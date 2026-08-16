// dsh-token-visual — host half.
// Token balance is fetched from the current model's provider configuration
// (baseURL + credentials) and served to the browser client through the
// harness webServer over three same-origin JSON routes:
//   POST /api/token-quota/state   -> current view (auto-refresh if stale)
//   POST /api/token-quota/fetch   -> force balance refresh
//   POST /api/token-quota/update  -> persist threshold
/** Cordis plugin name — must match the row id in cordis.patch.yml. */
export const name = 'dsh-token-visual';
/** Services required by this plugin. */
export const inject = ['fs', 'subprocess', 'timer', 'settings', 'credentials', 'agentDefaultModel', 'llm', 'webServer'];

const REFRESH_STALE_MS = 5 * 60 * 1000;
const BACKGROUND_REFRESH_MS = 5 * 60 * 1000;
const RECHARGE_URL = 'https://platform.deepseek.com/top_up';
const DEFAULT_DEEPSEEK_BASE = 'https://api.deepseek.com';

export function apply(ctx) {
  const fs = ctx.fs;
  const subprocess = ctx.subprocess;

  const state = {
    threshold: 10,
    daily: {},
    balances: {},
  };

  let statePath = null;
  let persistTimer = null;
  const fetchInFlight = {};
  let providersCache = null;

  const sandboxPolicy = ctx.get('sandboxPolicy');
  const workRoot = (sandboxPolicy && sandboxPolicy.workspaceRoot) || '.';
  statePath = String(workRoot).replace(/[\\/]+$/, '') + '/token-quota.json';

  function errMsg(e) {
    if (e instanceof Error) return e.message;
    return String(e);
  }

  function dayKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function trimDaily() {
    const keys = Object.keys(state.daily).sort();
    if (keys.length > 400) {
      const keep = new Set(keys.slice(keys.length - 400));
      for (const k of keys) if (!keep.has(k)) delete state.daily[k];
    }
  }

  function schedulePersist() {
    if (persistTimer !== null) return;
    persistTimer = ctx.timeout(() => {
      persistTimer = null;
      void doPersist();
    }, 5000);
  }

  async function doPersist() {
    try {
      const target = await fs.resolve(statePath);
      await fs.writeText(target, JSON.stringify(state));
    } catch (e) {
      console.error('dsh-token-visual: persist failed', errMsg(e));
    }
  }

  async function loadState() {
    try {
      const target = await fs.resolve(statePath);
      const info = await fs.stat(target);
      if (!info) return;
      const text = await fs.readText(target);
      if (!text) return;
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.threshold === 'number' && parsed.threshold >= 0) state.threshold = parsed.threshold;
        if (parsed.balances && typeof parsed.balances === 'object') {
          state.balances = {};
          for (const k of Object.keys(parsed.balances)) {
            if (parsed.balances[k] && typeof parsed.balances[k] === 'object') state.balances[k] = parsed.balances[k];
          }
        }
        if (parsed.daily && typeof parsed.daily === 'object') {
          state.daily = {};
          for (const k of Object.keys(parsed.daily)) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof parsed.daily[k] === 'number' && parsed.daily[k] > 0) {
              state.daily[k] = parsed.daily[k];
            }
          }
          trimDaily();
        }
      }
    } catch (e) {
      console.error('dsh-token-visual: load failed', errMsg(e));
    }
  }

  async function runPowershell(script, env) {
    let handle;
    try {
      handle = subprocess.spawn({
        argv: ['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', script],
        cwd: workRoot,
        stdio: { stdin: 'ignore', stdout: { maxBytes: 262144 }, stderr: { maxBytes: 32768 } },
        graceMs: 15000,
        env: env || undefined,
      });
    } catch (e) {
      throw new Error('无法启动 powershell.exe: ' + errMsg(e));
    }
    const outcome = await handle.done;
    const out = handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : '';
    const err = handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : '';
    if (outcome.exitCode !== 0) {
      throw new Error((out || err || ('进程退出码 ' + outcome.exitCode)).trim());
    }
    return out;
  }

  function deepseekNs() {
    try {
      const v = ctx.settings.get('llm-deepseek');
      return v && typeof v === 'object' ? v : null;
    } catch (e) {
      return null;
    }
  }

  async function providerCapability(provider) {
    if (provider === 'deepseek-official') {
      const ns = deepseekNs();
      let baseURL = (ns && typeof ns.baseURL === 'string' && ns.baseURL.trim()) || DEFAULT_DEEPSEEK_BASE;
      baseURL = baseURL.replace(/\/+$/, '').replace(/\/v1$/i, '');
      const apiKeyEnv = (ns && typeof ns.apiKeyEnv === 'string' && ns.apiKeyEnv) || 'DEEPSEEK_API_KEY';
      let key = null;
      try {
        const hit = await ctx.credentials.resolve(apiKeyEnv);
        if (hit && typeof hit.value === 'string' && hit.value.trim()) key = hit.value.trim();
      } catch (e) { /* ignore */ }
      return { supported: true, baseURL, apiKeyEnv, key, name: 'DeepSeek' };
    }
    return { supported: false, name: provider };
  }

  async function fetchBalance(provider) {
    if (!provider) return null;
    if (fetchInFlight[provider]) return state.balances[provider] || null;
    fetchInFlight[provider] = true;
    try {
      const cap = await providerCapability(provider);
      if (!cap.supported) {
        state.balances[provider] = {
          supported: false,
          total: null,
          currency: '',
          isAvailable: false,
          fetchedAt: Date.now(),
          error: '该模型尚不支持',
          keySource: 'none',
        };
        schedulePersist();
        return state.balances[provider];
      }
      if (!cap.key) {
        state.balances[provider] = {
          supported: true,
          total: null,
          currency: '',
          isAvailable: false,
          fetchedAt: Date.now(),
          error: '未配置 API Key（' + cap.apiKeyEnv + '），请在工作台 Models 页配置',
          keySource: 'missing',
        };
        schedulePersist();
        return state.balances[provider];
      }
      const script = [
        "$ErrorActionPreference='Stop'",
        '[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)',
        '$h=@{ Authorization = "Bearer $env:DQ_KEY" }',
        'try {',
        '$r = Invoke-RestMethod -Uri $env:DQ_URL -Headers $h -TimeoutSec 20',
        '$r | ConvertTo-Json -Compress -Depth 8',
        '}',
        'catch {',
        "Write-Output ('ERR: ' + $_.Exception.Message)",
        'exit 1',
        '}',
      ].join('\n');
      const out = await runPowershell(script, { DQ_KEY: cap.key, DQ_URL: cap.baseURL + '/user/balance' });
      const text = String(out).trim();
      if (!text) throw new Error('余额接口返回空响应');
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new Error('余额接口响应无法解析: ' + text.slice(0, 160));
      }
      const infos = Array.isArray(parsed.balance_infos) ? parsed.balance_infos : [];
      const info = infos.find((i) => i && i.currency === 'CNY') || infos[0] || null;
      let total = null;
      if (info && info.total_balance !== undefined && info.total_balance !== null) {
        const n = Number(info.total_balance);
        if (Number.isFinite(n)) total = n;
      }
      state.balances[provider] = {
        supported: true,
        total,
        currency: info ? String(info.currency) : '',
        isAvailable: parsed.is_available !== false,
        fetchedAt: Date.now(),
        error: null,
        keySource: 'credentials:' + cap.apiKeyEnv,
      };
      schedulePersist();
      return state.balances[provider];
    } catch (e) {
      const message = errMsg(e);
      const prev = state.balances[provider] || {};
      state.balances[provider] = {
        supported: prev.supported !== false,
        total: typeof prev.total === 'number' ? prev.total : null,
        currency: typeof prev.currency === 'string' ? prev.currency : '',
        isAvailable: prev.isAvailable !== false,
        fetchedAt: typeof prev.fetchedAt === 'number' ? prev.fetchedAt : Date.now(),
        error: /401|Unauthorized/i.test(message) ? 'API Key 无效或已过期' : message,
        keySource: typeof prev.keySource === 'string' ? prev.keySource : 'none',
      };
      schedulePersist();
      return state.balances[provider];
    } finally {
      fetchInFlight[provider] = false;
    }
  }

  function currentSelection() {
    try {
      const sel = ctx.agentDefaultModel.currentSelection();
      if (sel && typeof sel.provider === 'string' && typeof sel.model === 'string') {
        return { provider: sel.provider, model: sel.model };
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  async function providersView() {
    if (providersCache !== null) return providersCache;
    const out = [];
    let providers = [];
    try {
      providers = ctx.llm.listProviders() || [];
    } catch (e) {
      providers = [];
    }
    for (const p of providers) {
      const id = p && p.id;
      if (!id) continue;
      let models = [];
      try {
        const list = await ctx.llm.listModels(id);
        models = (list || []).map((m) => ({ id: m.id, name: m.name || m.id }));
      } catch (e) { /* keep empty */ }
      if (models.length === 0) continue;
      const cap = await providerCapability(id);
      out.push({ provider: id, name: p.name || id, supported: cap.supported, models });
    }
    providersCache = out;
    return out;
  }

  async function stateView(sel) {
    const target = sel || currentSelection();
    const provider = target ? target.provider : null;
    const b = provider ? state.balances[provider] : null;
    const providers = await providersView();
    return {
      current: target ? { provider: target.provider, model: target.model } : null,
      balance: b ? {
        total: typeof b.total === 'number' ? b.total : null,
        currency: typeof b.currency === 'string' && b.currency ? b.currency : 'CNY',
        isAvailable: b.isAvailable !== false,
        supported: b.supported !== false,
        fetchedAt: typeof b.fetchedAt === 'number' ? b.fetchedAt : null,
        error: b.error || null,
      } : null,
      threshold: state.threshold,
      daily: state.daily,
      providers,
      rechargeUrl: provider === 'deepseek-official' ? RECHARGE_URL : null,
    };
  }

  async function maybeRefresh(provider) {
    const b = provider ? state.balances[provider] : null;
    if (b && b.fetchedAt && Date.now() - b.fetchedAt < REFRESH_STALE_MS) return;
    await fetchBalance(provider);
  }

  async function readJson(req) {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    }
    const text = Buffer.concat(chunks).toString('utf8');
    if (!text.trim()) return {};
    return JSON.parse(text);
  }

  async function apiHandler(req, res) {
    let url;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch (e) {
      url = new URL('/', 'http://localhost');
    }
    const path = url.pathname.replace(/^\/api\/token-quota/, '') || '/';
    try {
      if (path === '/state') {
        const args = await readJson(req);
        let target = null;
        if (args && typeof args.provider === 'string' && typeof args.model === 'string') {
          target = { provider: args.provider, model: args.model };
        }
        const sel = target || currentSelection();
        if (sel && sel.provider) await maybeRefresh(sel.provider);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(await stateView(sel)));
        return;
      }
      if (path === '/fetch') {
        const args = await readJson(req);
        const provider = args && typeof args.provider === 'string' && args.provider
          ? args.provider
          : (currentSelection() || {}).provider;
        if (provider) await fetchBalance(provider);
        let sel = currentSelection();
        if (args && typeof args.provider === 'string' && args.provider) {
          sel = { provider: args.provider, model: typeof args.model === 'string' ? args.model : '' };
        }
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(await stateView(sel)));
        return;
      }
      if (path === '/update') {
        const patch = await readJson(req);
        if (typeof patch.threshold === 'number' && Number.isFinite(patch.threshold) && patch.threshold >= 0) {
          state.threshold = patch.threshold;
        }
        schedulePersist();
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(await stateView(currentSelection())));
        return;
      }
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'not found' }));
    } catch (e) {
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: errMsg(e) }));
    }
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/api/token-quota',
    handler: apiHandler,
  }));

  function refreshForCurrent() {
    const sel = currentSelection();
    if (sel && sel.provider && !fetchInFlight[sel.provider]) {
      void fetchBalance(sel.provider).catch(() => {});
    }
  }

  ctx.on('settings/updated', (ns) => {
    if (ns === 'agent-default-model' || ns === 'llm-deepseek') {
      providersCache = null;
      refreshForCurrent();
    }
  });

  ctx.on('llm/adapters-updated', () => {
    providersCache = null;
    refreshForCurrent();
  });

  ctx.on('llm/stream', (options, next) => {
    async function* wrapped() {
      for await (const chunk of next()) {
        if (chunk && chunk.type === 'usage' && chunk.usage) {
          try {
            const u = chunk.usage;
            const total = (Number(u.inputTokens) || 0) + (Number(u.outputTokens) || 0)
              + (Number(u.cacheReadTokens) || 0) + (Number(u.cacheWriteTokens) || 0);
            if (total > 0) {
              const key = dayKey(new Date());
              state.daily[key] = (state.daily[key] || 0) + total;
              trimDaily();
              schedulePersist();
            }
          } catch (e) { /* keep the stream alive */ }
        }
        yield chunk;
      }
    }
    return wrapped();
  });

  ctx.timeout(() => {
    void loadState().then(() => {
      const sel = currentSelection();
      if (sel && sel.provider) void fetchBalance(sel.provider).catch(() => {});
    });
  }, 0);

  ctx.interval(() => {
    const sel = currentSelection();
    if (sel && sel.provider && !fetchInFlight[sel.provider]) void fetchBalance(sel.provider).catch(() => {});
  }, BACKGROUND_REFRESH_MS);

  ctx.effect(() => () => {
    void doPersist();
  });

  console.log('dsh-token-visual host ready');
}
