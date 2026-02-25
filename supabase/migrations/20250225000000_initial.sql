-- GamiChore Supabase schema
-- Each user gets one household on signup. All data scoped by household_id.

-- Households (one per family)
create table households (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

-- Link auth users to households
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  created_at timestamptz default now()
);

-- Kids
create table kids (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  avatar text default '',
  age text default '',
  star_balance_override int,
  chore_set_ids uuid[] default '{}',
  created_at timestamptz default now()
);

-- Chores
create table chores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  star_value int not null default 0,
  created_at timestamptz default now()
);

-- Chore sets
create table chore_sets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  chore_ids uuid[] not null default '{}',
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly', 'monthly')),
  created_at timestamptz default now()
);

-- Completions
create table completions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  chore_id uuid not null references chores(id) on delete cascade,
  kid_id uuid not null references kids(id) on delete cascade,
  stars int not null default 0,
  date date not null,
  period_key text not null,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  submitted_at timestamptz not null,
  approved_at timestamptz,
  created_at timestamptz default now()
);

-- Shop items
create table shop_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  price_stars int not null default 0,
  price_rands int not null default 0,
  image text default '',
  created_at timestamptz default now()
);

-- Redemptions
create table redemptions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  kid_id uuid not null references kids(id) on delete cascade,
  shop_item_id uuid not null references shop_items(id) on delete cascade,
  stars int not null default 0,
  at timestamptz not null default now(),
  created_at timestamptz default now()
);

-- Indexes for RLS and queries
create index kids_household_id on kids(household_id);
create index chores_household_id on chores(household_id);
create index chore_sets_household_id on chore_sets(household_id);
create index completions_household_id on completions(household_id);
create index completions_kid_chore_period on completions(kid_id, chore_id, period_key);
create index shop_items_household_id on shop_items(household_id);
create index redemptions_household_id on redemptions(household_id);
create index profiles_household_id on profiles(household_id);

-- RLS: users can only access their household's data
alter table households enable row level security;
alter table profiles enable row level security;
alter table kids enable row level security;
alter table chores enable row level security;
alter table chore_sets enable row level security;
alter table completions enable row level security;
alter table shop_items enable row level security;
alter table redemptions enable row level security;

-- Helper: get current user's household_id
create or replace function get_household_id()
returns uuid as $$
  select household_id from profiles where id = auth.uid()
$$ language sql security definer;

-- RLS policies
create policy "Users can read own household" on households
  for select using (id = get_household_id());
create policy "Authenticated users can create households" on households
  for insert with check (auth.role() = 'authenticated');

create policy "Users can read own profile" on profiles
  for select using (id = auth.uid());
create policy "Users can insert own profile" on profiles
  for insert with check (id = auth.uid());

create policy "Kids RLS" on kids
  for all using (household_id = get_household_id());

create policy "Chores RLS" on chores
  for all using (household_id = get_household_id());

create policy "Chore sets RLS" on chore_sets
  for all using (household_id = get_household_id());

create policy "Completions RLS" on completions
  for all using (household_id = get_household_id());

create policy "Shop items RLS" on shop_items
  for all using (household_id = get_household_id());

create policy "Redemptions RLS" on redemptions
  for all using (household_id = get_household_id());
