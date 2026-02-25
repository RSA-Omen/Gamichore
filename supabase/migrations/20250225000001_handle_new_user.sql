-- Create household + profile automatically when a new user signs up.
-- Runs with elevated privileges, so RLS doesn't block it.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household_id uuid;
begin
  insert into public.households default values
  returning id into new_household_id;
  insert into public.profiles (id, household_id)
  values (new.id, new_household_id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
