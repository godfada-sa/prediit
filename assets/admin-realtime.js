/**
 * prediit — Admin Console Real-Time Sync (v2)
 * ──────────────────────────────────────────────
 * Injects Supabase Realtime subscriptions into the admin page.
 * Listens for new payments, orders, profile changes, gold transactions,
 * booking code requests, and spin signals.
 * Shows toast notifications + browser alerts + audio pings.
 */
(function () {
  "use strict";

  const SUPABASE_URL = "https://vzduzbprnbjchssexzmp.supabase.co";
  const SUPABASE_KEY = "sb_publishable_Ycu1cP3Wp92UsGU0JaAnFg_ZQvXE_GY";

  /* ── Helpers ────────────────────────────────────────── */

  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = document.createElement("script");
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function injectStyles() {
    if (document.getElementById("ve-rt-css")) return;
    const s = document.createElement("style");
    s.id = "ve-rt-css";
    s.textContent = `
      @keyframes veSlideIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
      @keyframes vePulse{0%,100%{opacity:1}50%{opacity:.4}}
      #ve-toasts{position:fixed;top:80px;right:16px;z-index:99999;display:flex;flex-direction:column;gap:8px;max-width:380px;pointer-events:none}
      #ve-toasts>div{pointer-events:auto}
    `;
    document.head.appendChild(s);
  }

  /* ── Toast ──────────────────────────────────────────── */

  function toast(title, body, kind) {
    let c = document.getElementById("ve-toasts");
    if (!c) {
      c = document.createElement("div");
      c.id = "ve-toasts";
      document.body.appendChild(c);
    }
    const colour = { success: "#00ff88", error: "#ff4444", info: "#4488ff", warning: "#fbbf24" }[kind] || "#4488ff";
    const el = document.createElement("div");
    el.style.cssText = `background:#111827;border:1px solid ${colour};border-radius:14px;padding:14px 18px;color:#f1f1f1;font-size:13px;line-height:1.45;box-shadow:0 8px 32px rgba(0,0,0,.45);animation:veSlideIn .3s ease;opacity:1;transition:opacity .35s`;
    el.innerHTML = `<div style="font-weight:800;color:${colour};margin-bottom:3px">${esc(title)}</div><div style="color:#9ca3af">${esc(body)}</div>`;
    c.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 350); }, 6000);
  }

  function ping() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.start(); o.stop(ctx.currentTime + 0.25);
    } catch (_) {}
  }

  function browserNotify(title, body) {
    if ("Notification" in window && Notification.permission === "granted")
      new Notification(title, { body, tag: "ve-admin-" + Date.now(), icon: "/favicon.png" });
  }

  /* ── Force React app to refetch data ────────────────── */

  function invalidateQueries() {
    // BroadcastChannel (cross-tab + same-tab)
    try {
      const bc = new BroadcastChannel("ve-admin-refresh");
      bc.postMessage({ ts: Date.now() });
      bc.close();
    } catch (_) {}

    // Storage event trick
    try {
      localStorage.setItem("ve-admin-ping", String(Date.now()));
      setTimeout(() => localStorage.removeItem("ve-admin-ping"), 100);
    } catch (_) {}

    // Custom events
    window.dispatchEvent(new Event("ve-realtime-update"));
    window.dispatchEvent(new StorageEvent("storage", { key: "ve-admin-ping" }));
  }

  /* ── Live badge in header ───────────────────────────── */

  function addLiveBadge() {
    const header = document.querySelector("header");
    if (!header) return;
    const badge = document.createElement("span");
    badge.id = "ve-live";
    badge.style.cssText = "display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:800;color:#00ff88;padding:5px 10px;border-radius:20px;border:1px solid rgba(0,255,136,.3);background:rgba(0,255,136,.06);letter-spacing:.5px";
    badge.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#00ff88;animation:vePulse 2s infinite"></span> LIVE';
    header.querySelector("div")?.appendChild(badge);
  }

  /* ── Counter badge for pending items ────────────────── */

  let pendingCount = 0;
  function updateCounter() {
    let counter = document.getElementById("ve-pending-count");
    if (!counter) {
      counter = document.createElement("span");
      counter.id = "ve-pending-count";
      counter.style.cssText = "display:none;position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:9px;background:#ff4444;color:#fff;font-size:10px;font-weight:800;text-align:center;line-height:18px;padding:0 4px";
      const live = document.getElementById("ve-live");
      if (live) {
        live.style.position = "relative";
        live.appendChild(counter);
      }
    }
    if (pendingCount > 0) {
      counter.style.display = "grid";
      counter.textContent = pendingCount > 99 ? "99+" : pendingCount;
    } else {
      counter.style.display = "none";
    }
  }

  /* ── Main ───────────────────────────────────────────── */

  async function init() {
    injectStyles();
    try {
      await loadScript("/assets/supabase.min.js");
    } catch (_) {
      await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js");
    }

    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    if ("Notification" in window && Notification.permission === "default")
      Notification.requestPermission();

    addLiveBadge();
    console.log("%c[prediit] ⚡ Admin real-time sync active", "color:#00ff88;font-weight:bold");

    /* ── New payment proofs (registrations) ────────────── */
    sb.channel("admin-payments")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "payments" }, (p) => {
        const r = p.new;
        toast("📩 New Payment Proof", `${r.email} submitted ${r.method} — ${r.amount} ${r.currency}`, "info");
        pendingCount++; updateCounter();
        ping(); browserNotify("New Payment Proof", `${r.email} — ${r.method}`);
        invalidateQueries();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "payments" }, (p) => {
        const r = p.new;
        toast("✅ Payment Reviewed", `${r.email} — ${r.status}`, r.status === "approved" ? "success" : "warning");
        pendingCount = Math.max(0, pendingCount - 1); updateCounter();
        ping(); invalidateQueries();
      })
      .subscribe();

    /* ── New diamond orders ────────────────────────────── */
    sb.channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (p) => {
        const r = p.new;
        toast("💎 New Diamond Order", `${r.email} — ${r.diamonds} diamonds (${r.package_name}) — ${r.amount} ${r.currency}`, "info");
        pendingCount++; updateCounter();
        ping(); browserNotify("New Diamond Order", `${r.email} — ${r.diamonds} diamonds`);
        invalidateQueries();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (p) => {
        const r = p.new;
        toast("💎 Order Reviewed", `${r.email} — ${r.diamonds} diamonds — ${r.status}`, r.status === "approved" ? "success" : "warning");
        pendingCount = Math.max(0, pendingCount - 1); updateCounter();
        ping(); invalidateQueries();
      })
      .subscribe();

    /* ── New member registrations ──────────────────────── */
    sb.channel("admin-profiles")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (p) => {
        const r = p.new;
        toast("👤 New Member", `${r.email || r.full_name || 'Unknown'} — ${r.status}`, "success");
        pendingCount++; updateCounter();
        ping(); browserNotify("New Member", `${r.email || r.full_name}`);
        invalidateQueries();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, (p) => {
        const n = p.new, o = p.old;
        if (n.status !== o.status)
          toast("👤 Status Changed", `${n.email || n.full_name}: ${o.status} → ${n.status}`, "info");
        if (n.diamonds !== o.diamonds)
          toast("💎 Diamonds Updated", `${n.email}: ${o.diamonds} → ${n.diamonds}`, "info");
        if (n.gold !== o.gold)
          toast("🪙 Gold Updated", `${n.email}: ${o.gold} → ${n.gold}`, "info");
        ping(); invalidateQueries();
      })
      .subscribe();

    /* ── Gold transactions ─────────────────────────────── */
    sb.channel("admin-gold")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "gold_transactions" }, (p) => {
        const r = p.new;
        toast("🪙 Gold Transaction", `${r.kind}: ${r.amount} gold — ${r.reason}`, "info");
        ping(); invalidateQueries();
      })
      .subscribe();

    /* ── Booking code requests ─────────────────────────── */
    sb.channel("admin-efootball")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "booking_code_requests" }, (p) => {
        const r = p.new;
        toast("⚽ New Booking Code Request", `User requested an eFootball booking code`, "info");
        pendingCount++; updateCounter();
        ping(); invalidateQueries();
      })
      .subscribe();

    /* ── Spin signals ──────────────────────────────────── */
    sb.channel("admin-spin")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "spin_signals" }, (p) => {
        const r = p.new;
        toast("🎰 New Spin Signal", `Direction: ${r.direction} — Confidence: ${r.confidence}%`, "info");
        ping(); invalidateQueries();
      })
      .subscribe();
  }

  /* ── Boot ───────────────────────────────────────────── */
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else
    init();
})();
