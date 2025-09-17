-- user policy per account
create table if not exists public.user_policy(
  user_id uuid primary key,
  capacity_s int not null default 1,
  service_minutes int not null default 30,
  price_cents int not null default 8000,
  penalty_over_cents int not null default 4000,  -- c
  penalty_under_cents int not null default 1000, -- l
  sla_wait_minutes int not null default 5,
  max_overbook int not null default 2,
  updated_at timestamptz default now()
);
-- quick seed on first login is done in code
