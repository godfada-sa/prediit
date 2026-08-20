import { C as supabase } from "./index-sG8SpmM9.js";
import { o as makeIcon } from "./button-DS1rjqG5.js";
import { G as reactRaw, o as jsxRaw, q as interop } from "./useStore-BI3_Wmfo.js";

const React = interop(reactRaw(), 1);
const j = jsxRaw();

function getAdminSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem('admin_verified') || 'null');
    if (session?.token && Number(session.expiresAt) > Date.now()) return session;
  } catch (_) { /* ignore malformed browser state */ }
  sessionStorage.removeItem('admin_verified');
  return null;
}

async function adminRpc(name, args = {}) {
  const session = getAdminSession();
  if (!session) throw new Error('Admin session expired. Enter the access code again.');
  const { data, error } = await supabase.rpc(name, { ...args, p_admin_token: session.token });
  if (error) {
    if (/session|expired|invalid|required/i.test(error.message || '')) {
      sessionStorage.removeItem('admin_verified');
    }
    throw error;
  }
  return data;
}

// Check icon component required by the admin page
export var _ = makeIcon('check', [['path', { d: 'M20 6 9 17l-5-5', key: '1gmf2c' }]]);

// GET: admin-session (server-side + session-based passcode auth)
export async function a() {
  const session = getAdminSession();
  if (!session) return { unlocked: false };
  const { data, error } = await supabase.rpc('check_admin_session', { p_admin_token: session.token });
  if (!error && data?.unlocked) return { unlocked: true };
  sessionStorage.removeItem('admin_verified');
  return { unlocked: false };
}

// POST: update-diamond-order (RPC call)
export async function d(props) {
  const { orderId, status, note } = props?.data ?? {};
  if (!orderId || !status) throw new Error("Missing parameters");

  return adminRpc('update_diamond_order', {
    p_order_id: orderId,
    p_status: status,
    p_note: note
  });
}

// POST: update-payment-proof (RPC call)
export async function f(props) {
  const { paymentId, status, note } = props?.data ?? {};
  if (!paymentId || !status) throw new Error("Missing parameters");

  return adminRpc('update_payment_proof', {
    p_payment_id: paymentId,
    p_status: status,
    p_note: note
  });
}

// POST: verify-admin-code
export async function g(props) {
  const code = props?.data?.code;
  const { data: verifyResult, error: verifyError } = await supabase.rpc('verify_admin_code', { p_code: code });
  if (verifyError) throw verifyError;
  if (verifyResult?.ok && verifyResult?.token) {
    sessionStorage.setItem('admin_verified', JSON.stringify({
      token: verifyResult.token,
      expiresAt: verifyResult.expiresAt
    }));
    return { ok: true, expiresAt: verifyResult.expiresAt };
  }
  return { ok: false };
}

// GET: admin-data — uses SECURITY DEFINER RPC to bypass RLS
// (admin panel uses passcode auth, not Supabase Auth, so auth.uid() is null
//  and regular table queries return empty due to RLS)
export async function i() {
  try {
    const data = await adminRpc('admin_get_all_data');
    if (!data) throw new Error('No data returned from admin_get_all_data');
    return {
      members: data.members || [],
      payments: data.payments || [],
      diamondOrders: data.diamondOrders || [],
      predictions: data.predictions || [],
      efootball: data.efootball || [],
      ticketTransactions: data.ticketTransactions || [],
      spinSignals: data.spinSignals || [],
      goldTransactions: data.goldTransactions || [],
      settings: data.settings || {},
      pricing: data.pricing || {
        prediction_cost: 50,
        efootball_cost: 1,
        efootball_expiry: 10,
        spin_cost: 50,
        registration_ghs: 50,
        registration_ngn: 10000
      },
      paymentSettings: data.paymentSettings || {
        payment_ghana: {},
        payment_nigeria: {},
      },
      earnings: data.earnings || {
        totalGHS: 0,
        totalNGN: 0,
        payments: [],
        orders: [],
        ticketTransactions: [],
        spinSignals: []
      },
      stats: data.stats || {
        revenue: { GHS: 0, NGN: 0 },
        pending: 0,
        members: 0
      }
    };
  } catch (err) {
    console.error("Error loading admin data:", err);
    return {
      members: [],
      payments: [],
      diamondOrders: [],
      predictions: [],
      efootball: [],
      ticketTransactions: [],
      spinSignals: [],
      pricing: {
        prediction_cost: 50,
        efootball_cost: 1,
        efootball_expiry: 10,
        spin_cost: 50,
        registration_ghs: 50,
        registration_ngn: 10000
      },
      paymentSettings: {
        payment_ghana: {},
        payment_nigeria: {},
      },
      earnings: {
        totalGHS: 0,
        totalNGN: 0,
        payments: [],
        orders: [],
        ticketTransactions: [],
        spinSignals: []
      },
      stats: {
        revenue: { GHS: 0, NGN: 0 },
        pending: 0,
        members: 0
      }
    };
  }
}

// POST: get-payment-proof-url
export async function l(props) {
  const { paymentId } = props?.data ?? {};
  const session = getAdminSession();
  if (!session) throw new Error('Admin session expired.');
  const { data, error } = await supabase.functions.invoke('admin-proof-url', {
    body: { adminToken: session.token, kind: 'payment', recordId: paymentId }
  });
  if (error) throw error;
  return { url: data?.url || null, expired: Boolean(data?.expired) };
}

// POST: update-member-status
export async function m(props) {
  const { userId, status } = props?.data ?? {};
  if (!userId || !status) throw new Error('Missing userId or status');
  await adminRpc('admin_update_member_status', {
    p_user_id: userId,
    p_status: status
  });
  return { ok: true };
}

// POST: get-order-proof-url
export async function n(props) {
  const { orderId } = props?.data ?? {};
  const session = getAdminSession();
  if (!session) throw new Error('Admin session expired.');
  const { data, error } = await supabase.functions.invoke('admin-proof-url', {
    body: { adminToken: session.token, kind: 'order', recordId: orderId }
  });
  if (error) throw error;
  return { url: data?.url || null, expired: Boolean(data?.expired) };
}

// POST: submit payment proof / order proof (imported as h in checkout)
export async function h(props) {
  const { country, method, amount, currency, senderName, senderNumber, txnId, fileName, fileBase64, packageName, diamonds } = props?.data ?? {};

  // Get user — try getUser first, fall back to getSession
  let userId = null;
  let userEmail = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { userId = user.id; userEmail = user.email; }
  } catch(e) { /* ignore */ }
  if (!userId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) { userId = session.user.id; userEmail = session.user.email; }
  }
  if (!userId) throw new Error("Please sign in to submit your proof");

  const fileBytes = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
  const screenshotPath = `${userId}/${Date.now()}-${fileName}`;

  // Try upload — use payment-proofs for registration, screenshot-proofs for orders
  const bucket = (packageName || diamonds) ? 'screenshot-proofs' : 'payment-proofs';
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(screenshotPath, fileBytes, { contentType: 'image/png' });
  if (uploadError) throw new Error('Screenshot upload failed: ' + uploadError.message);

  // Use RPC for the database insert
  if (packageName || diamonds) {
    const { data: rpcResult, error: rpcErr } = await supabase.rpc('submit_gold_order', {
      p_package_name: packageName,
      p_gold: Number(diamonds),
      p_amount: Number(amount),
      p_currency: currency,
      p_method: method,
      p_txn_id: txnId || null,
      p_sender_name: senderName,
      p_sender_number: senderNumber,
      p_screenshot_path: screenshotPath
    });
    if (rpcErr || !rpcResult?.ok) {
      await supabase.storage.from(bucket).remove([screenshotPath]);
      if (rpcErr) throw rpcErr;
      throw new Error(rpcResult?.reason || 'Submission failed');
    }
    return { ok: true, order: rpcResult.order };
  } else {
    const { data: rpcResult, error: rpcErr } = await supabase.rpc('submit_registration_payment', {
      p_country: country,
      p_method: method,
      p_amount: Number(amount),
      p_currency: currency,
      p_sender_name: senderName,
      p_sender_number: senderNumber,
      p_txn_id: txnId || null,
      p_screenshot_path: screenshotPath
    });
    if (rpcErr) throw rpcErr;
    if (!rpcResult?.ok) throw new Error(rpcResult?.reason || 'Submission failed');
    return { ok: true, payment: rpcResult.payment };
  }
}

// POST: update settings in database
export async function u(props) {
  const settingsData = props?.data;
  if (!settingsData) return { ok: true };

  await adminRpc('admin_update_settings', {
    p_settings: {
      payment_ghana: settingsData.payment_ghana,
      payment_nigeria: settingsData.payment_nigeria,
      registration_ghs: Number(settingsData.registration_ghs),
      registration_ngn: Number(settingsData.registration_ngn),
      prediction_cost: Number(settingsData.prediction_cost),
      efootball_cost: Number(settingsData.efootball_cost),
      efootball_expiry: Number(settingsData.efootball_expiry),
      spin_cost: Number(settingsData.spin_cost)
    }
  });
  return { ok: true };
}

// POST: delete admin items (member, prediction, booking_request, payment, order)
export async function deleteAdminItem(props) {
  const { table, id } = props?.data ?? {};
  if (!table || !id) throw new Error("Missing parameters");

  const allowedTables = ['profiles', 'predictions', 'booking_code_requests', 'payments', 'orders'];
  if (!allowedTables.includes(table)) throw new Error("Invalid table name");

  await adminRpc('admin_delete_record', { p_table: table, p_id: id });
  return { ok: true };
}


// --- REACT COMPONENTS FOR THE TABS ---

// 1. eFootball Codes Admin View (exported as T / t)
export function t(props) {
  const { data, members, invalidate } = props;
  const [code, setCode] = React.useState('');
  const [market, setMarket] = React.useState('1X2 - Home Win');
  const [stakeTime, setStakeTime] = React.useState('');
  const [selectedRequest, setSelectedRequest] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !code || !stakeTime) {
      alert("Please fill all details");
      return;
    }
    setLoading(true);
    try {
      await adminRpc('admin_approve_booking_code', {
        p_request_id: selectedRequest.id,
        p_code: code,
        p_market: market,
        p_stake_time: new Date(stakeTime).toISOString()
      });

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

  return j.jsxs("div", {
    className: "space-y-6",
    children: [
      selectedRequest && j.jsxs("form", {
        onSubmit: handleSubmit,
        className: "p-5 border border-primary/30 rounded-3xl bg-ash/50 space-y-4 glow-ring",
        children: [
          j.jsx("h3", { className: "text-lg font-black text-primary", children: `Publish Code for ${selectedRequest.email}` }),
          j.jsxs("div", {
            className: "grid grid-cols-2 gap-4",
            children: [
              j.jsxs("div", {
                children: [
                  j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Booking Code" }),
                  j.jsx("input", {
                    type: "text",
                    value: code,
                    onChange: e => setCode(e.target.value.toUpperCase()),
                    placeholder: "e.g. ABC1234",
                    className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold",
                    required: true
                  })
                ]
              }),
              j.jsxs("div", {
                children: [
                  j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Market Recommendation" }),
                  j.jsx("input", {
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
          j.jsxs("div", {
            children: [
              j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Recommended Stake Time" }),
              j.jsx("input", {
                type: "datetime-local",
                value: stakeTime,
                onChange: e => setStakeTime(e.target.value),
                className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold",
                required: true
              })
            ]
          }),
          j.jsxs("div", {
            className: "flex gap-2 justify-end",
            children: [
              j.jsx("button", {
                type: "button",
                onClick: () => setSelectedRequest(null),
                className: "px-4 py-2 border border-border rounded-full text-sm font-bold",
                children: "Cancel"
              }),
              j.jsx("button", {
                type: "submit",
                disabled: loading,
                className: "px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-black pulse-glow",
                children: loading ? "Publishing..." : "Publish & Notify User"
              })
            ]
          })
        ]
      }),
      j.jsxs("div", {
        className: "border border-border/60 rounded-3xl overflow-hidden bg-ash/30",
        children: [
          j.jsx("div", {
            className: "p-4 border-b border-border/60 bg-ash/60",
            children: j.jsx("h3", { className: "font-black text-sm uppercase tracking-wider", children: "Pending Requests" })
          }),
          j.jsx("div", {
            className: "divide-y divide-border/60",
            children: (data || []).length === 0 ? j.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No booking code requests yet." }) : (data || []).map(req => j.jsxs("div", {
              className: "p-4 flex items-center justify-between",
              children: [
                j.jsxs("div", {
                  children: [
                    j.jsx("p", { className: "font-black text-sm", children: req.email }),
                    j.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [new Date(req.created_at).toLocaleString(), " · Cost: ", req.cost, " tickets"] })
                  ]
                }),
                j.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    j.jsx("span", {
                      className: `px-2 py-0.5 text-[10px] font-black rounded-full uppercase ${req.status === 'pending' ? 'bg-tier-gold/15 text-tier-gold' : 'bg-tier-mint/15 text-tier-mint'}`,
                      children: req.status
                    }),
                    req.status === 'pending' && j.jsx("button", {
                      onClick: () => setSelectedRequest(req),
                      className: "px-3 py-1 bg-primary text-primary-foreground text-xs font-black rounded-full hover:opacity-90",
                      children: "Fulfill Code"
                    })
                  ]
                })
              ]
            }, req.id))
          })
        ]
      })
    ]
  });
}

// 2. Payment Settings Admin View (exported as E / u)
export function u_comp(props) {
  const { data, invalidate } = props;
  const [ghanaProvider, setGhanaProvider] = React.useState(data?.payment_ghana?.provider ?? 'Telecel');
  const [ghanaName, setGhanaName] = React.useState(data?.payment_ghana?.accountName ?? 'prediit');
  const [ghanaNumber, setGhanaNumber] = React.useState(data?.payment_ghana?.accountNumber ?? '0501234567');
  const [nigeriaProvider, setNigeriaProvider] = React.useState(data?.payment_nigeria?.provider ?? 'Access Bank');
  const [nigeriaName, setNigeriaName] = React.useState(data?.payment_nigeria?.accountName ?? 'prediit Ltd');
  const [nigeriaNumber, setNigeriaNumber] = React.useState(data?.payment_nigeria?.accountNumber ?? '0123456789');
  const [loading, setLoading] = React.useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await u({
        data: {
          payment_ghana: { provider: ghanaProvider, accountName: ghanaName, accountNumber: ghanaNumber, instructions: [] },
          payment_nigeria: { provider: nigeriaProvider, accountName: nigeriaName, accountNumber: nigeriaNumber, instructions: [] },
          // Preserve pricing
          // admin_access_code is now managed via change_admin_access_code RPC
          registration_ghs: data?.registration_ghs ?? 50,
          registration_ngn: data?.registration_ngn ?? 10000,
          prediction_cost: data?.prediction_cost ?? 50,
          efootball_cost: data?.efootball_cost ?? 1,
          efootball_expiry: data?.efootball_expiry ?? 10,
          spin_cost: data?.spin_cost ?? 50
        }
      });
      alert("Payment gateways updated!");
      invalidate?.();
    } catch (err) {
      alert("Error saving: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return j.jsxs("form", {
    onSubmit: handleSave,
    className: "p-6 border border-border rounded-3xl bg-ash/30 space-y-6",
    children: [
      j.jsxs("div", {
        className: "space-y-4",
        children: [
          j.jsx("h3", { className: "text-base font-black text-primary uppercase tracking-wide", children: "Ghana MoMo Gateway" }),
          j.jsxs("div", {
            className: "grid grid-cols-3 gap-4",
            children: [
              j.jsxs("div", {
                children: [
                  j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Provider" }),
                  j.jsx("input", { type: "text", value: ghanaProvider, onChange: e => setGhanaProvider(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              j.jsxs("div", {
                children: [
                  j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Account Name" }),
                  j.jsx("input", { type: "text", value: ghanaName, onChange: e => setGhanaName(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              j.jsxs("div", {
                children: [
                  j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "MoMo Number" }),
                  j.jsx("input", { type: "text", value: ghanaNumber, onChange: e => setGhanaNumber(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              })
            ]
          })
        ]
      }),
      j.jsxs("div", {
        className: "space-y-4",
        children: [
          j.jsx("h3", { className: "text-base font-black text-primary uppercase tracking-wide", children: "Nigeria Bank Gateway" }),
          j.jsxs("div", {
            className: "grid grid-cols-3 gap-4",
            children: [
              j.jsxs("div", {
                children: [
                  j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Bank" }),
                  j.jsx("input", { type: "text", value: nigeriaProvider, onChange: e => setNigeriaProvider(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              j.jsxs("div", {
                children: [
                  j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Account Name" }),
                  j.jsx("input", { type: "text", value: nigeriaName, onChange: e => setNigeriaName(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              j.jsxs("div", {
                children: [
                  j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Account Number" }),
                  j.jsx("input", { type: "text", value: nigeriaNumber, onChange: e => setNigeriaNumber(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              })
            ]
          })
        ]
      }),
      j.jsx("div", {
        className: "flex justify-end",
        children: j.jsx("button", {
          type: "submit",
          disabled: loading,
          className: "px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-black pulse-glow",
          children: loading ? "Saving..." : "Save Payment Gateways"
        })
      })
    ]
  });
}

// 3. Earnings Reconciliation Admin View (exported as w / r)
export function r_comp(props) {
  const { data } = props;

  return j.jsxs("div", {
    className: "space-y-6",
    children: [
      j.jsxs("div", {
        className: "grid grid-cols-2 gap-4",
        children: [
          j.jsxs("div", {
            className: "p-5 border border-primary/20 bg-ash/30 rounded-3xl text-center",
            children: [
              j.jsx("p", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest", children: "Total Revenue (GHS)" }),
              j.jsxs("p", { className: "text-3xl font-black text-primary glow-text mt-1", children: ["GH₵", data?.totalGHS?.toLocaleString() ?? 0] })
            ]
          }),
          j.jsxs("div", {
            className: "p-5 border border-primary/20 bg-ash/30 rounded-3xl text-center",
            children: [
              j.jsx("p", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest", children: "Total Revenue (NGN)" }),
              j.jsxs("p", { className: "text-3xl font-black text-primary glow-text mt-1", children: ["₦", data?.totalNGN?.toLocaleString() ?? 0] })
            ]
          })
        ]
      }),
      j.jsxs("div", {
        className: "border border-border/60 rounded-3xl overflow-hidden bg-ash/30",
        children: [
          j.jsx("div", {
            className: "p-4 border-b border-border/60 bg-ash/60",
            children: j.jsx("h3", { className: "font-black text-sm uppercase tracking-wider", children: "Recent Approved Payments" })
          }),
          j.jsx("div", {
            className: "divide-y divide-border/60",
            children: (data?.payments || []).length === 0 ? j.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No registration payments approved yet." }) : (data?.payments || []).slice(0, 10).map(pay => j.jsxs("div", {
              className: "p-4 flex items-center justify-between text-sm",
              children: [
                j.jsxs("div", {
                  children: [
                    j.jsx("p", { className: "font-black", children: pay.email }),
                    j.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [pay.method, " · ID: ", pay.txn_id ?? 'N/A'] })
                  ]
                }),
                j.jsxs("span", {
                  className: "font-black text-primary",
                  children: [pay.currency === 'GHS' ? 'GH₵' : '₦', pay.amount]
                })
              ]
            }, pay.id))
          })
        ]
      })
    ]
  });
}

// 4. Members / VIP Access Grant Admin View (exported as C / p)
export function p_comp(props) {
  const { members, updateMember } = props;
  const [search, setSearch] = React.useState('');
  const [grantUser, setGrantUser] = React.useState(null);
  const [diamonds, setDiamonds] = React.useState(100);
  const [gold, setGold] = React.useState(1000);
  const [tickets, setTickets] = React.useState(10);
  const [loading, setLoading] = React.useState(false);

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

      // Use grant_currencies RPC for proper ledger entries
      if (addD > 0 || addG > 0 || addT > 0) {
        const data = await adminRpc('grant_currencies', {
          p_user_id: grantUser.id,
          p_diamonds: addD,
          p_gold: addG,
          p_tickets: addT
        });
        if (!data?.ok) throw new Error(data?.error || 'Failed to grant currencies');
      }

      alert(`Successfully credited assets to ${grantUser.email}!`);
      setGrantUser(null);
      window.location.reload();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return j.jsxs("div", {
    className: "space-y-6",
    children: [
      grantUser && j.jsxs("form", {
        onSubmit: handleGrant,
        className: "p-5 border border-primary/30 rounded-3xl bg-ash/50 space-y-4 glow-ring",
        children: [
          j.jsx("h3", { className: "text-lg font-black text-primary", children: `Credit Assets for ${grantUser.email}` }),
          j.jsxs("div", {
            className: "grid grid-cols-3 gap-4",
            children: [
              j.jsxs("div", {
                children: [
                  j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "💎 Add Diamonds" }),
                  j.jsx("input", { type: "number", value: diamonds, onChange: e => setDiamonds(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              j.jsxs("div", {
                children: [
                  j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "🪙 Add Gold Coins" }),
                  j.jsx("input", { type: "number", value: gold, onChange: e => setGold(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              }),
              j.jsxs("div", {
                children: [
                  j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "🎟️ Add Tickets" }),
                  j.jsx("input", { type: "number", value: tickets, onChange: e => setTickets(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
                ]
              })
            ]
          }),
          j.jsxs("div", {
            className: "flex gap-2 justify-end",
            children: [
              j.jsx("button", { type: "button", onClick: () => setGrantUser(null), className: "px-4 py-2 border border-border rounded-full text-sm font-bold", children: "Cancel" }),
              j.jsx("button", { type: "submit", disabled: loading, className: "px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-black pulse-glow", children: loading ? "Crediting..." : "Apply Credit" })
            ]
          })
        ]
      }),
      j.jsx("input", {
        type: "text",
        placeholder: "Search members by name or email...",
        value: search,
        onChange: e => setSearch(e.target.value),
        className: "w-full h-12 px-4 bg-ash border border-border rounded-2xl font-semibold"
      }),
      j.jsxs("div", {
        className: "border border-border/60 rounded-3xl overflow-hidden bg-ash/30",
        children: [
          j.jsx("div", {
            className: "p-4 border-b border-border/60 bg-ash/60",
            children: j.jsx("h3", { className: "font-black text-sm uppercase tracking-wider", children: "All Registered Profiles" })
          }),
          j.jsx("div", {
            className: "divide-y divide-border/60",
            children: filteredMembers.length === 0 ? j.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No members found." }) : filteredMembers.map(member => j.jsxs("div", {
              className: "p-4 flex items-center justify-between",
              children: [
                j.jsxs("div", {
                  className: "min-w-0 flex-1 pr-4",
                  children: [
                    j.jsxs("p", { className: "font-black text-sm truncate", children: [member.full_name, " (", member.email, ")"] }),
                    j.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: ["Phone: ", member.phone, " · 💎 ", member.diamonds, " · 🪙 ", member.gold, " · 🎟️ ", member.tickets] })
                  ]
                }),
                j.jsxs("div", {
                  className: "flex items-center gap-2 shrink-0",
                  children: [
                    j.jsx("span", {
                      className: `px-2 py-0.5 text-[9px] font-black rounded-full uppercase ${member.status === 'active' ? 'bg-tier-mint/15 text-tier-mint' : member.status === 'suspended' ? 'bg-destructive/15 text-destructive' : 'bg-tier-gold/15 text-tier-gold'}`,
                      children: member.status
                    }),
                    j.jsx("button", {
                      onClick: () => setGrantUser(member),
                      className: "px-2 py-1 bg-ash/80 border border-border text-xs font-bold rounded-full hover:bg-ash",
                      children: "Credit"
                    }),
                    member.status !== 'active' ? j.jsx("button", {
                      onClick: () => updateMember?.({ data: { userId: member.id, status: 'active' } }),
                      className: "px-2 py-1 bg-primary text-primary-foreground text-xs font-black rounded-full hover:opacity-90",
                      children: "Activate"
                    }) : j.jsx("button", {
                      onClick: () => updateMember?.({ data: { userId: member.id, status: 'suspended' } }),
                      className: "px-2 py-1 bg-destructive text-destructive-foreground text-xs font-black rounded-full hover:opacity-90",
                      children: "Suspend"
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

// 5. VIP Access & Security Admin View (exported as te / d)
export function d_comp(props) {
  const { members, invalidate } = props;
  const [passcode, setPasscode] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // If members is passed, this is the VIP page. Render VIP tools.
  if (members) {
    return j.jsx(p_comp, { members, updateMember: null });
  }

  // Otherwise, render Security settings passcode update
  const handleSave = async (e) => {
    e.preventDefault();
    if (passcode.length < 6) {
      alert("Passcode must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await adminRpc('change_admin_access_code', { p_new_code: passcode });
      if (!data?.ok) throw new Error('Failed to update access code');
      alert("Admin access passcode updated successfully!");
      setPasscode('');
    } catch (err) {
      alert("Error updating passcode: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return j.jsxs("form", {
    onSubmit: handleSave,
    className: "p-6 border border-border rounded-3xl bg-ash/30 space-y-4 max-w-sm",
    children: [
      j.jsxs("div", {
        children: [
          j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "New Admin Control Room Code" }),
          j.jsx("input", {
            type: "password",
            value: passcode,
            onChange: e => setPasscode(e.target.value),
            placeholder: "At least 6 characters",
            className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold"
          })
        ]
      }),
      j.jsx("button", {
        type: "submit",
        disabled: loading,
        className: "px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-black pulse-glow",
        children: loading ? "Saving..." : "Change Access Code"
      })
    ]
  });
}

// 6. Pricing & Game Costs Admin View (exported as ne / f)
export function f_comp(props) {
  const { data, invalidate } = props;
  const [predictionCost, setPredictionCost] = React.useState(data?.prediction_cost ?? 50);
  const [efootballCost, setEfootballCost] = React.useState(data?.efootball_cost ?? 1);
  const [efootballExpiry, setEfootballExpiry] = React.useState(data?.efootball_expiry ?? 10);
  const [spinCost, setSpinCost] = React.useState(data?.spin_cost ?? 50);
  const [regGHS, setRegGHS] = React.useState(data?.registration_ghs ?? 50);
  const [regNGN, setRegNGN] = React.useState(data?.registration_ngn ?? 10000);
  const [loading, setLoading] = React.useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Find current config
      const { data: config } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'global_config')
        .single();

      await u({
        data: {
          payment_ghana: config?.payment_ghana ?? {},
          payment_nigeria: config?.payment_nigeria ?? {},
          // admin_access_code is now managed via change_admin_access_code RPC
          registration_ghs: Number(regGHS),
          registration_ngn: Number(regNGN),
          prediction_cost: Number(predictionCost),
          efootball_cost: Number(efootballCost),
          efootball_expiry: Number(efootballExpiry),
          spin_cost: Number(spinCost)
        }
      });
      alert("Game costs and registration pricing updated!");
      invalidate?.();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return j.jsxs("form", {
    onSubmit: handleSave,
    className: "p-6 border border-border rounded-3xl bg-ash/30 space-y-6 max-w-md",
    children: [
      j.jsxs("div", {
        className: "grid grid-cols-2 gap-4",
        children: [
          j.jsxs("div", {
            children: [
              j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Registration Cost (GHS)" }),
              j.jsx("input", { type: "number", value: regGHS, onChange: e => setRegGHS(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
            ]
          }),
          j.jsxs("div", {
            children: [
              j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Registration Cost (NGN)" }),
              j.jsx("input", { type: "number", value: regNGN, onChange: e => setRegNGN(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
            ]
          })
        ]
      }),
      j.jsxs("div", {
        className: "grid grid-cols-2 gap-4",
        children: [
          j.jsxs("div", {
            children: [
              j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Fixture Prediction Cost (💎)" }),
              j.jsx("input", { type: "number", value: predictionCost, onChange: e => setPredictionCost(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
            ]
          }),
          j.jsxs("div", {
            children: [
              j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Spin Signal Cost (🪙)" }),
              j.jsx("input", { type: "number", value: spinCost, onChange: e => setSpinCost(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
            ]
          })
        ]
      }),
      j.jsxs("div", {
        className: "grid grid-cols-2 gap-4",
        children: [
          j.jsxs("div", {
            children: [
              j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "eFootball Code Cost (🎟️)" }),
              j.jsx("input", { type: "number", value: efootballCost, onChange: e => setEfootballCost(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
            ]
          }),
          j.jsxs("div", {
            children: [
              j.jsx("label", { className: "text-xs font-bold text-muted-foreground block mb-1", children: "Booking Code Expiry (mins)" }),
              j.jsx("input", { type: "number", value: efootballExpiry, onChange: e => setEfootballExpiry(e.target.value), className: "w-full h-10 px-3 bg-background border border-border rounded-xl font-bold" })
            ]
          })
        ]
      }),
      j.jsx("div", {
        className: "flex justify-end",
        children: j.jsx("button", {
          type: "submit",
          disabled: loading,
          className: "px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-black pulse-glow",
          children: loading ? "Saving..." : "Save Pricing"
        })
      })
    ]
  });
}

// 7. Manual Predictions Admin View (exported as re / g)
export function g_comp(props) {
  const { predictions } = props;

  return j.jsxs("div", {
    className: "space-y-6",
    children: [
      j.jsxs("div", {
        className: "border border-border/60 rounded-3xl overflow-hidden bg-ash/30",
        children: [
          j.jsx("div", {
            className: "p-4 border-b border-border/60 bg-ash/60",
            children: j.jsx("h3", { className: "font-black text-sm uppercase tracking-wider", children: "Prediction Feed History" })
          }),
          j.jsx("div", {
            className: "divide-y divide-border/60",
            children: (predictions || []).length === 0 ? j.jsx("p", { className: "p-6 text-center text-sm text-muted-foreground", children: "No predictions recorded yet." }) : (predictions || []).map(p => {
              const matches = p.result?.matches ?? [];
              return j.jsxs("div", {
                className: "p-4 text-sm",
                children: [
                  j.jsxs("p", { className: "text-xs text-muted-foreground", children: [new Date(p.created_at).toLocaleString(), " · Cost: ", p.cost, " 💎"] }),
                  j.jsx("div", {
                    className: "mt-2 space-y-1",
                    children: matches.map((m, idx) => j.jsxs("p", {
                      className: "font-bold",
                      children: [m.home, " vs ", m.away, " (Pick: ", m.pick, " · CS: ", m.correctScore, " · Conf: ", m.confidence, "%)"]
                    }, idx))
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

// Export original names mapped to compiler expected functions/components

// Export both the component panels and the original API function handlers

// Export component panels and legacy alias mappings

// Export component panels and legacy alias mappings
export {
  // Component Panels for Admin UI Tabs
  t as EfootballPanel,
  u_comp as PaysettingsPanel,
  r_comp as EarningsPanel,
  p_comp as MembersPanel,
  d_comp as VipSecurityPanel,
  f_comp as PricingPanel,
  g_comp as PredictionsPanel,

  // Legacy alias mappings for imports: import {_ as b, a as x, c as S, d as te, f as ne, g as re, i as ie, l as ae, m as oe, n as se, o as ce, p as C, r as w, s as le, t as T, u as E}
  a as x,
  i as c,
  d as te,
  f as ne,
  g as re,
  i as ie,
  l as ae,
  m as oe,
  n as se,
  l as ce,
  d as le,
  p_comp as p,
  r_comp as r,
  l as s,
  n as o
};
