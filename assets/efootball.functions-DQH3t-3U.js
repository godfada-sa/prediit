import { C as supabase } from "./index-sG8SpmM9.js";

// GET: efootball-home
export async function t() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from('profiles')
    .select('tickets, status')
    .eq('id', user.id)
    .single();

  const { data: settings } = await supabase
    .from('settings')
    .select('efootball_cost, efootball_expiry')
    .eq('id', 'global_config')
    .maybeSingle();

  const { data: requests } = await supabase
    .from('booking_code_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: ledger } = await supabase
    .from('ticket_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return {
    tickets: profile?.tickets ?? 0,
    cost: settings?.efootball_cost ?? 1,
    expiresInMinutes: settings?.efootball_expiry ?? 10,
    profile: {
      status: profile?.status ?? 'pending'
    },
    requests: requests || [],
    ledger: ledger || []
  };
}

// POST: request booking code (via database RPC)
export async function n() {
  const { data, error } = await supabase.rpc('request_booking_code');
  if (error) throw new Error(error.message);
  return data;
}

// POST: stub
export async function r() {
  return { ok: true };
}