-- Return expected order-validation failures as structured JSON instead of
-- PostgreSQL exceptions (HTTP 400), while retaining server-side validation.

alter table public.orders add column if not exists sender_name text;
alter table public.orders add column if not exists sender_number text;

drop policy if exists "Users delete own rejected order proofs" on storage.objects;
create policy "Users delete own rejected order proofs"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'screenshot-proofs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace function public.submit_gold_order(
  p_package_name text,
  p_gold integer,
  p_amount numeric,
  p_currency text,
  p_method text,
  p_txn_id text,
  p_sender_name text,
  p_sender_number text,
  p_screenshot_path text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  user_record auth.users%rowtype;
  expected_amount numeric;
  asset text;
  order_record public.orders%rowtype;
  normalized_txn text := nullif(trim(p_txn_id), '');
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_gold not in (5, 15, 30) then
    return jsonb_build_object('ok', false, 'reason', 'Invalid package quantity');
  end if;
  if p_currency not in ('GHS', 'NGN') then
    return jsonb_build_object('ok', false, 'reason', 'Invalid currency');
  end if;

  expected_amount := case
    when p_currency = 'GHS' and p_gold = 5 then 50
    when p_currency = 'GHS' and p_gold = 15 then 120
    when p_currency = 'GHS' and p_gold = 30 then 200
    when p_currency = 'NGN' and p_gold = 5 then 5000
    when p_currency = 'NGN' and p_gold = 15 then 12000
    when p_currency = 'NGN' and p_gold = 30 then 20000
  end;
  if expected_amount is null or p_amount <> expected_amount then
    return jsonb_build_object('ok', false, 'reason', 'Order amount does not match package');
  end if;
  if p_screenshot_path not like auth.uid()::text || '/%' then
    return jsonb_build_object('ok', false, 'reason', 'Invalid proof path');
  end if;
  if not exists (
    select 1 from storage.objects
    where bucket_id = 'screenshot-proofs'
      and name = p_screenshot_path
      and owner_id = auth.uid()::text
  ) then
    return jsonb_build_object('ok', false, 'reason', 'Payment proof upload was not found');
  end if;
  if length(trim(p_sender_name)) < 2 or length(trim(p_sender_number)) < 6 then
    return jsonb_build_object('ok', false, 'reason', 'Sender details are required');
  end if;

  if normalized_txn is not null then
    -- Serialize attempts for the same user/transaction ID so concurrent
    -- requests cannot both pass the duplicate check.
    perform pg_advisory_xact_lock(
      hashtextextended(auth.uid()::text || '|' || lower(normalized_txn), 0)
    );
    if exists (
      select 1 from public.orders
      where user_id = auth.uid()
        and lower(trim(txn_id)) = lower(normalized_txn)
        and status <> 'rejected'
    ) then
      return jsonb_build_object(
        'ok', false,
        'reason', 'This transaction ID has already been submitted'
      );
    end if;
  end if;

  asset := case
    when lower(p_package_name) like '%gold%' then 'gold'
    when lower(p_package_name) like '%ticket%' then 'tickets'
    else 'diamonds'
  end;
  select * into user_record from auth.users where id = auth.uid();

  insert into public.orders (
    user_id, email, package_name, diamonds, asset_type, amount, currency,
    method, txn_id, sender_name, sender_number, screenshot_path, status
  ) values (
    auth.uid(), user_record.email, left(trim(p_package_name), 100), p_gold, asset,
    expected_amount, p_currency, left(trim(p_method), 80),
    nullif(left(normalized_txn, 80), ''), left(trim(p_sender_name), 100),
    left(trim(p_sender_number), 30), p_screenshot_path, 'pending'
  ) returning * into order_record;

  return jsonb_build_object('ok', true, 'order', to_jsonb(order_record));
end;
$$;

revoke all on function public.submit_gold_order(text, integer, numeric, text, text, text, text, text, text) from public;
grant execute on function public.submit_gold_order(text, integer, numeric, text, text, text, text, text, text) to authenticated;
