-- Closes the Supabase Security Advisor warnings that can be closed without breaking row level
-- security, and removes write grants that anonymous visitors never need.

-- 1. Pin search_path on the two role helpers, like every other definer function here.
alter function public.has_role(uuid, public.user_role_enum) set search_path = public;
alter function public.is_admin(uuid) set search_path = public;

-- 2. Trigger functions run from their triggers only, so nobody needs to call them through the API.
revoke execute on function public.enforce_student_email() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 3. Only signed-in members' policies call the role helpers, so anonymous visitors lose them.
--    Members keep EXECUTE because their policies run these functions as the member.
revoke execute on function public.has_role(uuid, public.user_role_enum) from public, anon;
revoke execute on function public.is_admin(uuid) from public, anon;
revoke execute on function public.has_permission(uuid, text) from public, anon;
revoke execute on function public.member_contact(uuid) from public, anon;
grant execute on function public.has_role(uuid, public.user_role_enum) to authenticated, service_role;
grant execute on function public.is_admin(uuid) to authenticated, service_role;
grant execute on function public.has_permission(uuid, text) to authenticated, service_role;
grant execute on function public.member_contact(uuid) to authenticated, service_role;

-- 4. Anonymous visitors only read. Row level security already rejects their writes; dropping the
--    grants is a second lock. TRUNCATE skips row level security, so only the owner keeps it.
do $$
declare
  t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('revoke insert, update, delete, truncate on table public.%I from anon', t.tablename);
    execute format('revoke truncate on table public.%I from authenticated', t.tablename);
  end loop;
end;
$$;

-- Tables created by later migrations start without these grants too.
alter default privileges for role postgres in schema public revoke insert, update, delete, truncate on tables from anon;
alter default privileges for role postgres in schema public revoke truncate on tables from authenticated;
