-- 1. Create tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    email text not null unique,
    phone text not null,
    referral_code text,
    status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
    diamonds integer not null default 0,
    gold integer not null default 0,
    tickets integer not null default 0,
    is_admin boolean not null default false,
    created_at timestamp with time zone default now()
);

-- Payments table (Registration Proofs)
create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    email text not null,
    country text not null check (country in ('GH', 'NG')),
    method text not null,
    amount numeric not null,
    currency text not null,
    sender_name text not null,
    sender_number text not null,
    txn_id text,
    screenshot_path text not null,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    admin_note text,
    created_at timestamp with time zone default now(),
    reviewed_at timestamp with time zone
);

-- Orders table (Diamond Purchase Proofs)
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    email text not null,
    package_name text not null,
    diamonds integer not null,
    amount numeric not null,
    currency text not null,
    method text not null,
    txn_id text,
    screenshot_path text not null,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    admin_note text,
    created_at timestamp with time zone default now(),
    reviewed_at timestamp with time zone
);

-- Transactions table (Diamond ledger)
create table if not exists public.transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    kind text not null check (kind in ('credit', 'debit')),
    amount integer not null,
    reason text not null,
    balance_after integer not null,
    created_at timestamp with time zone default now()
);

-- Predictions table
create table if not exists public.predictions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    cost integer not null default 50,
    result jsonb not null,
    created_at timestamp with time zone default now()
);

-- Notifications table
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    body text not null,
    kind text not null default 'info' check (kind in ('success', 'error', 'info')),
    read_at timestamp with time zone,
    created_at timestamp with time zone default now()
);

-- Ticket Transactions table (Ticket ledger)
create table if not exists public.ticket_transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    kind text not null check (kind in ('credit', 'debit')),
    amount integer not null,
    reason text not null,
    balance_after integer not null,
    created_at timestamp with time zone default now()
);

-- Booking Code Requests (eFootball Requests)
create table if not exists public.booking_code_requests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    code text,
    market text,
    stake_time timestamp with time zone,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    cost integer not null default 1,
    created_at timestamp with time zone default now()
);

-- Spin Bottle Signals table
create table if not exists public.spin_signals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    direction text not null check (direction in ('up', 'down')),
    confidence integer not null check (confidence >= 0 and confidence <= 100),
    round_id text not null,
    cost integer not null default 50,
    created_at timestamp with time zone default now()
);

-- Settings table
create table if not exists public.settings (
    id text primary key default 'global_config',
    payment_ghana jsonb not null default '{"provider": "MTN MoMo", "accountName": "VirtuEdge", "accountNumber": "055XXXXXXX", "instructions": ["Dial *170#", "Send Money", "Enter Number", "Confirm name", "Take a screenshot"]}'::jsonb,
    payment_nigeria jsonb not null default '{"provider": "OPay", "accountName": "VirtuEdge Limited", "accountNumber": "90XXXXXXXX", "instructions": ["Transfer to OPay", "Enter account number", "Confirm name", "Take a screenshot"]}'::jsonb,
    registration_ghs numeric not null default 50,
    registration_ngn numeric not null default 10000,
    prediction_cost integer not null default 50,
    efootball_cost integer not null default 1,
    efootball_expiry integer not null default 10,
    spin_cost integer not null default 50,
    updated_at timestamp with time zone default now()
);

-- Secrets table (admin-only, holds sensitive keys)
-- Separated from settings so non-admins cannot read API keys.
create table if not exists public.app_secrets (
    id text primary key default 'global_config',
    gemini_api_key text,
    updated_at timestamp with time zone default now()
);
insert into public.app_secrets (id) values ('global_config') on conflict do nothing;

-- Insert default settings row
insert into public.settings (id) values ('global_config') on conflict do nothing;


-- 2. Create Storage Buckets

-- Make sure buckets exist (can also be created via Supabase console)
insert into storage.buckets (id, name, public) 
values ('payment-proofs', 'payment-proofs', false) 
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('screenshot-proofs', 'screenshot-proofs', false) 
on conflict (id) do nothing;


-- 3. Stored Procedures / RPC Functions

-- Helper: Check if user is an Admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
end;
$$ language plpgsql security definer;

-- RPC: Request a new eFootball Booking Code
create or replace function public.request_booking_code()
returns jsonb as $$
declare
  v_tickets integer;
  v_status text;
  v_cost integer;
  v_request_id uuid;
  v_request_record jsonb;
begin
  -- Fetch user profile
  select tickets, status into v_tickets, v_status
  from public.profiles where id = auth.uid();
  
  if v_status != 'active' then
    return jsonb_build_object('ok', false, 'reason', 'status');
  end if;
  
  -- Fetch cost
  select efootball_cost into v_cost
  from public.settings where id = 'global_config';
  v_cost := coalesce(v_cost, 1);
  
  if v_tickets < v_cost then
    return jsonb_build_object('ok', false, 'reason', 'tickets');
  end if;
  
  -- Deduct tickets
  update public.profiles
  set tickets = tickets - v_cost
  where id = auth.uid();
  
  -- Log transaction
  insert into public.ticket_transactions (user_id, kind, amount, reason, balance_after)
  values (auth.uid(), 'debit', v_cost, 'Booking code request', v_tickets - v_cost);
  
  -- Create booking code request
  insert into public.booking_code_requests (user_id, status, cost)
  values (auth.uid(), 'pending', v_cost)
  returning id into v_request_id;
  
  -- Fetch request details to return
  select to_jsonb(r) into v_request_record
  from public.booking_code_requests r
  where r.id = v_request_id;
  
  return jsonb_build_object('ok', true, 'request', v_request_record);
end;
$$ language plpgsql security definer;

-- RPC: Spin Da Bottle Reveal Signal
create or replace function public.reveal_spin_signal()
returns jsonb as $$
declare
  v_gold integer;
  v_status text;
  v_cost integer;
  v_signal_id uuid;
  v_direction text;
  v_confidence integer;
  v_round_id text;
  v_signal_record jsonb;
begin
  -- Fetch profile
  select gold, status into v_gold, v_status
  from public.profiles where id = auth.uid();
  
  if v_status != 'active' then
    return jsonb_build_object('ok', false, 'reason', 'status');
  end if;
  
  -- Fetch cost
  select spin_cost into v_cost
  from public.settings where id = 'global_config';
  v_cost := coalesce(v_cost, 50);
  
  if v_gold < v_cost then
    return jsonb_build_object('ok', false, 'reason', 'gold');
  end if;
  
  -- Deduct gold
  update public.profiles
  set gold = gold - v_cost
  where id = auth.uid();
  
  -- Log gold transaction (we can reuse transactions table or ticket ledger - let's add it to standard transactions table)
  -- Actually, let's log it in transactions as 'debit' gold
  insert into public.transactions (user_id, kind, amount, reason, balance_after)
  values (auth.uid(), 'debit', v_cost, 'Spin reveal charge', v_gold - v_cost);
  
  -- Generate random prediction
  v_direction := case when random() > 0.5 then 'up' else 'down' end;
  v_confidence := floor(random() * (99 - 70 + 1) + 70);
  v_round_id := 'ROUND-' || upper(substring(gen_random_uuid()::text from 1 for 8));
  
  -- Insert signal
  insert into public.spin_signals (user_id, direction, confidence, round_id, cost)
  values (auth.uid(), v_direction, v_confidence, v_round_id, v_cost)
  returning id into v_signal_id;
  
  select to_jsonb(s) into v_signal_record
  from public.spin_signals s
  where s.id = v_signal_id;
  
  return jsonb_build_object('ok', true, 'signal', v_signal_record);
end;
$$ language plpgsql security definer;

-- RPC: Admin Update Diamond Order
create or replace function public.update_diamond_order(
  p_order_id uuid,
  p_status text,
  p_note text
)
returns jsonb as $$
declare
  v_order_status text;
  v_user_id uuid;
  v_diamonds integer;
  v_current_diamonds integer;
begin
  -- Check admin access
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;
  
  -- Fetch order details
  select status, user_id, diamonds into v_order_status, v_user_id, v_diamonds
  from public.orders where id = p_order_id;
  
  if v_order_status != 'pending' then
    return jsonb_build_object('ok', false, 'reason', 'Already processed');
  end if;
  
  -- Update order status
  update public.orders
  set status = p_status, admin_note = p_note, reviewed_at = now()
  where id = p_order_id;
  
  -- If approved, credit diamonds
  if p_status = 'approved' then
    -- Get current diamonds
    select diamonds into v_current_diamonds from public.profiles where id = v_user_id;
    v_current_diamonds := coalesce(v_current_diamonds, 0);
    
    -- Update profile
    update public.profiles
    set diamonds = diamonds + v_diamonds
    where id = v_user_id;
    
    -- Log transaction
    insert into public.transactions (user_id, kind, amount, reason, balance_after)
    values (v_user_id, 'credit', v_diamonds, 'Package purchase', v_current_diamonds + v_diamonds);
    
    -- Push success notification
    insert into public.notifications (user_id, title, body, kind)
    values (
      v_user_id, 
      'Diamond Package Credited', 
      'Your order for ' || v_diamonds || ' diamonds has been approved. Enjoy prediction access!', 
      'success'
    );
  elsif p_status = 'rejected' then
    -- Push rejection notification
    insert into public.notifications (user_id, title, body, kind)
    values (
      v_user_id, 
      'Diamond Order Declined', 
      'Your diamond purchase order was rejected. Note: ' || coalesce(p_note, 'No reason provided.'), 
      'error'
    );
  end if;
  
  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer;

-- RPC: Admin Update Payment Proof (Initial Sign-up Payment)
create or replace function public.update_payment_proof(
  p_payment_id uuid,
  p_status text,
  p_note text
)
returns jsonb as $$
declare
  v_payment_status text;
  v_user_id uuid;
begin
  -- Check admin access
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;
  
  -- Fetch payment details
  select status, user_id into v_payment_status, v_user_id
  from public.payments where id = p_payment_id;
  
  if v_payment_status != 'pending' then
    return jsonb_build_object('ok', false, 'reason', 'Already processed');
  end if;
  
  -- Update payment status
  update public.payments
  set status = p_status, admin_note = p_note, reviewed_at = now()
  where id = p_payment_id;
  
  -- If approved, activate user profile
  if p_status = 'approved' then
    update public.profiles
    set status = 'active'
    where id = v_user_id;
    
    -- Push success notification
    insert into public.notifications (user_id, title, body, kind)
    values (
      v_user_id, 
      'Account Activated', 
      'Welcome to VirtuEdge! Your payment proof was approved and your account is active.', 
      'success'
    );
  elsif p_status = 'rejected' then
    -- Keep profile as pending/deactivated
    update public.profiles
    set status = 'pending'
    where id = v_user_id;
    
    -- Push rejection notification
    insert into public.notifications (user_id, title, body, kind)
    values (
      v_user_id, 
      'Payment Proof Declined', 
      'Your registration payment proof was declined. Note: ' || coalesce(p_note, 'Please upload a valid screenshot.'), 
      'error'
    );
  end if;
  
  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer;


-- 4. Enable Row Level Security (RLS) and Policies

alter table public.profiles enable row level security;
alter table public.payments enable row level security;
alter table public.orders enable row level security;
alter table public.transactions enable row level security;
alter table public.predictions enable row level security;
alter table public.notifications enable row level security;
alter table public.ticket_transactions enable row level security;
alter table public.booking_code_requests enable row level security;
alter table public.spin_signals enable row level security;
alter table public.settings enable row level security;

-- Profiles policies
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can upsert own profile" on public.profiles;
create policy "Users can upsert own profile" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users can update own profile fields" on public.profiles;
create policy "Users can update own profile fields" on public.profiles for update using (auth.uid() = id);
drop policy if exists "Admins have full access to profiles" on public.profiles;
create policy "Admins have full access to profiles" on public.profiles for all using (public.is_admin());

-- Payments policies
drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments" on public.payments for select using (auth.uid() = user_id);
drop policy if exists "Users can submit payment proofs" on public.payments;
create policy "Users can submit payment proofs" on public.payments for insert with check (auth.uid() = user_id);
drop policy if exists "Admins have full access to payments" on public.payments;
create policy "Admins have full access to payments" on public.payments for all using (public.is_admin());

-- Orders policies
drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders" on public.orders for select using (auth.uid() = user_id);
drop policy if exists "Users can submit orders" on public.orders;
create policy "Users can submit orders" on public.orders for insert with check (auth.uid() = user_id);
drop policy if exists "Admins have full access to orders" on public.orders;
create policy "Admins have full access to orders" on public.orders for all using (public.is_admin());

-- Transactions policies
drop policy if exists "Users can read own transactions" on public.transactions;
create policy "Users can read own transactions" on public.transactions for select using (auth.uid() = user_id);
drop policy if exists "Admins have full access to transactions" on public.transactions;
create policy "Admins have full access to transactions" on public.transactions for all using (public.is_admin());

-- Predictions policies
drop policy if exists "Users can read own predictions" on public.predictions;
create policy "Users can read own predictions" on public.predictions for select using (auth.uid() = user_id);
drop policy if exists "Users can submit predictions" on public.predictions;
create policy "Users can submit predictions" on public.predictions for insert with check (auth.uid() = user_id);
drop policy if exists "Admins have full access to predictions" on public.predictions;
create policy "Admins have full access to predictions" on public.predictions for all using (public.is_admin());

-- Notifications policies
drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
drop policy if exists "Admins have full access to notifications" on public.notifications;
create policy "Admins have full access to notifications" on public.notifications for all using (public.is_admin());

-- Ticket Transactions policies
drop policy if exists "Users can read own ticket transactions" on public.ticket_transactions;
create policy "Users can read own ticket transactions" on public.ticket_transactions for select using (auth.uid() = user_id);
drop policy if exists "Admins have full access to ticket transactions" on public.ticket_transactions;
create policy "Admins have full access to ticket transactions" on public.ticket_transactions for all using (public.is_admin());

-- Booking Code Requests policies
drop policy if exists "Users can read own requests" on public.booking_code_requests;
create policy "Users can read own requests" on public.booking_code_requests for select using (auth.uid() = user_id);
drop policy if exists "Admins have full access to requests" on public.booking_code_requests;
create policy "Admins have full access to requests" on public.booking_code_requests for all using (public.is_admin());

-- Spin Signals policies
drop policy if exists "Users can read own spin signals" on public.spin_signals;
create policy "Users can read own spin signals" on public.spin_signals for select using (auth.uid() = user_id);
drop policy if exists "Admins have full access to spin signals" on public.spin_signals;
create policy "Admins have full access to spin signals" on public.spin_signals for all using (public.is_admin());

-- Settings policies (safe — no sensitive columns remain)
drop policy if exists "Anyone can select settings" on public.settings;
create policy "Authenticated can read settings" on public.settings for select using (auth.role() = 'authenticated');
drop policy if exists "Admins have full access to settings" on public.settings;
create policy "Admins have full access to settings" on public.settings for all using (public.is_admin());

-- App Secrets policies (admin-only — holds API keys)
alter table public.app_secrets enable row level security;
drop policy if exists "Admins have full access to app_secrets" on public.app_secrets;
create policy "Admins have full access to app_secrets" on public.app_secrets for all using (public.is_admin());

-- Public VIEW for settings that excludes nothing (safe because gemini_api_key is gone)
-- but provides a clean read path. Non-admins read from this; admins can use the table directly.
drop view if exists public.settings_public;
create view public.settings_public as
  select id, payment_ghana, payment_nigeria, registration_ghs, registration_ngn,
         prediction_cost, efootball_cost, efootball_expiry, spin_cost, updated_at
  from public.settings;

grant select on public.settings_public to authenticated;

-- RPC: get_public_settings() — returns settings without any secrets
create or replace function public.get_public_settings()
returns jsonb as $$
  select to_jsonb(s) from (
    select id, payment_ghana, payment_nigeria, registration_ghs, registration_ngn,
           prediction_cost, efootball_cost, efootball_expiry, spin_cost, updated_at
    from public.settings where id = 'global_config'
  ) s;
$$ language sql security definer;

-- RPC: get_app_secrets() — admin-only, returns sensitive keys
create or replace function public.get_app_secrets()
returns jsonb as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;
  return (select to_jsonb(s) from public.app_secrets s where s.id = 'global_config');
end;
$$ language plpgsql security definer;

-- RPC: update_app_secrets() — admin-only, updates sensitive keys
create or replace function public.update_app_secrets(
  p_gemini_api_key text default null
)
returns jsonb as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;
  update public.app_secrets
  set gemini_api_key = coalesce(p_gemini_api_key, gemini_api_key),
      updated_at = now()
  where id = 'global_config';
  return jsonb_build_object('ok', true);
end;
$$ language plpgsql security definer;

-- 5. Profile Auto-Create Trigger (replaces the removed make_admin_automatically)
-- When a user signs up via Supabase Auth, automatically create their profile
-- with status = 'pending' (requires admin approval) and is_admin = false.
-- The old trigger forced ALL users to admin — that has been removed.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone, referral_code, status, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'referral_code', ''),
    'pending',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop the old dangerous trigger if it still exists
DROP TRIGGER IF EXISTS on_profile_inserted ON public.profiles;
DROP FUNCTION IF EXISTS public.make_admin_automatically();

-- Fire after a new auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
