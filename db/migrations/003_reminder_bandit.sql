create table if not exists public.reminder_bandit (
  user_id uuid not null,
  variant public.reminder_variant not null,
  a int not null default 1,
  b int not null default 1,
  updated_at timestamptz default now(),
  primary key (user_id, variant)
);
