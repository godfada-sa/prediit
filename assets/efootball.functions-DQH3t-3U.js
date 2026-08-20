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

  const packages = [
    { id: 'ticket-basic', name: 'Basic', coins: 5, ghs: 50, ngn: 5000, features: ['5 booking-code credits', 'Standard queue', 'Email support'], popular: false, tone: 'mint' },
    { id: 'ticket-pro', name: 'Pro', coins: 15, ghs: 120, ngn: 12000, features: ['15 booking-code credits', 'Priority queue', 'Status tracking'], popular: true, tone: 'gold' },
    { id: 'ticket-elite', name: 'Elite', coins: 30, ghs: 200, ngn: 20000, features: ['30 booking-code credits', 'Priority queue', 'Status tracking', 'Priority support'], popular: false, tone: 'ice' }
  ];
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .eq('asset_type', 'tickets')
    .order('created_at', { ascending: false });

  return {
    tickets: profile?.tickets ?? 0,
    cost: settings?.efootball_cost ?? 1,
    expiresInMinutes: settings?.efootball_expiry ?? 10,
    profile: {
      status: profile?.status ?? 'pending'
    },
    requests: requests || [],
    ledger: ledger || [],
    packages,
    orders: (orders || []).map(order => ({ ...order, coins: order.diamonds }))
  };
}

// POST: request booking code (via database RPC)
export async function n() {
  const { data, error } = await supabase.rpc('request_booking_code');
  if (error) throw new Error(error.message);
  return data;
}

// POST: submit ticket order
export async function r(props) {
  const { packageId, country, txnId, senderName, senderNumber, fileName, fileBase64 } = props?.data ?? {};
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const packages = [
    { id: 'ticket-basic', name: 'Basic', coins: 5, ghs: 50, ngn: 5000 },
    { id: 'ticket-pro', name: 'Pro', coins: 15, ghs: 120, ngn: 12000 },
    { id: 'ticket-elite', name: 'Elite', coins: 30, ghs: 200, ngn: 20000 }
  ];
  const pkg = packages.find(item => item.id === packageId);
  if (!pkg) throw new Error('Invalid package');

  const isGhana = country === 'ghana';
  const currency = isGhana ? 'GHS' : 'NGN';
  const amount = isGhana ? pkg.ghs : pkg.ngn;
  const bytes = Uint8Array.from(atob(fileBase64), value => value.charCodeAt(0));
  const screenshotPath = `${user.id}/${Date.now()}-${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from('screenshot-proofs')
    .upload(screenshotPath, bytes, { contentType: 'image/png' });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase.rpc('submit_gold_order', {
    p_package_name: pkg.name + ' Tickets',
    p_gold: pkg.coins,
    p_amount: amount,
    p_currency: currency,
    p_method: isGhana ? 'Mobile Money' : 'Bank Transfer',
    p_txn_id: txnId || null,
    p_sender_name: senderName,
    p_sender_number: senderNumber,
    p_screenshot_path: screenshotPath
  });
  if (error || !data?.ok) {
    await supabase.storage.from('screenshot-proofs').remove([screenshotPath]);
    if (error) throw error;
    throw new Error(data?.reason || 'Order submission failed');
  }
  return { ...data, receipt: data?.order ? { ...data.order, coins: data.order.diamonds, sender_name: senderName, sender_number: senderNumber } : null };
}
