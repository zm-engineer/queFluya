-- RLS + minor schema tweak for the `recordings` table.
--
-- Apply once:
--   npx prisma db execute --file supabase/recordings_setup.sql --schema prisma/schema.prisma
--
-- Idempotent.

-- Allow recordings without an audio URL yet — the free practice flow
-- only stores the transcription and score; uploading the actual audio
-- to Supabase Storage is reserved for the paid OpenAI version (Phase C v2).
alter table public.recordings alter column original_url drop not null;

alter table public.recordings enable row level security;

drop policy if exists "Users can read own recordings" on public.recordings;
drop policy if exists "Users can insert own recordings" on public.recordings;

create policy "Users can read own recordings"
on public.recordings
for select
to authenticated
using (
  profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);

create policy "Users can insert own recordings"
on public.recordings
for insert
to authenticated
with check (
  profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);
