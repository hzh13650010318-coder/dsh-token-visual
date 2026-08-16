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
      tag.textContent = "\n.tq-capsule{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:22px;min-width:44px;padding:0 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:500;font-variant-numeric:tabular-nums;line-height:1;white-space:nowrap;cursor:pointer;user-select:none;transition:border-color .15s ease,color .15s ease}\n.tq-capsule:hover{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}\n.tq-capsule.tq-ok{border-color:var(--dsw-static-green-400);color:var(--dsw-static-green-400)}\n.tq-capsule.tq-ok:hover{border-color:var(--dsw-static-green-500);color:var(--dsw-static-green-500)}\n.tq-capsule.tq-low{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}\n.tq-capsule.tq-unsupported{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}\n.tq-page{box-sizing:border-box;width:100%;max-width:600px;display:flex;flex-direction:column;gap:16px;padding:4px 2px 24px;font-family:var(--dsw-font-family),system-ui,sans-serif;color:var(--dsw-alias-label-primary)}\n.tq-hero{box-sizing:border-box;display:flex;flex-direction:column;gap:6px;padding:20px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:16px}\n.tq-hero-low{border-color:var(--dsw-alias-state-error-primary)}\n.tq-hero-label{font-size:13px;color:var(--dsw-alias-label-secondary)}\n.tq-hero-value{font-size:34px;font-weight:600;line-height:1.15;letter-spacing:-.5px;font-variant-numeric:tabular-nums}\n.tq-hero-low .tq-hero-value{color:var(--dsw-alias-state-error-primary)}\n.tq-hero-unsupported{font-size:16px;font-weight:600;color:var(--dsw-alias-state-error-primary)}\n.tq-hero-model{font-size:12px;color:var(--dsw-alias-label-tertiary)}\n.tq-hero-meta{font-size:12px;color:var(--dsw-alias-label-tertiary)}\n.tq-hero-warn{font-size:12px;color:var(--dsw-alias-state-error-primary)}\n.tq-hero-err{font-size:12px;color:var(--dsw-alias-state-error-primary)}\n.tq-hero-actions{display:flex;gap:8px;margin-top:8px}\n.tq-select{box-sizing:border-box;height:34px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;outline:none;cursor:pointer;max-width:100%}\n.tq-section{box-sizing:border-box;display:flex;flex-direction:column;gap:12px;padding:18px 20px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:16px}\n.tq-title{font-size:15px;font-weight:600}\n.tq-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.tq-input{box-sizing:border-box;height:34px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;outline:none;transition:border-color .15s ease}\n.tq-input:focus{border-color:var(--dsw-alias-brand-primary)}\n.tq-btn{box-sizing:border-box;height:34px;padding:0 16px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;cursor:pointer;transition:background .15s ease,border-color .15s ease}\n.tq-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}\n.tq-btn-primary{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:#fff}\n.tq-btn-primary:hover{background:var(--dsw-alias-brand-primary);filter:brightness(1.08)}\n.tq-hint{font-size:12px;color:var(--dsw-alias-label-tertiary);line-height:1.5}\n.tq-msg{font-size:12px;padding:6px 12px;border-radius:10px;white-space:nowrap}\n.tq-msg-ok{color:var(--dsw-alias-state-success-primary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}\n.tq-msg-err{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}\n.tq-curve{width:100%}\n.tq-curve svg{display:block}\n.tq-grid{stroke:var(--dsw-alias-border-l1);stroke-width:1}\n.tq-axis{fill:var(--dsw-alias-label-tertiary);font-size:10px}\n.tq-curve-area{fill:var(--dsw-alias-brand-primary);opacity:.12;stroke:none}\n.tq-curve-line{fill:none;stroke:var(--dsw-alias-brand-primary);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}\n.tq-curve-dot{fill:var(--dsw-alias-brand-primary)}\n.tq-cal{display:flex;flex-direction:column;gap:8px}\n.tq-cal-head{display:flex;align-items:center;justify-content:space-between}\n.tq-cal-title{font-size:14px;font-weight:500}\n.tq-cal-nav{box-sizing:border-box;width:28px;height:28px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:15px;cursor:pointer;line-height:1}\n.tq-cal-nav:hover{background:var(--dsw-alias-interactive-bg-hover)}\n.tq-cal-week{display:grid;grid-template-columns:repeat(7,44px);gap:2px;justify-content:center}\n.tq-cal-weekday{height:20px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--dsw-alias-label-tertiary)}\n.tq-cal-grid{display:grid;grid-template-columns:repeat(7,44px);gap:2px;justify-content:center}\n.tq-cal-cell{box-sizing:border-box;width:44px;height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-radius:50%;position:relative;cursor:default}\n.tq-cal-blank{visibility:hidden}\n.tq-cal-date{width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:13px;color:var(--dsw-alias-label-primary)}\n.tq-cal-empty .tq-cal-date{color:var(--dsw-alias-label-tertiary)}\n.tq-cal-today .tq-cal-date{box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l2)}\n.tq-cal-cell:hover .tq-cal-date{background:var(--dsw-alias-brand-primary);color:#fff;box-shadow:none}\n.tq-cal-count{font-size:9px;line-height:10px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}\n.tq-cal-cell:hover .tq-cal-count{opacity:0}\n.tq-cal-cell::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:4px 10px;font-size:11px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .12s ease;z-index:10;box-shadow:0 4px 16px rgba(0,0,0,.12)}\n.tq-cal-cell:hover::after{opacity:1}\n";
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
      const low = !unsupported && total !== null && total !== undefined && view && typeof view.threshold === "number" && total < view.threshold;

      let cls = "tq-capsule";
      let label = "—";
      let style = undefined;
      if (failed) { label = "!"; }
      else if (unsupported) { label = "不支持"; cls += " tq-capsule-unsupported"; style = { borderColor: RED, color: RED }; }
      else if (total !== null && total !== undefined) {
        label = fmtBalance(total);
        if (low) { cls += " tq-capsule-low"; style = { borderColor: RED, color: RED }; }
        else { cls += " tq-capsule-ok"; style = { borderColor: GREEN, color: GREEN }; }
      }

      const tip = (() => {
        if (failed) return "Token 余额获取失败，点击重试";
        if (unsupported) return "该模型尚不支持：" + (view && view.current ? view.current.provider + " / " + view.current.model : "") + "\n点击刷新";
        if (total === null || total === undefined) {
          const err = bal && bal.error;
          return (err ? err + "\n" : "") + "点击刷新";
        }
        const sym = curSymbol(bal ? bal.currency : "CNY");
        const lines = [];
        lines.push("Token 余额：" + sym + fmtBalance(total));
        if (view && typeof view.threshold === "number") lines.push("警戒值：" + sym + fmtBalance(view.threshold));
        if (low) lines.push("⚠ 余额不足");
        if (bal && bal.error) lines.push(bal.error);
        lines.push("点击刷新余额");
        return lines.join("\n");
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
        },
        label
      );
    }

    function ConsumptionCurve(props) {
      const daily = props.daily || {};
      const days = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        days.push({ key: keyOf(d), label: (d.getMonth() + 1) + "/" + d.getDate(), tokens: daily[keyOf(d)] || 0 });
      }
      const cap = Math.max(1, days.reduce((m, x) => Math.max(m, x.tokens), 0));
      const W = 640, H = 190, L = 48, R = 14, T = 12, B = 26;
      const iw = W - L - R, ih = H - T - B;
      const x = (i) => L + (iw * i) / (days.length - 1);
      const y = (v) => T + ih - (ih * v) / cap;
      const linePts = days.map((d, i) => (i === 0 ? "M" : "L") + x(i).toFixed(1) + " " + y(d.tokens).toFixed(1)).join(" ");
      const areaPts = linePts + " L" + x(days.length - 1).toFixed(1) + " " + (T + ih) + " L" + x(0).toFixed(1) + " " + (T + ih) + " Z";
      const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ v: cap * f, yy: y(cap * f) }));

      return React.createElement(
        "div",
        { className: "tq-curve" },
        React.createElement(
          "svg",
          { viewBox: "0 0 " + W + " " + H, width: "100%" },
          ticks.map((t) =>
            React.createElement("g", { key: "y" + t.v },
              React.createElement("line", { x1: L, y1: t.yy, x2: W - R, y2: t.yy, className: "tq-grid" }),
              React.createElement("text", { x: L - 6, y: t.yy + 4, className: "tq-axis", textAnchor: "end" }, fmtCompact(Math.round(t.v)))
            )
          ),
          days.map((d, i) =>
            i % 5 === 0 || i === days.length - 1
              ? React.createElement("text", { key: "x" + d.key, x: x(i), y: H - 8, className: "tq-axis", textAnchor: "middle" }, d.label)
              : null
          ),
          React.createElement("path", { d: areaPts, className: "tq-curve-area" }),
          React.createElement("path", { d: linePts, className: "tq-curve-line" }),
          days.map((d, i) =>
            d.tokens > 0
              ? React.createElement("circle", { key: "d" + d.key, cx: x(i), cy: y(d.tokens), r: 2.5, className: "tq-curve-dot" })
              : null
          )
        )
      );
    }

    const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

    function ConsumptionCalendar(props) {
      const daily = props.daily || {};
      const [offset, setOffset] = React.useState(0);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + offset;
      const first = new Date(year, month, 1);
      const lead = (first.getDay() + 6) % 7;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const todayKey = keyOf(now);
      const cells = [];
      for (let i = 0; i < lead; i++) cells.push(null);
      for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

      return React.createElement("div", { className: "tq-cal" },
        React.createElement("div", { className: "tq-cal-head" },
          React.createElement("button", { type: "button", className: "tq-cal-nav", onClick: () => setOffset(offset - 1) }, "‹"),
          React.createElement("div", { className: "tq-cal-title" }, year + "年" + (month + 1) + "月"),
          React.createElement("button", { type: "button", className: "tq-cal-nav", onClick: () => setOffset(offset + 1) }, "›")
        ),
        React.createElement("div", { className: "tq-cal-week" },
          WEEKDAYS.map((w) => React.createElement("div", { key: w, className: "tq-cal-weekday" }, w))
        ),
        React.createElement("div", { className: "tq-cal-grid" },
          cells.map((d, i) => {
            if (!d) return React.createElement("div", { key: "x" + i, className: "tq-cal-cell tq-cal-blank" });
            const k = keyOf(d);
            const tokens = daily[k] || 0;
            const tip = (d.getMonth() + 1) + "月" + d.getDate() + "日" + (tokens > 0 ? " 消耗 " + fmtNumber(tokens) + " tokens" : " 无消耗记录");
            let cls = "tq-cal-cell" + (tokens === 0 ? " tq-cal-empty" : "") + (k === todayKey ? " tq-cal-today" : "");
            return React.createElement("div", { key: k, className: cls, "data-tip": tip },
              React.createElement("span", { className: "tq-cal-date" }, String(d.getDate())),
              React.createElement("span", { className: "tq-cal-count" }, tokens > 0 ? fmtCompact(tokens) : "")
            );
          })
        )
      );
    }

    function TokenQuotaPage() {
      const [view, setView] = React.useState(null);
      const [picked, setPicked] = React.useState(null);
      const [thresholdDraft, setThresholdDraft] = React.useState("");
      const [msg, setMsg] = React.useState("");
      const [msgKind, setMsgKind] = React.useState("ok");

      const refresh = React.useCallback(() => {
        const args = picked ? { provider: picked.provider, model: picked.model } : {};
        api("/state", args).then((v) => {
          setView(v);
          setThresholdDraft((prev) => (prev === "" && v && typeof v.threshold === "number") ? String(v.threshold) : prev);
        }).catch(() => {
          setMsg("加载失败，请稍后重试");
          setMsgKind("err");
        });
      }, [picked]);

      React.useEffect(() => {
        refresh();
        return activeCtx.interval(refresh, 30000);
      }, [refresh]);

      const showMsg = (text, kind) => { setMsg(text); setMsgKind(kind || "ok"); };

      const saveThreshold = () => {
        const n = Number(thresholdDraft);
        if (!Number.isFinite(n) || n < 0) { showMsg("警戒值需为非负数字", "err"); return; }
        api("/update", { threshold: n })
          .then((v) => { setView(v); showMsg("警戒值已保存"); })
          .catch(() => showMsg("保存失败", "err"));
      };

      const doFetch = () => {
        const args = picked ? { provider: picked.provider, model: picked.model } : {};
        api("/fetch", args)
          .then((v) => { setView(v); showMsg(v && v.balance && v.balance.error ? v.balance.error : "余额已刷新"); })
          .catch(() => showMsg("刷新失败", "err"));
      };

      const doRecharge = () => {
        if (view && view.rechargeUrl) window.open(view.rechargeUrl, "_blank", "noopener,noreferrer");
      };

      const onPick = (e) => {
        const val = e.target.value;
        if (!val) { setPicked(null); return; }
        const sep = val.indexOf("::");
        const provider = val.slice(0, sep);
        const model = val.slice(sep + 2);
        setPicked({ provider, model });
        api("/fetch", { provider, model })
          .then((v) => { setView(v); showMsg("余额已刷新"); })
          .catch(() => showMsg("刷新失败", "err"));
      };

      const sel = picked || (view && view.current ? { provider: view.current.provider, model: view.current.model } : null);
      const bal = view ? view.balance : null;
      const total = bal ? bal.total : null;
      const unsupported = bal ? bal.supported === false : false;
      const low = !unsupported && total !== null && total !== undefined && view && typeof view.threshold === "number" && total < view.threshold;
      const symbol = curSymbol(bal ? bal.currency : "CNY");
      const daily = view ? (view.daily || {}) : {};
      const todayTokens = daily[keyOf(new Date())] || 0;
      const selKey = sel ? sel.provider + "::" + sel.model : "";
      const providers = (view && view.providers) || [];

      const balanceArea = unsupported
        ? React.createElement("div", { className: "tq-hero-unsupported" }, "该模型尚不支持")
        : React.createElement("div", { className: "tq-hero-value" + (low ? " tq-hero-low-value" : "") }, symbol + " " + fmtBalance(total));

      return React.createElement("div", { className: "tq-page" },
        React.createElement("div", { className: "tq-hero" + (low || unsupported ? " tq-hero-low" : "") },
          React.createElement("div", { className: "tq-hero-label" }, "Token 余额"),
          React.createElement("div", { className: "tq-row" },
            React.createElement("select", { className: "tq-select", value: selKey, onChange: onPick },
              React.createElement("option", { value: "" }, "跟随当前选中模型"),
              providers.map((p) =>
                p.models.map((m) =>
                  React.createElement("option", { key: p.provider + "::" + m.id, value: p.provider + "::" + m.id },
                    p.name + " · " + (m.name || m.id) + (p.supported ? "" : "（不支持）")
                  )
                )
              )
            )
          ),
          React.createElement("div", { className: "tq-row" },
            balanceArea,
            msg ? React.createElement("div", { className: "tq-msg tq-msg-" + msgKind }, msg) : null
          ),
          React.createElement("div", { className: "tq-hero-model" }, "当前查看：" + (sel ? sel.provider + " / " + sel.model : "—")),
          React.createElement("div", { className: "tq-hero-meta" },
            "最近更新 " + timeOf(bal ? bal.fetchedAt : null) + " · 今日已消耗 " + fmtNumber(todayTokens) + " tokens"
          ),
          low ? React.createElement("div", { className: "tq-hero-warn" }, "余额已低于警戒值（" + symbol + fmtBalance(view.threshold) + "），请及时充值") : null,
          bal && bal.error ? React.createElement("div", { className: "tq-hero-err" }, bal.error) : null,
          React.createElement("div", { className: "tq-hero-actions" },
            React.createElement("button", { type: "button", className: "tq-btn", onClick: doFetch }, "刷新余额"),
            view && view.rechargeUrl
              ? React.createElement("button", { type: "button", className: "tq-btn tq-btn-primary", onClick: doRecharge }, "充值")
              : null
          )
        ),
        React.createElement("div", { className: "tq-section" },
          React.createElement("div", { className: "tq-title" }, "余额警戒值"),
          React.createElement("div", { className: "tq-row" },
            React.createElement("input", { className: "tq-input", type: "number", min: 0, step: "any", value: thresholdDraft, onChange: (e) => setThresholdDraft(e.target.value), placeholder: "例如 10" }),
            React.createElement("button", { type: "button", className: "tq-btn tq-btn-primary", onClick: saveThreshold }, "保存")
          ),
          React.createElement("div", { className: "tq-hint" }, "当余额低于该值时，工作台对话框中的余额胶囊将显示为红色。")
        ),
        React.createElement("div", { className: "tq-section" },
          React.createElement("div", { className: "tq-title" }, "余额接口"),
          React.createElement("div", { className: "tq-hint" }, "余额自动使用当前模型所属服务商的配置（API 地址与 Key 均取自工作台已配置的模型设置，无需手动填写）。DeepSeek 官方模型支持余额查询；其他模型将显示红色“该模型尚不支持”。")
        ),
        React.createElement("div", { className: "tq-section" },
          React.createElement("div", { className: "tq-title" }, "Token 每日消耗（近 30 天）"),
          React.createElement(ConsumptionCurve, { daily: daily })
        ),
        React.createElement("div", { className: "tq-section" },
          React.createElement("div", { className: "tq-title" }, "消耗日历"),
          React.createElement(ConsumptionCalendar, { daily: daily }),
          React.createElement("div", { className: "tq-hint" }, "将鼠标指向日期即可查看当日消耗（日期高亮为圆形）。")
        )
      );
    }

    function apply(ctx) {
      activeCtx = ctx;
      injectCss();
      ctx.slots.inject("conversation.input.right", () => ctx.slots.register(
        { name: "conversation.input.right", id: "token-quota-capsule", order: 10, label: "Token余额" },
        (props) => React.createElement(TokenCapsule, { sessionId: props.sessionId })
      ));
      ctx.slots.inject("settings.section", () => ctx.slots.register(
        { name: "settings.section", id: "token-quota", order: 25, label: "Token余额" },
        () => React.createElement(TokenQuotaPage, null)
      ));
    }

    module.exports = {
      apply,
      inject: ["slots", "timer"],
    };
    return module.exports;
  }
});
