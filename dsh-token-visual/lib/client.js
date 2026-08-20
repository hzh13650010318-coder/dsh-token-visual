window.__ModuleLoader__.load({
  id: "dsh-token-visual",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    "use strict";
    var React = require("react");

    var SOURCE_NAME = "dsh-token-visual";
    var STYLE_TAG = "dsh-token-visual/style.css";
    var activeCtx = null;

    function injectCss() {
      if (typeof document === "undefined") return;
      if (document.querySelector('style[data-plugin-css="' + STYLE_TAG + '"]') !== null) return;
      var tag = document.createElement("style");
      tag.dataset.plugin = SOURCE_NAME;
      tag.dataset.pluginCss = STYLE_TAG;
      tag.textContent = "\n.tq-plugin-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}\n.tq-plugin-card:hover{border-color:var(--dsw-alias-label-dimmed)}\n.tq-plugin-card-open{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}\n.tq-plugin-card-header{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}\n.tq-plugin-card-header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}\n.tq-plugin-card-headtext{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}\n.tq-plugin-card-name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}\n.tq-plugin-card-desc{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}\n.tq-plugin-card-chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}\n.tq-plugin-card-chevron-open{transform:rotate(180deg)}\n.tq-plugin-card-body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding:14px 0 8px}\n.tq-capsule{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:22px;min-width:44px;padding:0 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;font-variant-numeric:tabular-nums;line-height:1;white-space:nowrap;cursor:pointer;user-select:none;transition:border-color .15s ease,color .15s ease}\n.tq-capsule:hover{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}\n.tq-capsule.tq-ok{border-color:var(--dsw-static-green-400);color:var(--dsw-static-green-400)}\n.tq-capsule.tq-ok:hover{border-color:var(--dsw-static-green-500);color:var(--dsw-static-green-500)}\n.tq-capsule.tq-muted{border-color:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary)}\n.tq-capsule.tq-muted:hover{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}\n.tq-capsule.tq-low{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}\n.tq-capsule.tq-unsupported{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}\n.tq-page{box-sizing:border-box;width:100%;max-width:600px;display:flex;flex-direction:column;gap:16px;padding:4px 2px 24px;font-family:var(--dsw-font-family),system-ui,sans-serif;color:var(--dsw-alias-label-primary)}\n.tq-hero{box-sizing:border-box;display:flex;flex-direction:column;gap:6px;padding:20px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:16px}\n.tq-hero-low{border-color:var(--dsw-alias-state-error-primary)}\n.tq-hero-label{font-size:13px;color:var(--dsw-alias-label-secondary)}\n.tq-hero-value{font-size:34px;font-weight:600;line-height:1.15;letter-spacing:-.5px;font-variant-numeric:tabular-nums}\n.tq-hero-low .tq-hero-value{color:var(--dsw-alias-state-error-primary)}\n.tq-hero-unsupported{font-size:16px;font-weight:600;color:var(--dsw-alias-state-error-primary)}\n.tq-hero-model{font-size:12px;color:var(--dsw-alias-label-tertiary)}\n.tq-hero-meta{font-size:12px;color:var(--dsw-alias-label-tertiary)}\n.tq-hero-warn{font-size:12px;color:var(--dsw-alias-state-error-primary)}\n.tq-hero-err{font-size:12px;color:var(--dsw-alias-state-error-primary)}\n.tq-hero-actions{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}\n.tq-select{box-sizing:border-box;height:34px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;outline:none;cursor:pointer;max-width:160px}\n.tq-section{box-sizing:border-box;display:flex;flex-direction:column;gap:12px;padding:18px 20px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:16px}\n.tq-title{font-size:15px;font-weight:600}\n.tq-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.tq-input{box-sizing:border-box;height:34px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;outline:none;transition:border-color .15s ease}\n.tq-input:focus{border-color:var(--dsw-alias-brand-primary)}\n.tq-btn{box-sizing:border-box;height:34px;padding:0 16px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;cursor:pointer;transition:background .15s ease,border-color .15s ease}\n.tq-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}\n.tq-btn-primary{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:#fff}\n.tq-btn-primary:hover{background:var(--dsw-alias-brand-primary);filter:brightness(1.08)}\nbody[data-ds-dark-theme] .tq-btn-primary{border-color:var(--dsw-alias-button-info-fill);background:var(--dsw-alias-button-info-fill)}\nbody[data-ds-dark-theme] .tq-btn-primary:hover{background:var(--dsw-alias-button-info-hover);filter:none}\n.tq-hint{font-size:12px;color:var(--dsw-alias-label-tertiary);line-height:1.5}\n.tq-msg{font-size:12px;padding:6px 12px;border-radius:10px;white-space:nowrap}\n.tq-msg-ok{color:var(--dsw-alias-state-success-primary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}\n.tq-msg-err{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}\n.tq-curve{width:100%}\n.tq-curve svg{display:block}\n.tq-grid{stroke:var(--dsw-alias-border-l1);stroke-width:1}\n.tq-axis{fill:var(--dsw-alias-label-tertiary);font-size:10px}\n.tq-curve-area{fill:var(--dsw-alias-brand-primary);opacity:.12;stroke:none}\n.tq-curve-line{fill:none;stroke:var(--dsw-alias-brand-primary);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}\n.tq-curve-dot{fill:var(--dsw-alias-brand-primary);stroke:#fff;stroke-width:1}\n.tq-curve-legend{display:flex;flex-wrap:wrap;gap:4px 14px;margin-bottom:8px}\n.tq-curve-legend-item{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}\n.tq-curve-legend-dot{width:8px;height:8px;border-radius:2px;flex:none}\n.tq-curve-title{font-size:12px;color:var(--dsw-alias-label-tertiary);margin:10px 0 2px}\n.tq-bar{fill:var(--dsw-alias-button-info-fill);opacity:.5}\n.tq-bar:hover{fill:var(--dsw-alias-button-info-hover);opacity:.9}\n.tq-curve-total-line{fill:none;stroke:#F2A33C;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;opacity:1}.tq-curve-halo{fill:none;stroke:rgba(255,255,255,.75);stroke-width:5;stroke-linecap:round;stroke-linejoin:round}\n.tq-cal{display:flex;flex-direction:column;gap:8px}\n.tq-cal-head{display:flex;align-items:center;justify-content:space-between}\n.tq-cal-title{font-size:14px;font-weight:500}\n.tq-cal-nav{box-sizing:border-box;width:28px;height:28px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:15px;cursor:pointer;line-height:1}\n.tq-cal-nav:hover{background:var(--dsw-alias-interactive-bg-hover)}\n.tq-cal-week{display:grid;grid-template-columns:repeat(7,44px);gap:2px;justify-content:center}\n.tq-cal-weekday{height:20px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--dsw-alias-label-tertiary)}\n.tq-cal-grid{display:grid;grid-template-columns:repeat(7,44px);gap:2px;justify-content:center}\n.tq-cal-cell{box-sizing:border-box;width:44px;height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-radius:50%;position:relative;cursor:default}\n.tq-cal-blank{visibility:hidden}\n.tq-cal-date{width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:13px;color:var(--dsw-alias-label-primary)}\n.tq-cal-empty .tq-cal-date{color:var(--dsw-alias-label-tertiary)}\n.tq-cal-today .tq-cal-date{box-shadow:inset 0 0 0 1.5px var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent)}\n.tq-cal-cell:hover .tq-cal-date{background:var(--dsw-alias-brand-primary);color:#fff;box-shadow:none}\nbody[data-ds-dark-theme] .tq-cal-cell:hover .tq-cal-date{background:var(--dsw-alias-button-info-fill)}\n.tq-cal-count{font-size:9px;line-height:10px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}\n.tq-cal-cell:hover .tq-cal-count{opacity:0}\n.tq-cal-cell::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:4px 10px;font-size:11px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .12s ease;z-index:10;box-shadow:0 4px 16px rgba(0,0,0,.12)}\n.tq-cal-cell:hover::after{opacity:1}\n.tq-curve-tip{position:fixed;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:6px 10px;font-size:12px;line-height:1.6;white-space:pre-line;box-shadow:0 4px 16px rgba(0,0,0,.12);pointer-events:none;z-index:999;max-width:280px}\n";
      document.head.appendChild(tag);
    }

    function api(path, args) {
      return fetch("/api/token-quota" + path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args || {}),
      }).then((res) => {
        if (!res.ok) {
          return res.json().catch(() => ({})).then((j) => {
            throw new Error((j && j.error) || "请求失败 " + res.status);
          });
        }
        return res.json();
      });
    }

    function cssVar(name, fallback) {
      try {
        const v = getComputedStyle(document.body).getPropertyValue(name).trim();
        if (v) return v;
      } catch (e) { /* ignore */ }
      return fallback;
    }
    const GREEN = cssVar("--dsw-static-green-400", "rgb(78, 209, 126)");
    const RED = cssVar("--dsw-alias-state-error-primary", "rgb(224, 49, 49)");

    function fmtBalance(n) {
      if (n === null || n === undefined || Number.isNaN(n)) return "—";
      return n.toFixed(2);
    }
    function fmtCompact(n) {
      if (!n || n <= 0) return "0";
      if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
      return String(Math.round(n));
    }
    function fmtNumber(n) {
      if (n === null || n === undefined || Number.isNaN(n)) return "0";
      return n.toLocaleString("zh-CN");
    }
    function curSymbol(c) { return c === "USD" ? "$" : "¥"; }
    function keyOf(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return y + "-" + m + "-" + day;
    }
    function timeOf(ts) {
      if (!ts) return "—";
      const d = new Date(ts);
      return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + ":" + String(d.getSeconds()).padStart(2, "0");
    }

    function TokenCapsule(props) {
      const sessionId = props.sessionId;
      const [view, setView] = React.useState(null);
      const [failed, setFailed] = React.useState(false);
      const [selection, setSelection] = React.useState(null);
      // 显示模式：null=自动，"balance"=强制显示充值余额，"tokenPlan"=强制显示Token Plan百分比
      const [displayMode, setDisplayMode] = React.useState(null);

      React.useEffect(() => {
        const md = activeCtx.get("modelDirectories");
        if (!md || !sessionId) return;
        let dir = null;
        try { dir = md.directoryFor(sessionId); } catch (e) { dir = null; }
        if (!dir || !dir.store) return;
        const read = () => {
          let snap = null;
          try { snap = dir.store.getSnapshot(); } catch (e) { snap = null; }
          const cur = snap && snap.current;
          setSelection(cur && cur.provider && cur.model ? { provider: cur.provider, model: cur.model } : null);
        };
        read();
        let off = null;
        try { off = dir.store.subscribe(read); } catch (e) { off = null; }
        return typeof off === "function" ? off : undefined;
      }, [sessionId]);

      const refresh = React.useCallback(() => {
        const args = selection ? { provider: selection.provider, model: selection.model } : {};
        api("/state", args)
          .then((v) => { setView(v); setFailed(false); })
          .catch(() => setFailed(true));
      }, [selection]);

      React.useEffect(() => {
        refresh();
        return activeCtx.interval(refresh, 30000);
      }, [refresh]);

      const bal = view ? view.balance : null;
      const total = bal ? bal.total : null;
      const unsupported = bal ? bal.supported === false : false;
      const alertOn = view ? view.alertEnabled !== false : true;
      const low = !unsupported && total !== null && total !== undefined && alertOn && typeof view.threshold === "number" && total < view.threshold;
      const tp = view ? view.tokenPlan : null;
      const tpDetail = tp && tp.detail ? tp.detail : null;
      const tpUsage = tp && tp.usage ? tp.usage : null;
      // 有真实 Token Plan 时：胶囊显示已使用百分比（无 Plan 时显示充值余额）。
      // 判断依据：detail 有套餐信息且 usage 有数据（host 端 generic 余额厂商
      // 伪造的 detail 没有 usage，不能算作 Token Plan）。
      // 计算与设置页一致：优先 usage.items 的 plan_total_token / month_total_token，
      // 其次 usage.percent（0~1 需 ×100），最后回退 detail.remain/total。
      const hasTokenPlan = !!(tpDetail && tpUsage && (tpDetail.planCode || tpDetail.planName));
      const planItem = tpUsage && tpUsage.usage && tpUsage.usage.items
        ? tpUsage.usage.items.find((it) => it && it.name === 'plan_total_token') : null;
      const monthItem = tpUsage && tpUsage.monthUsage && tpUsage.monthUsage.items
        ? (tpUsage.monthUsage.items.find((it) => it && it.name === 'month_total_token') || tpUsage.monthUsage.items[0]) : null;
      const usedFromItem = (item) => {
        if (item && typeof item.limit === 'number' && item.limit > 0 && typeof item.used === 'number') {
          return (item.used / item.limit) * 100;
        }
        return null;
      };
      let tpPercent = usedFromItem(planItem);
      if (tpPercent === null) tpPercent = usedFromItem(monthItem);
      if (tpPercent === null) {
        const tpPctRaw = (tpUsage && tpUsage.usage && tpUsage.usage.percent !== undefined)
          ? tpUsage.usage.percent
          : (tpUsage && tpUsage.monthUsage && tpUsage.monthUsage.percent !== undefined ? tpUsage.monthUsage.percent : null);
        const n = Number(tpPctRaw);
        if (Number.isFinite(n)) tpPercent = n <= 1 ? n * 100 : n;
      }
      if (tpPercent === null) {
        const tpRemain = tpDetail && tpDetail.remain !== undefined ? tpDetail.remain : null;
        const tpTotal = tpDetail && tpDetail.total !== undefined ? tpDetail.total : null;
        if (tpRemain !== null && tpTotal !== null && tpTotal > 0) {
          tpPercent = ((tpTotal - tpRemain) / tpTotal) * 100;
        }
      }
      if (tpPercent !== null) tpPercent = Math.min(100, Math.max(0, tpPercent));
      // token 余额警戒值：已使用百分比超出该值时胶囊显示红色
      const tokenThreshold = view && typeof view.tokenThreshold === "number" ? view.tokenThreshold : 80;
      const tpOver = hasTokenPlan && tpPercent !== null && alertOn && tpPercent > tokenThreshold;

      // 确定显示内容：手动切换优先，否则自动判断
      let cls = "tq-capsule";
      let label = "—";
      let style = undefined;
      // 判断是否有余额数据可用于显示
      const hasBalanceData = total !== null && total !== undefined;
      const hasTokenPlanData = hasTokenPlan && tpPercent !== null;
      // 确定显示模式：手动切换 > 自动
      let effectiveMode = displayMode;
      if (effectiveMode === "balance" && !hasBalanceData) effectiveMode = null;
      if (effectiveMode === "tokenPlan" && !hasTokenPlanData) effectiveMode = null;
      // 未手动切换时自动判断
      if (effectiveMode === null) {
        if (hasTokenPlanData) effectiveMode = "tokenPlan";
        else if (hasBalanceData) effectiveMode = "balance";
      }
      // 根据模式渲染标签
      if (failed) { label = "!"; }
      else if (unsupported) { label = "不支持"; cls += " tq-capsule-unsupported"; }
      else if (effectiveMode === "tokenPlan") {
        label = tpPercent.toFixed(1) + "%";
        if (tpOver) { cls += " tq-capsule-low"; style = { borderColor: RED, color: RED }; }
        else { cls += " tq-capsule-ok"; style = { borderColor: GREEN, color: GREEN }; }
      }
      else if (effectiveMode === "balance") {
        label = fmtBalance(total);
        if (!alertOn) { cls += " tq-capsule-muted"; }
        else if (low) { cls += " tq-capsule-low"; style = { borderColor: RED, color: RED }; }
        else { cls += " tq-capsule-ok"; style = { borderColor: GREEN, color: GREEN }; }
      }

      const tip = (() => {
        if (failed) return "Token 余额获取失败，点击重试";
        if (unsupported) return "该模型尚不支持：" + (view && view.current ? view.current.provider + " / " + view.current.model : "") + "\n点击刷新";
        if (effectiveMode === "tokenPlan" && hasTokenPlanData) {
          const lines = [];
          lines.push("Token Plan：" + (tpDetail.planName || tpDetail.planCode));
          lines.push("已使用 " + tpPercent.toFixed(1) + "%");
          if (tpDetail.currentPeriodEnd) lines.push("到期 " + tpDetail.currentPeriodEnd);
          if (tpOver) lines.push("⚠ 用量已超警戒值 " + tokenThreshold + "%");
          if (hasBalanceData) lines.push("右键切换到充值余额");
          lines.push("点击刷新");
          return lines.join("\n");
        }
        if (effectiveMode === "balance" && hasBalanceData) {
          const sym = curSymbol(bal ? bal.currency : "CNY");
          const lines = [];
          if (bal && bal.mode === "quota") lines.push("配额剩余：" + fmtBalance(total));
          else lines.push("Token 余额：" + sym + fmtBalance(total));
          if (bal && bal.note) lines.push(bal.note);
          if (view && typeof view.threshold === "number") lines.push("充值余额警戒值：" + sym + fmtBalance(view.threshold));
          if (low) lines.push("⚠ 余额不足");
          if (bal && bal.error) lines.push(bal.error);
          if (hasTokenPlanData) lines.push("右键切换到 Token Plan");
          lines.push("点击刷新余额");
          return lines.join("\n");
        }
        if (total === null || total === undefined) {
          const err = bal && bal.error;
          return (err ? err + "\n" : "") + "点击刷新";
        }
        return "点击刷新";
      })();

      return React.createElement(
        "div",
        {
          className: cls,
          style: style,
          title: tip,
          onClick: () => {
            const args = selection ? { provider: selection.provider, model: selection.model } : {};
            api("/fetch", args).then((v) => { setView(v); setFailed(false); }).catch(() => setFailed(true));
          },
          onContextMenu: (e) => {
            e.preventDefault();
            // 基于当前手动模式判断切换方向
            // 如果当前手动模式是 null 或 tokenPlan，则切换到 balance（如果有数据）
            // 如果当前手动模式是 balance，则切换到 tokenPlan（如果有数据）
            if (displayMode === null || displayMode === "tokenPlan") {
              if (hasBalanceData) setDisplayMode("balance");
            } else if (displayMode === "balance") {
              if (hasTokenPlanData) setDisplayMode("tokenPlan");
            }
          },
        },
        label
      );
    }

    function ConsumptionCurve(props) {
      const daily = props.daily || {};
      const dailyModels = props.dailyModels || {};
      const providers = props.providers || [];
      const days = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        days.push({ key: keyOf(d), label: (d.getMonth() + 1) + "/" + d.getDate() });
      }
      // Distinct model keys seen in the 30-day window (stable, sorted).
      const modelKeys = [];
      const seen = new Set();
      for (const d of days) {
        const bucket = dailyModels[d.key];
        if (!bucket) continue;
        for (const mk of Object.keys(bucket).sort()) {
          if (!seen.has(mk)) { seen.add(mk); modelKeys.push(mk); }
        }
      }
      const PALETTE = ["#7C6CE0","#4ED17E","#F2A33C","#E05A5A","#2BA9C4","#E85D9A","#A3C94F","#5AC8E8","#D4A843","#6B8FD4","#FF7043","#66BB6A","#AB47BC","#FFA726","#26C6DA","#EC407A","#8D6E63","#78909C","#FFCA28","#5C6BC0"];
      const colorOf = (i) => {
        if (i < PALETTE.length) return PALETTE[i];
        const h = (i * 137.508) % 360;
        return "hsl(" + Math.round(h) + ", 65%, 50%)";
      };
      const labelOf = (mk) => {
        const sep = mk.indexOf("::");
        const pid = sep === -1 ? mk : mk.slice(0, sep);
        const mid = sep === -1 ? mk : mk.slice(sep + 2);
        const p = providers.find((x) => x.provider === pid);
        if (!p) return mid || mk;
        const m = p.models.find((x) => x.id === mid);
        return p.name + " · " + (m ? (m.name || m.id) : mid);
      };
      const totalValues = days.map((d) => daily[d.key] || 0);
      // Shared y-axis cap: total usage is the sum across models, so it always
      // dominates any single-model segment.
      const cap = Math.max(1, totalValues.reduce((m, v) => Math.max(m, v), 0));

      const W = 640, L = 48, R = 14, T = 12, B = 22;
      const H = 190;
      const iw = W - L - R, ih = H - T - B;
      const x = (i) => L + (iw * i) / (days.length - 1);
      const y = (v) => T + ih - (ih * v) / cap;
      const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ v: cap * f, yy: y(cap * f) }));
      const barW = Math.max(2, (iw / days.length) * 0.7);
      // Hover tooltip: shows the day's total and per-model breakdown.
      const [tip, setTip] = React.useState(null);
      let tipEl = null;
      if (tip) {
        const bucket = (dailyModels && dailyModels[tip.d.key]) || {};
        const modelRows = modelKeys
          .filter((mk) => (bucket[mk] || 0) > 0)
          .map((mk) => labelOf(mk) + "：" + fmtNumber(bucket[mk] || 0) + " tokens");
        const lines = [tip.d.label, "总消耗 " + fmtNumber(totalValues[tip.i]) + " tokens"].concat(modelRows);
        const tipW = 260;
        const left = tip.x + 14 > window.innerWidth - tipW - 8 ? tip.x - tipW - 14 : tip.x + 14;
        const top = tip.y + 18 > window.innerHeight - 180 ? tip.y - 150 : tip.y + 18;
        tipEl = React.createElement("div", {
          className: "tq-curve-tip",
          style: { left, top },
        }, lines.join("\n"));
      }

      return React.createElement(
        "div",
        { className: "tq-curve" },
        React.createElement("div", { className: "tq-curve-legend" },
          modelKeys.map((mk, i) =>
            React.createElement("span", { key: mk, className: "tq-curve-legend-item" },
              React.createElement("span", { className: "tq-curve-legend-dot", style: { background: colorOf(i) } }),
              labelOf(mk)
            )
          )
        ),
        React.createElement(
          "svg",
          { viewBox: "0 0 " + W + " " + H, width: "100%" },
          ticks.map((t) =>
            React.createElement("g", { key: "y" + t.v },
              React.createElement("line", { x1: L, y1: t.yy, x2: W - R, y2: t.yy, className: "tq-grid" }),
              React.createElement("text", { x: L - 6, y: t.yy + 4, className: "tq-axis", textAnchor: "end" }, fmtCompact(Math.round(t.v)))
            )
          ),
          // Stacked bars: one bar per day, height = total usage; each bar is
          // split into model-colored segments proportional to that day's per-model usage.
          days.map((d, i) => {
            const v = totalValues[i];
            if (v <= 0) return null;
            const bucket = (dailyModels && dailyModels[d.key]) || {};
            const segs = [];
            for (let mi = 0; mi < modelKeys.length; mi++) {
              const sv = bucket[modelKeys[mi]] || 0;
              if (sv > 0) segs.push({ mi, v: sv });
            }
            const hover = {
              onMouseEnter: (e) => setTip({ d, i, x: e.clientX, y: e.clientY }),
              onMouseMove: (e) => setTip({ d, i, x: e.clientX, y: e.clientY }),
              onMouseLeave: () => setTip(null),
            };
            if (segs.length === 0) {
              const h = Math.max(1, (ih * v) / cap);
              return React.createElement("rect", {
                key: "bar" + d.key,
                x: x(i) - barW / 2,
                y: y(v),
                width: barW,
                height: h,
                className: "tq-bar",
                ...hover,
              });
            }
            let acc = 0;
            return React.createElement("g", { key: "seg" + d.key },
              segs.map((s) => {
                const top = acc + s.v;
                const h = Math.max(1, (ih * s.v) / cap);
                const el = React.createElement("rect", {
                  key: "s" + d.key + "-" + s.mi,
                  x: x(i) - barW / 2,
                  y: y(top),
                  width: barW,
                  height: h,
                  fill: colorOf(s.mi),
                  opacity: 0.85,
                  ...hover,
                });
                acc = top;
                return el;
              })
            );
          }),
          days.map((d, i) =>
            i % 5 === 0 || i === days.length - 1
              ? React.createElement("text", { key: "x" + d.key, x: x(i), y: H - 6, className: "tq-axis", textAnchor: "middle" }, d.label)
              : null
          )
        ),
        tipEl
      );
    }

    function readActiveSessionModel() {
      // 独立解析当前激活会话的模型（provider/model），任何一步失败都返回 null
      try {
        const sessions = activeCtx.get("sessions");
        if (!sessions || !sessions.list) return null;
        const snap = sessions.list.getSnapshot();
        const sid = snap && snap.current;
        if (!sid) return null;
        const md = activeCtx.get("modelDirectories");
        if (!md) return null;
        const dir = md.directoryFor(sid);
        if (!dir || !dir.store) return null;
        const s = dir.store.getSnapshot();
        const cur = s && s.current;
        return cur && cur.provider && cur.model ? { provider: cur.provider, model: cur.model } : null;
      } catch (e) { return null; }
    }

    function TokenQuotaPage() {
      const [view, setView] = React.useState(null);
      const [picked, setPicked] = React.useState(null);
      const [thresholdDraft, setThresholdDraft] = React.useState("");
      const [tokenThresholdDraft, setTokenThresholdDraft] = React.useState("");
      const [cookieDraft, setCookieDraft] = React.useState("");
      const [msg, setMsg] = React.useState("");
      const [msgKind, setMsgKind] = React.useState("ok");
      const [sessionModel, setSessionModel] = React.useState(null);
      // 首次加载已完成标记：警戒值输入框只在初次填充一次，
      // 之后任何自动刷新都不再覆盖用户输入的值。
      const draftInitializedRef = React.useRef(false);

      // 跟随当前激活会话的模型：轮询当前会话 + 模型目录（不依赖订阅事件，切换后 ~1s 内生效）
      React.useEffect(() => {
        let sessions = null;
        try { sessions = activeCtx.get("sessions"); } catch (e) { sessions = null; }
        if (!sessions || !sessions.list) return;
        let timer = null;
        let lastSid = null;
        let lastModelKey = "";
        const probe = () => {
          let sid = null;
          try { sid = sessions.list.getSnapshot().current || null; } catch (e) { sid = null; }
          if (sid !== lastSid) {
            // 切换对话：清空手动选择，让下拉框跟随新会话
            if (lastSid !== null && sid !== null) setPicked(null);
            lastSid = sid;
          }
          const m = readActiveSessionModel();
          const mk = m ? m.provider + "::" + m.model : "";
          if (mk !== lastModelKey) {
            lastModelKey = mk;
            setSessionModel(m);
          }
        };
        probe();
        timer = setInterval(probe, 1000);
        return () => { if (timer) clearInterval(timer); };
      }, []);

      // 手动选择优先；未手动选择时用当前会话的模型（刷新时兜底再解析一次）
      const effectiveSel = picked || sessionModel;
      const refresh = React.useCallback(() => {
        const model = effectiveSel || readActiveSessionModel();
        const args = model ? { provider: model.provider, model: model.model } : {};
        api("/state", args).then((v) => {
          setView(v);
          // 警戒值输入框只在首次加载时填充，自动刷新不覆盖用户输入
          if (!draftInitializedRef.current) {
            draftInitializedRef.current = true;
            if (v && typeof v.threshold === "number") setThresholdDraft(String(v.threshold));
            if (v && typeof v.tokenThreshold === "number") setTokenThresholdDraft(String(v.tokenThreshold));
          }
        }).catch(() => {
          setMsg("加载失败，请稍后重试");
          setMsgKind("err");
        });
      }, [effectiveSel]);

      React.useEffect(() => {
        refresh();
        return activeCtx.interval(refresh, 30000);
      }, [refresh]);

      const showMsg = (text, kind) => { setMsg(text); setMsgKind(kind || "ok"); };

      const onThresholdChange = (e) => {
        const text = e.target.value;
        setThresholdDraft(text);
        const n = Number(text);
        if (text !== "" && Number.isFinite(n) && n >= 0 && n !== (view ? view.threshold : null)) {
          api("/update", { threshold: n })
            .then((v) => { setView(v); setThresholdDraft(String(n)); })
            .catch(() => showMsg("保存失败", "err"));
        }
      };

      const onTokenThresholdChange = (e) => {
        const text = e.target.value;
        setTokenThresholdDraft(text);
        const n = Number(text);
        if (text !== "" && Number.isFinite(n) && n >= 0 && n <= 100 && n !== (view ? view.tokenThreshold : null)) {
          api("/update", { tokenThreshold: n })
            .then((v) => { setView(v); setTokenThresholdDraft(String(n)); })
            .catch(() => showMsg("保存失败", "err"));
        }
      };

      const saveAlert = (enabled) => {
        api("/update", { alertEnabled: enabled })
          .then((v) => { setView(v); showMsg(enabled ? "余额警戒已开启" : "余额警戒已关闭"); })
          .catch(() => showMsg("保存失败", "err"));
      };

      const saveCookie = () => {
        const target = picked || (view && view.current ? { provider: view.current.provider, model: view.current.model } : null);
        if (!target) { showMsg("请先选择厂商", "err"); return; }
        api("/update", { provider: target.provider, cookie: cookieDraft })
          .then((v) => { setView(v); setCookieDraft(""); showMsg("Cookie 已保存并刷新余额"); })
          .catch(() => showMsg("保存失败", "err"));
      };

      const doFetch = () => {
        const args = effectiveSel ? { provider: effectiveSel.provider, model: effectiveSel.model } : {};
        api("/fetch", args)
          .then((v) => { setView(v); showMsg(v && v.balance && v.balance.error ? v.balance.error : "已刷新"); })
          .catch(() => showMsg("刷新失败", "err"));
      };

      const doRecharge = () => {
        if (view && view.rechargeUrl) window.open(view.rechargeUrl, "_blank", "noopener,noreferrer");
      };

      const onPick = (e) => {
        const val = e.target.value;
        if (!val) { setPicked(null); return; }
        setPicked({ provider: val, model: "" });
        api("/fetch", { provider: val, model: "" })
          .then((v) => { setView(v); showMsg("已刷新"); })
          .catch(() => showMsg("刷新失败", "err"));
      };

      const sel = effectiveSel || (view && view.current ? { provider: view.current.provider, model: view.current.model } : null);
      const bal = view ? view.balance : null;
      const total = bal ? bal.total : null;
      const unsupported = bal ? bal.supported === false : false;
      const low = !unsupported && total !== null && total !== undefined && view && view.alertEnabled !== false && typeof view.threshold === "number" && total < view.threshold;
      const alertEnabled = view ? view.alertEnabled !== false : true;
      const symbol = curSymbol(bal ? bal.currency : "CNY");
      const daily = view ? (view.daily || {}) : {};
      const dailyModels = view ? (view.dailyModels || {}) : {};
      const selKey = sel ? sel.provider : "";
      const providers = (view && view.providers) || [];

      const balanceArea = unsupported
        ? React.createElement("div", { className: "tq-hero-unsupported" }, "该模型尚不支持")
        : React.createElement("div", { className: "tq-hero-value" + (low ? " tq-hero-low-value" : "") }, (bal && bal.mode === "quota" ? "" : symbol + " ") + fmtBalance(total));

      const tp = view ? view.tokenPlan : null;
      const tpDetail = tp && tp.detail ? tp.detail : null;
      const tpUsage = tp && tp.usage ? tp.usage : null;
      const tpError = tp && tp.error ? tp.error : null;
      // 有真实 Token Plan（detail 有套餐信息且 usage 有数据）才展示套餐与用量；
      // 纯余额厂商（host 端 generic detail 无 usage）视为「暂无套餐」。
      const hasPlan = !!(tpDetail && tpUsage && (tpDetail.planCode || tpDetail.planName));
      const planName = hasPlan ? (tpDetail.planName || tpDetail.planCode) : "暂无套餐";
      const planExpired = !!(tpDetail && tpDetail.expired);
      const planEnd = tpDetail && tpDetail.currentPeriodEnd;
      // 用量计算：接口 percent 字段是 0~1 的比例（如 0.0116 = 1.16%），需 ×100 转百分比；
      // 优先用 usage.items 的 used/limit 精确计算（plan_total_token → 套餐总用量）
      const planItem = tpUsage && tpUsage.usage && tpUsage.usage.items
        ? tpUsage.usage.items.find((it) => it && it.name === 'plan_total_token') : null;
      const monthItem = tpUsage && tpUsage.monthUsage && tpUsage.monthUsage.items
        ? (tpUsage.monthUsage.items.find((it) => it && it.name === 'month_total_token') || tpUsage.monthUsage.items[0]) : null;
      const usedFromItem = (item) => {
        if (item && typeof item.limit === 'number' && item.limit > 0 && typeof item.used === 'number') {
          return (item.used / item.limit) * 100;
        }
        return null;
      };
      const tpPctRaw = (tpUsage && tpUsage.usage && tpUsage.usage.percent !== undefined)
        ? tpUsage.usage.percent
        : (tpUsage && tpUsage.monthUsage && tpUsage.monthUsage.percent !== undefined ? tpUsage.monthUsage.percent : null);
      const normalizePct = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? (n <= 1 ? n * 100 : n) : null;
      };
      let usedPercent = usedFromItem(planItem) !== null ? usedFromItem(planItem) : usedFromItem(monthItem);
      if (usedPercent === null && tpPctRaw !== null && tpPctRaw !== undefined) usedPercent = normalizePct(tpPctRaw);
      const usedPercentClamped = usedPercent !== null ? Math.min(100, Math.max(0, usedPercent)) : null;
      // 与控制台发送按钮同色（DeepSeek 品牌蓝）
      const barColor = "var(--dsw-static-deepseek-500)";

      return React.createElement("div", { className: "tq-page" },
        React.createElement("div", { className: "tq-hero-actions" },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, width: "100%" } },
            React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", flexShrink: 0 } }, "厂商"),
            React.createElement("select", { className: "tq-select", value: selKey, onChange: onPick, style: { flex: "1 1 0", maxWidth: "none" } },
              React.createElement("option", { value: "" }, "跟随当前选中厂商"),
              providers.map((p) =>
                React.createElement("option", { key: p.provider, value: p.provider },
                  p.name + (p.supported ? "" : "（不支持）")
                )
              )
            ),
            React.createElement("button", { type: "button", className: "tq-btn", onClick: doFetch, style: { flexShrink: 0 } }, "刷新")
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "stretch" } },
          React.createElement("div", { className: "tq-hero" + (low || unsupported ? " tq-hero-low" : ""), style: { flex: "1 1 0", minWidth: 0 } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
              React.createElement("div", { className: "tq-hero-label" }, "充值余额"),
              view && view.rechargeUrl
                ? React.createElement("button", {
                    type: "button",
                    onClick: doRecharge,
                    style: { display: "inline-flex", alignItems: "center", height: 24, padding: "0 12px", border: "1px solid var(--dsw-static-blue-500)", borderRadius: 999, background: "transparent", color: "var(--dsw-alias-label-secondary)", font: "inherit", fontSize: 13, lineHeight: 1, cursor: "pointer", whiteSpace: "nowrap", transition: "border-color .15s ease,color .15s ease" }
                  }, "充值")
                : null
            ),
            React.createElement("div", { className: "tq-row" },
              balanceArea,
              msg ? React.createElement("div", { className: "tq-msg tq-msg-" + msgKind }, msg) : null
            ),
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
              React.createElement("span", { className: "tq-hero-meta", style: { margin: 0 } },
                "最近更新 " + timeOf(bal ? bal.fetchedAt : null)
              )
            ),
            low ? React.createElement("div", { className: "tq-hero-warn" }, "充值余额已低于警戒值（" + symbol + fmtBalance(view.threshold) + "），请及时充值") : null,
            bal && bal.error ? React.createElement("div", { className: "tq-hero-err" }, bal.error) : null
          ),
          React.createElement("div", { className: "tq-hero", style: { flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column" } },
            React.createElement("div", { className: "tq-hero-label" }, "Token Plan"),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginTop: 2 } },
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                React.createElement("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-secondary)" } }, "套餐"),
                hasPlan && planEnd
                  ? React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)" } },
                      (planExpired ? "已过期 · " : "到期 ") + planEnd
                    )
                  : null
              ),
              React.createElement("div", { style: { fontSize: 15, fontWeight: 600 } }, planName),
              usedPercentClamped !== null
                ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 6 } },
                    React.createElement("div", { style: { flex: "1 1 0", height: 6, borderRadius: 999, background: "var(--dsw-alias-border-l1)", overflow: "hidden" } },
                      React.createElement("div", { style: { width: usedPercentClamped.toFixed(1) + "%", height: "100%", borderRadius: 999, background: barColor, transition: "width .3s ease" } })
                    ),
                    React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)", flexShrink: 0, minWidth: 40, textAlign: "right", fontVariantNumeric: "tabular-nums" } },
                      usedPercentClamped.toFixed(1) + "%"
                    )
                  )
                : null,
              tpError
                ? React.createElement("div", { style: { fontSize: 12, color: "var(--dsw-alias-state-error-primary)", marginTop: 4 } },
                    "获取失败：" + tpError
                  )
                : null
            )
          )
        ),
        view && view.needsCookie ? React.createElement("div", { className: "tq-section" },
          React.createElement("div", { className: "tq-title" }, "MiMo Cookie（余额查询必需）"),
          React.createElement("input", { className: "tq-input tq-wide", type: "password", value: cookieDraft, onChange: (e) => setCookieDraft(e.target.value), placeholder: view.hasCookie ? "已配置（重新粘贴可更新）" : "粘贴 Cookie…" }),
          React.createElement("button", { type: "button", className: "tq-btn tq-btn-primary", onClick: saveCookie, style: { alignSelf: "flex-start" } }, "保存"),
          React.createElement("div", { className: "tq-key-status", style: { marginTop: 8 } }, view.hasCookie ? "已配置 Cookie" : "未配置"),
          React.createElement("div", { className: "tq-hint" }, "MiMo 余额接口需浏览器 Cookie（约 1 天有效）。请登录 platform.xiaomimimo.com/#/console/balance，用浏览器开发者工具复制请求中的 Cookie 头粘贴至此。")
        ) : null,
        React.createElement("div", { className: "tq-section" },
          React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 } },
            React.createElement("div", { className: "tq-title" }, "余额警戒"),
            React.createElement("button", {
              type: "button",
              role: "switch",
              "aria-checked": alertEnabled,
              onClick: () => saveAlert(!alertEnabled),
              style: { position: "relative", width: 36, height: 20, borderRadius: 999, border: "none", padding: 0, cursor: "pointer", flex: "none", background: alertEnabled ? "#158A4E" : "var(--dsw-alias-border-l2)", transition: "background .15s ease" }
            },
              React.createElement("span", { style: { position: "absolute", top: 2, left: alertEnabled ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .15s ease" } })
            )
          ),
          React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 } },
            React.createElement("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-secondary)" } }, "充值余额警戒值"),
            React.createElement("input", { className: "tq-input", type: "number", min: 0, step: "any", value: thresholdDraft, onChange: onThresholdChange, placeholder: "例如 10", style: { width: 120 } })
          ),
          React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 } },
            React.createElement("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-secondary)" } }, "Token 余额警戒值"),
            React.createElement("input", { className: "tq-input", type: "number", min: 0, max: 100, step: "any", value: tokenThresholdDraft, onChange: onTokenThresholdChange, placeholder: "例如 80", style: { width: 120 } })
          ),
          React.createElement("div", { className: "tq-hint" }, "当充值余额低于「充值余额警戒值」、或 Token Plan 用量超出「Token 余额警戒值」（百分比）时，工作台对话框中的余额胶囊将显示为红色。")
        ),
        React.createElement("div", { className: "tq-section" },
          React.createElement("div", { className: "tq-title" }, "Token 每日消耗（近 30 天）"),
          React.createElement(ConsumptionCurve, { daily: daily, dailyModels: dailyModels, providers: providers })
        )
      );
    }

    /** Collapsible plugin card (matches the 终端/bash card style) wrapping the 余额 page. */
    function TokenQuotaCard() {
      const [open, setOpen] = React.useState(false);
      return React.createElement("li", { className: "tq-plugin-card" + (open ? " tq-plugin-card-open" : "") },
        React.createElement("button", {
          type: "button",
          className: "tq-plugin-card-header",
          "aria-expanded": open,
          "aria-label": (open ? "折叠" : "展开") + ": 余额",
          onClick: () => setOpen(!open),
        },
          React.createElement("span", { className: "tq-plugin-card-headtext" },
            React.createElement("span", { className: "tq-plugin-card-name" }, "余额"),
            React.createElement("span", { className: "tq-plugin-card-desc" }, "充值余额、额度与消耗统计配置")
          ),
          React.createElement("svg", {
            viewBox: "0 0 16 16",
            width: 14,
            height: 14,
            "aria-hidden": true,
            className: "tq-plugin-card-chevron" + (open ? " tq-plugin-card-chevron-open" : ""),
          },
            React.createElement("path", {
              d: "M4 6l4 4 4-4",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 1.5,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            })
          )
        ),
        open ? React.createElement("div", { className: "tq-plugin-card-body" },
          React.createElement(TokenQuotaPage, null)
        ) : null
      );
    }

    function apply(ctx) {
      activeCtx = ctx;
      injectCss();
      ctx.slots.inject("conversation.input.right", () => ctx.slots.register(
        { name: "conversation.input.right", id: "token-quota-capsule", order: 10, label: "余额" },
        (props) => React.createElement(TokenCapsule, { sessionId: props.sessionId })
      ));
      // 余额 设置页放在「设置 → 插件 → 插件配置」的可折叠插件卡片中（不再是独立设置目录项）。
      ctx.slots.inject("settings.plugin.item", () => ctx.slots.register(
        { name: "settings.plugin.item", id: "dsh-token-visual", order: 30, label: "余额" },
        () => React.createElement(TokenQuotaCard, null)
      ));
    }

    module.exports = {
      apply,
      inject: ["slots", "timer"],
    };
    return module.exports;
  }
});
