-- Step 2 of docs/ACCOUNTS_PLAN.md: profiles, addresses, attendance.
-- Coordinates are rounded to 3 decimal places (~100m) at write time by the
-- app; numeric(6,3) here is just the storage precision, not the rounding.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  units text not null default 'mi' check (units in ('mi', 'km')),
  privacy_version_accepted integer,
  age_confirmed_13_plus boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  postcode text not null,
  lat numeric(6, 3) not null,
  lng numeric(6, 3) not null,
  from_date date not null,
  to_date date,
  created_at timestamptz not null default now()
);

create table public.attendance (
  user_id uuid not null references auth.users (id) on delete cascade,
  match_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

create index addresses_user_id_idx on public.addresses (user_id);

-- Row-level security: every table, every row scoped to its owner.
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.attendance enable row level security;

create policy "profiles: owner full access" on public.profiles
  for all
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "addresses: owner full access" on public.addresses
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "attendance: owner full access" on public.attendance
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- New users: create their profiles row automatically. security definer so it
-- can write to public.profiles despite the caller having no session yet.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
