-- Co-parent / split-home support: invite another parent to share household

create table if not exists household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  email text not null,
  token uuid not null default gen_random_uuid() unique,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

create index household_invites_token on household_invites(token);
create index household_invites_email on household_invites(lower(email));
create index household_invites_household on household_invites(household_id);

alter table household_invites enable row level security;

-- Only household members can create invites; no one can read (we look up by token server-side)
create policy "Household members can create invites" on household_invites
  for insert with check (
    household_id in (select household_id from profiles where id = auth.uid())
  );

create policy "Household members can read their invites" on household_invites
  for select using (
    household_id in (select household_id from profiles where id = auth.uid())
  );

create policy "Household members can delete their invites" on household_invites
  for delete using (
    household_id in (select household_id from profiles where id = auth.uid())
  );

-- RPC: create invite (returns token for shareable link)
create or replace function public.create_household_invite(invite_email text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  hh_id uuid;
  inv_token uuid;
  invite_link text;
begin
  select household_id into hh_id from profiles where id = auth.uid();
  if hh_id is null then
    raise exception 'Not in a household';
  end if;
  insert into household_invites (household_id, email)
  values (hh_id, lower(trim(invite_email)))
  returning token into inv_token;
  return json_build_object('token', inv_token, 'email', lower(trim(invite_email)));
end;
$$;

-- RPC: accept invite (call when user visits /invite/TOKEN)
create or replace function public.accept_household_invite(invite_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inv household_invites%rowtype;
begin
  select * into inv from household_invites
  where token = invite_token and expires_at > now();
  if not found then
    return false;
  end if;
  -- Update current user's profile to join the household
  update profiles set household_id = inv.household_id where id = auth.uid();
  delete from household_invites where id = inv.id;
  return true;
end;
$$;

-- RPC: get invite link for email (for lookup by inviter)
create or replace function public.get_invite_by_email(invite_email text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  inv household_invites%rowtype;
begin
  select * into inv from household_invites i
  join profiles p on p.household_id = i.household_id
  where p.id = auth.uid() and lower(i.email) = lower(trim(invite_email)) and i.expires_at > now()
  order by i.created_at desc
  limit 1;
  if not found then
    return null;
  end if;
  return json_build_object('token', inv.token, 'email', inv.email, 'expires_at', inv.expires_at);
end;
$$;

-- Update handle_new_user: check for pending invite by email before creating new household
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  inv household_invites%rowtype;
  target_household_id uuid;
begin
  -- Check for pending invite for this email
  select * into inv from household_invites
  where lower(email) = lower(new.email) and expires_at > now()
  order by created_at desc limit 1;
  if found then
    target_household_id := inv.household_id;
    delete from household_invites where id = inv.id;
  else
    insert into households default values returning id into target_household_id;
  end if;
  insert into profiles (id, household_id)
  values (new.id, target_household_id);
  return new;
end;
$$;
