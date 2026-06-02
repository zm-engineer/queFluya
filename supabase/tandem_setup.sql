-- RLS + realtime for the 1:1 tandem text chat (Conectar, Phase 1).
--
-- Tables: tandem_sessions, session_participants, chat_messages.
--
-- Apply once:
--   npx prisma db execute --file supabase/tandem_setup.sql --schema prisma/schema.prisma
--
-- Idempotent. Run AFTER supabase/tandem_tables.sql has created the tables
-- (we don't use `prisma db push` — it chokes on the cross-schema auth FK).
--
-- Design notes:
--  * "My sessions" = sessions where I have a row in session_participants. The
--    host inserts their own participant row on create, so this is uniform for
--    host and joiner alike and lets us avoid cross-referencing host_profile_id
--    in the hot-path message policies.
--  * A peer joins by reading a WAITING session via its invite code, so the
--    session SELECT policy must expose WAITING rows to any authenticated user.
--    Codes are random and unguessable, so this leaks nothing useful.
--  * Capacity (max 2) is enforced by a SECURITY DEFINER trigger that counts
--    participants without RLS filtering — the client can't see the other
--    participant's row, so it cannot enforce this itself.

alter table public.tandem_sessions enable row level security;
alter table public.session_participants enable row level security;
alter table public.chat_messages enable row level security;

-- ---------------------------------------------------------------------------
-- tandem_sessions
-- ---------------------------------------------------------------------------
drop policy if exists "Read waiting or own sessions" on public.tandem_sessions;
drop policy if exists "Create own session" on public.tandem_sessions;
drop policy if exists "Participants update session" on public.tandem_sessions;

create policy "Read waiting or own sessions"
on public.tandem_sessions
for select
to authenticated
using (
  status = 'WAITING'
  or id in (
    select session_id from public.session_participants
    where profile_id in (
      select id from public.profiles where user_id = auth.uid()
    )
  )
);

create policy "Create own session"
on public.tandem_sessions
for insert
to authenticated
with check (
  host_profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);

-- Either participant may flip the session to ACTIVE (on join) or ENDED.
create policy "Participants update session"
on public.tandem_sessions
for update
to authenticated
using (
  id in (
    select session_id from public.session_participants
    where profile_id in (
      select id from public.profiles where user_id = auth.uid()
    )
  )
  or host_profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
)
with check (true);

-- ---------------------------------------------------------------------------
-- session_participants
-- ---------------------------------------------------------------------------
drop policy if exists "Read own participation" on public.session_participants;
drop policy if exists "Insert own participation" on public.session_participants;

create policy "Read own participation"
on public.session_participants
for select
to authenticated
using (
  profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);

create policy "Insert own participation"
on public.session_participants
for insert
to authenticated
with check (
  profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
);

-- Enforce the 2-person cap server-side (clients can't see each other's rows).
create or replace function public.enforce_tandem_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    select count(*) from public.session_participants
    where session_id = new.session_id
  ) >= 2 then
    raise exception 'tandem session is full';
  end if;
  return new;
end;
$$;

drop trigger if exists tandem_capacity on public.session_participants;
create trigger tandem_capacity
before insert on public.session_participants
for each row execute function public.enforce_tandem_capacity();

-- ---------------------------------------------------------------------------
-- chat_messages
-- ---------------------------------------------------------------------------
drop policy if exists "Read messages of my sessions" on public.chat_messages;
drop policy if exists "Send messages to my sessions" on public.chat_messages;

create policy "Read messages of my sessions"
on public.chat_messages
for select
to authenticated
using (
  session_id in (
    select session_id from public.session_participants
    where profile_id in (
      select id from public.profiles where user_id = auth.uid()
    )
  )
);

create policy "Send messages to my sessions"
on public.chat_messages
for insert
to authenticated
with check (
  profile_id in (
    select id from public.profiles where user_id = auth.uid()
  )
  and session_id in (
    select session_id from public.session_participants
    where profile_id in (
      select id from public.profiles where user_id = auth.uid()
    )
  )
);

-- ---------------------------------------------------------------------------
-- Realtime: clients subscribe to new messages and to session status changes.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'tandem_sessions'
  ) then
    alter publication supabase_realtime add table public.tandem_sessions;
  end if;
end $$;
