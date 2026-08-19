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
    .select('*')
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

  // Gold coin packages
  const packages = [
    {
      id: 'gold-basic',
      name: 'Basic',
      coins: 5,
      ghs: 50,
      ngn: 5000,
      features: ['3 spin reveals', 'Standard signals', 'Email support'],
      example: 'Tomorrow 14:00 → Man City Win (78%)',
      popular: false,
      tone: 'emerald'
    },
    {
      id: 'gold-pro',
      name: 'Pro',
      coins: 15,
      ghs: 120,
      ngn: 12000,
      features: ['10 spin reveals', 'AI-powered signals', 'Priority processing', 'Score predictions'],
      example: 'Tomorrow 16:30 → Arsenal Win 2-1 (85%) + BTTS',
      popular: true,
      tone: 'gold'
    },
    {
      id: 'gold-elite',
      name: 'Elite',
      coins: 30,
      ghs: 200,
      ngn: 20000,
      features: ['Unlimited reveals', 'Full AI analysis', 'Instant processing', 'Detailed match notes', 'VIP support'],
      example: 'Liverpool vs Chelsea → Draw 2-2 (91%) + Over 2.5',
      popular: false,
      tone: 'ice'
    }
  ];

  // User's gold coin orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return {
    gold: profile?.gold ?? 0,
    cost: settings?.spin_cost ?? 50,
    packages,
    orders: orders || [],
    profile: {
      status: profile?.status ?? 'pending',
      country: profile?.country || null
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

// POST: submit gold coin order
export async function r(props) {
  const { packageId, country, txnId, senderName, senderNumber, fileName, fileBase64 } = props?.data ?? {};
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Gold packages
  const PACKAGES = [
    { id: 'gold-basic', name: 'Basic', coins: 5, ghs: 50, ngn: 5000 },
    { id: 'gold-pro', name: 'Pro', coins: 15, ghs: 120, ngn: 12000 },
    { id: 'gold-elite', name: 'Elite', coins: 30, ghs: 200, ngn: 20000 }
  ];
  const pkg = PACKAGES.find(p => p.id === packageId);
  if (!pkg) throw new Error('Invalid package');

  const currency = country === 'ghana' ? 'GHS' : 'NGN';
  const amount = country === 'ghana' ? pkg.ghs : pkg.ngn;
  const method = country === 'ghana' ? 'Mobile Money' : 'Bank Transfer';

  const fileBytes = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
  const screenshotPath = `${user.id}/${Date.now()}-${fileName}`;

  const { error: uploadErr } = await supabase.storage
    .from('screenshot-proofs')
    .upload(screenshotPath, fileBytes, { contentType: 'image/png' });
  if (uploadErr) throw uploadErr;

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      email: user.email,
      package_name: pkg.name + ' Gold',
      diamonds: pkg.coins,
      amount: Number(amount),
      currency,
      method,
      txn_id: txnId || null,
      sender_name: senderName,
      sender_number: senderNumber,
      screenshot_path: screenshotPath,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return { ok: true, order: data };
}