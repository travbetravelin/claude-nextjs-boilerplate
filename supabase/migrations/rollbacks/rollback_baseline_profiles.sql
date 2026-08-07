-- DESTRUCTIVE: drops the profiles table and every profile row in it.
-- Auth users themselves (auth.users) are not touched.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.profiles cascade;
