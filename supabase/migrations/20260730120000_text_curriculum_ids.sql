-- Cappy   switch curriculum ids (courses/units/lessons + dependents) from
-- uuid to text.
--
-- Why: the app has always identified lessons/units by deterministic string
-- ids matching packages/types' static curriculum constants (e.g.
-- "lesson-a-e" for the a-e LETTER_GROUPS entry, generated client-side and
-- never actually read from these tables). recordLessonProgress() already
-- calls upsertUserProgress({ lessonId: lesson.id, ... }) with that string
-- id today -- against the uuid-typed user_progress.lesson_id/
-- lesson_progress.lesson_id columns this migration replaces, that insert
-- would fail with "invalid input syntax for type uuid". This has never been
-- exercised by a real signed-in session yet (docs/CHANGELOG.md's own
-- "not yet verified: on-device click-through" notes), so it's a latent bug,
-- not a regression.
--
-- Safe to do as a type change (not a rebuild): zero real user rows exist
-- yet in user_progress/lesson_progress (docs/PROGRESS.md confirms
-- pre-launch, mock-data-only state), so there is no real data to migrate --
-- only the seed rows this same effort replaces in the next migration/seed
-- update.
--
-- courses/units/lessons ids become deterministic slugs the app already
-- knows (no gen_random_uuid() default anymore -- callers/seed data supply
-- the id explicitly, same convention morse_character_mastery already uses
-- for its text-typed `character` column).

-- ---- Drop FKs that reference the columns being retyped ---------------------
alter table public.units drop constraint if exists units_course_id_fkey;
alter table public.lessons drop constraint if exists lessons_unit_id_fkey;
alter table public.exercises drop constraint if exists exercises_lesson_id_fkey;
alter table public.user_progress drop constraint if exists user_progress_lesson_id_fkey;
alter table public.lesson_progress drop constraint if exists lesson_progress_lesson_id_fkey;

-- ---- courses ----------------------------------------------------------------
alter table public.courses alter column id drop default;
alter table public.courses alter column id type text using id::text;

-- ---- units ------------------------------------------------------------------
alter table public.units alter column id drop default;
alter table public.units alter column id type text using id::text;
alter table public.units alter column course_id type text using course_id::text;

-- ---- lessons ------------------------------------------------------------------
alter table public.lessons alter column id drop default;
alter table public.lessons alter column id type text using id::text;
alter table public.lessons alter column unit_id type text using unit_id::text;

-- ---- exercises ----------------------------------------------------------------
alter table public.exercises alter column lesson_id type text using lesson_id::text;

-- ---- user_progress / lesson_progress -------------------------------------------
alter table public.user_progress alter column lesson_id type text using lesson_id::text;
alter table public.lesson_progress alter column lesson_id type text using lesson_id::text;

-- ---- Re-add FKs with the new column types ---------------------------------
alter table public.units
  add constraint units_course_id_fkey foreign key (course_id) references public.courses (id) on delete cascade;

alter table public.lessons
  add constraint lessons_unit_id_fkey foreign key (unit_id) references public.units (id) on delete cascade;

alter table public.exercises
  add constraint exercises_lesson_id_fkey foreign key (lesson_id) references public.lessons (id) on delete cascade;

alter table public.user_progress
  add constraint user_progress_lesson_id_fkey foreign key (lesson_id) references public.lessons (id) on delete cascade;

alter table public.lesson_progress
  add constraint lesson_progress_lesson_id_fkey foreign key (lesson_id) references public.lessons (id) on delete cascade;
