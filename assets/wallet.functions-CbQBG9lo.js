import { C as supabase } from "./index-sG8SpmM9.js";
import { o as makeIcon } from "./button-DS1rjqG5.js";

// The "bell" icon component required by the dashboard, exported as "r"
export var r = makeIcon('bell', [
  ['path', { d: 'M10.268 21a2 2 0 0 0 3.464 0', key: 'vwvbt9' }],
  ['path', { d: 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326', key: '11g9vi' }]
]);

// GET: wallet-activity (exported as "t")
export async function t() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from('profiles')
    .select('diamonds')
    .eq('id', user.id)
    .single();

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return {
    diamonds: profile?.diamonds ?? 0,
    orders: orders || [],
    transactions: transactions || [],
    notifications: notifications || [],
    payments: payments || []
  };
}

// POST: mark-notifications-read (exported as "n")
export async function n(props) {
  const ids = props?.data?.ids;
  if (!ids || !ids.length) return { ok: true };

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .in('id', ids);

  if (error) throw error;
  return { ok: true };
}

// POST: delete notification / clear alerts (exported as "d")
export async function d(props) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const id = props?.data?.id;

  if (id === 'all' || !id) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
  }

  return { ok: true };
}