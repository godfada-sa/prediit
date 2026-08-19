/**
 * prediit — Dashboard Real-Time Sync (v3)
 * ────────────────────────────────────────────
 * Replaces 30-second polling with Supabase Realtime subscriptions.
 *
 * How it works:
 *  1. Loads Supabase JS from CDN (lightweight UMD bundle).
 *  2. Authenticates with the user's existing session from localStorage.
 *  3. Subscribes to postgres_changes on profiles, notifications, payments,
 *     orders, and booking_code_requests for the current user only.
 *  4. On every change: shows a toast, plays a ping, fires a browser
 *     notification, AND invalidates the TanStack Query cache + disables
 *     the 30s polling interval so the React UI updates instantly.
 *  5. Exposes window.__ve_invalidate() for manual cache refresh.
 */
(function () {
  "use strict";

  /* ── Config ─────────────────────────────────────────── */
  const SUPABASE_URL = "https://vzduzbprnbjchssexzmp.supabase.co";
  const SUPABASE_KEY = "sb_publishable_Ycu1cP3Wp92UsGU0JaAnFg_ZQvXE_GY";

  /* All query keys used by the dashboard */
  const ALL_QUERY_KEYS = [
    ["wallet-activity"],
    ["my-account"],
    ["prediction-home"],
    ["efootball-home"],
    ["spin-home"],
  ];

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

  /* ── Toast system ───────────────────────────────────── */

  function injectStyles() {
    if (document.getElementById("ve-rt-css")) return;
    const s = document.createElement("style");
    s.id = "ve-rt-css";
    s.textContent = `@keyframes veSlideIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}#ve-toasts{position:fixed;top:80px;right:16px;z-index:99999;display:flex;flex-direction:column;gap:8px;max-width:380px;pointer-events:none}#ve-toasts>div{pointer-events:auto}`;
    document.head.appendChild(s);
  }

  function toast(title, body, kind) {
    let c = document.getElementById("ve-toasts");
    if (!c) {
      c = document.createElement("div");
      c.id = "ve-toasts";
      document.body.appendChild(c);
    }
    const colour = {
      success: "#00ff88",
      error: "#ff4444",
      info: "#4488ff",
    }[kind] || "#4488ff";
    const el = document.createElement("div");
    el.style.cssText = `background:#111827;border:1px solid ${colour};border-radius:14px;padding:14px 18px;color:#f1f1f1;font-size:13px;line-height:1.45;box-shadow:0 8px 32px rgba(0,0,0,.45);animation:veSlideIn .3s ease;opacity:1;transition:opacity .35s`;
    el.innerHTML = `<div style="font-weight:800;color:${colour};margin-bottom:3px">${esc(title)}</div><div style="color:#9ca3af">${esc(body)}</div>`;
    c.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 350);
    }, 5500);
  }

  function ping() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.setValueAtTime(660, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(
        990,
        ctx.currentTime + 0.08
      );
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + 0.22
      );
      o.start();
      o.stop(ctx.currentTime + 0.22);
    } catch (_) {}
  }

  function browserNotify(title, body) {
    if (
      "Notification" in window &&
      Notification.permission === "granted"
    )
      new Notification(title, {
        body,
        tag: "ve-" + Date.now(),
        icon: "/favicon.png",
      });
  }

  /* ═══════════════════════════════════════════════════════
     TanStack Query Client Discovery
     ═══════════════════════════════════════════════════════
     The React app creates a single QueryClient and passes it
     via React Context. We walk the React fiber tree to find
     it, then use it directly to invalidate queries and
     disable polling intervals.
     ═══════════════════════════════════════════════════════ */

  let _queryClient = null;
  let _pollingIntervals = []; // references to setInterval IDs we've disabled

  /**
   * Find the TanStack QueryClient by walking the React fiber tree.
   * TanStack Query stores the client in a context value that flows
   * through the fiber. We look for objects with invalidateQueries().
   */
  function findQueryClient() {
    if (_queryClient) return _queryClient;

    // Strategy 1: Walk React fiber from body
    const root = document.body;
    for (const key of Object.keys(root)) {
      if (
        key.startsWith("__reactFiber$") ||
        key.startsWith("__reactContainer$")
      ) {
        const fiber = root[key];
        if (fiber) {
          const qc = walkFiber(fiber);
          if (qc) {
            _queryClient = qc;
            return _queryClient;
          }
        }
      }
    }

    // Strategy 2: Walk from main element
    const main = document.querySelector("main");
    if (main) {
      for (const key of Object.keys(main)) {
        if (
          key.startsWith("__reactFiber$") ||
          key.startsWith("__reactContainer$")
        ) {
          const fiber = main[key];
          if (fiber) {
            const qc = walkFiber(fiber);
            if (qc) {
              _queryClient = qc;
              return _queryClient;
            }
          }
        }
      }
    }

    // Strategy 3: Check for global (some setups expose it)
    if (
      window.__TANSTACK_QUERY_CLIENT__?.invalidateQueries
    ) {
      _queryClient = window.__TANSTACK_QUERY_CLIENT__;
      return _queryClient;
    }

    return null;
  }

  function walkFiber(root) {
    if (!root) return null;
    const visited = new Set();
    const queue = [root];

    while (queue.length > 0 && visited.size < 1000) {
      const node = queue.shift();
      if (!node || visited.has(node)) continue;
      visited.add(node);

      // Check memoizedState chain for QueryClient
      let state = node.memoizedState;
      while (state) {
        const mc = state.memoizedState;
        if (
          mc &&
          typeof mc === "object" &&
          typeof mc.invalidateQueries === "function" &&
          typeof mc.getQueryCache === "function"
        ) {
          return mc;
        }
        // TanStack Query v5 stores it in a different shape
        if (
          mc?.queryClient?.invalidateQueries
        ) {
          return mc.queryClient;
        }
        state = state.next;
      }

      if (node.child) queue.push(node.child);
      if (node.sibling) queue.push(node.sibling);
    }
    return null;
  }

  /**
   * Invalidate all known query keys.
   * This forces TanStack Query to refetch the data immediately.
   */
  function invalidateAll() {
    const qc = findQueryClient();
    if (!qc) return false;

    try {
      // Invalidate all queries (blanket invalidation)
      qc.invalidateQueries();
      return true;
    } catch (e) {
      console.warn("[prediit] invalidateQueries failed:", e);
      return false;
    }
  }

  /**
   * Invalidate specific query keys.
   */
  function invalidateQueries(queryKeys) {
    const qc = findQueryClient();
    if (!qc) return false;

    try {
      for (const key of queryKeys) {
        qc.invalidateQueries({ queryKey: key });
      }
      return true;
    } catch (e) {
      console.warn("[prediit] invalidateQueries failed:", e);
      return false;
    }
  }

  /**
   * Disable the 30-second polling interval on wallet-activity.
   *
   * The dashboard component creates a query with refetchInterval: 30000.
   * We find the observer in the query cache and set its interval to 0,
   * effectively disabling polling. Realtime events will trigger refetches
   * instead.
   */
  function disablePolling() {
    const qc = findQueryClient();
    if (!qc) return;

    try {
      const cache = qc.getQueryCache();
      const queries = cache.getAll();

      for (const query of queries) {
        // Check if this query has a polling interval
        const observer = query.observers?.[0];
        if (observer && observer.options?.refetchInterval) {
          const interval = observer.options.refetchInterval;
          if (
            typeof interval === "number" &&
            interval >= 20000
          ) {
            // This is the 30s polling query — disable it
            _pollingIntervals.push({
              queryKey: query.queryKey,
              originalInterval: interval,
              observer,
            });

            // Override to only poll every 5 minutes (as a safety net)
            observer.setOptions({
              ...observer.options,
              refetchInterval: 300000,
            });

            console.log(
              `%c[prediit] ⏸ Disabled 30s polling on query: ${JSON.stringify(query.queryKey)}`,
              "color:#fbbf24;font-weight:bold"
            );
          }
        }
      }
    } catch (e) {
      console.warn("[prediit] disablePolling failed:", e);
    }
  }

  /* ═══════════════════════════════════════════════════════
     Global API
     ═══════════════════════════════════════════════════════ */

  // Expose for manual use from console
  window.__ve_invalidate = function () {
    invalidateAll();
  };

  window.__ve_restorePolling = function () {
    const qc = findQueryClient();
    if (!qc) return;
    for (const { queryKey, originalInterval, observer } of _pollingIntervals) {
      observer.setOptions({
        ...observer.options,
        refetchInterval: originalInterval,
      });
      console.log(
        `%c[prediit] ▶ Restored ${originalInterval / 1000}s polling on: ${JSON.stringify(queryKey)}`,
        "color:#22c55e;font-weight:bold"
      );
    }
    _pollingIntervals = [];
  };

  /* ═══════════════════════════════════════════════════════
     Main
     ═══════════════════════════════════════════════════════ */

  async function init() {
    injectStyles();
    try {
      await loadScript("/assets/supabase.min.js");
    } catch (_) {
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"
      );
    }

    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    if (
      "Notification" in window &&
      Notification.permission === "default"
    )
      Notification.requestPermission();

    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      console.log(
        "%c[prediit] ⏸ No active session — real-time sync skipped",
        "color:#888"
      );
      return;
    }

    console.log(
      `%c[prediit] ⚡ Real-time sync active for ${user.email}`,
      "color:#00ff88;font-weight:bold"
    );

    // Wait a tick for React to mount, then disable polling
    setTimeout(() => {
      if (disablePolling()) {
        console.log(
          "%c[prediit] ✅ 30s polling disabled — realtime replaces it",
          "color:#00ff88;font-weight:bold"
        );
      } else {
        console.log(
          "%c[prediit] ⏳ Polling will be disabled once React mounts",
          "color:#fbbf24"
        );
        // Retry every 2s for up to 10s
        let retries = 0;
        const retryInterval = setInterval(() => {
          retries++;
          if (disablePolling() || retries > 5) {
            clearInterval(retryInterval);
          }
        }, 2000);
      }
    }, 3000);

    /* ── Profile changes (status, diamonds, gold, tickets) ── */
    sb.channel("rt-profile-" + user.id)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new,
            o = payload.old;

          if (n.status !== o.status) {
            if (n.status === "active")
              toast(
                "🎉 Account Activated!",
                "Your payment was approved. Full access unlocked!",
                "success"
              );
            else if (n.status === "suspended")
              toast(
                "⚠️ Access Suspended",
                "Your account has been suspended. Contact support.",
                "error"
              );
            else if (n.status === "pending")
              toast(
                "⏳ Under Review",
                "Your account is pending admin approval.",
                "info"
              );
          }

          if (n.diamonds !== o.diamonds) {
            const d = n.diamonds - o.diamonds;
            toast(
              "💎 Diamonds " + (d > 0 ? "Credited" : "Used"),
              d > 0
                ? `+${d} diamonds. Balance: ${n.diamonds}`
                : `${Math.abs(d)} diamonds spent. Balance: ${n.diamonds}`,
              d > 0 ? "success" : "info"
            );
          }

          if (n.gold !== o.gold) {
            const d = n.gold - o.gold;
            toast(
              "🪙 Gold " + (d > 0 ? "Credited" : "Used"),
              d > 0
                ? `+${d} gold. Balance: ${n.gold}`
                : `${Math.abs(d)} gold spent. Balance: ${n.gold}`,
              d > 0 ? "success" : "info"
            );
          }

          if (n.tickets !== o.tickets) {
            const d = n.tickets - o.tickets;
            toast(
              "🎫 Tickets " + (d > 0 ? "Credited" : "Used"),
              d > 0
                ? `+${d} tickets. Balance: ${n.tickets}`
                : `${Math.abs(d)} tickets spent. Balance: ${n.tickets}`,
              d > 0 ? "success" : "info"
            );
          }

          ping();
          browserNotify(
            "prediit Update",
            "Your account data has been updated."
          );
          invalidateAll();
        }
      )
      .subscribe();

    /* ── Notifications (admin messages, approvals, etc.) ─ */
    sb.channel("rt-notifs-" + user.id)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new;
          toast(row.title, row.body, row.kind);
          ping();
          browserNotify(row.title, row.body);
          invalidateAll();
        }
      )
      .subscribe();

    /* ── Payment status changes (own payments) ─────────── */
    sb.channel("rt-payments-" + user.id)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "payments",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new,
            o = payload.old;
          if (n.status !== o.status) {
            if (n.status === "approved")
              toast(
                "✅ Payment Approved",
                "Your registration payment has been approved!",
                "success"
              );
            else if (n.status === "rejected")
              toast(
                "❌ Payment Declined",
                n.admin_note || "Your payment proof was rejected.",
                "error"
              );
          }
          ping();
          invalidateAll();
        }
      )
      .subscribe();

    /* ── Order status changes (diamond/gold purchases) ──── */
    sb.channel("rt-orders-" + user.id)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new,
            o = payload.old;
          if (n.status !== o.status) {
            if (n.status === "approved")
              toast(
                "💎 Order Approved",
                `${n.diamonds} credits added to your account!`,
                "success"
              );
            else if (n.status === "rejected")
              toast(
                "❌ Order Declined",
                n.admin_note || "Your purchase was rejected.",
                "error"
              );
          }
          ping();
          invalidateAll();
        }
      )
      .subscribe();

    /* ── EFootball booking code requests ───────────────── */
    sb.channel("rt-efootball-" + user.id)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "booking_code_requests",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new;
          if (n.status === "approved" && n.code)
            toast(
              "⚽ Booking Code Ready",
              `Your eFootball code: ${n.code}`,
              "success"
            );
          else if (n.status === "rejected")
            toast(
              "❌ Request Declined",
              "Your booking code request was declined.",
              "error"
            );
          ping();
          invalidateAll();
        }
      )
      .subscribe();
  }

  /* ── Boot ───────────────────────────────────────────── */
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
