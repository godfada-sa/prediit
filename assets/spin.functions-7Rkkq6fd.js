import { C as supabase } from "./index-sG8SpmM9.js";
import { o as makeIcon } from "./button-DS1rjqG5.js";

// Coins icon component required by the page
export var i = makeIcon('coins', [
  ['path', { d: 'M13.744 17.736a6 6 0 1 1-7.48-7.48', key: 'bq4yh3' }],
  ['path', { d: 'M15 6h1v4', key: '11y1tn' }],
  ['path', { d: 'm6.134 14.768.866-.5 2 3.464', key: '17snzx' }],
  ['circle', { cx: '16', cy: '8', r: '6', key: '14bfc9' }]
]);

// GET: spin-home
export async function t() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from('profiles')
    .select('gold, status')
    .eq('id', user.id)
    .single();

  const { data: settings } = await supabase
    .from('settings')
    .select('spin_cost')
    .eq('id', 'global_config')
    .maybeSingle();

  const { data: signals } = await supabase
    .from('spin_signals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return {
    gold: profile?.gold ?? 0,
    cost: settings?.spin_cost ?? 50,
    profile: {
      status: profile?.status ?? 'pending'
    },
    signals: signals || []
  };
}

// POST: reveal spin signal (via database RPC)
export async function n() {
  const { data, error } = await supabase.rpc('reveal_spin_signal');
  if (error) throw new Error(error.message);
  return data;
}

// POST: stub
export async function r() {
  return { ok: true };
}