-- `activity_days`: one row per calendar day the user did a streak-worthy
-- activity that isn't a recording (e.g. using Esenciales). The streak unions
-- these days with the recordings' days, so the practice count isn't inflated.
--
-- Apply once:
--   npx prisma db execute --file supabase/activity_setup.sql --schema prisma/schema.prisma
--
-- Idempotent.

create table if not exists public.activity_days (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  primary key (profile_id, day)
);

alter table public.activity_days enable row level security;

drop policy if exists "Users can read own activity" on public.activity_days;
drop policy if exists "Users can insert own activity" on public.activity_days;

create policy "Users can read own activity"
on public.activity_days
for select
to authenticated
using (
  profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);

create policy "Users can insert own activity"
on public.activity_days
for insert
to authenticated
with check (
  profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);
