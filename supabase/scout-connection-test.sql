-- SingHUB Supabase connection test
-- Run this in Supabase SQL Editor before opening /admin/scout-test.

create table if not exists connection_test (
  id bigint primary key generated always as identity,
  message text not null,
  created_at timestamptz default now()
);

insert into connection_test (message)
values ('SingHUB is connected to Supabase');

alter table connection_test enable row level security;

drop policy if exists "connection_test can be read publicly" on connection_test;

create policy "connection_test can be read publicly"
on connection_test
for select
to anon
using (true);
