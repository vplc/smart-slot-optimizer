-- users are managed by Supabase auth.users
create table if not exists public.customers(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text,
  phone text,
  consent_sms boolean default false,
  created_at timestamptz default now()
);
create table if not exists public.appointments(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  customer_id uuid,
  starts_at timestamptz not null,
  minutes int not null,
  service_type text,
  price_cents int not null,
  status text check (status in ('booked','showed','no_show','cancel')) default 'booked',
  source text check (source in ('google','calendly')) default 'google',
  created_at timestamptz default now()
);
create index on public.appointments(user_id, starts_at);
create table if not exists public.slot_features(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  slot_start timestamptz not null,
  dow smallint,
  hour smallint,
  lead_hours int,
  weather_temp real,
  weather_precip real,
  traffic_idx real,
  school_break boolean,
  holiday boolean,
  created_at timestamptz default now()
);
create table if not exists public.reminders(
  id uuid primary key default gen_random_uuid(),
  appt_id uuid not null references public.appointments(id) on delete cascade,
  variant text check (variant in ('T-24','T-6','T-2')) not null,
  sent_at timestamptz,
  delivered boolean,
  cost_cents int default 0,
  link_clicked boolean
);
create table if not exists public.model_params(
  user_id uuid primary key,
  beta jsonb,
  sigma_u real default 1.0,
  sigma_v real default 1.0,
  updated_at timestamptz default now()
);
create table if not exists public.reminder_bandit(
  user_id uuid not null,
  variant text check (variant in ('T-24','T-6','T-2')) not null,
  a real default 1.0,
  b real default 1.0,
  primary key(user_id, variant)
);
