-- Matchmaking (Conectar, Phase 2): denormalize pair_key onto tandem_sessions
-- so the queue can find a waiting peer by pair_key + opposite language without
-- joining back to the topics table on the hot path.
--
-- pair_key mirrors topics.pair_key (set on session creation). It is nullable:
-- a topic without a mirror (e.g. job-interview-basics has no ES counterpart)
-- simply never finds a match — that's expected, not an error.
--
-- RLS needs no change: the existing "Read waiting or own sessions" policy
-- already exposes WAITING rows to any authenticated user, which is exactly what
-- the queue lookup reads.
--
-- Apply (the existing tables are created via supabase/tandem_tables.sql):
--   npx prisma db execute --file supabase/tandem_matchmaking.sql --schema prisma/schema.prisma
--
-- Idempotent.

alter table public.tandem_sessions add column if not exists pair_key text;

create index if not exists "tandem_sessions_status_pair_key_language_idx"
  on public.tandem_sessions ("status", "pair_key", "language");
