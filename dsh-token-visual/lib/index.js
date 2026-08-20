// dsh-token-visual — host half.
// Balance is fetched from the current model's provider configuration and
// served to the browser client through the harness webServer over three
// same-origin JSON routes:
//   POST /api/token-quota/state   -> current view (auto-refresh if stale)
//   POST /api/token-quota/fetch   -> force balance refresh
//   POST /api/token-quota/update  -> persist threshold
//
// Provider balance support (per provider route / baseURL host):
//   deepseek-official    -> GET {base}/user/balance
//   moonshot / kimi      -> GET {base}/v1/users/me/balance
//   minimax              -> GET {base}/v1/token_plan/remains
//   stepfun              -> GET {base}/v1/accounts
//   xai                  -> GET {base}/v1/billing/credits (USD)
//   openai               -> GET /dashboard/billing/subscription + /usage (estimate)
//   zhipu / glm          -> GET {base}/api/monitor/usage/quota/limit (配额, non-money)
//   qwen / dashscope     -> POST cli.qianwenai.com flat API (best-effort with API key)
//   mimo (xiaomi)        -> no public balance API -> informative message
//   any other with baseURL -> generic probe: /user/balance, then OpenAI billing
//   everything else      -> "该模型尚不支持"
/** Cordis plugin name — must match the row id in cordis.patch.yml. */
export const name = 'dsh-token-visual';
/** Services required by this plugin. */
export const inject = ['fs', 'subprocess', 'timer', 'settings', 'credentials', 'agentDefaultModel', 'llm', 'webServer'];

const REFRESH_STALE_MS = 5 * 60 * 1000;
const BACKGROUND_REFRESH_MS = 5 * 60 * 1000;
const RECHARGE_URL = 'https://platform.deepseek.com/top_up';
const DEFAULT_DEEPSEEK_BASE = 'https://api.deepseek.com';

const QWEN_FLAT_URL = 'https://cli.qianwenai.com/data/v2/api.json';
const QWEN_PRODUCT = 'BssOpenAPI-V3';
const QWEN_RECHARGE_URL = 'https://platform.qianwenai.com/home/billing/overview';

/** Console/recharge URL per recognized provider route. */
const CONSOLE_URLS = {
  'deepseek-official': RECHARGE_URL,
  moonshot: 'https://platform.moonshot.cn/console/account/balance',
  minimax: 'https://platform.minimaxi.com/user-center/basic-information/interface-key',
  stepfun: 'https://platform.stepfun.com/interface-key',
  xai: 'https://console.x.ai/',
  openai: 'https://platform.openai.com/settings/organization/billing/overview',
  zhipu: 'https://open.bigmodel.cn/usercenter/apikeys',
  qwen: QWEN_RECHARGE_URL,
  dashscope: QWEN_RECHARGE_URL,
  mimo: 'https://platform.xiaomimimo.com/#/console/balance',
  siliconflow: 'https://cloud.siliconflow.cn',
};

/** Official upstream baseURL per family, used when a pi-ai catalog route has no baseURL. */
const FAMILY_BASE = {
  openai: 'https://api.openai.com',
  moonshot: 'https://api.moonshot.cn',
  zhipu: 'https://open.bigmodel.cn',
  minimax: 'https://api.minimaxi.com',
  stepfun: 'https://api.stepfun.com',
  xai: 'https://api.x.ai',
  qwen: 'https://dashscope.aliyuncs.com',
  siliconflow: 'https://api.siliconflow.cn',
};

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return '';
  }
}

/** Match a provider route to a known balance-capable family by keywords. */
function familyOfRoute(provider) {
  if (provider === 'deepseek-official' || provider === 'deepseek') return 'deepseek';
  if (provider === 'openai') return 'openai';
  if (/qwen|dashscope|tongyi/i.test(provider)) return 'qwen';
  if (/moonshot|kimi/i.test(provider)) return 'moonshot';
  if (/zhipu|glm|bigmodel/i.test(provider)) return 'zhipu';
  if (/minimax/i.test(provider)) return 'minimax';
  if (/^step/i.test(provider)) return 'stepfun';
  if (/xai|grok/i.test(provider)) return 'xai';
  if (/mimo|xiaomi/i.test(provider)) return 'mimo';
  if (/silicon/i.test(provider)) return 'siliconflow';
  return null;
}

/** Match a provider's baseURL host to a known family. */
function familyOfHost(host) {
  if (host === 'api.openai.com') return 'openai';
  if (host === 'dashscope.aliyuncs.com') return 'qwen';
  if (host === 'api.moonshot.cn' || host === 'api.moonshot.ai') return 'moonshot';
  if (host === 'open.bigmodel.cn') return 'zhipu';
  if (host === 'api.minimaxi.com' || host === 'api.minimax.chat') return 'minimax';
  if (host === 'api.stepfun.com') return 'stepfun';
  if (host === 'api.x.ai') return 'xai';
  if (host === 'api.siliconflow.cn') return 'siliconflow';
  if (host.endsWith('.xiaomimimo.com')) return 'mimo';
  return null;
}

export function apply(ctx) {
  const fs = ctx.fs;
  const subprocess = ctx.subprocess;

  const state = {
    threshold: 10,
    tokenThreshold: 80,
    alertEnabled: true,
    daily: {},
    dailyModels: {},
    balances: {},
    cookies: {},
    tokenPlans: {},
  };

  let statePath = null;
  let persistTimer = null;
  const fetchInFlight = {};
  const tokenPlanInFlight = {};
  let providersCache = null;
  let directoryCache = null;

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
      for (const k of keys) if (!keep.has(k)) {
        delete state.daily[k];
        delete state.dailyModels[k];
      }
    }
    const mkeys = Object.keys(state.dailyModels).sort();
    if (mkeys.length > 400) {
      const mkeep = new Set(mkeys.slice(mkeys.length - 400));
      for (const k of mkeys) if (!mkeep.has(k)) delete state.dailyModels[k];
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
        if (typeof parsed.tokenThreshold === 'number' && parsed.tokenThreshold >= 0) state.tokenThreshold = parsed.tokenThreshold;
        if (typeof parsed.alertEnabled === 'boolean') state.alertEnabled = parsed.alertEnabled;
        if (parsed.balances && typeof parsed.balances === 'object') {
          state.balances = {};
          for (const k of Object.keys(parsed.balances)) {
            if (parsed.balances[k] && typeof parsed.balances[k] === 'object') state.balances[k] = parsed.balances[k];
          }
        }
        if (parsed.cookies && typeof parsed.cookies === 'object') {
          state.cookies = {};
          for (const k of Object.keys(parsed.cookies)) {
            if (typeof parsed.cookies[k] === 'string') state.cookies[k] = parsed.cookies[k];
          }
        }
        if (parsed.tokenPlans && typeof parsed.tokenPlans === 'object') {
          state.tokenPlans = {};
          for (const k of Object.keys(parsed.tokenPlans)) {
            if (parsed.tokenPlans[k] && typeof parsed.tokenPlans[k] === 'object') {
              const entry = { ...parsed.tokenPlans[k] };
              // 持久化的 error 是历史快照，启动后立即会被刷新覆盖；
              // 直接丢弃，避免旧超时提示一直挂在界面上。
              delete entry.error;
              state.tokenPlans[k] = entry;
            }
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
        if (parsed.dailyModels && typeof parsed.dailyModels === 'object') {
          state.dailyModels = {};
          for (const k of Object.keys(parsed.dailyModels)) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) continue;
            const byModel = parsed.dailyModels[k];
            if (!byModel || typeof byModel !== 'object') continue;
            const clean = {};
            for (const mk of Object.keys(byModel)) {
              if (typeof byModel[mk] === 'number' && byModel[mk] > 0) clean[mk] = byModel[mk];
            }
            if (Object.keys(clean).length > 0) state.dailyModels[k] = clean;
          }
          const mkeys = Object.keys(state.dailyModels).sort();
          if (mkeys.length > 400) {
            const mkeep = new Set(mkeys.slice(mkeys.length - 400));
            for (const k of mkeys) if (!mkeep.has(k)) delete state.dailyModels[k];
          }
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
        graceMs: 30000,
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

  /** One GET request returning parsed JSON; opts.auth = 'raw'|'cookie' overrides the header. */
  async function httpGetJson(url, key, opts) {
    // Cookie auth needs WebSession to avoid PowerShell mangling the Cookie header.
    if (opts && opts.auth === 'cookie') {
      const script = [
        "$ErrorActionPreference='Stop'",
        '[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)',
        '$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession',
        '$env:DQ_KEY -split ";" | ForEach-Object {',
        '  $p = $_.Trim().Split("=", 2)',
        '  if ($p.Length -eq 2) { $s.Cookies.Add((New-Object System.Net.Cookie($p[0].Trim(), $p[1].Trim(), "/", ".xiaomimimo.com"))) }',
        '}',
        'try {',
        '$r = Invoke-WebRequest -Uri $env:DQ_URL -WebSession $s -UseBasicParsing -TimeoutSec 25',
        '$r.Content',
        '}',
        'catch {',
        "Write-Output ('ERR: ' + $_.Exception.Message)",
        'exit 1',
        '}',
      ].join('\n');
      const out = await runPowershell(script, { DQ_KEY: key, DQ_URL: url });
      const text = String(out).trim();
      if (!text) throw new Error('空响应');
      return JSON.parse(text);
    }
    let authLine = '$h=@{ Authorization = "Bearer $env:DQ_KEY" }';
    if (opts && opts.auth === 'raw') authLine = '$h=@{ Authorization = $env:DQ_KEY }';
    const script = [
      "$ErrorActionPreference='Stop'",
      '[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)',
      authLine,
      'try {',
      '$r = Invoke-RestMethod -Uri $env:DQ_URL -Headers $h -TimeoutSec 25',
      '$r | ConvertTo-Json -Compress -Depth 10',
      '}',
      'catch {',
      "Write-Output ('ERR: ' + $_.Exception.Message)",
      'exit 1',
      '}',
    ].join('\n');
    const out = await runPowershell(script, { DQ_KEY: key, DQ_URL: url });
    const text = String(out).trim();
    if (!text) throw new Error('空响应');
    return JSON.parse(text);
  }

  /** One POST request with a JSON body returning parsed JSON; throws on any failure. */
  async function httpPostJson(url, key, body) {
    const script = [
      "$ErrorActionPreference='Stop'",
      '[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)',
      '$h=@{ Authorization = "Bearer $env:DQ_KEY"; "Content-Type" = "application/json" }',
      '$b = $env:DQ_BODY',
      'try {',
      '$r = Invoke-RestMethod -Uri $env:DQ_URL -Method Post -Headers $h -Body $b -TimeoutSec 25',
      '$r | ConvertTo-Json -Compress -Depth 10',
      '}',
      'catch {',
      "Write-Output ('ERR: ' + $_.Exception.Message)",
      'exit 1',
      '}',
    ].join('\n');
    const out = await runPowershell(script, { DQ_KEY: key, DQ_URL: url, DQ_BODY: JSON.stringify(body) });
    const text = String(out).trim();
    if (!text) throw new Error('空响应');
    return JSON.parse(text);
  }

  /** The v1 credential-name convention the Models page uses for provider routes. */
  function deriveKeyEnv(provider) {
    return provider.toUpperCase().replace(/[^A-Z0-9]+/g, '_') + '_API_KEY';
  }

  function deepseekNs() {
    try {
      const v = ctx.settings.get('llm-deepseek');
      return v && typeof v === 'object' ? v : null;
    } catch (e) {
      return null;
    }
  }

  /** Resolve one configurable-provider directory entry (or undefined). */
  function directoryEntry(provider) {
    try {
      if (directoryCache === null) directoryCache = ctx.llm.listConfigurableProviders() || [];
      const dir = directoryCache;
      for (const e of dir) if (e && e.provider === provider) return e;
      return undefined;
    } catch (e) {
      return undefined;
    }
  }

  /** Read a provider's settings profile at entry.settingsPath. */
  function profileOfEntry(entry) {
    if (!entry) return null;
    try {
      const v = ctx.settings.get(entry.settingsNs);
      if (!v || typeof v !== 'object') return null;
      let p = v;
      for (const seg of entry.settingsPath) {
        if (!p || typeof p !== 'object') return null;
        p = p[seg];
      }
      return p && typeof p === 'object' ? p : null;
    } catch (e) {
      return null;
    }
  }

  /** Capability + credentials for one provider route. */
  async function providerCapability(provider) {
    const entry = directoryEntry(provider);
    const profile = profileOfEntry(entry);
    let keyEnv = 'DEEPSEEK_API_KEY';
    if (profile && typeof profile.apiKeyEnv === 'string' && profile.apiKeyEnv) keyEnv = profile.apiKeyEnv;
    else keyEnv = deriveKeyEnv(provider);
    let key = null;
    try {
      const hit = await ctx.credentials.resolve(keyEnv);
      if (hit && typeof hit.value === 'string' && hit.value.trim()) key = hit.value.trim();
    } catch (e) { /* ignore */ }
    let baseURL = profile && typeof profile.baseURL === 'string' && profile.baseURL.trim()
      ? profile.baseURL.trim()
      : null;

    if (provider === 'deepseek-official') {
      if (!baseURL) {
        const ns = deepseekNs();
        baseURL = (ns && typeof ns.baseURL === 'string' && ns.baseURL.trim()) || DEFAULT_DEEPSEEK_BASE;
      }
      return {
        supported: true,
        kind: 'deepseek',
        baseURL: baseURL.replace(/\/+$/, '').replace(/\/v1$/i, ''),
        keyEnv,
        key,
        name: 'DeepSeek',
      };
    }
    const host = baseURL ? hostOf(baseURL) : '';
    const kind = (host ? familyOfHost(host) : null) || familyOfRoute(provider);
    // MiMo has no balance API at all; fetchBalance reports the informative message.
    if (kind === 'mimo') {
      return { supported: true, kind: 'mimo', baseURL: baseURL || '', keyEnv, key, name: 'MiMo' };
    }
    // pi-ai catalog routes carry only apiKeyEnv (proxied). Fall back to the
    // upstream provider's official baseURL so the user's own key can query it.
    if (!baseURL && kind && FAMILY_BASE[kind]) baseURL = FAMILY_BASE[kind];
    if (!baseURL) return { supported: false, name: provider, keyEnv, kind };
    const clean = baseURL.replace(/\/+$/, '');
    if (kind === 'openai') {
      return { supported: true, kind: 'openai', baseURL: clean, keyEnv, key, name: 'OpenAI' };
    }
    if (kind === 'qwen') {
      return { supported: true, kind: 'qwen', baseURL: clean, keyEnv, key, name: '千问/Qwen' };
    }
    if (kind === 'moonshot') {
      return { supported: true, kind: 'moonshot', baseURL: clean, keyEnv, key, name: 'Kimi/Moonshot' };
    }
    if (kind === 'zhipu') {
      return { supported: true, kind: 'zhipu', baseURL: clean, keyEnv, key, name: '智谱/Zhipu' };
    }
    if (kind === 'minimax') {
      return { supported: true, kind: 'minimax', baseURL: clean, keyEnv, key, name: 'MiniMax' };
    }
    if (kind === 'stepfun') {
      return { supported: true, kind: 'stepfun', baseURL: clean, keyEnv, key, name: '阶跃星辰/StepFun' };
    }
    if (kind === 'xai') {
      return { supported: true, kind: 'xai', baseURL: clean, keyEnv, key, name: 'xAI/Grok' };
    }
    if (kind === 'siliconflow') {
      return { supported: true, kind: 'siliconflow', baseURL: clean, keyEnv, key, name: '硅基流动/SiliconFlow' };
    }
    return { supported: true, kind: 'generic', baseURL: clean, keyEnv, key, name: provider };
  }

  function unsupportedBalance(message) {
    return {
      supported: false,
      total: null,
      currency: '',
      mode: 'money',
      isAvailable: false,
      fetchedAt: Date.now(),
      error: message || '该模型尚不支持',
      keySource: 'none',
      note: null,
    };
  }

  /** DeepSeek-style /user/balance parse; null when unrecognized. */
  function parseDeepseekShape(parsed) {
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.balance_infos)) return null;
    const info = parsed.balance_infos.find((i) => i && i.currency === 'CNY') || parsed.balance_infos[0] || null;
    if (!info || info.total_balance === undefined || info.total_balance === null) return null;
    const n = Number(info.total_balance);
    if (!Number.isFinite(n)) return null;
    return { total: n, currency: info.currency ? String(info.currency) : 'CNY', isAvailable: parsed.is_available !== false, note: null };
  }

  async function fetchDeepseekBalance(cap) {
    const parsed = await httpGetJson(cap.baseURL + '/user/balance', cap.key);
    const r = parseDeepseekShape(parsed);
    if (!r) throw new Error('余额接口响应无法识别');
    return r;
  }

  async function fetchMoonshotBalance(cap) {
    const parsed = await httpGetJson(cap.baseURL + '/v1/users/me/balance', cap.key);
    // Official shape (platform.kimi.com/docs/api/balance): { code:0, data:{ available_balance, voucher_balance, cash_balance } }
    if (parsed && parsed.data && typeof parsed.data === 'object') {
      const d = parsed.data;
      if (d.available_balance !== undefined && d.available_balance !== null) {
        const total = Number(d.available_balance);
        if (Number.isFinite(total)) {
          const cash = Number(d.cash_balance) || 0;
          const voucher = Number(d.voucher_balance) || 0;
          return { total, currency: 'CNY', isAvailable: true, note: '现金 ' + cash.toFixed(2) + ' / 代金券 ' + voucher.toFixed(2) };
        }
      }
    }
    // Legacy shapes fallback: total_balance / balance_infos
    const d = parsed && parsed.data ? parsed.data : parsed;
    let total = null;
    if (d && d.total_balance !== undefined && d.total_balance !== null) {
      total = Number(d.total_balance);
    } else if (Array.isArray(d.balance_infos) && d.balance_infos[0]) {
      total = Number(d.balance_infos[0].total_balance);
    }
    if (!Number.isFinite(total)) throw new Error('Kimi 余额响应无法解析: ' + JSON.stringify(parsed).slice(0, 200));
    return { total, currency: 'CNY', isAvailable: parsed && parsed.is_available !== false, note: null };
  }

  /** Zhipu money balance (proven endpoint), falling back to the quota API. */
  async function fetchZhipuBalance(cap) {
    try {
      const parsed = await httpGetJson('https://www.bigmodel.cn/api/biz/account/query-customer-account-report', cap.key);
      const d = parsed && parsed.data ? parsed.data : parsed;
      if (d && d.availableBalance !== undefined && d.availableBalance !== null) {
        const total = Number(d.availableBalance);
        if (Number.isFinite(total)) return { total, currency: 'CNY', isAvailable: true, note: null };
      }
    } catch (e) { /* fall through to quota */ }
    return fetchZhipuQuota(cap);
  }

  async function fetchZhipuQuota(cap) {
    const parsed = await httpGetJson(cap.baseURL + '/api/monitor/usage/quota/limit', cap.key, { auth: 'raw' });
    if (!parsed || parsed.code !== 200 || !parsed.data) throw new Error('智谱配额接口响应异常');
    const limits = Array.isArray(parsed.data.limits) ? parsed.data.limits : [];
    if (limits.length === 0) throw new Error('智谱未返回配额信息');
    const parts = [];
    let remainingSum = 0;
    for (const limit of limits) {
      const remaining = Number(limit.remaining) || 0;
      const total = limit.number !== undefined ? Number(limit.number) : 0;
      remainingSum += remaining;
      parts.push(String(remaining) + '/' + String(total));
    }
    return {
      total: remainingSum,
      currency: '',
      mode: 'quota',
      isAvailable: true,
      note: '智谱配额剩余（非金额）：' + parts.join('，'),
    };
  }

  /** MiMo balance: cookie-authenticated console endpoint (platform.xiaomimimo.com). */
  async function fetchMimoBalance(provider) {
    const cookie = state.cookies[provider];
    if (!cookie || !cookie.trim()) {
      throw new Error('未配置 Cookie：请登录 platform.xiaomimimo.com/#/console/balance 后复制 Cookie（约1天有效），在设置页填入');
    }
    const parsed = await httpGetJson('https://platform.xiaomimimo.com/api/v1/balance', cookie.trim(), { auth: 'cookie' });
    const d = parsed && parsed.data ? parsed.data : parsed;
    if (!d || d.balance === undefined) throw new Error('MiMo 余额响应无法解析: ' + JSON.stringify(parsed).slice(0, 200));
    const total = Number(d.balance);
    if (!Number.isFinite(total)) throw new Error('MiMo 余额解析失败');
    return { total, currency: 'CNY', isAvailable: true, note: 'MiMo 账户余额（Cookie 会话）' };
  }

  /** MiMo Token Plan detail + usage via cookie auth（detail/usage 独立获取，任一失败不阻塞另一项）。 */
  async function fetchMimoTokenPlan(provider) {
    const cookie = state.cookies[provider];
    if (!cookie || !cookie.trim()) return null;
    const result = { detail: null, usage: null };
    const failures = [];
    try {
      const detail = await httpGetJson('https://platform.xiaomimimo.com/api/v1/tokenPlan/detail', cookie.trim(), { auth: 'cookie' });
      result.detail = detail && detail.data ? detail.data : detail;
    } catch (e) {
      failures.push('detail: ' + (e instanceof Error ? e.message : String(e)));
    }
    try {
      const usage = await httpGetJson('https://platform.xiaomimimo.com/api/v1/tokenPlan/usage', cookie.trim(), { auth: 'cookie' });
      result.usage = usage && usage.data ? usage.data : usage;
    } catch (e) {
      failures.push('usage: ' + (e instanceof Error ? e.message : String(e)));
    }
    if (failures.length > 0) result.error = failures.join('; ');
    return result;
  }

  /** 刷新并缓存某厂商的 Token Plan（带并发防重）。 */
  async function refreshTokenPlan(provider, cap) {
    if (!provider) return null;
    if (tokenPlanInFlight[provider]) return state.tokenPlans[provider] || null;
    tokenPlanInFlight[provider] = true;
    try {
      let tp = null;
      const kind = cap ? cap.kind : null;
      if (kind === 'mimo') {
        tp = await fetchMimoTokenPlan(provider);
      } else if (kind === 'minimax') {
        tp = await fetchMinimaxTokenPlan(cap);
      } else if (kind === 'zhipu') {
        tp = await fetchZhipuTokenPlan(cap);
      } else if (cap && cap.supported) {
        tp = await fetchGenericTokenPlan(cap, kind, provider);
      }
      if (tp === null) return state.tokenPlans[provider] || null;
      const prev = state.tokenPlans[provider] || {};
      // 合并：本次失败的子项（detail/usage 为 null）保留旧缓存，避免
      // 偶发超时把已拿到的套餐信息清掉；本次完全成功则清除旧 error。
      const merged = { ...prev, ...tp };
      if (tp.detail === null || tp.detail === undefined) {
        if (prev.detail !== undefined && prev.detail !== null) merged.detail = prev.detail;
        else delete merged.detail;
      }
      if (tp.usage === null || tp.usage === undefined) {
        if (prev.usage !== undefined && prev.usage !== null) merged.usage = prev.usage;
        else delete merged.usage;
      }
      if (!tp.error) delete merged.error;
      else merged.error = tp.error;
      state.tokenPlans[provider] = merged;
      schedulePersist();
      return state.tokenPlans[provider];
    } finally {
      tokenPlanInFlight[provider] = false;
    }
  }

  /** MiniMax Token Plan: /v1/token_plan/remains */
  async function fetchMinimaxTokenPlan(cap) {
    try {
      const parsed = await httpGetJson(cap.baseURL + '/v1/token_plan/remains', cap.key);
      const d = parsed && parsed.data ? parsed.data : parsed;
      if (!d) return null;
      const remain = Number(d.remain) || 0;
      const total = Number(d.total) || 0;
      return {
        detail: { planName: 'Token Plan', remain, total, currency: 'CNY' },
        usage: total > 0 ? { percent: Math.round((1 - remain / total) * 10000) / 100 } : null,
      };
    } catch (e) {
      return { detail: null, usage: null, error: e instanceof Error ? e.message : String(e) };
    }
  }

  /** 智谱 Token Plan: quota API */
  async function fetchZhipuTokenPlan(cap) {
    try {
      const parsed = await httpGetJson(cap.baseURL + '/api/monitor/usage/quota/limit', cap.key, { auth: 'raw' });
      if (!parsed || parsed.code !== 200 || !parsed.data) return null;
      const limits = Array.isArray(parsed.data.limits) ? parsed.data.limits : [];
      if (limits.length === 0) return null;
      let total = 0, used = 0;
      for (const l of limits) {
        total += Number(l.number) || 0;
        used += (Number(l.number) || 0) - (Number(l.remaining) || 0);
      }
      return {
        detail: { planName: '智谱配额', remain: total - used, total, currency: '' },
        usage: total > 0 ? { percent: Math.round(used / total * 10000) / 100 } : null,
      };
    } catch (e) {
      return { detail: null, usage: null, error: e instanceof Error ? e.message : String(e) };
    }
  }

  /** 通用: 从余额信息生成简易套餐展示 */
  async function fetchGenericTokenPlan(cap, kind, provider) {
    const b = state.balances[provider] || null;
    if (!b || typeof b.total !== 'number') return null;
    const names = { deepseek: 'DeepSeek', moonshot: 'Kimi/Moonshot', stepfun: '阶跃星辰', siliconflow: '硅基流动' };
    return {
      detail: { planName: names[kind] || kind, remain: b.total, total: b.total, currency: b.currency || 'CNY' },
      usage: null,
    };
  }

  async function fetchSiliconflowBalance(cap) {
    const parsed = await httpGetJson(cap.baseURL + '/v1/user/info', cap.key);
    const d = parsed && parsed.data ? parsed.data : parsed;
    if (!d || d.totalBalance === undefined) throw new Error('硅基流动余额响应无法解析: ' + JSON.stringify(parsed).slice(0, 200));
    const total = Number(d.totalBalance);
    if (!Number.isFinite(total)) throw new Error('硅基流动余额解析失败');
    return { total, currency: 'CNY', isAvailable: true, note: null };
  }

  async function fetchMinimaxBalance(cap) {
    const parsed = await httpGetJson(cap.baseURL + '/v1/token_plan/remains', cap.key);
    const d = parsed && parsed.data ? parsed.data : parsed;
    if (!d || d.remain === undefined) throw new Error('MiniMax 余额响应无法解析');
    const total = Number(d.remain);
    if (!Number.isFinite(total)) throw new Error('MiniMax 余额解析失败');
    return { total, currency: 'CNY', isAvailable: true, note: 'Token Plan 剩余额度' };
  }

  async function fetchStepfunBalance(cap) {
    const parsed = await httpGetJson(cap.baseURL + '/v1/accounts', cap.key);
    if (!parsed || parsed.balance === undefined) throw new Error('阶跃余额响应无法解析');
    const total = Number(parsed.balance);
    if (!Number.isFinite(total)) throw new Error('阶跃余额解析失败');
    const cash = Number(parsed.total_cash_balance) || 0;
    const voucher = Number(parsed.total_voucher_balance) || 0;
    return { total, currency: 'CNY', isAvailable: true, note: '现金 ' + cash.toFixed(2) + ' / 赠金 ' + voucher.toFixed(2) };
  }

  async function fetchXaiBalance(cap) {
    const parsed = await httpGetJson(cap.baseURL + '/v1/billing/credits', cap.key);
    const total = parsed && parsed.total && parsed.total.val !== undefined ? Number(parsed.total.val) / 100 : NaN;
    if (!Number.isFinite(total)) throw new Error('xAI 余额响应无法解析');
    return { total: Math.abs(total), currency: 'USD', isAvailable: true, note: null };
  }

  async function fetchOpenaiBalance(cap) {
    const sub = await httpGetJson(cap.baseURL + '/dashboard/billing/subscription', cap.key);
    if (!sub || typeof sub.hard_limit_usd !== 'number') throw new Error('OpenAI 账户未提供可用额度（hard_limit_usd）');
    const end = new Date();
    const start = new Date(Date.now() - 30 * 86400000);
    const fmt = (d) => d.toISOString().slice(0, 10);
    let usage;
    try {
      usage = await httpGetJson(cap.baseURL + '/dashboard/billing/usage?start_date=' + fmt(start) + '&end_date=' + fmt(end), cap.key);
    } catch (e) {
      usage = null;
    }
    const cents = usage && typeof usage.total_usage === 'number' ? usage.total_usage : 0;
    const spent = cents / 100;
    const total = Math.max(0, sub.hard_limit_usd - spent);
    return { total, currency: 'USD', isAvailable: true, note: 'OpenAI 官方估算（近30天用量）' };
  }

  async function fetchQwenBalance(cap) {
    const parsed = await httpPostJson(QWEN_FLAT_URL, cap.key, {
      product: QWEN_PRODUCT,
      action: 'GetFundAccountAvailableAmount',
      region: 'cn-beijing',
      params: {},
    });
    if (!parsed || parsed.code !== '200' || !parsed.data) throw new Error('千问余额接口响应异常');
    const data = parsed.data;
    if (data.AvailableAmount === undefined || data.AvailableAmount === null) throw new Error('千问余额响应缺少 AvailableAmount');
    const n = Number(data.AvailableAmount);
    if (!Number.isFinite(n)) throw new Error('千问余额解析失败');
    return { total: n, currency: data.Currency || 'CNY', isAvailable: true, note: null };
  }

  /** Best-effort probe for any OpenAI-compatible provider; null when unrecognized. */
  async function fetchGenericBalance(cap) {
    try {
      const parsed = await httpGetJson(cap.baseURL + '/user/balance', cap.key);
      const r = parseDeepseekShape(parsed);
      if (r) return r;
    } catch (e) { /* fall through to OpenAI billing probe */ }
    try {
      const sub = await httpGetJson(cap.baseURL + '/dashboard/billing/subscription', cap.key);
      if (sub && typeof sub.hard_limit_usd === 'number') {
        const end = new Date();
        const start = new Date(Date.now() - 30 * 86400000);
        const fmt = (d) => d.toISOString().slice(0, 10);
        let usage = null;
        try {
          usage = await httpGetJson(cap.baseURL + '/dashboard/billing/usage?start_date=' + fmt(start) + '&end_date=' + fmt(end), cap.key);
        } catch (e) { usage = null; }
        const cents = usage && typeof usage.total_usage === 'number' ? usage.total_usage : 0;
        const total = Math.max(0, sub.hard_limit_usd - cents / 100);
        return { total, currency: 'USD', isAvailable: true, note: '余额为估算值（近30天用量）' };
      }
    } catch (e) { /* fall through */ }
    return null;
  }

  async function fetchBalance(provider) {
    if (!provider) return null;
    if (fetchInFlight[provider]) return state.balances[provider] || null;
    fetchInFlight[provider] = true;
    try {
      const cap = await providerCapability(provider);
      if (!cap.supported) {
        state.balances[provider] = unsupportedBalance('该模型尚不支持');
        schedulePersist();
        return state.balances[provider];
      }
      if (!cap.key) {
        state.balances[provider] = {
          supported: true,
          total: null,
          currency: '',
          mode: 'money',
          isAvailable: false,
          fetchedAt: Date.now(),
          error: '未配置 API Key（' + cap.keyEnv + '），请在工作台 Models 页配置',
          keySource: 'missing',
          note: null,
        };
        schedulePersist();
        return state.balances[provider];
      }
      let result = null;
      try {
        if (cap.kind === 'deepseek') result = await fetchDeepseekBalance(cap);
        else if (cap.kind === 'moonshot') result = await fetchMoonshotBalance(cap);
        else if (cap.kind === 'zhipu') result = await fetchZhipuBalance(cap);
        else if (cap.kind === 'minimax') result = await fetchMinimaxBalance(cap);
        else if (cap.kind === 'stepfun') result = await fetchStepfunBalance(cap);
        else if (cap.kind === 'xai') result = await fetchXaiBalance(cap);
        else if (cap.kind === 'siliconflow') result = await fetchSiliconflowBalance(cap);
        else if (cap.kind === 'openai') result = await fetchOpenaiBalance(cap);
        else if (cap.kind === 'mimo') {
          result = await fetchMimoBalance(provider);
          await refreshTokenPlan(provider, cap);
        }
        else if (cap.kind === 'minimax') {
          result = await fetchMinimaxBalance(cap);
          await refreshTokenPlan(provider, cap);
        }
        else if (cap.kind === 'zhipu') {
          result = await fetchZhipuBalance(cap);
          await refreshTokenPlan(provider, cap);
        }
        else if (cap.kind === 'deepseek' || cap.kind === 'moonshot' || cap.kind === 'stepfun' || cap.kind === 'siliconflow') {
          await refreshTokenPlan(provider, cap);
        }
        else if (cap.kind === 'qwen') result = await fetchQwenBalance(cap);
        else result = await fetchGenericBalance(cap);
      } catch (e) {
        if (cap.kind === 'qwen') {
          state.balances[provider] = unsupportedBalance('千问暂不支持余额查询：千问未开放 API Key 余额接口（请登录官方控制台或使用官方 CLI 查看）');
          schedulePersist();
          return state.balances[provider];
        }
        if (cap.kind === 'mimo' && /Cookie/.test(errMsg(e))) {
          state.balances[provider] = {
            supported: true,
            total: null,
            currency: '',
            mode: 'money',
            isAvailable: false,
            fetchedAt: Date.now(),
            error: errMsg(e),
            keySource: 'cookie',
            note: null,
          };
          schedulePersist();
          return state.balances[provider];
        }
        throw e;
      }
      if (!result) {
        state.balances[provider] = unsupportedBalance('该模型尚不支持');
        schedulePersist();
        return state.balances[provider];
      }
      state.balances[provider] = {
        supported: true,
        total: result.total,
        currency: result.currency || (result.mode === 'quota' ? '' : 'CNY'),
        mode: result.mode || 'money',
        isAvailable: result.isAvailable !== false,
        fetchedAt: Date.now(),
        error: null,
        keySource: 'credentials:' + cap.keyEnv,
        note: result.note || null,
      };
      schedulePersist();
      return state.balances[provider];
    } catch (e) {
      const message = errMsg(e);
      const prev = state.balances[provider] || {};
      state.balances[provider] = /401|Unauthorized/i.test(message)
        ? { ...unsupportedBalance('API Key 无效或已过期'), supported: prev.supported !== false }
        : {
            supported: prev.supported !== false,
            total: typeof prev.total === 'number' ? prev.total : null,
            currency: typeof prev.currency === 'string' ? prev.currency : '',
            mode: prev.mode === 'quota' ? 'quota' : 'money',
            isAvailable: prev.isAvailable !== false,
            fetchedAt: typeof prev.fetchedAt === 'number' ? prev.fetchedAt : Date.now(),
            error: message,
            keySource: typeof prev.keySource === 'string' ? prev.keySource : 'none',
            note: typeof prev.note === 'string' ? prev.note : null,
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

  function rechargeUrlFor(provider) {
    if (provider === 'deepseek-official' || provider === 'deepseek') return CONSOLE_URLS['deepseek-official'];
    const routeFamily = familyOfRoute(provider);
    if (routeFamily && CONSOLE_URLS[routeFamily]) return CONSOLE_URLS[routeFamily];
    return null;
  }

  async function stateView(sel) {
    const target = sel || currentSelection();
    const provider = target ? target.provider : null;
    const b = provider ? state.balances[provider] : null;
    const providers = await providersView();
    const cap = provider ? await providerCapability(provider) : null;
    const needsCookie = cap ? cap.kind === 'mimo' : false;
    const tp = provider ? (state.tokenPlans[provider] || null) : null;
    return {
      current: target ? { provider: target.provider, model: target.model } : null,
      balance: b ? {
        total: typeof b.total === 'number' ? b.total : null,
        currency: typeof b.currency === 'string' && b.currency ? b.currency : 'CNY',
        mode: b.mode === 'quota' ? 'quota' : 'money',
        isAvailable: b.isAvailable !== false,
        supported: b.supported !== false,
        fetchedAt: typeof b.fetchedAt === 'number' ? b.fetchedAt : null,
        error: b.error || null,
        note: b.note || null,
      } : null,
      tokenPlan: tp,
      threshold: state.threshold,
      tokenThreshold: state.tokenThreshold,
      alertEnabled: state.alertEnabled !== false,
      daily: state.daily,
      dailyModels: state.dailyModels,
      providers,
      rechargeUrl: rechargeUrlFor(provider || ''),
      needsCookie,
      hasCookie: needsCookie ? Boolean(provider && state.cookies[provider]) : false,
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
        if (sel && sel.provider) {
          await maybeRefresh(sel.provider);
          const cap = await providerCapability(sel.provider);
          await refreshTokenPlan(sel.provider, cap);
        }
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
        if (typeof patch.tokenThreshold === 'number' && Number.isFinite(patch.tokenThreshold) && patch.tokenThreshold >= 0) {
          state.tokenThreshold = patch.tokenThreshold;
        }
        if (typeof patch.alertEnabled === 'boolean') {
          state.alertEnabled = patch.alertEnabled;
        }
        if (typeof patch.provider === 'string' && patch.provider && typeof patch.cookie === 'string') {
          state.cookies[patch.provider] = patch.cookie.trim();
          if (!state.cookies[patch.provider]) delete state.cookies[patch.provider];
          const cap = await providerCapability(patch.provider);
          if (cap.kind === 'mimo') await fetchBalance(patch.provider).catch(() => {});
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
    if (ns === 'agent-default-model' || ns === 'llm-deepseek' || ns === 'llm-pi-ai') {
      providersCache = null;
      directoryCache = null;
      refreshForCurrent();
    }
  });

  ctx.on('llm/adapters-updated', () => {
    providersCache = null;
    directoryCache = null;
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
              // Per-model bucket: options carries the routed provider/model pair.
              const provider = options && typeof options.provider === 'string' && options.provider ? options.provider : 'unknown';
              const model = options && (typeof options.model === 'string' || typeof options.model === 'number') ? String(options.model) : 'unknown';
              const modelKey = provider + '::' + model;
              if (!state.dailyModels[key]) state.dailyModels[key] = {};
              state.dailyModels[key][modelKey] = (state.dailyModels[key][modelKey] || 0) + total;
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
