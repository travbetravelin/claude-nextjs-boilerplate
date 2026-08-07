-- Baseline auth schema: a profiles row per auth user, created automatically
-- on signup. This is the starting point for any app-mode project; static
-- sites delete this file along with the rest of the Supabase layer.
--
-- Design notes:
-- * role is a simple user/admin split. If a project outgrows it, use the
--   roles-and-permissions recipe (docs/recipes/roles-and-permissions.md)
--   instead of adding more values here.
-- * active follows the archiving doctrine (docs/recipes/archiving-not-deleting.md):
--   users are deactivated, never deleted, so their history stays intact.

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Everyone signed in can read profiles (needed to show names in the UI);
-- users can update only their own row. Role changes are done by an admin
-- via the service-role client, which bypasses RLS — so no policy grants
-- role edits to regular users.
create policy "profiles_select" on public.profiles
  for select using (auth.uid() is not null);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile when a user signs up. SECURITY DEFINER with an
-- empty search_path: the trigger runs as the function owner, and pinning
-- search_path stops a malicious schema from shadowing table names.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
