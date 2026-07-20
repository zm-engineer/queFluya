-- Table + RLS + realtime for scheduled tandems (Conectar, Phase 5 "agenda").
--
-- A host publishes an OPEN slot (topic + scheduled_at); a guest books it
-- (BOOKED); at the time both join a tandem_sessions row (session_id). scheduled_at
-- is timestamptz on purpose — reservations do real future-time math, and the
-- project's naive-timestamp columns would shift by the user's UTC offset.
--
-- Apply once (db push chokes on the cross-schema auth FK, so we use db execute):
--   npx prisma db execute --file supabase/tandem_reservations_setup.sql --schema prisma/schema.prisma
--
-- Idempotent. The DDL matches what Prisma generates from schema.prisma.

-- Enum ----------------------------------------------------------------------
do $$ begin
  create type "ReservationStatus" as enum ('OPEN', 'BOOKED', 'CANCELLED');
exception when duplicate_object then null;
end $$;

-- Table ---------------------------------------------------------------------
create table if not exists "tandem_reservations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "host_profile_id" UUID NOT NULL,
    "host_username" TEXT,
    "topic_slug" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "pair_key" TEXT,
    "scheduled_at" TIMESTAMPTZ(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'OPEN',
    "guest_profile_id" UUID,
    "guest_username" TEXT,
    "session_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tandem_reservations_pkey" PRIMARY KEY ("id")
);

-- Denormalized usernames (public handles) so both peers can see who they're
-- matched with without a cross-profile RLS read. For tables that predate these.
alter table "tandem_reservations" add column if not exists "host_username" TEXT;
alter table "tandem_reservations" add column if not exists "guest_username" TEXT;

create unique index if not exists "tandem_reservations_session_id_key"
  on "tandem_reservations"("session_id");
create index if not exists "tandem_reservations_status_pair_key_language_scheduled_at_idx"
  on "tandem_reservations"("status", "pair_key", "language", "scheduled_at");

do $$ begin
  alter table "tandem_reservations" add constraint "tandem_reservations_host_profile_id_fkey"
    foreign key ("host_profile_id") references "profiles"("id") on delete cascade on update cascade;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table "tandem_reservations" add constraint "tandem_reservations_guest_profile_id_fkey"
    foreign key ("guest_profile_id") references "profiles"("id") on delete set null on update cascade;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table "tandem_reservations" add constraint "tandem_reservations_session_id_fkey"
    foreign key ("session_id") references "tandem_sessions"("id") on delete set null on update cascade;
exception when duplicate_object then null;
end $$;

-- RLS -----------------------------------------------------------------------
alter table public.tandem_reservations enable row level security;

drop policy if exists "Read open or own reservations" on public.tandem_reservations;
drop policy if exists "Create own reservation" on public.tandem_reservations;
drop policy if exists "Update open or own reservations" on public.tandem_reservations;

-- Anyone authenticated may browse OPEN slots (to book them); you can always see
-- reservations where you are the host or the guest.
create policy "Read open or own reservations"
on public.tandem_reservations
for select
to authenticated
using (
  status = 'OPEN'
  or host_profile_id in (select id from public.profiles where user_id = auth.uid())
  or guest_profile_id in (select id from public.profiles where user_id = auth.uid())
);

-- You can only publish a slot as yourself.
create policy "Create own reservation"
on public.tandem_reservations
for insert
to authenticated
with check (
  host_profile_id in (select id from public.profiles where user_id = auth.uid())
);

-- Booking (a guest claims an OPEN slot), cancelling (host), and attaching a
-- session at join time. USING lets you act on an OPEN slot or your own rows;
-- WITH CHECK requires you to end up as the host or the guest — so a booker can
-- only set THEMSELVES as guest, not hijack a row for someone else.
create policy "Update open or own reservations"
on public.tandem_reservations
for update
to authenticated
using (
  status = 'OPEN'
  or host_profile_id in (select id from public.profiles where user_id = auth.uid())
  or guest_profile_id in (select id from public.profiles where user_id = auth.uid())
)
with check (
  host_profile_id in (select id from public.profiles where user_id = auth.uid())
  or guest_profile_id in (select id from public.profiles where user_id = auth.uid())
);

-- Realtime: so a waiting host sees their slot get booked live, and both peers
-- see the session_id appear when the other joins at the scheduled time.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'tandem_reservations'
  ) then
    alter publication supabase_realtime add table public.tandem_reservations;
  end if;
end $$;
