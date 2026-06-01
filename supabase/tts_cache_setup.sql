-- Storage bucket + RLS for the TTS audio cache.
--
-- Apply once:
--   Paste in Supabase SQL Editor (or `npx prisma db execute --file ... --schema ...`).
--
-- Idempotent. The audio content (vocabulary words, dialogue lines, practice
-- phrases) is not user-private — anyone learning the same topic gets the
-- same mp3. Bucket is public read; the route handler is the only writer.

insert into storage.buckets (id, name, public)
values ('tts-cache', 'tts-cache', true)
on conflict (id) do update set public = true;

drop policy if exists "TTS cache is publicly readable" on storage.objects;
drop policy if exists "Authenticated users can write TTS cache" on storage.objects;

create policy "TTS cache is publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'tts-cache');

-- Writes are scoped to authenticated users; in practice only the
-- /api/speak route ever uploads, because clients never call storage
-- directly with the hash naming convention.
create policy "Authenticated users can write TTS cache"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'tts-cache');
