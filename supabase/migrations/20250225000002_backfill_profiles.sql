-- Backfill profiles for auth users who signed up before the handle_new_user trigger existed.
-- Safe to run multiple times; only creates profile for users who don't have one.

do $$
declare
  r record;
  new_hid uuid;
begin
  for r in
    select u.id from auth.users u
    where not exists (select 1 from public.profiles p where p.id = u.id)
  loop
    insert into public.households default values returning id into new_hid;
    insert into public.profiles (id, household_id) values (r.id, new_hid);
  end loop;
end $$;
