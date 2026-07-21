-- Cappy — initial schema migration
--
-- Implements docs/DB_SETUP_GUIDE.md §2, cross-checked field-by-field against
-- packages/types/src/{user,curriculum,progress,letters}.ts. Columns are
-- snake_case in Postgres; packages/api maps them to the camelCase TS shapes.
--
-- NOTE: this migration is written by hand (no Supabase CLI available in this
-- environment) but follows the exact structure `supabase migration new
-- init_schema` would have produced. There is no live Supabase project yet —
-- this has not been applied anywhere. Run `supabase db push` once a real
-- project is linked (see docs/BACKEND_SSO_SETUP.md §4).

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ============================================================================
-- users — public profile table, 1:1 with auth.users
-- Source type: User (packages/types/src/user.ts)
-- ============================================================================
create table if not exists public.users (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null unique,
  display_name text not null,
  created_at   timestamptz not null default now(),
  total_xp     integer not null default 0
);

comment on table public.users is 'Public profile row per Supabase Auth user. 1:1 with auth.users via id FK.';

-- ============================================================================
-- Curriculum tables — separate from user-progress tables per
-- AI_project_bible.md §9 ("Key Rules"): curriculum updates must never
-- corrupt progress data. Public-read, no client-write (see RLS migration).
-- ============================================================================

-- courses — Source type: Course (curriculum.ts)
create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  order_index integer not null
);

-- units — Source type: Unit (curriculum.ts)
create table if not exists public.units (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses (id) on delete cascade,
  title       text not null,
  order_index integer not null,
  description text not null
);

create index if not exists idx_units_course_id on public.units (course_id);

-- lessons — Source type: Lesson (curriculum.ts)
create table if not exists public.lessons (
  id                 uuid primary key default gen_random_uuid(),
  unit_id            uuid not null references public.units (id) on delete cascade,
  title              text not null,
  description        text not null,
  lesson_type        text not null check (
    lesson_type in (
      'observe', 'recognize', 'perform', 'recall',
      'mixed-review', 'timed-practice', 'assessment'
    )
  ),
  difficulty         integer not null,
  estimated_minutes  integer not null,
  xp_reward          integer not null,
  order_index        integer not null
);

create index if not exists idx_lessons_unit_id on public.lessons (unit_id);

-- exercises — Source type: Exercise (curriculum.ts)
create table if not exists public.exercises (
  id            uuid primary key default gen_random_uuid(),
  lesson_id     uuid not null references public.lessons (id) on delete cascade,
  exercise_type text not null check (
    exercise_type in (
      'observe', 'practice', 'camera-validation', 'multiple-choice', 'review'
    )
  ),
  content       jsonb not null default '{}'::jsonb,
  difficulty    integer not null,
  order_index   integer not null
);

create index if not exists idx_exercises_lesson_id on public.exercises (lesson_id);

-- achievements — Source type: Achievement (progress.ts). Reference table,
-- not per-user. "Meaningful milestones only" per AI_project_bible.md §12.
create table if not exists public.achievements (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null,
  icon        text not null
);

-- ============================================================================
-- User-progress tables — RLS-protected, one row (or set of rows) per user.
-- ============================================================================

-- user_progress — Source type: UserProgress (progress.ts)
create table if not exists public.user_progress (
  user_id               uuid not null references public.users (id) on delete cascade,
  lesson_id             uuid not null references public.lessons (id) on delete cascade,
  status                text not null default 'not-started' check (
    status in ('not-started', 'in-progress', 'completed')
  ),
  attempts              integer not null default 0,
  completion_percentage numeric not null default 0,
  score                 numeric not null default 0,
  started_at            timestamptz,
  completed_at          timestamptz,
  primary key (user_id, lesson_id)
);

create index if not exists idx_user_progress_user_id on public.user_progress (user_id);
create index if not exists idx_user_progress_lesson_id on public.user_progress (lesson_id);

-- lesson_progress — Source type: LessonProgress (progress.ts)
create table if not exists public.lesson_progress (
  user_id             uuid not null references public.users (id) on delete cascade,
  lesson_id           uuid not null references public.lessons (id) on delete cascade,
  exercises_completed integer not null default 0,
  exercises_total     integer not null default 0,
  accuracy            numeric not null default 0,
  primary key (user_id, lesson_id)
);

create index if not exists idx_lesson_progress_user_id on public.lesson_progress (user_id);
create index if not exists idx_lesson_progress_lesson_id on public.lesson_progress (lesson_id);

-- letter_mastery — Source type: LetterMastery (progress.ts). The foundation
-- of adaptive learning per AI_project_bible.md §9.
create table if not exists public.letter_mastery (
  user_id        uuid not null references public.users (id) on delete cascade,
  letter         char(1) not null check (letter ~ '^[A-Z]$'),
  mastery_score  numeric not null default 0,
  last_practiced timestamptz,
  accuracy       numeric not null default 0,
  avg_confidence numeric not null default 0,
  practice_count integer not null default 0,
  primary key (user_id, letter)
);

create index if not exists idx_letter_mastery_user_id on public.letter_mastery (user_id);

-- streaks — Source type: Streak (progress.ts)
create table if not exists public.streaks (
  user_id          uuid primary key references public.users (id) on delete cascade,
  current_streak   integer not null default 0,
  longest_streak   integer not null default 0,
  last_active_date date
);

-- user_achievements — Source type: UserAchievement (progress.ts)
create table if not exists public.user_achievements (
  user_id        uuid not null references public.users (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create index if not exists idx_user_achievements_user_id on public.user_achievements (user_id);
create index if not exists idx_user_achievements_achievement_id on public.user_achievements (achievement_id);

-- daily_activity — Source type: Statistics (progress.ts)
create table if not exists public.daily_activity (
  user_id            uuid not null references public.users (id) on delete cascade,
  date               date not null,
  minutes            numeric not null default 0,
  lessons_completed  integer not null default 0,
  letters_practiced  integer not null default 0,
  xp_earned          integer not null default 0,
  primary key (user_id, date)
);

create index if not exists idx_daily_activity_user_id on public.daily_activity (user_id);
