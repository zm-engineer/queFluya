-- RLS for the `topics` table.
--
-- Apply once after `npx prisma db push` creates the table:
--   psql $DATABASE_URL -f supabase/topics_setup.sql
-- or paste in the Supabase SQL Editor.
--
-- Idempotent: dropping/recreating the policy lets you re-run this safely.
--
-- NOTE: Topic CONTENT is no longer seeded here. It lives in the typed pipeline
-- under content/topics/ and is generated into supabase/topics_seed.generated.sql
-- (`npm run build:topics`). Apply that file to load/refresh the topics:
--   npx prisma db execute --file supabase/topics_seed.generated.sql --schema prisma/schema.prisma

-- ─── Row Level Security ─────────────────────────────────────────────────────

alter table public.topics enable row level security;

drop policy if exists "Authenticated users can read topics" on public.topics;

create policy "Authenticated users can read topics"
on public.topics
for select
to authenticated
using (true);

-- ─── Remove pre-split combined topics ──────────────────────────────────────
-- Old topics that bundled multiple study units into one entry. The new
-- per-topic structure splits them apart (greetings vs introductions, etc.).
delete from public.topics
where slug in (
  'greetings-and-introductions',
  'saludos-y-presentaciones',
  'ordering-at-a-restaurant',
  'en-el-restaurante'
);
