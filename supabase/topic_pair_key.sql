-- Adds `pair_key` to topics and links the mirror topics of each language
-- exchange (EN topic ↔ its ES counterpart share one pair_key). The tandem chat
-- uses this to show each side's vocabulary during its timer phase.
--
-- Apply with (db push chokes on the cross-schema auth FK):
--   npx prisma db execute --file supabase/topic_pair_key.sql --schema prisma/schema.prisma
--
-- Idempotent.

alter table public.topics add column if not exists pair_key text;

update public.topics set pair_key = 'greetings'            where slug in ('greetings', 'saludos');
update public.topics set pair_key = 'introductions'        where slug in ('introductions', 'presentaciones');
update public.topics set pair_key = 'getting-a-table'      where slug in ('getting-a-table', 'conseguir-mesa');
update public.topics set pair_key = 'ordering-food'        where slug in ('ordering-food', 'pedir-comida');
update public.topics set pair_key = 'job-interview-basics' where slug = 'job-interview-basics';
