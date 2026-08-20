-- Retain reviewed payment proof images for 15 days, then let the scheduled
-- cleanup Edge Function remove the Storage object while preserving the record.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

alter table public.payments alter column screenshot_path drop not null;
alter table public.orders alter column screenshot_path drop not null;

alter table public.payments
  add column if not exists proof_deleted_at timestamptz;
alter table public.orders
  add column if not exists proof_deleted_at timestamptz;

create index if not exists payments_proof_retention_idx
  on public.payments (created_at)
  where screenshot_path is not null and status <> 'pending';
create index if not exists orders_proof_retention_idx
  on public.orders (created_at)
  where screenshot_path is not null and status <> 'pending';

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'proof_cleanup_secret') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'proof_cleanup_secret',
      'Authenticates the daily proof image retention job'
    );
  end if;
end;
$$;

create or replace function public.validate_proof_cleanup_secret(p_secret text)
returns boolean
language sql
security definer
set search_path = public, vault, pg_temp
as $$
  select coalesce(
    nullif(p_secret, '') is not null
    and exists (
      select 1
      from vault.decrypted_secrets
      where name = 'proof_cleanup_secret'
        and decrypted_secret = p_secret
    ),
    false
  );
$$;

revoke all on function public.validate_proof_cleanup_secret(text) from public;
grant execute on function public.validate_proof_cleanup_secret(text) to service_role;

do $$
declare
  existing_job bigint;
begin
  select jobid into existing_job
  from cron.job
  where jobname = 'cleanup-proof-images-daily';

  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;

  perform cron.schedule(
    'cleanup-proof-images-daily',
    '15 3 * * *',
    $job$
      select net.http_post(
        url := 'https://vzduzbprnbjchssexzmp.supabase.co/functions/v1/cleanup-proof-images',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cleanup-secret', (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'proof_cleanup_secret'
          )
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 30000
      );
    $job$
  );
end;
$$;
