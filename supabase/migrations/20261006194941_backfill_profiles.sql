-- Olly's test sign-in happened before the init_schema migration existed, so
-- the on_auth_user_created trigger never fired for that auth.users row (and
-- wouldn't for anyone else signed up before this point either). Backfill a
-- profiles row for every existing auth.users row that doesn't have one.
insert into public.profiles (id)
select id from auth.users
where id not in (select id from public.profiles);
