-- ProDecide schema for Supabase (Postgres). Safe to re-run.
-- Each collection is a table: id (text key), data (jsonb document), created_at.

do $$
declare t text;
begin
  foreach t in array array['consultants','bookings','users','user_profiles','availability','reviews','otps','rate_limits']
  loop
    execute format('create table if not exists public.%I (
      id text primary key,
      data jsonb not null default ''{}''::jsonb,
      created_at timestamptz not null default now()
    )', t);
    -- Lock out Supabase's public REST API; the server connects as the postgres role, which bypasses RLS.
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

create unique index if not exists consultants_email_uq on public.consultants ((lower(data->>'email')));
create index if not exists consultants_status_idx      on public.consultants ((data->>'status'));
create index if not exists consultants_google_idx      on public.consultants ((data->>'googleId'));
create index if not exists users_email_idx             on public.users ((data->>'email'));
create index if not exists user_profiles_email_idx     on public.user_profiles ((data->>'email'));
create index if not exists otps_email_idx              on public.otps ((data->>'email'));
create index if not exists bookings_consultant_idx     on public.bookings ((data->>'consultantId'));
create index if not exists bookings_client_idx         on public.bookings ((data->>'clientEmail'));
create index if not exists availability_consultant_idx on public.availability ((data->>'consultantId'));
create index if not exists reviews_consultant_idx      on public.reviews ((data->>'consultantId'));
create index if not exists rate_limits_ip_action_idx   on public.rate_limits ((data->>'ip'), (data->>'action'));
