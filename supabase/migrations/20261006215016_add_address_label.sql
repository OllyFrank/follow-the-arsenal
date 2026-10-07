-- Deliberate deviation from the plan's documented addresses columns: the app's
-- local address form lets a user set a custom label (e.g. "Mum's house"),
-- and this is small enough to keep rather than drop for signed-in users.
alter table public.addresses add column label text;
