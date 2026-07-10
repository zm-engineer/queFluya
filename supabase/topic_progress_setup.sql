-- RLS for the `topic_progress` table.
--
-- Apply once:
--   npx prisma db execute --file supabase/topic_progress_setup.sql --schema prisma/schema.prisma
--
-- Idempotent.

alter table public.topic_progress enable row level security;

drop policy if exists "Users can read own progress" on public.topic_progress;
drop policy if exists "Users can insert own progress" on public.topic_progress;
drop policy if exists "Users can update own progress" on public.topic_progress;

create policy "Users can read own progress"
on public.topic_progress
for select
to authenticated
using (
  profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);

create policy "Users can insert own progress"
on public.topic_progress
for insert
to authenticated
with check (
  profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);

-- Upsert collides with an existing row → that path is an UPDATE under
-- RLS, so we need an update policy too.
create policy "Users can update own progress"
on public.topic_progress
for update
to authenticated
using (
  profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
)
with check (
  profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);
