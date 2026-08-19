import {G as e, o as t, q as n} from "./useStore-BI3_Wmfo.js";
var G = t();

import {i as r, n as i} from "./auth-middleware-vq8LsfrH.js";
import {C as SupabaseClient, S as a, _ as o, a as s, c, d as l, i as u, k as d, o as f, p, v as m} from "./index-sG8SpmM9.js";
var supabaseClient = SupabaseClient;
import {o as h, t as g} from "./button-DS1rjqG5.js";
import {n as _, t as v} from "./trending-up-C2afOBtn.js";
import {n as y, t as ee} from "./log-out-UeAcfEkt.js";
import {_ as b, a as x, c as S, d as te, f as ne, g as re, i as ie, l as ae, m as oe, n as se, o as ce, p as C, r as w, s as le, t as T, u as E} from "./admin.functions-Qwu3nqHw.js";
import {t as ue} from "./clock-CoLxtegL.js";
import {t as D} from "./eye-CCpK9ho-.js";
import {t as O} from "./gamepad-2-1NQauY1n.js";
import {t as k} from "./gem-BrEBzmCS.js";
import {t as de} from "./receipt-YN0Cilx5.js";
import {t as A} from "./shield-check-jvVy79mL.js";
import {t as fe} from "./sparkles-Bdgb3vhO.js";
import {a as pe, i as me, n as he, o as j, r as ge, t as _e} from "./dialog-DZmXhtEZ.js";
import {t as M} from "./zap-DtLusXU7.js";
import {i as N, t as P} from "./label-vrjGOANv.js";

var F = class extends a {
    #e;
    #t = void 0;
    #n;
    #r;
    constructor(e, t) {
        super(),
        this.#e = e,
        this.setOptions(t),
        this.bindMethods(),
        this.#i()
    }
    bindMethods() {
        this.mutate = this.mutate.bind(this),
        this.reset = this.reset.bind(this)
    }
    setOptions(e) {
        let t = this.options;
        this.options = this.#e.defaultMutationOptions(e),
        o(this.options, t) || this.#e.getMutationCache().notify({
            type: `observerOptionsUpdated`,
            mutation: this.#n,
            observer: this
        }),
        t?.mutationKey && this.options.mutationKey && l(t.mutationKey) !== l(this.options.mutationKey) ? this.reset() : this.#n?.state.status === `pending` && this.#n.setOptions(this.options)
    }
    onUnsubscribe() {
        this.hasListeners() || this.#n?.removeObserver(this)
    }
    onMutationUpdate(e) {
        this.#i(),
        this.#a(e)
    }
    getCurrentResult() {
        return this.#t
    }
    reset() {
        this.#n?.removeObserver(this),
        this.#n = void 0,
        this.#i(),
        this.#a()
    }
    mutate(e, t) {
        return this.#r = t,
        this.#n?.removeObserver(this),
        this.#n = this.#e.getMutationCache().build(this.#e, this.options),
        this.#n.addObserver(this),
        this.#n.execute(e)
    }
    #i() {
        let e = this.#n?.state ?? f();
        this.#t = {
            ...e,
            isPending: e.status === `pending`,
            isSuccess: e.status === `success`,
            isError: e.status === `error`,
            isIdle: e.status === `idle`,
            mutate: this.mutate,
            reset: this.reset
        }
    }
    #a(e) {
        c.batch( () => {
            if (this.#r && this.hasListeners()) {
                let t = this.#t.variables
                  , n = this.#t.context
                  , r = {
                    client: this.#e,
                    meta: this.options.meta,
                    mutationKey: this.options.mutationKey
                };
                if (e?.type === `success`) {
                    try {
                        this.#r.onSuccess?.(e.data, t, n, r)
                    } catch (e) {
                        Promise.reject(e)
                    }
                    try {
                        this.#r.onSettled?.(e.data, null, t, n, r)
                    } catch (e) {
                        Promise.reject(e)
                    }
                } else if (e?.type === `error`) {
                    try {
                        this.#r.onError?.(e.error, t, n, r)
                    } catch (e) {
                        Promise.reject(e)
                    }
                    try {
                        this.#r.onSettled?.(void 0, e.error, t, n, r)
                    } catch (e) {
                        Promise.reject(e)
                    }
                }
            }
            this.listeners.forEach(e => {
                e(this.#t)
            }
            )
        }
        )
    }
}
  , I = n(e(), 1);
function L(e, t) {
    let n = s(t)
      , [r] = I.useState( () => new F(n,e));
    I.useEffect( () => {
        r.setOptions(e)
    }
    , [r, e]);
    let i = I.useSyncExternalStore(I.useCallback(e => r.subscribe(c.batchCalls(e)), [r]), () => r.getCurrentResult(), () => r.getCurrentResult())
      , a = I.useCallback( (e, t) => {
        r.mutate(e, t).catch(p)
    }
    , [r]);
    if (i.error && m(r.options.throwOnError, [i.error]))
        throw i.error;
    return {
        ...i,
        mutate: a,
        mutateAsync: i.mutate
    }
}
var ve = h(`ban`, [[`circle`, {
    cx: `12`,
    cy: `12`,
    r: `10`,
    key: `1mglay`
}], [`path`, {
    d: `M4.929 4.929 19.07 19.071`,
    key: `196cmz`
}]])
  , R = h(`banknote`, [[`rect`, {
    width: `20`,
    height: `12`,
    x: `2`,
    y: `6`,
    rx: `2`,
    key: `9lu3g6`
}], [`circle`, {
    cx: `12`,
    cy: `12`,
    r: `2`,
    key: `1c9p78`
}], [`path`, {
    d: `M6 12h.01M18 12h.01`,
    key: `113zkx`
}]])
  , ye = h(`chevron-down`, [[`path`, {
    d: `m6 9 6 6 6-6`,
    key: `qrunsl`
}]])
  , be = h(`chevron-up`, [[`path`, {
    d: `m18 15-6-6-6 6`,
    key: `153udz`
}]])
  , z = h(`credit-card`, [[`rect`, {
    width: `20`,
    height: `14`,
    x: `2`,
    y: `5`,
    rx: `2`,
    key: `ynyp8z`
}], [`line`, {
    x1: `2`,
    x2: `22`,
    y1: `10`,
    y2: `10`,
    key: `1b3vmo`
}]])
  , xe = h(`key-round`, [[`path`, {
    d: `M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z`,
    key: `1s6t7t`
}], [`circle`, {
    cx: `16.5`,
    cy: `7.5`,
    r: `.5`,
    fill: `currentColor`,
    key: `w0ekpg`
}]])
  , B = h(`layout-grid`, [[`rect`, {
    width: `7`,
    height: `7`,
    x: `3`,
    y: `3`,
    rx: `1`,
    key: `1g98yp`
}], [`rect`, {
    width: `7`,
    height: `7`,
    x: `14`,
    y: `3`,
    rx: `1`,
    key: `6d4xhi`
}], [`rect`, {
    width: `7`,
    height: `7`,
    x: `14`,
    y: `14`,
    rx: `1`,
    key: `nxv5o0`
}], [`rect`, {
    width: `7`,
    height: `7`,
    x: `3`,
    y: `14`,
    rx: `1`,
    key: `1bb6yr`
}]])
  , Se = h(`menu`, [[`path`, {
    d: `M4 5h16`,
    key: `1tepv9`
}], [`path`, {
    d: `M4 12h16`,
    key: `1lakjw`
}], [`path`, {
    d: `M4 19h16`,
    key: `1djgab`
}]])
  , V = h(`save`, [[`path`, {
    d: `M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z`,
    key: `1c8476`
}], [`path`, {
    d: `M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7`,
    key: `1ydtos`
}], [`path`, {
    d: `M7 3v4a1 1 0 0 0 1 1h7`,
    key: `t51u73`
}]])
  , H = h(`send`, [[`path`, {
    d: `M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z`,
    key: `1ffxy3`
}], [`path`, {
    d: `m21.854 2.147-10.94 10.939`,
    key: `12cjpa`
}]])
  , U = h(`sliders-horizontal`, [[`path`, {
    d: `M10 5H3`,
    key: `1qgfaw`
}], [`path`, {
    d: `M12 19H3`,
    key: `yhmn1j`
}], [`path`, {
    d: `M14 3v4`,
    key: `1sua03`
}], [`path`, {
    d: `M16 17v4`,
    key: `1q0r14`
}], [`path`, {
    d: `M21 12h-9`,
    key: `1o4lsq`
}], [`path`, {
    d: `M21 19h-5`,
    key: `1rlt1p`
}], [`path`, {
    d: `M21 5h-7`,
    key: `1oszz2`
}], [`path`, {
    d: `M8 10v4`,
    key: `tgpxqk`
}], [`path`, {
    d: `M8 12H3`,
    key: `a7s4jb`
}]])
  , W = h(`user-plus`, [[`path`, {
    d: `M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2`,
    key: `1yyitq`
}], [`circle`, {
    cx: `9`,
    cy: `7`,
    r: `4`,
    key: `nufk8`
}], [`line`, {
    x1: `19`,
    x2: `19`,
    y1: `8`,
    y2: `14`,
    key: `1bvyxn`
}], [`line`, {
    x1: `22`,
    x2: `16`,
    y1: `11`,
    y2: `11`,
    key: `1shjgl`
}]])
  , Ce = h(`users`, [[`path`, {
    d: `M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2`,
    key: `1yyitq`
}], [`path`, {
    d: `M16 3.128a4 4 0 0 1 0 7.744`,
    key: `16gr8j`
}], [`path`, {
    d: `M22 21v-2a4 4 0 0 0-3-3.87`,
    key: `kshegd`
}], [`circle`, {
    cx: `9`,
    cy: `7`,
    r: `4`,
    key: `nufk8`
}]])
  , G = t()
  , we = [{
    id: `overview`,
    label: `Dashboard`,
    icon: B
}, {
    id: `queue`,
    label: `Payment Approvals`,
    icon: y
}, {
    id: `predictions`,
    label: `Manual Predictions`,
    icon: fe
}, {
    id: `earnings`,
    label: `Earnings Reconciliation`,
    icon: v
}, {
    id: `efootball`,
    label: `eFootball Codes`,
    icon: O
}, {
    id: `pricing`,
    label: `Pricing & Game Costs`,
    icon: k
}, {
    id: `paysettings`,
    label: `Payment Settings`,
    icon: R
}, {
    id: `diamonds`,
    label: `Diamond / Gold / Ticket Orders`,
    icon: k
}, {
    id: `payments`,
    label: `Purchase History`,
    icon: de
}, {
    id: `vip`,
    label: `VIP Access Grants`,
    icon: A
}, {
    id: `members`,
    label: `Members`,
    icon: Ce
}, {
    id: `security`,
    label: `Security`,
    icon: xe
}];

function Te() {
    return (0,
    G.jsx)(G.Fragment, {
        children: (0,
        G.jsx)(Ee, {})
    })
}

function Ee() {
    let e = r(x)
      , {data: t, isLoading: n} = i({
        queryKey: [`admin-session`],
        queryFn: async () => {
            // Check Supabase Auth first (for logged-in admin users)
            try {
                const { data, error } = await supabaseClient.rpc('check_admin_session');
                if (!error && data?.unlocked) return { unlocked: true };
            } catch (_) { /* ignore */ }

            // Check session-based passcode verification (admin panel's own auth)
            try {
                const session = JSON.parse(sessionStorage.getItem('admin_verified') || 'null');
                if (session?.verified && session?.ts) {
                    const elapsed = Date.now() - session.ts;
                    if (elapsed < 30 * 60 * 1000) { // 30-minute session
                        return { unlocked: true };
                    }
                    sessionStorage.removeItem('admin_verified');
                }
            } catch (_) { /* ignore */ }

            return { unlocked: false };
        },
        enabled: typeof window !== 'undefined',
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 30000
    });
    // During SSR or initial load, show loading skeleton to avoid hydration mismatch
    if (typeof window === 'undefined' || n) return (0, G.jsx)(K, {});
    let isUnlocked = t?.unlocked;
    return isUnlocked ? (0,
    G.jsx)(Oe, {}) : (0,
    G.jsx)(De, {})
}

function De() {
    let[e,t] = (0,
    I.useState)(``)
      , [n,i] = (0,
    I.useState)(!1)
      , a = s()
      , o = r(re);
    return (0,
    G.jsxs)(`main`, { className: `mx-auto max-w-md px-4 py-16 min-h-screen flex flex-col justify-center`,
        children: [(0,
        G.jsxs)(`div`, {
            className: `text-center`,
            children: [(0,
            G.jsx)(`span`, {
                className: `mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground glow-ring pulse-glow`,
                children: (0,
                G.jsx)(A, {
                    className: `h-6 w-6`
                })
            }), (0,
            G.jsx)(`h1`, {
                className: `mt-5 text-3xl font-black tracking-tight`,
                children: `ADMIN CONTROL ROOM`
            }), (0,
            G.jsx)(`p`, {
                className: `mt-2 text-sm text-muted-foreground`,
                children: `Enter your access code to continue`
            })]
        }), (0,
        G.jsxs)(`form`, {
            onSubmit: async n => {
                if (n.preventDefault(),
                e.trim()) {
                    i(!0);
                    try {
                        const result = await supabaseClient.rpc('verify_admin_code', { p_code: e.trim() });
                        if (result.error || !result.data?.ok) {
                            u.error(`Incorrect access code`),
                            t(``);
                            return
                        }
                        // Store admin session (30 min, clears on tab close)
                        sessionStorage.setItem('admin_verified', JSON.stringify({verified: true, ts: Date.now()}));
                        await a.invalidateQueries({
                            queryKey: [`admin-session`]
                        })
                    } catch {
                        u.error(`Could not verify the access code`)
                    } finally {
                        i(!1)
                    }
                }
            }
            ,
            className: `mt-6 space-y-4`,
            children: [(0,
            G.jsxs)(`div`, {
                className: `space-y-2`,
                children: [(0,
                G.jsx)(P, {
                    className: `text-[11px] font-bold tracking-widest text-muted-foreground uppercase`,
                    children: `Access code`
                }), (0,
                G.jsx)(N, {
                    type: `password`,
                    value: e,
                    onChange: e => t(e.target.value),
                    placeholder: `••••••••`,
                    autoComplete: `current-password`,
                    className: `h-14 rounded-xl text-center text-lg font-black tracking-[0.35em]`
                })]
            }), (0,
            G.jsx)(g, {
                type: `submit`,
                size: `lg`,
                disabled: n,
                className: `w-full rounded-full text-base font-bold pulse-glow`,
                children: n ? `Verifying…` : `Unlock control room`
            })]
        })]
    })
}


// --- CLIENT-SIDE ADMIN COMPONENTS ---

function EfootballPanel(props) {
  const { data, members, invalidate } = props;
  const [code, setCode] = I.useState('');
  const [market, setMarket] = I.useState('1X2 - Home Win');
  const [stakeTime, setStakeTime] = I.useState('');
  const [selectedRequest, setSelectedRequest] = I.useState(null);
  const [loading, setLoading] = I.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !code || !stakeTime) {
      alert("Please fill all details");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabaseClient.rpc('admin_approve_booking_code', {
        p_request_id: selectedRequest.id,
        p_code: code,
        p_market: market,
        p_stake_time: new Date(stakeTime).toISOString()
      });

      if (error) throw error;

      alert("Booking code published successfully!");
      setCode('');
      setSelectedRequest(null);
      invalidate?.();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return G.jsxs("div", {
    className: "space-y-6",
    children: [
      selectedRequest && G.jsxs("form", {
        onSubmit: handleSubmit,
        className: "p-5 border border-primary/30 rounded-3xl bg-ash/50 space-y-4 glow-ring",
        children: [
          G.jsx("h3", { className: "text-lg font-black text-primary", children: `Publish Code for ${members?.find(m=>m.id===selectedRequest.user_id)?.email || selectedRequest.user_id}` }),
          G.jsxs("div", {
            className: "grid grid-cols-2 gap-4",
            children: [
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Booking Code" }),
                  G.jsx("input", {
                    type: "text",
                    value: code,
                    onChange: e => setCode(e.target.value.toUpperCase()),
                    placeholder: "e.g. ABC1234",
                    className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold",
                    required: true
                  })
                ]
              }),
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Market Recommendation" }),
                  G.jsx("input", {
                    type: "text",
                    value: market,
                    onChange: e => setMarket(e.target.value),
                    placeholder: "e.g. Over 2.5 Goals",
                    className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold",
                    required: true
                  })
                ]
              })
            ]
          }),
          G.jsxs("div", {
            children: [
              G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Recommended Stake Time" }),
              G.jsx("input", {
                type: "datetime-local",
                value: stakeTime,
                onChange: e => setStakeTime(e.target.value),
                className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold",
                required: true
              })
            ]
          }),
          G.jsxs("div", {
            className: "flex gap-2 justify-end",
            children: [
              G.jsx("button", {
                type: "button",
                onClick: () => setSelectedRequest(null),
                className: "px-4 py-2 border border-border rounded-full text-sm font-bold",
                children: "Cancel"
              }),
              G.jsx("button", {
                type: "submit",
                disabled: loading,
                className: "px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-black pulse-glow",
                children: loading ? "Publishing..." : "Publish & Notify User"
              })
            ]
          })
        ]
      }),
      G.jsxs("div", {
        className: "border border-border/60 rounded-3xl overflow-hidden bg-ash/30",
        children: [
          G.jsx("div", {
            className: "p-4 border-b border-border/60 bg-ash/60",
            children: G.jsx("h3", { className: "font-black text-sm uppercase tracking-wider", children: "Booking Code Requests" })
          }),
          G.jsx("div", {
            className: "divide-y divide-border/60",
            children: (data || []).length === 0 ? G.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No booking code requests yet." }) : (data || []).map(req => {
              const userEmail = members?.find(m=>m.id===req.user_id)?.email || req.user_id;
              return G.jsxs("div", {
                className: "p-4 flex items-center justify-between",
                children: [
                  G.jsxs("div", {
                    children: [
                      G.jsx("p", { className: "font-black text-sm", children: userEmail }),
                      G.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [new Date(req.created_at).toLocaleString(), " · Cost: ", req.cost, " tickets"] })
                    ]
                  }),
                  G.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      G.jsx("span", {
                        className: `px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${req.status === 'pending' ? 'bg-tier-gold/15 text-tier-gold' : 'bg-tier-mint/15 text-tier-mint'}`,
                        children: req.status
                      }),
                      req.status === 'pending' && G.jsx("button", {
                        onClick: () => setSelectedRequest(req),
                        className: "px-3 py-1 bg-primary text-primary-foreground text-xs font-black rounded-full hover:opacity-90",
                        children: "Fulfill Code"
                      }),
                      G.jsx("button", {
                        onClick: async () => {
                          if (confirm(`Delete booking request from ${userEmail}?`)) {
                            try {
                              await supabaseClient.rpc('admin_delete_record', { p_table: 'booking_code_requests', p_id: req.id });
                              alert("Booking request deleted");
                              invalidate?.();
                            } catch (err) {
                              alert("Error: " + err.message);
                            }
                          }
                        },
                        className: "px-2.5 py-1 bg-destructive/15 border border-destructive/40 text-destructive text-xs font-bold rounded-full hover:bg-destructive/30",
                        children: "Delete"
                      })
                    ]
                  })
                ]
              }, req.id);
            })
          })
        ]
      })
    ]
  });
}

function PaysettingsPanel(props) {
  const { data, invalidate } = props;
  const [ghanaProvider, setGhanaProvider] = I.useState(data?.payment_ghana?.provider ?? 'Telecel');
  const [ghanaName, setGhanaName] = I.useState(data?.payment_ghana?.accountName ?? 'prediit');
  const [ghanaNumber, setGhanaNumber] = I.useState(data?.payment_ghana?.accountNumber ?? '0501234567');
  const [nigeriaProvider, setNigeriaProvider] = I.useState(data?.payment_nigeria?.provider ?? 'Access Bank');
  const [nigeriaName, setNigeriaName] = I.useState(data?.payment_nigeria?.accountName ?? 'prediit Ltd');
  const [nigeriaNumber, setNigeriaNumber] = I.useState(data?.payment_nigeria?.accountNumber ?? '0123456789');
  const [loading, setLoading] = I.useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabaseClient.rpc('admin_update_settings', {
        p_settings: {
          payment_ghana: { provider: ghanaProvider, accountName: ghanaName, accountNumber: ghanaNumber },
          payment_nigeria: { provider: nigeriaProvider, accountName: nigeriaName, accountNumber: nigeriaNumber }
        }
      });

      if (error) throw error;
      alert("Payment gateways updated!");
      invalidate?.();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return G.jsxs("form", {
    onSubmit: handleSave,
    className: "p-6 border border-border rounded-3xl bg-ash/30 space-y-6 max-w-lg",
    children: [
      G.jsxs("div", {
        className: "space-y-4",
        children: [
          G.jsx("h3", { className: "text-base font-black text-primary uppercase tracking-wide", children: "Ghana MoMo Gateway" }),
          G.jsxs("div", {
            className: "grid grid-cols-3 gap-4",
            children: [
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Provider" }),
                  G.jsx("input", { type: "text", value: ghanaProvider, onChange: e => setGhanaProvider(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Account Name" }),
                  G.jsx("input", { type: "text", value: ghanaName, onChange: e => setGhanaName(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "MoMo Number" }),
                  G.jsx("input", { type: "text", value: ghanaNumber, onChange: e => setGhanaNumber(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              })
            ]
          })
        ]
      }),
      G.jsxs("div", {
        className: "space-y-4",
        children: [
          G.jsx("h3", { className: "text-base font-black text-primary uppercase tracking-wide", children: "Nigeria Bank Gateway" }),
          G.jsxs("div", {
            className: "grid grid-cols-3 gap-4",
            children: [
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Bank" }),
                  G.jsx("input", { type: "text", value: nigeriaProvider, onChange: e => setNigeriaProvider(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Account Name" }),
                  G.jsx("input", { type: "text", value: nigeriaName, onChange: e => setNigeriaName(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Account Number" }),
                  G.jsx("input", { type: "text", value: nigeriaNumber, onChange: e => setNigeriaNumber(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              })
            ]
          })
        ]
      }),
      G.jsx("div", {
        className: "flex justify-end",
        children: G.jsx("button", {
          type: "submit",
          disabled: loading,
          className: "px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-black pulse-glow",
          children: loading ? "Saving..." : "Save Gateways"
        })
      })
    ]
  });
}

function PaymentsPanel(props) {
  const { payments, diamondOrders, invalidate } = props;
  const [tab, setTab] = I.useState('payments');

  return G.jsxs("div", {
    className: "space-y-6",
    children: [
      G.jsxs("div", {
        className: "grid grid-cols-2 gap-2 max-w-xs bg-ash/60 p-1 rounded-2xl border border-border/60",
        children: [
          G.jsx("button", {
            type: "button",
            onClick: () => setTab('payments'),
            className: `py-2 rounded-xl text-xs font-black uppercase transition ${tab === 'payments' ? 'bg-primary text-primary-foreground glow-ring' : 'text-muted-foreground'}`,
            children: "Registration Proofs"
          }),
          G.jsx("button", {
            type: "button",
            onClick: () => setTab('orders'),
            className: `py-2 rounded-xl text-xs font-black uppercase transition ${tab === 'orders' ? 'bg-primary text-primary-foreground glow-ring' : 'text-muted-foreground'}`,
            children: "Diamond Orders"
          })
        ]
      }),
      tab === 'payments' ? G.jsxs("div", {
        className: "border border-border/60 rounded-3xl overflow-hidden bg-ash/30",
        children: [
          G.jsx("div", {
            className: "p-4 border-b border-border/60 bg-ash/60",
            children: G.jsx("h3", { className: "font-black text-sm uppercase tracking-wider", children: "Registration Payment Proofs History" })
          }),
          G.jsx("div", {
            className: "divide-y divide-border/60",
            children: (payments || []).length === 0 ? G.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No registration payments recorded yet." }) : (payments || []).map(p => G.jsxs("div", {
              className: "p-4 flex items-center justify-between text-sm",
              children: [
                G.jsxs("div", {
                  children: [
                    G.jsx("p", { className: "font-black", children: p.email }),
                    G.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [p.method, " · Sender: ", p.sender_name, " (", p.sender_number, ") · TXN: ", p.txn_id || 'N/A'] }),
                    G.jsxs("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: [new Date(p.created_at).toLocaleString(), " · Country: ", p.country] })
                  ]
                }),
                G.jsxs("div", {
                  className: "text-right shrink-0 flex items-center gap-2",
                  children: [
                    G.jsxs("div", {
                      children: [
                        G.jsxs("p", { className: "font-black text-primary text-base", children: [p.currency === 'GHS' ? 'GH₵' : '₦', p.amount] }),
                        G.jsx("span", {
                          className: `inline-block px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase mt-1 ${p.status === 'approved' ? 'bg-tier-mint/15 text-tier-mint' : p.status === 'rejected' ? 'bg-destructive/15 text-destructive' : 'bg-tier-gold/15 text-tier-gold'}`,
                          children: p.status
                        })
                      ]
                    }),
                    G.jsx("button", {
                      type: "button",
                      onClick: async () => {
                        if (confirm(`Delete registration payment proof from ${p.email}?`)) {
                          try {
                            await supabaseClient.rpc('admin_delete_record', { p_table: 'payments', p_id: p.id });
                            alert("Payment proof deleted");
                            invalidate?.();
                          } catch (err) {
                            alert("Error: " + err.message);
                          }
                        }
                      },
                      className: "px-2.5 py-1 bg-destructive/15 border border-destructive/40 text-destructive text-xs font-bold rounded-full hover:bg-destructive/30",
                      children: "Delete"
                    })
                  ]
                })
              ]
            }, p.id))
          })
        ]
      }) : G.jsxs("div", {
        className: "border border-border/60 rounded-3xl overflow-hidden bg-ash/30",
        children: [
          G.jsx("div", {
            className: "p-4 border-b border-border/60 bg-ash/60",
            children: G.jsx("h3", { className: "font-black text-sm uppercase tracking-wider", children: "Diamond Orders History" })
          }),
          G.jsx("div", {
            className: "divide-y divide-border/60",
            children: (diamondOrders || []).length === 0 ? G.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No diamond package orders recorded yet." }) : (diamondOrders || []).map(o => G.jsxs("div", {
              className: "p-4 flex items-center justify-between text-sm",
              children: [
                G.jsxs("div", {
                  children: [
                    G.jsx("p", { className: "font-black", children: o.email }),
                    G.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [o.package_name, " (💎 ", o.diamonds, ") · ", o.method, " · TXN: ", o.txn_id || 'N/A'] }),
                    G.jsx("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: new Date(o.created_at).toLocaleString() })
                  ]
                }),
                G.jsxs("div", {
                  className: "text-right shrink-0 flex items-center gap-2",
                  children: [
                    G.jsxs("div", {
                      children: [
                        G.jsxs("p", { className: "font-black text-primary text-base", children: [o.currency === 'GHS' ? 'GH₵' : '₦', o.amount] }),
                        G.jsx("span", {
                          className: `inline-block px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase mt-1 ${o.status === 'approved' ? 'bg-tier-mint/15 text-tier-mint' : o.status === 'rejected' ? 'bg-destructive/15 text-destructive' : 'bg-tier-gold/15 text-tier-gold'}`,
                          children: o.status
                        })
                      ]
                    }),
                    G.jsx("button", {
                      type: "button",
                      onClick: async () => {
                        if (confirm(`Delete diamond order from ${o.email}?`)) {
                          try {
                            await supabaseClient.rpc('admin_delete_record', { p_table: 'orders', p_id: o.id });
                            alert("Diamond order deleted");
                            invalidate?.();
                          } catch (err) {
                            alert("Error: " + err.message);
                          }
                        }
                      },
                      className: "px-2.5 py-1 bg-destructive/15 border border-destructive/40 text-destructive text-xs font-bold rounded-full hover:bg-destructive/30",
                      children: "Delete"
                    })
                  ]
                })
              ]
            }, o.id))
          })
        ]
      })
    ]
  });
}

function EarningsPanel(props) {
  const { data } = props;
  return G.jsxs("div", {
    className: "space-y-6",
    children: [
      G.jsxs("div", {
        className: "grid grid-cols-2 gap-4",
        children: [
          G.jsxs("div", {
            className: "p-5 border border-primary/20 bg-ash/30 rounded-3xl text-center",
            children: [
              G.jsx("p", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest", children: "Total Revenue (GHS)" }),
              G.jsxs("p", { className: "text-3xl font-black text-primary glow-text mt-1", children: ["GH₵", data?.totalGHS?.toLocaleString() ?? 0] })
            ]
          }),
          G.jsxs("div", {
            className: "p-5 border border-primary/20 bg-ash/30 rounded-3xl text-center",
            children: [
              G.jsx("p", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest", children: "Total Revenue (NGN)" }),
              G.jsxs("p", { className: "text-3xl font-black text-primary glow-text mt-1", children: ["₦", data?.totalNGN?.toLocaleString() ?? 0] })
            ]
          })
        ]
      }),
      G.jsxs("div", {
        className: "border border-border/60 rounded-3xl overflow-hidden bg-ash/30",
        children: [
          G.jsx("div", {
            className: "p-4 border-b border-border/60 bg-ash/60",
            children: G.jsx("h3", { className: "font-black text-sm uppercase tracking-wider", children: "Recent Revenue Transactions" })
          }),
          G.jsx("div", {
            className: "divide-y divide-border/60",
            children: (data?.payments || []).length === 0 && (data?.orders || []).length === 0 ? G.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No revenue transactions recorded yet." }) : [...(data?.payments || []), ...(data?.orders || [])].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0, 15).map(item => G.jsxs("div", {
              className: "p-4 flex items-center justify-between text-sm",
              children: [
                G.jsxs("div", {
                  children: [
                    G.jsx("p", { className: "font-black", children: item.email }),
                    G.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [item.package_name ? `Diamond Package: ${item.package_name}` : 'Registration Fee', " · ", item.method] })
                  ]
                }),
                G.jsxs("span", { className: "font-black text-primary text-base", children: [item.currency === 'GHS' ? 'GH₵' : '₦', item.amount] })
              ]
            }, item.id))
          })
        ]
      })
    ]
  });
}

function MembersPanel(props) {
  const { members, updateMember, invalidate } = props;
  const [search, setSearch] = I.useState('');
  const [grantUser, setGrantUser] = I.useState(null);
  const [diamonds, setDiamonds] = I.useState(100);
  const [gold, setGold] = I.useState(1000);
  const [tickets, setTickets] = I.useState(10);
  const [loading, setLoading] = I.useState(false);

  const filteredMembers = (members || []).filter(m =>
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleGrant = async (e) => {
    e.preventDefault();
    if (!grantUser) return;
    setLoading(true);
    try {
      const addD = Number(diamonds) || 0;
      const addG = Number(gold) || 0;
      const addT = Number(tickets) || 0;

      // Use grant_currencies RPC for proper ledger entries + notifications
      if (addD > 0 || addG > 0 || addT > 0) {
        const { data, error } = await supabaseClient.rpc('grant_currencies', {
          p_user_id: grantUser.id,
          p_diamonds: addD,
          p_gold: addG,
          p_tickets: addT
        });
        if (error) throw error;
        if (!data?.ok) throw new Error(data?.error || 'Failed to grant currencies');
      }

      let alertParts = [];
      if (addD > 0) alertParts.push(`${addD} Diamonds 💎`);
      if (addG > 0) alertParts.push(`${addG} Gold Coins 🪙`);
      if (addT > 0) alertParts.push(`${addT} Tickets 🎟️`);

      alert(alertParts.length > 0
        ? `Successfully credited ${alertParts.join(', ')} to ${grantUser.email}!`
        : `No amounts to credit.`);
      setGrantUser(null);
      if (updateMember) {
        updateMember({ data: { userId: grantUser.id, status: grantUser.status } });
      } else {
        window.location.reload();
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return G.jsxs("div", {
    className: "space-y-6",
    children: [
      grantUser && G.jsxs("form", {
        onSubmit: handleGrant,
        className: "p-5 border border-primary/30 rounded-3xl bg-ash/50 space-y-4 glow-ring",
        children: [
          G.jsx("h3", { className: "text-lg font-black text-primary", children: `Credit Assets for ${grantUser.email}` }),
          G.jsxs("div", {
            className: "grid grid-cols-3 gap-4",
            children: [
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "💎 Add Diamonds" }),
                  G.jsx("input", { type: "number", value: diamonds, onChange: e => setDiamonds(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "🪙 Add Gold Coins" }),
                  G.jsx("input", { type: "number", value: gold, onChange: e => setGold(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "🎟️ Add Tickets" }),
                  G.jsx("input", { type: "number", value: tickets, onChange: e => setTickets(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              })
            ]
          }),
          G.jsxs("div", {
            className: "flex gap-2 justify-end",
            children: [
              G.jsx("button", { type: "button", onClick: () => setGrantUser(null), className: "px-4 py-2 border border-border rounded-full text-sm font-bold", children: "Cancel" }),
              G.jsx("button", { type: "submit", disabled: loading, className: "px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-black pulse-glow", children: loading ? "Crediting..." : "Apply Credit" })
            ]
          })
        ]
      }),
      G.jsx("input", {
        type: "text",
        placeholder: "Search members by name or email...",
        value: search,
        onChange: e => setSearch(e.target.value),
        className: "w-full h-12 px-4 bg-ash border border-border rounded-2xl font-semibold"
      }),
      G.jsxs("div", {
        className: "border border-border/60 rounded-3xl overflow-hidden bg-ash/30",
        children: [
          G.jsx("div", {
            className: "p-4 border-b border-border/60 bg-ash/60",
            children: G.jsx("h3", { className: "font-black text-sm uppercase tracking-wider", children: "All Registered Profiles" })
          }),
          G.jsx("div", {
            className: "divide-y divide-border/60",
            children: filteredMembers.length === 0 ? G.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No members found." }) : filteredMembers.map(member => G.jsxs("div", {
              className: "p-4 flex items-center justify-between",
              children: [
                G.jsxs("div", {
                  className: "min-w-0 flex-1 pr-4",
                  children: [
                    G.jsxs("p", { className: "font-black text-sm truncate", children: [member.full_name, " (", member.email, ")"] }),
                    G.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: ["Phone: ", member.phone, " · 💎 ", member.diamonds, " · 🪙 ", member.gold, " · 🎟️ ", member.tickets] })
                  ]
                }),
                G.jsxs("div", {
                  className: "flex items-center gap-2 shrink-0",
                  children: [
                    G.jsx("span", {
                      className: `px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase ${member.status === 'active' ? 'bg-tier-mint/15 text-tier-mint' : member.status === 'suspended' ? 'bg-destructive/15 text-destructive' : 'bg-tier-gold/15 text-tier-gold'}`,
                      children: member.status
                    }),
                    G.jsx("button", {
                      onClick: () => setGrantUser(member),
                      className: "px-2 py-1 bg-ash/80 border border-border text-xs font-bold rounded-full hover:bg-ash",
                      children: "Credit"
                    }),
                    member.status !== 'active' ? G.jsx("button", {
                      onClick: () => updateMember?.({ data: { userId: member.id, status: 'active' } }),
                      className: "px-3 py-1 bg-primary text-primary-foreground text-xs font-black rounded-full hover:opacity-90",
                      children: "Activate"
                    }) : G.jsx("button", {
                      onClick: () => updateMember?.({ data: { userId: member.id, status: 'suspended' } }),
                      className: "px-3 py-1 bg-destructive text-destructive-foreground text-xs font-black rounded-full hover:opacity-90",
                      children: "Suspend"
                    }),
                    G.jsx("button", {
                      onClick: async () => {
                        if (confirm(`Delete member ${member.email}?`)) {
                          try {
                            await supabaseClient.rpc('admin_delete_record', { p_table: 'profiles', p_id: member.id });
                            alert(`Member ${member.email} deleted`);
                            invalidate?.();
                          } catch (err) {
                            alert("Error: " + err.message);
                          }
                        }
                      },
                      className: "px-2.5 py-1 bg-destructive/15 border border-destructive/40 text-destructive text-xs font-bold rounded-full hover:bg-destructive/30",
                      children: "Delete"
                    })
                  ]
                })
              ]
            }, member.id))
          })
        ]
      })
    ]
  });
}

function VipSecurityPanel(props) {
  const { members, invalidate } = props;
  const [passcode, setPasscode] = I.useState('');
  const [loading, setLoading] = I.useState(false);

  if (members) {
    return G.jsx(MembersPanel, { members, updateMember: null });
  }

  const handleSave = async (e) => {
    e.preventDefault();
    if (passcode.length < 4) {
      alert("Passcode must be at least 4 digits");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabaseClient.rpc('change_admin_access_code', { p_new_code: passcode });
      if (error) throw error;
      if (!data?.ok) throw new Error('Failed to update access code');
      alert("Admin access passcode updated successfully!");
      setPasscode('');
      invalidate?.();
    } catch (err) {
      alert("Error updating passcode: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return G.jsxs("form", {
    onSubmit: handleSave,
    className: "p-6 border border-border rounded-3xl bg-ash/30 space-y-4 max-w-sm",
    children: [
      G.jsxs("div", {
        children: [
          G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "New Admin Control Room Code" }),
          G.jsx("input", {
            type: "password",
            value: passcode,
            onChange: e => setPasscode(e.target.value),
            placeholder: "e.g. 12345",
            className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold"
          })
        ]
      }),
      G.jsx("button", {
        type: "submit",
        disabled: loading,
        className: "px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-black pulse-glow",
        children: loading ? "Saving..." : "Change Access Code"
      })
    ]
  });
}

function PricingPanel(props) {
  const { data, invalidate } = props;
  const [predictionCost, setPredictionCost] = I.useState(data?.prediction_cost ?? 50);
  const [efootballCost, setEfootballCost] = I.useState(data?.efootball_cost ?? 1);
  const [efootballExpiry, setEfootballExpiry] = I.useState(data?.efootball_expiry ?? 10);
  const [spinCost, setSpinCost] = I.useState(data?.spin_cost ?? 50);
  const [regGHS, setRegGHS] = I.useState(data?.registration_ghs ?? 50);
  const [regNGN, setRegNGN] = I.useState(data?.registration_ngn ?? 10000);
  const [geminiApiKey, setGeminiApiKey] = I.useState('');
  const [loading, setLoading] = I.useState(false);

  // Load API key from app_secrets (admin-only, separate from settings)
  I.useEffect(() => {
    (async () => {
      try {
        const { data: secrets } = await supabaseClient.rpc('get_app_secrets');
        if (secrets?.gemini_api_key) setGeminiApiKey(secrets.gemini_api_key);
      } catch (e) { /* ignore - key is optional */ }
    })();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Save pricing settings (no gemini_api_key here)
      const updatePayload = {
        registration_ghs: Number(regGHS),
        registration_ngn: Number(regNGN),
        prediction_cost: Number(predictionCost),
        efootball_cost: Number(efootballCost),
        efootball_expiry: Number(efootballExpiry),
        spin_cost: Number(spinCost)
      };

      const { error } = await supabaseClient.rpc('admin_update_settings', { p_settings: updatePayload });
      if (error) throw error;

      // 2. Save API key via separate admin-only RPC (goes to app_secrets, not settings)
      if (geminiApiKey.trim()) {
        const { error: secretErr } = await supabaseClient.rpc('update_app_secrets', { p_gemini_api_key: geminiApiKey.trim() });
        if (secretErr) throw secretErr;
      }

      alert("Settings and AI key saved!");
      invalidate?.();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return G.jsxs("form", {
    onSubmit: handleSave,
    className: "p-6 border border-border rounded-3xl bg-ash/30 space-y-6 max-w-md",
    children: [
      G.jsxs("div", {
        className: "grid grid-cols-2 gap-4",
        children: [
          G.jsxs("div", {
            children: [
              G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Registration Cost (GHS)" }),
              G.jsx("input", { type: "number", value: regGHS, onChange: e => setRegGHS(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
            ]
          }),
          G.jsxs("div", {
            children: [
              G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Registration Cost (NGN)" }),
              G.jsx("input", { type: "number", value: regNGN, onChange: e => setRegNGN(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
            ]
          })
        ]
      }),
      G.jsxs("div", {
        className: "grid grid-cols-2 gap-4",
        children: [
          G.jsxs("div", {
            children: [
              G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Fixture Prediction Cost (💎)" }),
              G.jsx("input", { type: "number", value: predictionCost, onChange: e => setPredictionCost(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
            ]
          }),
          G.jsxs("div", {
            children: [
              G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Spin Signal Cost (🪙)" }),
              G.jsx("input", { type: "number", value: spinCost, onChange: e => setSpinCost(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
            ]
          })
        ]
      }),
      G.jsxs("div", {
        className: "grid grid-cols-2 gap-4",
        children: [
          G.jsxs("div", {
            children: [
              G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "eFootball Code Cost (🎟️)" }),
              G.jsx("input", { type: "number", value: efootballCost, onChange: e => setEfootballCost(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
            ]
          }),
          G.jsxs("div", {
            children: [
              G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Booking Code Expiry (mins)" }),
              G.jsx("input", { type: "number", value: efootballExpiry, onChange: e => setEfootballExpiry(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
            ]
          })
        ]
      }),
      G.jsxs("div", {
        children: [
          G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "🤖 Gemini AI Vision API Key" }),
          G.jsx("input", { type: "text", value: geminiApiKey, onChange: e => setGeminiApiKey(e.target.value), placeholder: "Paste your Gemini API key (AIzaSy...)", className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-mono text-xs font-bold" }),
          G.jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Enables Gemini 1.5 Flash Vision OCR to analyze screenshots." })
        ]
      }),
      G.jsx("div", {
        className: "flex justify-end",
        children: G.jsx("button", {
          type: "submit",
          disabled: loading,
          className: "px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-black pulse-glow",
          children: loading ? "Saving..." : "Save Settings & AI Key"
        })
      })
    ]
  });
}

function PredictionsPanel(props) {
  const { predictions, invalidate } = props;
  const [home, setHome] = I.useState('');
  const [away, setAway] = I.useState('');
  const [pick, setPick] = I.useState('1');
  const [drawChance, setDrawChance] = I.useState(33);
  const [correctScore, setCorrectScore] = I.useState('2-1');
  const [goals, setGoals] = I.useState('Over 2.5');
  const [confidence, setConfidence] = I.useState(75);
  const [loading, setLoading] = I.useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!home || !away || !correctScore) {
      alert("Fill all match details");
      return;
    }
    setLoading(true);
    try {
      const matchObj = {
        home,
        away,
        pick,
        pickLabel: pick === '1' ? 'Home Win' : pick === '2' ? 'Away Win' : 'Draw',
        drawChance: Number(drawChance),
        correctScore,
        goals,
        confidence: Number(confidence),
        probabilities: {
          home: pick === '1' ? 60 : 20,
          draw: pick === 'X' ? 60 : 20,
          away: pick === '2' ? 60 : 20
        }
      };

      const { error } = await supabaseClient.rpc('admin_insert_prediction', {
        p_user_id: null,
        p_result: { matches: [matchObj] },
        p_cost: 0
      });

      if (error) throw error;
      alert("Manual prediction added!");
      setHome('');
      setAway('');
      invalidate?.();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return G.jsxs("div", {
    className: "space-y-6",
    children: [
      G.jsxs("form", {
        onSubmit: handleCreate,
        className: "p-6 border border-border rounded-3xl bg-ash/30 space-y-4 max-w-lg",
        children: [
          G.jsx("h3", { className: "text-base font-black text-primary uppercase tracking-wide", children: "Create Mock/Manual Match Pick" }),
          G.jsxs("div", {
            className: "grid grid-cols-2 gap-4",
            children: [
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Home Team" }),
                  G.jsx("input", { type: "text", value: home, onChange: e => setHome(e.target.value), placeholder: "e.g. Real Madrid", className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Away Team" }),
                  G.jsx("input", { type: "text", value: away, onChange: e => setAway(e.target.value), placeholder: "e.g. Barcelona", className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              })
            ]
          }),
          G.jsxs("div", {
            className: "grid grid-cols-3 gap-4",
            children: [
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "AI Pick" }),
                  G.jsxs("select", {
                    value: pick,
                    onChange: e => setPick(e.target.value),
                    className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold",
                    children: [
                      G.jsx("option", { value: "1", children: "1 (Home Win)" }),
                      G.jsx("option", { value: "X", children: "X (Draw)" }),
                      G.jsx("option", { value: "2", children: "2 (Away Win)" })
                    ]
                  })
                ]
              }),
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Correct Score" }),
                  G.jsx("input", { type: "text", value: correctScore, onChange: e => setCorrectScore(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Goals Selection" }),
                  G.jsx("input", { type: "text", value: goals, onChange: e => setGoals(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              })
            ]
          }),
          G.jsxs("div", {
            className: "grid grid-cols-2 gap-4",
            children: [
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "AI Confidence (%)" }),
                  G.jsx("input", { type: "number", value: confidence, onChange: e => setConfidence(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              G.jsxs("div", {
                children: [
                  G.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Draw Probability (%)" }),
                  G.jsx("input", { type: "number", value: drawChance, onChange: e => setDrawChance(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              })
            ]
          }),
          G.jsx("button", {
            type: "submit",
            disabled: loading,
            className: "px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-black pulse-glow",
            children: loading ? "Creating..." : "Add Pick"
          })
        ]
      }),
      G.jsxs("div", {
        className: "border border-border/60 rounded-3xl overflow-hidden bg-ash/30",
        children: [
          G.jsx("div", {
            className: "p-4 border-b border-border/60 bg-ash/60",
            children: G.jsx("h3", { className: "font-black text-sm uppercase tracking-wider", children: "Prediction Feed History" })
          }),
          G.jsx("div", {
            className: "divide-y divide-border/60",
            children: (predictions || []).length === 0 ? G.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No predictions recorded yet." }) : (predictions || []).map(p => {
              const matches = p.result?.matches ?? [];
              return G.jsxs("div", {
                className: "p-4 text-sm flex items-start justify-between gap-4",
                children: [
                  G.jsxs("div", {
                    className: "min-w-0 flex-1",
                    children: [
                      G.jsxs("p", { className: "text-xs text-muted-foreground", children: [new Date(p.created_at).toLocaleString(), " · Cost: ", p.cost, " 💎"] }),
                      G.jsx("div", {
                        className: "mt-2 space-y-1",
                        children: matches.map((m, idx) => G.jsxs("p", {
                          className: "font-bold",
                          children: [m.home, " vs ", m.away, " (Pick: ", m.pick, " · CS: ", m.correctScore, " · Conf: ", m.confidence, "%)"]
                        }, idx))
                      })
                    ]
                  }),
                  G.jsx("button", {
                    type: "button",
                    onClick: async () => {
                      if (confirm("Delete this prediction record?")) {
                        try {
                          await supabaseClient.rpc('admin_delete_record', { p_table: 'predictions', p_id: p.id });
                          alert("Prediction deleted");
                          invalidate?.();
                        } catch (err) {
                          alert("Error: " + err.message);
                        }
                      }
                    },
                    className: "px-2.5 py-1 bg-destructive/15 border border-destructive/40 text-destructive text-xs font-bold rounded-full hover:bg-destructive/30 shrink-0",
                    children: "Delete"
                  })
                ]
              }, p.id);
            })
          })
        ]
      })
    ]
  });
}

function Oe() {
    let[e,t] = (0,
    I.useState)(`overview`)
      , [n,a] = (0,
    I.useState)(!1)
      , o = r(ie)
      , c = r(ae)
      , l = s()
      , {data: d, isLoading: f, isFetching: p, dataUpdatedAt: m} = i({
        queryKey: [`admin-data`],
        queryFn: () => o(),
        refetchInterval: 1e4,
        refetchIntervalInBackground: !0
    })
      , h = L({
        mutationFn: r(te),
        onSuccess: () => {
            u.success(`Diamond order updated`),
            l.invalidateQueries({
                queryKey: [`admin-data`]
            })
        }
        ,
        onError: () => u.error(`Could not update this diamond order`)
    })
      , x = L({
        mutationFn: r(ne),
        onSuccess: () => {
            u.success(`Payment updated`),
            l.invalidateQueries({
                queryKey: [`admin-data`]
            })
        }
        ,
        onError: () => u.error(`Could not update this payment`)
    })
      , S = L({
        mutationFn: r(oe),
        onSuccess: () => {
            u.success(`Member updated`),
            l.invalidateQueries({
                queryKey: [`admin-data`]
            })
        }
        ,
        onError: () => u.error(`Could not update this member`)
    })
      , re = r(le)
      , se = r(ce)
      , [_C,_w] = (0,
    I.useState)(null)
      , [_T,_E] = (0,
    I.useState)({})
      , [_proofModal, _setProofModal] = (0, I.useState)(null)
      , F = (e, t, n, r, i=``) => _setProofModal({
        title: t,
        summary: n,
        tone: e,
        reasonRequired: e === `reject`,
        reason: i,
        run: r
    })
      , _pendingDiamondOrders = (0, I.useMemo)( () => (d?.diamondOrders ?? []).filter(e => e.status === `pending`), [d])
      , V = (0,
    I.useMemo)( () => (d?.payments ?? []).filter(e => e.status === `pending`), [d])
      , H = (0,
    I.useMemo)( () => {
        let e = new Set((d?.payments ?? []).map(e => e.user_id));
        return (d?.members ?? []).filter(t => t.status === `pending` && !e.has(t.id))
    }
    , [d])
      , U = (0,
    I.useMemo)( () => {
        let e = d?.payments ?? []
          , t = d?.diamondOrders ?? []
          , n = d?.members ?? []
          , r = Date.now() - 1440 * 60 * 1e3
          , i = e => !!e && new Date(e).toDateString() === new Date().toDateString()
          , a = e.filter(e => e.status === `approved` && i(e.reviewed_at ?? e.created_at)).length
          , o = t.filter(e => e.status === `approved` && i(e.reviewed_at ?? e.created_at)).length;
        return {
            approvedGateway: a,
            approvedAssets: o,
            approvedTotal: a + o,
            activeMembers: n.filter(e => e.status === `active`).length,
            pendingProofs: e.filter(e => e.status === `pending`).length,
            rejected24h: e.filter(e => e.status === `rejected` && new Date(e.reviewed_at ?? e.created_at).getTime() > r).length
        }
    }
    , [d])
      , Te = (0,
    I.useMemo)( () => {
        let e = d?.stats?.revenue ?? {}
          , t = {
            GHS: `🇬🇭`,
            NGN: `🇳🇬`
        };
        return Array.from(new Set([`GHS`, `NGN`, ...Object.keys(e)])).map(n => ({
            currency: n,
            flag: t[n] ?? ``,
            amount: Number(e[n] ?? 0).toLocaleString(void 0, {
                minimumFractionDigits: 2
            })
        }))
    }
    , [d])
      , Ee = (0,
    I.useMemo)( () => {
        let e = d?.stats?.revenue ?? {}
          , t = Object.entries(e).map( ([e,t]) => `${e === `GHS` ? `GH₵` : e === `NGN` ? `₦` : e + ` `}${Number(t).toLocaleString()}`);
        return t.length ? t.join(` · `) : `—`
    }
    , [d])
      , De = async e => {
        let t = await re({
            data: {
                paymentId: e
            }
        });
        if (!t.url) {
            u.error(`No screenshot on this submission`);
            return
        }
        _w(t.url)
    }
      , Oe = async e => {
        let t = await se({
            data: {
                orderId: e
            }
        });
        if (!t.url) {
            u.error(`No screenshot on this order`);
            return
        }
        _w(t.url)
    }
    ;
    return (0,
    G.jsxs)(`div`, {
        className: `space-y-5`,
        children: [(0,
        G.jsxs)(`div`, {
            className: `flex items-center gap-3 rounded-2xl p-4 surface-ash`,
            children: [(0,
            G.jsx)(`span`, {
                className: `grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground glow-ring`,
                children: (0,
                G.jsx)(A, {
                    className: `h-5 w-5`
                })
            }), (0,
            G.jsxs)(`div`, {
                className: `min-w-0`,
                children: [(0,
                G.jsx)(`p`, {
                    className: `text-[11px] font-bold tracking-widest text-primary uppercase`,
                    children: `Admin`
                }), (0,
                G.jsx)(`p`, {
                    className: `truncate text-sm font-bold`,
                    children: `Control room unlocked`
                })]
            }), (0,
            G.jsxs)(`span`, {
                className: `ml-auto shrink-0 rounded-full border border-primary/50 bg-primary/10 px-2.5 py-1 text-[9px] font-black tracking-widest text-primary uppercase`,
                children: [(0,
                G.jsx)(`span`, {
                    className: `mr-1 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle ${p ? `animate-ping` : `pulse-glow`}`
                }), `Live`]
            }), (0,
            G.jsxs)(`button`, {
                onClick: async () => {
                    try {
                        await supabaseClient.rpc('log_admin_action', { p_action: 'admin_logout' });
                    } catch (_) { /* ignore audit log errors */ }
                    sessionStorage.removeItem('admin_verified');
                    await l.cancelQueries();
                    l.clear();
                    await supabaseClient.auth.signOut();
                    window.location.href = '/admin';
                }
                ,
                className: `flex shrink-0 items-center gap-1 rounded-full border border-border/70 px-3 py-2 text-xs font-bold`,
                children: [(0,
                G.jsx)(ee, {
                    className: `h-3.5 w-3.5`
                }), ` Lock`]
            })]
        }), (0,
        G.jsxs)(`div`, {
            children: [(0,
            G.jsxs)(`button`, {
                type: `button`,
                onClick: () => a(e => !e),
                "aria-expanded": n,
                className: `grid w-full grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/70 bg-ash/60 px-4 py-3.5 text-left`,
                children: [(0,
                G.jsx)(Se, {
                    className: `h-5 w-5 shrink-0 text-primary`
                }), (0,
                G.jsx)(we.find(t => t.id === e)?.icon ?? B, {
                    className: `h-5 w-5 shrink-0 text-muted-foreground`
                }), (0,
                G.jsx)(`span`, {
                    className: `truncate text-base font-black`,
                    children: we.find(t => t.id === e)?.label ?? `Dashboard`
                }), n ? (0,
                G.jsx)(be, {
                    className: `h-5 w-5 shrink-0 text-muted-foreground`
                }) : (0,
                G.jsx)(ye, {
                    className: `h-5 w-5 shrink-0 text-muted-foreground`
                })]
            }), n ? (0,
            G.jsx)(`nav`, {
                className: `mt-2 overflow-hidden rounded-2xl border border-border/70 bg-ash/40`,
                children: we.map(n => {
                    let r = n.id === e
                      , i = n.id === `queue` ? V.length + _pendingDiamondOrders.length + H.length : n.id === `diamonds` ? _pendingDiamondOrders.length : n.id === `members` ? H.length : 0;
                    return (0,
                    G.jsxs)(`button`, {
                        type: `button`,
                        onClick: () => {
                            t(n.id),
                            a(!1)
                        }
                        ,
                        className: `flex w-full items-center gap-3 border-b border-border/50 px-4 py-3.5 text-left last:border-b-0 ${r ? `bg-primary/10 text-primary` : `text-muted-foreground`}`,
                        children: [(0,
                        G.jsx)(n.icon, {
                            className: `h-4.5 w-4.5 shrink-0`
                        }), (0,
                        G.jsx)(`span`, {
                            className: `min-w-0 truncate text-sm ${r ? `font-black` : `font-bold`}`,
                            children: n.label
                        }), i > 0 ? (0,
                        G.jsx)(`span`, {
                            className: `ml-auto grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-destructive px-1 text-[10px] font-black text-destructive-foreground`,
                            children: i
                        }) : null]
                    }, n.id)
                }
                )
            }) : null]
        }), f ? (0,
        G.jsx)(K, {}) : null, !f && d && e === `diamonds` ? (0,
        G.jsxs)(`div`, {
            className: `space-y-3`,
            children: [(0,
            G.jsxs)(`div`, {
                className: `flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/5 p-4 glow-ring`,
                children: [(0,
                G.jsx)(ue, {
                    className: `h-5 w-5 shrink-0 text-primary`
                }), (0,
                G.jsxs)(`div`, {
                    className: `min-w-0`,
                    children: [(0,
                    G.jsx)(`p`, {
                        className: `text-[11px] font-bold tracking-widest text-primary uppercase`,
                        children: `Diamond orders`
                    }), (0,
                    G.jsx)(`p`, {
                        className: `text-sm font-bold`,
                        children: _pendingDiamondOrders.length === 0 ? `No diamond top-ups awaiting review` : `${_pendingDiamondOrders.length} top-up${_pendingDiamondOrders.length > 1 ? `s` : ``} awaiting review`
                    })]
                })]
            }), (d.diamondOrders ?? []).length === 0 ? (0,
            G.jsx)(q, {
                text: `Diamond package orders will appear here once members submit them.`
            }) : null, (d.diamondOrders ?? []).map(e => (0,
            G.jsxs)(`div`, {
                className: `space-y-3 rounded-2xl border border-accent/30 p-4 surface-ash`,
                children: [(0,
                G.jsxs)(`div`, {
                    className: `flex items-start gap-2`,
                    children: [(0,
                    G.jsxs)(`div`, {
                        className: `min-w-0`,
                        children: [(0,
                        G.jsxs)(`p`, {
                            className: `truncate text-base font-black`,
                            children: [e.package_name, ` · `, e.diamonds, ` 💎`]
                        }), (0,
                        G.jsx)(`p`, {
                            className: `truncate text-xs text-muted-foreground`,
                            children: e.email
                        })]
                    }), (0,
                    G.jsx)(Y, {
                        status: e.status
                    })]
                }), (0,
                G.jsxs)(`dl`, {
                    className: `space-y-1.5 text-xs`,
                    children: [(0,
                    G.jsx)(Z, {
                        label: `Amount`,
                        value: `${e.currency} ${Number(e.amount).toLocaleString()}`
                    }), (0,
                    G.jsx)(Z, {
                        label: `Method`,
                        value: e.method
                    }), (0,
                    G.jsx)(Z, {
                        label: `Sender`,
                        value: e.sender_name
                    }), (0,
                    G.jsx)(Z, {
                        label: `Number`,
                        value: e.sender_number
                    }), (0,
                    G.jsx)(Z, {
                        label: `Txn ID`,
                        value: e.txn_id || `—`
                    }), (0,
                    G.jsx)(Z, {
                        label: `Submitted`,
                        value: new Date(e.created_at).toLocaleString()
                    })]
                }), (0,
                G.jsxs)(g, {
                    size: `sm`,
                    variant: `outline`,
                    onClick: () => Oe(e.id),
                    className: `w-full rounded-full text-xs font-bold`,
                    children: [(0,
                    G.jsx)(D, {
                        className: `mr-1 h-3.5 w-3.5`
                    }), ` View payment proof`]
                }), e.status === `pending` ? (0,
                G.jsxs)(G.Fragment, {
                    children: [(0,
                    G.jsx)(N, {
                        value: _T[e.id] ?? ``,
                        onChange: t => _E(n => ({
                            ...n,
                            [e.id]: t.target.value
                        })),
                        placeholder: `Note for this decision (optional)`,
                        className: `h-11 rounded-xl text-sm`
                    }), (0,
                    G.jsxs)(`div`, {
                        className: `flex flex-wrap gap-2`,
                        children: [(0,
                        G.jsxs)(g, {
                            size: `sm`,
                            disabled: h.isPending,
                            onClick: () => F(`approve`, `Credit this order?`, `${e.package_name} for ${e.email}.`, t => h.mutate({
                                data: {
                                    orderId: e.id,
                                    status: `approved`,
                                    note: t
                                }
                            }), _T[e.id] ?? ``),
                            className: `flex-1 rounded-full text-xs font-bold pulse-glow`,
                            children: [(0,
                            G.jsx)(b, {
                                className: `mr-1 h-3.5 w-3.5`
                            }), ` Credit diamonds`]
                        }), (0,
                        G.jsxs)(g, {
                            size: `sm`,
                            variant: `destructive`,
                            disabled: h.isPending,
                            onClick: () => F(`reject`, `Reject this order?`, `${e.package_name} for ${e.email} — add the reason below.`, t => h.mutate({
                                data: {
                                    orderId: e.id,
                                    status: `rejected`,
                                    note: t
                                }
                            }), _T[e.id] ?? ``),
                            className: `flex-1 rounded-full text-xs font-bold`,
                            children: [(0,
                            G.jsx)(j, {
                                className: `mr-1 h-3.5 w-3.5`
                            }), ` Reject`]
                        })]
                    })]
                }) : null]
            }, e.id))]
        }) : null, !f && d && e === `queue` ? (0,
        G.jsxs)(`div`, {
            className: `space-y-3`,
            children: [(0,
            G.jsxs)(`div`, {
                className: `flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/5 p-4 glow-ring`,
                children: [(0,
                G.jsx)(ue, {
                    className: `h-5 w-5 shrink-0 text-primary`
                }), (0,
                G.jsxs)(`div`, {
                    className: `min-w-0`,
                    children: [(0,
                    G.jsx)(`p`, {
                        className: `text-[11px] font-bold tracking-widest text-primary uppercase`,
                        children: `Approval queue`
                    }), (0,
                    G.jsx)(`p`, {
                        className: `text-sm font-bold`,
                        children: V.length + _pendingDiamondOrders.length + H.length === 0 ? `All caught up — nothing awaiting review` : `${V.length + _pendingDiamondOrders.length + H.length} request${V.length + _pendingDiamondOrders.length + H.length > 1 ? `s` : ``} awaiting review`
                    })]
                }), (0,
                G.jsx)(`span`, {
                    className: `ml-auto shrink-0 text-[9px] font-black tracking-widest text-primary uppercase`,
                    children: p ? `Syncing…` : `Live ${new Date(m).toLocaleTimeString()}`
                })]
            }), (0,
            G.jsxs)(`div`, {
                className: `grid grid-cols-3 gap-2`,
                children: [(0,
                G.jsx)(je, {
                    label: `Accounts`,
                    value: H.length,
                    icon: W
                }), (0,
                G.jsx)(je, {
                    label: `Gateway`,
                    value: V.length,
                    icon: z
                }), (0,
                G.jsx)(je, {
                    label: `Packages`,
                    value: _pendingDiamondOrders.length,
                    icon: k
                })]
            }), (0,
            G.jsx)(X, {
                icon: W,
                text: `Account creation requests`,
                count: H.length
            }), H.length === 0 ? (0,
            G.jsx)(q, {
                text: `No new accounts waiting for activation.`
            }) : null, H.map(e => (0,
            G.jsxs)(`div`, {
                className: `space-y-3 rounded-2xl border border-accent/30 p-4 surface-ash`,
                children: [(0,
                G.jsxs)(`div`, {
                    className: `flex items-start gap-2`,
                    children: [(0,
                    G.jsxs)(`div`, {
                        className: `min-w-0`,
                        children: [(0,
                        G.jsx)(`p`, {
                            className: `truncate text-base font-black`,
                            children: e.full_name || `New member`
                        }), (0,
                        G.jsx)(`p`, {
                            className: `truncate text-xs text-muted-foreground`,
                            children: e.email
                        })]
                    }), (0,
                    G.jsx)(Y, {
                        status: e.status
                    })]
                }), (0,
                G.jsxs)(`dl`, {
                    className: `space-y-1.5 text-xs`,
                    children: [(0,
                    G.jsx)(Z, {
                        label: `Phone`,
                        value: e.phone || `—`
                    }), (0,
                    G.jsx)(Z, {
                        label: `Country`,
                        value: e.country ?? `—`
                    }), (0,
                    G.jsx)(Z, {
                        label: `Signed up`,
                        value: new Date(e.created_at).toLocaleString()
                    })]
                }), (0,
                G.jsxs)(`div`, {
                    className: `flex gap-2`,
                    children: [(0,
                    G.jsxs)(g, {
                        size: `sm`,
                        disabled: S.isPending,
                        onClick: () => F(`approve`, `Activate this account?`, `${e.full_name || e.email} will be able to log in and use every game.`, () => S.mutate({
                            data: {
                                userId: e.id,
                                status: `active`
                            }
                        })),
                        className: `flex-1 rounded-full text-xs font-bold pulse-glow`,
                        children: [(0,
                        G.jsx)(y, {
                            className: `mr-1 h-3.5 w-3.5`
                        }), ` Approve account`]
                    }), (0,
                    G.jsxs)(g, {
                        size: `sm`,
                        variant: `destructive`,
                        disabled: S.isPending,
                        onClick: () => F(`reject`, `Decline this account?`, `${e.full_name || e.email} stays locked out until you activate them.`, () => S.mutate({
                            data: {
                                userId: e.id,
                                status: `suspended`
                            }
                        })),
                        className: `flex-1 rounded-full text-xs font-bold`,
                        children: [(0,
                        G.jsx)(ve, {
                            className: `mr-1 h-3.5 w-3.5`
                        }), ` Decline`]
                    })]
                })]
            }, e.id)), (0,
            G.jsx)(X, {
                icon: k,
                text: `Plan package purchases`,
                count: _pendingDiamondOrders.length
            }), _pendingDiamondOrders.length === 0 ? (0,
            G.jsx)(q, {
                text: `No diamond, gold or ticket packages waiting.`
            }) : null, _pendingDiamondOrders.map(e => (0,
            G.jsxs)(`div`, {
                className: `space-y-3 rounded-2xl border border-accent/30 p-4 surface-ash`,
                children: [(0,
                G.jsxs)(`div`, {
                    className: `flex items-start gap-2`,
                    children: [(0,
                    G.jsxs)(`div`, {
                        className: `min-w-0`,
                        children: [(0,
                        G.jsxs)(`p`, {
                            className: `truncate text-base font-black`,
                            children: [e.package_name, ` ·`, ` `, e.asset === `gold` ? `${e.coins} 🪙` : e.asset === `ticket` ? `${e.coins} 🎟️` : `${e.diamonds} 💎`]
                        }), (0,
                        G.jsx)(`p`, {
                            className: `truncate text-xs text-muted-foreground`,
                            children: e.email
                        })]
                    }), (0,
                    G.jsx)(Y, {
                        status: e.status
                    })]
                }), (0,
                G.jsxs)(`dl`, {
                    className: `space-y-1.5 text-xs`,
                    children: [(0,
                    G.jsx)(Z, {
                        label: `Amount`,
                        value: `${e.currency} ${Number(e.amount).toLocaleString()}`
                    }), (0,
                    G.jsx)(Z, {
                        label: `Method`,
                        value: e.method
                    }), (0,
                    G.jsx)(Z, {
                        label: `Sender`,
                        value: e.sender_name
                    }), (0,
                    G.jsx)(Z, {
                        label: `Number`,
                        value: e.sender_number
                    }), (0,
                    G.jsx)(Z, {
                        label: `Submitted`,
                        value: new Date(e.created_at).toLocaleString()
                    })]
                }), (0,
                G.jsx)(N, {
                    value: _T[e.id] ?? ``,
                    onChange: t => _E(n => ({
                        ...n,
                        [e.id]: t.target.value
                    })),
                    placeholder: `Note for this decision (optional)`,
                    className: `h-11 rounded-xl text-sm`
                }), (0,
                G.jsxs)(`div`, {
                    className: `flex flex-wrap gap-2`,
                    children: [(0,
                    G.jsxs)(g, {
                        size: `sm`,
                        variant: `outline`,
                        onClick: () => Oe(e.id),
                        className: `flex-1 rounded-full text-xs font-bold`,
                        children: [(0,
                        G.jsx)(D, {
                            className: `mr-1 h-3.5 w-3.5`
                        }), ` Proof`]
                    }), (0,
                    G.jsxs)(g, {
                        size: `sm`,
                        disabled: h.isPending,
                        onClick: () => F(`approve`, `Credit this package?`, `${e.package_name} · ${e.currency} ${Number(e.amount).toLocaleString()} for ${e.email}.`, t => h.mutate({
                            data: {
                                orderId: e.id,
                                status: `approved`,
                                note: t
                            }
                        }), _T[e.id] ?? ``),
                        className: `flex-1 rounded-full text-xs font-bold pulse-glow`,
                        children: [(0,
                        G.jsx)(b, {
                            className: `mr-1 h-3.5 w-3.5`
                        }), ` Credit`]
                    }), (0,
                    G.jsxs)(g, {
                        size: `sm`,
                        variant: `destructive`,
                        disabled: h.isPending,
                        onClick: () => F(`reject`, `Reject this package order?`, `${e.package_name} for ${e.email} — the member is told why.`, t => h.mutate({
                            data: {
                                orderId: e.id,
                                status: `rejected`,
                                note: t
                            }
                        }), _T[e.id] ?? ``),
                        className: `flex-1 rounded-full text-xs font-bold`,
                        children: [(0,
                        G.jsx)(j, {
                            className: `mr-1 h-3.5 w-3.5`
                        }), ` Reject`]
                    })]
                })]
            }, e.id)), (0,
            G.jsx)(X, {
                icon: z,
                text: `Registration payment proofs`,
                count: V.length
            }), V.length === 0 ? (0,
            G.jsx)(q, {
                text: `New payment proofs will appear here the moment members submit them.`
            }) : null, V.map(e => (0,
            G.jsxs)(`div`, {
                className: `space-y-3 rounded-2xl border border-accent/30 p-4 surface-ash`,
                children: [(0,
                G.jsxs)(`div`, {
                    className: `flex items-start gap-2`,
                    children: [(0,
                    G.jsxs)(`div`, {
                        className: `min-w-0`,
                        children: [(0,
                        G.jsx)(`p`, {
                            className: `truncate text-base font-black`,
                            children: e.full_name || e.email || `Member`
                        }), (0,
                        G.jsx)(`p`, {
                            className: `truncate text-xs text-muted-foreground`,
                            children: e.email
                        })]
                    }), (0,
                    G.jsx)(Y, {
                        status: e.status
                    })]
                }), (0,
                G.jsxs)(`dl`, {
                    className: `space-y-1.5 text-xs`,
                    children: [(0,
                    G.jsx)(Z, {
                        label: `Amount`,
                        value: `${e.currency} ${Number(e.amount).toLocaleString()}`
                    }), (0,
                    G.jsx)(Z, {
                        label: `Method`,
                        value: `${e.country === `GH` ? `🇬🇭` : `🇳🇬`} ${e.method}`
                    }), (0,
                    G.jsx)(Z, {
                        label: `Sender`,
                        value: e.sender_name
                    }), (0,
                    G.jsx)(Z, {
                        label: `Number`,
                        value: e.sender_number
                    }), (0,
                    G.jsx)(Z, {
                        label: `Txn ID`,
                        value: e.txn_id || `—`
                    }), (0,
                    G.jsx)(Z, {
                        label: `Waiting`,
                        value: new Date(e.created_at).toLocaleString()
                    })]
                }), (0,
                G.jsx)(N, {
                    value: _T[e.id] ?? ``,
                    onChange: t => _E(n => ({
                        ...n,
                        [e.id]: t.target.value
                    })),
                    placeholder: `Note for this decision (optional)`,
                    className: `h-11 rounded-xl text-sm`
                }), (0,
                G.jsxs)(`div`, {
                    className: `flex flex-wrap gap-2`,
                    children: [(0,
                    G.jsxs)(g, {
                        size: `sm`,
                        variant: `outline`,
                        onClick: () => De(e.id),
                        className: `flex-1 rounded-full text-xs font-bold`,
                        children: [(0,
                        G.jsx)(D, {
                            className: `mr-1 h-3.5 w-3.5`
                        }), ` Proof`]
                    }), (0,
                    G.jsxs)(g, {
                        size: `sm`,
                        disabled: x.isPending,
                        onClick: () => F(`approve`, `Approve this member?`, `${e.full_name || e.email} paid ${e.currency} ${Number(e.amount).toLocaleString()} — approving activates the account.`, t => x.mutate({
                            data: {
                                paymentId: e.id,
                                status: `approved`,
                                note: t
                            }
                        }), _T[e.id] ?? ``),
                        className: `flex-1 rounded-full text-xs font-bold pulse-glow`,
                        children: [(0,
                        G.jsx)(b, {
                            className: `mr-1 h-3.5 w-3.5`
                        }), ` Approve`]
                    }), (0,
                    G.jsxs)(g, {
                        size: `sm`,
                        variant: `destructive`,
                        disabled: x.isPending,
                        onClick: () => F(`reject`, `Reject this payment proof?`, `${e.full_name || e.email} stays pending and receives your reason.`, t => x.mutate({
                            data: {
                                paymentId: e.id,
                                status: `rejected`,
                                note: t
                            }
                        }), _T[e.id] ?? ``),
                        className: `flex-1 rounded-full text-xs font-bold`,
                        children: [(0,
                        G.jsx)(j, {
                            className: `mr-1 h-3.5 w-3.5`
                        }), ` Reject`]
                    })]
                })]
            }, e.id))]
        }) : null, !f && d && e === `overview` ? (0,
        G.jsxs)(`div`, {
            className: `space-y-5`,
            children: [(0,
            G.jsxs)(`div`, {
                className: `flex items-center gap-3`,
                children: [(0,
                G.jsx)(B, {
                    className: `h-6 w-6 shrink-0 text-primary`
                }), (0,
                G.jsx)(`h2`, {
                    className: `min-w-0 truncate text-2xl font-black tracking-tight`,
                    children: `Dashboard`
                }), (0,
                G.jsxs)(`span`, {
                    className: `ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-3 py-1.5 text-[10px] font-black tracking-widest text-primary uppercase`,
                    children: [(0,
                    G.jsx)(_, {
                        className: `h-3.5 w-3.5 ${p ? `animate-pulse` : ``}`
                    }), ` `, p ? `Syncing` : new Date(m).toLocaleTimeString()]
                })]
            }), (0,
            G.jsxs)(`div`, {
                className: `grid grid-cols-2 gap-3`,
                children: [(0,
                G.jsx)(J, {
                    label: `Members`,
                    value: String(d.stats.members),
                    icon: Ce
                }), (0,
                G.jsx)(J, {
                    label: `Active members`,
                    value: String(U.activeMembers),
                    icon: A,
                    accent: !0
                }), (0,
                G.jsx)(J, {
                    label: `Pending payments`,
                    value: String(d.stats.pending),
                    icon: ue,
                    warn: !0
                }), (0,
                G.jsx)(J, {
                    label: `Pending asset orders`,
                    value: String(_pendingDiamondOrders.length),
                    icon: k,
                    warn: !0
                }), (0,
                G.jsx)(J, {
                    label: `Approved today · gateway`,
                    value: String(U.approvedGateway),
                    icon: z,
                    accent: !0
                }), (0,
                G.jsx)(J, {
                    label: `Approved today · assets`,
                    value: String(U.approvedAssets),
                    icon: k,
                    accent: !0
                }), (0,
                G.jsx)(`div`, {
                    className: `col-span-2`,
                    children: (0,
                    G.jsx)(J, {
                        label: `Approved today · total`,
                        value: String(U.approvedTotal),
                        icon: b,
                        accent: !0
                    })
                })]
            }), (0,
            G.jsxs)(`div`, {
                className: `rounded-2xl border p-4 ${U.pendingProofs === 0 ? `border-primary/40 bg-primary/5 glow-ring` : `border-accent/40 bg-accent/5`}`,
                children: [(0,
                G.jsxs)(`p`, {
                    className: `flex items-center gap-2 text-sm font-black`,
                    children: [(0,
                    G.jsx)(A, {
                        className: `h-4 w-4 shrink-0 ${U.pendingProofs === 0 ? `text-primary` : `text-accent`}`
                    }), `Login health ·`, ` `, U.pendingProofs === 0 ? `All clear` : `${U.pendingProofs} waiting`]
                }), (0,
                G.jsxs)(`div`, {
                    className: `mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3`,
                    children: [(0,
                    G.jsxs)(`p`, {
                        className: `min-w-0 text-xs leading-relaxed text-muted-foreground`,
                        children: [`Approved users:`, ` `, (0,
                        G.jsx)(`span`, {
                            className: `font-black text-foreground`,
                            children: U.activeMembers
                        }), ` · Pending proofs: `, (0,
                        G.jsx)(`span`, {
                            className: `font-black text-foreground`,
                            children: U.pendingProofs
                        }), ` · Rejected last 24h:`, ` `, (0,
                        G.jsx)(`span`, {
                            className: `font-black text-foreground`,
                            children: U.rejected24h
                        })]
                    }), (0,
                    G.jsx)(`button`, {
                        type: `button`,
                        onClick: () => l.invalidateQueries({
                            queryKey: [`admin-data`]
                        }),
                        className: `shrink-0 rounded-full border border-border/70 px-3 py-2 text-[10px] font-black tracking-widest uppercase`,
                        children: `Refresh`
                    })]
                })]
            }), (0,
            G.jsxs)(`div`, {
                className: `space-y-3`,
                children: [Te.map(e => (0,
                G.jsxs)(`div`, {
                    className: `rounded-2xl p-4 surface-ash`,
                    children: [(0,
                    G.jsxs)(`p`, {
                        className: `text-[10px] font-bold tracking-widest text-muted-foreground uppercase`,
                        children: [`Revenue approved `, e.flag]
                    }), (0,
                    G.jsxs)(`p`, {
                        className: `mt-1 text-2xl font-black`,
                        children: [e.amount, ` `, (0,
                        G.jsx)(`span`, {
                            className: `text-xs font-bold text-muted-foreground`,
                            children: e.currency
                        })]
                    })]
                }, e.currency)), (0,
                G.jsxs)(`div`, {
                    className: `rounded-2xl border border-primary/40 bg-primary/5 p-4 glow-ring`,
                    children: [(0,
                    G.jsxs)(`p`, {
                        className: `text-[10px] font-bold tracking-widest text-primary uppercase`,
                        children: [`Pending Reconciliation`]
                    }), (0,
                    G.jsxs)(`p`, {
                        className: `mt-1 text-2xl font-black`,
                        children: [Ee]
                    })]
                })]
            })]
        }) : null, !f && d && e === `earnings` ? (0,
        G.jsxs)(`div`, {
            className: `space-y-5`,
            children: [(0,
            G.jsxs)(`div`, {
                className: `flex items-center gap-3`,
                children: [(0,
                G.jsx)(v, {
                    className: `h-6 w-6 shrink-0 text-primary`
                }), (0,
                G.jsx)(`h2`, {
                    className: `min-w-0 truncate text-2xl font-black tracking-tight`,
                    children: `Earnings Reconciliation`
                })]
            }), (0,
            G.jsx)(EarningsPanel, {
                data: d.earnings,
                stats: d.stats,
                members: d.members,
                invalidate: () => l.invalidateQueries({
                    queryKey: [`admin-data`]
                })
            })]
        }) : null, !f && d && e === `efootball` ? (0,
        G.jsxs)(`div`, {
            className: `space-y-5`,
            children: [(0,
            G.jsxs)(`div`, {
                className: `flex items-center gap-3`,
                children: [(0,
                G.jsx)(O, {
                    className: `h-6 w-6 shrink-0 text-primary`
                }), (0,
                G.jsx)(`h2`, {
                    className: `min-w-0 truncate text-2xl font-black tracking-tight`,
                    children: `eFootball Codes`
                })]
            }), (0,
            G.jsx)(EfootballPanel, {
                data: d.efootball,
                members: d.members,
                invalidate: () => l.invalidateQueries({
                    queryKey: [`admin-data`]
                })
            })]
        }) : null, !f && d && e === `pricing` ? (0,
        G.jsxs)(`div`, {
            className: `space-y-5`,
            children: [(0,
            G.jsxs)(`div`, {
                className: `flex items-center gap-3`,
                children: [(0,
                G.jsx)(k, {
                    className: `h-6 w-6 shrink-0 text-primary`
                }), (0,
                G.jsx)(`h2`, {
                    className: `min-w-0 truncate text-2xl font-black tracking-tight`,
                    children: `Pricing & Game Costs`
                })]
            }), (0,
            G.jsx)(PricingPanel, {
                data: d.pricing,
                invalidate: () => l.invalidateQueries({
                    queryKey: [`admin-data`]
                })
            })]
        }) : null, !f && d && e === `paysettings` ? (0,
        G.jsxs)(`div`, {
            className: `space-y-5`,
            children: [(0,
            G.jsxs)(`div`, {
                className: `flex items-center gap-3`,
                children: [(0,
                G.jsx)(R, {
                    className: `h-6 w-6 shrink-0 text-primary`
                }), (0,
                G.jsx)(`h2`, {
                    className: `min-w-0 truncate text-2xl font-black tracking-tight`,
                    children: `Payment Settings`
                })]
            }), (0,
            G.jsx)(PaysettingsPanel, {
                data: d.paymentSettings,
                invalidate: () => l.invalidateQueries({
                    queryKey: [`admin-data`]
                })
            })]
        }) : null, !f && d && e === `payments` ? (0,
        G.jsxs)(`div`, {
            className: `space-y-5`,
            children: [(0,
            G.jsxs)(`div`, {
                className: `flex items-center gap-3`,
                children: [(0,
                G.jsx)(de, {
                    className: `h-6 w-6 shrink-0 text-primary`
                }), (0,
                G.jsx)(`h2`, {
                    className: `min-w-0 truncate text-2xl font-black tracking-tight`,
                    children: `Purchase History`
                })]
            }), (0,
            G.jsx)(PaymentsPanel, { payments: d.payments,
                diamondOrders: d.diamondOrders,
                onViewPaymentProof: De,
                onViewOrderProof: Oe
            })]
        }) : null, !f && d && e === `vip` ? (0,
        G.jsxs)(`div`, {
            className: `space-y-5`,
            children: [(0,
            G.jsxs)(`div`, {
                className: `flex items-center gap-3`,
                children: [(0,
                G.jsx)(A, {
                    className: `h-6 w-6 shrink-0 text-primary`
                }), (0,
                G.jsx)(`h2`, {
                    className: `min-w-0 truncate text-2xl font-black tracking-tight`,
                    children: `VIP Access Grants`
                })]
            }), (0,
            G.jsx)(VipSecurityPanel, {
                members: d.members,
                invalidate: () => l.invalidateQueries({
                    queryKey: [`admin-data`]
                })
            })]
        }) : null, !f && d && e === `members` ? (0,
        G.jsxs)(`div`, {
            className: `space-y-5`,
            children: [(0,
            G.jsxs)(`div`, {
                className: `flex items-center gap-3`,
                children: [(0,
                G.jsx)(Ce, {
                    className: `h-6 w-6 shrink-0 text-primary`
                }), (0,
                G.jsx)(`h2`, {
                    className: `min-w-0 truncate text-2xl font-black tracking-tight`,
                    children: `Members`
                })]
            }), (0,
            G.jsx)(MembersPanel, {
                members: d.members,
                updateMember: S.mutate
            })]
        }) : null, !f && d && e === `security` ? (0,
        G.jsxs)(`div`, {
            className: `space-y-5`,
            children: [(0,
            G.jsxs)(`div`, {
                className: `flex items-center gap-3`,
                children: [(0,
                G.jsx)(xe, {
                    className: `h-6 w-6 shrink-0 text-primary`
                }), (0,
                G.jsx)(`h2`, {
                    className: `min-w-0 truncate text-2xl font-black tracking-tight`,
                    children: `Security Settings`
                })]
            }), (0,
            G.jsx)(VipSecurityPanel, {
                invalidate: () => l.invalidateQueries({
                    queryKey: [`admin-data`]
                })
            })]
        }) : null, !f && d && e === `predictions` ? (0,
        G.jsxs)(`div`, {
            className: `space-y-5`,
            children: [(0,
            G.jsxs)(`div`, {
                className: `flex items-center gap-3`,
                children: [(0,
                G.jsx)(fe, {
                    className: `h-6 w-6 shrink-0 text-primary`
                }), (0,
                G.jsx)(`h2`, {
                    className: `min-w-0 truncate text-2xl font-black tracking-tight`,
                    children: `Manual Predictions`
                })]
            }), (0,
            G.jsx)(PredictionsPanel, {
                predictions: d.predictions,
                invalidate: () => l.invalidateQueries({
                    queryKey: [`admin-data`]
                })
            })]
        }) : null, (0,
        G.jsx)(_e, {
            open: _C !== null,
            onOpenChange: e => e || _w(null),
            children: (0,
            G.jsxs)(he, {
                className: `max-w-2xl rounded-3xl border-border/70 bg-card p-0 overflow-hidden`,
                children: [(0,
                G.jsxs)(me, {
                    className: `p-6 border-b border-border/60`,
                    children: [(0,
                    G.jsx)(pe, {
                        className: `text-xl font-black`,
                        children: `Payment receipt proof`
                    }), (0,
                    G.jsx)(ge, {
                        children: `Uploaded Mobile Money / Bank transfer screenshot`
                    })]
                }), (0,
                G.jsx)(`div`, {
                    className: `p-6 flex justify-center bg-ash/30`,
                    children: _C ? (0,
                    G.jsx)(`img`, {
                        src: _C,
                        alt: `Payment screenshot proof`,
                        className: `max-h-[70vh] rounded-2xl object-contain shadow-2xl`
                    }) : null
                }), (0,
                G.jsx)(`div`, {
                    className: `p-6 border-t border-border/60 flex justify-end`,
                    children: (0,
                    G.jsx)(g, {
                        onClick: () => _w(null),
                        className: `rounded-full px-6`,
                        children: `Close`
                    })
                })]
            })
        }), (0,
        G.jsx)(_e, {
            open: _proofModal !== null,
            onOpenChange: e => e || _setProofModal(null),
            children: (0,
            G.jsxs)(he, {
                className: `max-w-md rounded-3xl border-border/70 bg-card p-6`,
                children: [(0,
                G.jsxs)(me, {
                    children: [(0,
                    G.jsx)(pe, {
                        className: `text-xl font-black`,
                        children: _proofModal?.title
                    }), (0,
                    G.jsx)(ge, {
                        children: _proofModal?.summary
                    })]
                }), _proofModal?.reasonRequired ? (0,
                G.jsxs)(`div`, {
                    className: `space-y-2 mt-4`,
                    children: [(0,
                    G.jsx)(P, {
                        className: `text-[11px] font-bold tracking-widest text-muted-foreground uppercase`,
                        children: `Reason for rejection`
                    }), (0,
                    G.jsx)(N, {
                        value: _proofModal?.reason ?? ``,
                        onChange: e => M(t => ({
                            ...t,
                            reason: e.target.value
                        })),
                        placeholder: `Explain why this payment proof was rejected...`,
                        className: `h-11 rounded-xl text-sm`
                    })]
                }) : null, (0,
                G.jsxs)(`div`, {
                    className: `flex gap-3 mt-6`,
                    children: [(0,
                    G.jsx)(g, {
                        variant: _proofModal?.tone === `approve` ? `default` : `destructive`,
                        onClick: () => {
                            if (_proofModal?.reasonRequired && !_proofModal.reason?.trim()) {
                                u.error(`Please enter a reason for rejection`);
                                return
                            }
                            _proofModal?.run(_proofModal.reason),
                            _setProofModal(null)
                        }
                        ,
                        className: `flex-1 rounded-full font-bold`,
                        children: _proofModal?.tone === `approve` ? `Confirm Approval` : `Confirm Rejection`
                    }), (0,
                    G.jsx)(g, {
                        variant: `ghost`,
                        onClick: () => _setProofModal(null),
                        className: `flex-1 rounded-full font-bold`,
                        children: `Cancel`
                    })]
                })]
            })
        })]
    })
}

function J({label: e, value: t, icon: n, accent: r, warn: i}) {
    return (0,
    G.jsxs)(`div`, {
        className: `rounded-2xl border p-4 transition-colors ${r ? `border-primary/20 bg-primary/5` : i ? `border-destructive/20 bg-destructive/5` : `border-border/60 bg-card`}`,
        children: [(0,
        G.jsxs)(`div`, {
            className: `flex items-center gap-2 text-xs font-bold text-muted-foreground`,
            children: [(0,
            G.jsx)(n, {
                className: `h-4 w-4 shrink-0 ${r ? `text-primary` : i ? `text-destructive` : `text-muted-foreground`}`
            }), e]
        }), (0,
        G.jsx)(`p`, {
            className: `mt-2 text-2xl font-black tracking-tight`,
            children: t
        })]
    })
}

function je({label: e, value: t, icon: n}) {
    return (0,
    G.jsxs)(`div`, {
        className: `rounded-2xl border border-border/60 bg-card p-3 text-center`,
        children: [(0,
        G.jsx)(n, {
            className: `mx-auto h-5 w-5 text-muted-foreground`
        }), (0,
        G.jsx)(`p`, {
            className: `mt-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase`,
            children: e
        }), (0,
        G.jsx)(`p`, {
            className: `mt-1 text-lg font-black`,
            children: t
        })]
    })
}

function X({icon: e, text: t, count: n}) {
    return (0,
    G.jsxs)(`div`, {
        className: `flex items-center gap-2 border-b border-border/50 pb-2 pt-4 first:pt-2`,
        children: [(0,
        G.jsx)(e, {
            className: `h-4.5 w-4.5 text-primary`
        }), (0,
        G.jsx)(`h3`, {
            className: `text-sm font-black`,
            children: t
        }), n > 0 ? (0,
        G.jsx)(`span`, {
            className: `grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-black text-destructive-foreground`,
            children: n
        }) : null]
    })
}

function Y({status: e}) {
    let t = e === `approved` || e === `active`
      , n = e === `pending`;
    return (0,
    G.jsx)(`span`, {
        className: `shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase ${t ? `bg-primary/10 text-primary` : n ? `bg-accent/10 text-accent` : `bg-destructive/10 text-destructive`}`,
        children: e
    })
}

function Z({label: e, value: t}) {
    return (0,
    G.jsxs)(`div`, {
        className: `flex justify-between gap-3 py-0.5 border-b border-border/30 last:border-b-0`,
        children: [(0,
        G.jsx)(`dt`, {
            className: `text-muted-foreground font-medium`,
            children: e
        }), (0,
        G.jsx)(`dd`, {
            className: `font-bold text-right text-foreground break-all`,
            children: t
        })]
    })
}

function q({text: e}) {
    return (0,
    G.jsx)(`div`, {
        className: `rounded-2xl border border-dashed border-border/80 p-8 text-center`,
        children: (0,
        G.jsx)(`p`, {
            className: `text-sm text-muted-foreground`,
            children: e
        })
    })
}

function K() {
    return (0,
    G.jsxs)(`div`, {
        className: `space-y-5`,
        children: [(0,
        G.jsx)(`div`, {
            className: `flex items-center gap-3 rounded-2xl p-4 surface-ash`,
            children: [(0,
            G.jsx)(`div`, {
                className: `h-10 w-10 animate-pulse rounded-xl bg-ash/80`
            }), (0,
            G.jsxs)(`div`, {
                className: `min-w-0 flex-1 space-y-2`,
                children: [(0,
                G.jsx)(`div`, {
                    className: `h-2.5 w-16 animate-pulse rounded bg-ash/80`
                }), (0,
            G.jsx)(`div`, {
                className: `h-3.5 w-32 animate-pulse rounded bg-ash/80`
            })]
            })]
        }), (0,
        G.jsx)(`div`, {
            className: `h-12 w-full animate-pulse rounded-2xl bg-ash/60`
        }), (0,
        G.jsxs)(`div`, {
            className: `grid grid-cols-2 gap-3`,
            children: [(0,
            G.jsx)(`div`, {
                className: `h-24 animate-pulse rounded-2xl bg-ash/60`
            }), (0,
            G.jsx)(`div`, {
                className: `h-24 animate-pulse rounded-2xl bg-ash/60`
            }), (0,
            G.jsx)(`div`, {
                className: `h-24 animate-pulse rounded-2xl bg-ash/60`
            }), (0,
            G.jsx)(`div`, {
                className: `h-24 animate-pulse rounded-2xl bg-ash/60`
            })]
        }), (0,
        G.jsxs)(`div`, {
            className: `space-y-3`,
            children: [(0,
            G.jsx)(`div`, {
                className: `h-5 w-40 animate-pulse rounded bg-ash/60`
            }), (0,
            G.jsx)(`div`, {
                className: `h-36 animate-pulse rounded-2xl bg-ash/60`
            }), (0,
            G.jsx)(`div`, {
                className: `h-36 animate-pulse rounded-2xl bg-ash/60`
            }), (0,
            G.jsx)(`div`, {
                className: `h-36 animate-pulse rounded-2xl bg-ash/60`
            })]
        })]
    })
}

export { Te as component };
