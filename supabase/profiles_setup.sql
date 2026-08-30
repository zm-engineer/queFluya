-- profiles RLS: let a user update their OWN profile row.
-- The profiles table predates the per-table setup convention (it already had
-- SELECT/INSERT policies created early). The editable profile page needs an
-- UPDATE policy, added here idempotently. `user_id` is the FK to auth.users.

alter table public.profiles enable row level security;

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
