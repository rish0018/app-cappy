-- Cappy   auto-create the public.users profile row when a new auth.users
-- row is created.
--
-- Why: public.users (the app-owned profile row: email, display_name,
-- total_xp) was never actually populated by anything   no trigger existed,
-- and no app code calls a profile-creation function after signUp()
-- (packages/api/src/repositories/profile.ts's updateProfile() only UPDATEs
-- an existing row, and is never called from any screen). Confirmed live:
-- the one real signed-up test user (auth.users) has zero matching
-- public.users row, so every write to user_progress/letter_mastery/
-- streaks/user_achievements/daily_activity   all FK'd to public.users.id
-- fails with a foreign-key violation for every real user, always.
--
-- display_name fallback chain mirrors packages/api/src/repositories/
-- auth.ts's mapAuthUser(): user_metadata.display_name, then .full_name
-- (OAuth providers set this), then the email itself.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, created_at, total_xp)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.email,
      ''
    ),
    now(),
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- Backfill any existing auth.users row missing its public.users row ----
insert into public.users (id, email, display_name, created_at, total_xp)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'display_name', u.raw_user_meta_data ->> 'full_name', u.email, ''),
  now(),
  0
from auth.users u
left join public.users p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
