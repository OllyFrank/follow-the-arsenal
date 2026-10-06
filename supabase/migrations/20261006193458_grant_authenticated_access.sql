-- Postgres table privileges are separate from RLS: RLS restricts *which rows*
-- a role can see, but the role still needs a base GRANT to touch the table at
-- all. A quick anon-role check against staging after the previous migration
-- returned "permission denied for table profiles" even before RLS was
-- evaluated — confirming the authenticated role needs these grants too. The
-- anon role intentionally gets nothing: these tables are sign-in only.
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses to authenticated;
grant select, insert, update, delete on public.attendance to authenticated;
