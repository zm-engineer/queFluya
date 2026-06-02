-- Tables for the 1:1 tandem text chat (Conectar, Phase 1).
--
-- Why this file exists instead of `prisma db push`:
-- `db push` introspects the live database, and it refuses to run because of the
-- manual cross-schema FK `public.profiles.user_id -> auth.users` (documented in
-- schema.prisma). `prisma db execute` does NOT introspect, so we apply the new
-- tables with plain DDL here — same approach already used for the RLS files.
--
-- The DDL matches exactly what Prisma generates from schema.prisma, so the
-- schema stays the source of truth and a future `db push` (once multiSchema is
-- sorted out) will see no drift. All FKs point at public.profiles / each other,
-- never at the auth schema.
--
-- Apply BEFORE supabase/tandem_setup.sql:
--   npx prisma db execute --file supabase/tandem_tables.sql --schema prisma/schema.prisma
--
-- Idempotent.

-- CreateEnum
do $$ begin
  create type "SessionStatus" as enum ('WAITING', 'ACTIVE', 'ENDED');
exception when duplicate_object then null;
end $$;

-- CreateTable
create table if not exists "tandem_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "topic_slug" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "invite_code" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'WAITING',
    "host_profile_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tandem_sessions_pkey" PRIMARY KEY ("id")
);

create table if not exists "session_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "session_participants_pkey" PRIMARY KEY ("id")
);

create table if not exists "chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
create unique index if not exists "tandem_sessions_invite_code_key" on "tandem_sessions"("invite_code");
create index if not exists "tandem_sessions_invite_code_idx" on "tandem_sessions"("invite_code");
create unique index if not exists "session_participants_session_id_profile_id_key" on "session_participants"("session_id", "profile_id");
create index if not exists "chat_messages_session_id_created_at_idx" on "chat_messages"("session_id", "created_at");

-- AddForeignKey
do $$ begin
  alter table "tandem_sessions" add constraint "tandem_sessions_host_profile_id_fkey"
    foreign key ("host_profile_id") references "profiles"("id") on delete cascade on update cascade;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table "session_participants" add constraint "session_participants_session_id_fkey"
    foreign key ("session_id") references "tandem_sessions"("id") on delete cascade on update cascade;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table "session_participants" add constraint "session_participants_profile_id_fkey"
    foreign key ("profile_id") references "profiles"("id") on delete cascade on update cascade;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table "chat_messages" add constraint "chat_messages_session_id_fkey"
    foreign key ("session_id") references "tandem_sessions"("id") on delete cascade on update cascade;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table "chat_messages" add constraint "chat_messages_profile_id_fkey"
    foreign key ("profile_id") references "profiles"("id") on delete cascade on update cascade;
exception when duplicate_object then null;
end $$;
