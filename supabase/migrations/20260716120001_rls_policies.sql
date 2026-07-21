-- Cappy — Row-Level Security policies
--
-- Implements docs/DB_SETUP_GUIDE.md §3 / AI_project_bible.md §9 ("Key
-- Rules"): RLS on every user-data table, never rely on frontend-only
-- restrictions. Curriculum tables are public-read, no client-write.
--
-- Not yet applied to any live project — see docs/BACKEND_SSO_SETUP.md §4
-- for how to run this against a real Supabase instance once provisioned.

-- ============================================================================
-- User-data tables — baseline policy shape: auth.uid() = user_id
-- ============================================================================

-- ---- users -----------------------------------------------------------------
alter table public.users enable row level security;

create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users_delete_own"
  on public.users for delete
  using (auth.uid() = id);

-- ---- user_progress -----------------------------------------------------
alter table public.user_progress enable row level security;

create policy "user_progress_select_own"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "user_progress_insert_own"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "user_progress_update_own"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_progress_delete_own"
  on public.user_progress for delete
  using (auth.uid() = user_id);

-- ---- lesson_progress ----------------------------------------------------
alter table public.lesson_progress enable row level security;

create policy "lesson_progress_select_own"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "lesson_progress_insert_own"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "lesson_progress_update_own"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "lesson_progress_delete_own"
  on public.lesson_progress for delete
  using (auth.uid() = user_id);

-- ---- letter_mastery ------------------------------------------------------
alter table public.letter_mastery enable row level security;

create policy "letter_mastery_select_own"
  on public.letter_mastery for select
  using (auth.uid() = user_id);

create policy "letter_mastery_insert_own"
  on public.letter_mastery for insert
  with check (auth.uid() = user_id);

create policy "letter_mastery_update_own"
  on public.letter_mastery for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "letter_mastery_delete_own"
  on public.letter_mastery for delete
  using (auth.uid() = user_id);

-- ---- streaks ---------------------------------------------------------------
alter table public.streaks enable row level security;

create policy "streaks_select_own"
  on public.streaks for select
  using (auth.uid() = user_id);

create policy "streaks_insert_own"
  on public.streaks for insert
  with check (auth.uid() = user_id);

create policy "streaks_update_own"
  on public.streaks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "streaks_delete_own"
  on public.streaks for delete
  using (auth.uid() = user_id);

-- ---- user_achievements ---------------------------------------------------
alter table public.user_achievements enable row level security;

create policy "user_achievements_select_own"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "user_achievements_insert_own"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);

-- Deliberately no update/delete policy: achievements are event-driven and
-- recorded once (AI_project_bible.md §9 "Achievements are event-driven;
-- backend records them, frontend presents them"). Unlocking again is a
-- no-op handled at the application layer via upsert-or-ignore semantics.

-- ---- daily_activity --------------------------------------------------------
alter table public.daily_activity enable row level security;

create policy "daily_activity_select_own"
  on public.daily_activity for select
  using (auth.uid() = user_id);

create policy "daily_activity_insert_own"
  on public.daily_activity for insert
  with check (auth.uid() = user_id);

create policy "daily_activity_update_own"
  on public.daily_activity for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_activity_delete_own"
  on public.daily_activity for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- Curriculum tables — public-read, no client-facing write policy. Writes
-- only via service role (seed scripts / dashboard), which bypasses RLS.
-- ============================================================================

alter table public.courses enable row level security;
create policy "courses_public_read" on public.courses for select using (true);

alter table public.units enable row level security;
create policy "units_public_read" on public.units for select using (true);

alter table public.lessons enable row level security;
create policy "lessons_public_read" on public.lessons for select using (true);

alter table public.exercises enable row level security;
create policy "exercises_public_read" on public.exercises for select using (true);

alter table public.achievements enable row level security;
create policy "achievements_public_read" on public.achievements for select using (true);
