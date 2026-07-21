-- Cappy   seed data
--
-- Implements docs/DB_SETUP_GUIDE.md §4: the Phase-1 "ASL Alphabet" course,
-- one unit, and lessons/exercises for the first letter group (A, S, E per
-- AI_project_bible.md §12 "Letter Groupings"   grouped by hand-shape
-- similarity, not alphabetically), plus a handful of achievement rows.
--
-- Explicit UUIDs are used (instead of gen_random_uuid()) so this file is
-- idempotent via `on conflict do nothing` and so FK references between
-- courses -> units -> lessons -> exercises are simple literal values
-- rather than requiring CTEs. Run via `supabase db reset` (local) or
-- `psql` against a real project once provisioned   see
-- docs/BACKEND_SSO_SETUP.md §4.

-- ============================================================================
-- Course: ASL Alphabet
-- ============================================================================
insert into public.courses (id, title, description, order_index)
values (
  '00000000-0000-0000-0000-000000000001',
  'ASL Alphabet',
  'Learn to fingerspell the American Sign Language alphabet, one hand shape at a time.',
  0
)
on conflict (id) do nothing;

-- ============================================================================
-- Unit: Group 1   A, S, E (similar closed-fist hand shapes)
-- ============================================================================
insert into public.units (id, course_id, title, order_index, description)
values (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  'Group 1: A, S, E',
  0,
  'The first hand-shape group   three closed-fist signs that build foundational finger control.'
)
on conflict (id) do nothing;

-- ============================================================================
-- Lessons within Group 1
-- ============================================================================

-- Lesson 1: Observe (demonstration)
insert into public.lessons (id, unit_id, title, description, lesson_type, difficulty, estimated_minutes, xp_reward, order_index)
values (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  'Meet A, S, and E',
  'Watch each sign demonstrated up close before you try it yourself.',
  'observe',
  1,
  3,
  10,
  0
)
on conflict (id) do nothing;

-- Lesson 2: Perform (camera-validated guided practice)
insert into public.lessons (id, unit_id, title, description, lesson_type, difficulty, estimated_minutes, xp_reward, order_index)
values (
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000101',
  'Practice A, S, and E',
  'Use your camera to practice forming each sign with real-time feedback.',
  'perform',
  2,
  5,
  20,
  1
)
on conflict (id) do nothing;

-- Lesson 3: Recall (timed quiz)
insert into public.lessons (id, unit_id, title, description, lesson_type, difficulty, estimated_minutes, xp_reward, order_index)
values (
  '00000000-0000-0000-0000-000000000203',
  '00000000-0000-0000-0000-000000000101',
  'Quick Check: A, S, E',
  'A short timed quiz to check what you remember.',
  'recall',
  2,
  4,
  15,
  2
)
on conflict (id) do nothing;

-- ============================================================================
-- Exercises
-- ============================================================================

-- Lesson 1 (observe)   one observe exercise per letter
insert into public.exercises (id, lesson_id, exercise_type, content, difficulty, order_index)
values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', 'observe',
    '{"letter": "A", "videoUrl": "/assets/asl/letters/A.mp4", "instructions": "Make a fist with your thumb resting against the side of your index finger."}', 1, 0),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000201', 'observe',
    '{"letter": "S", "videoUrl": "/assets/asl/letters/S.mp4", "instructions": "Make a fist with your thumb crossed over the front of your fingers."}', 1, 1),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000201', 'observe',
    '{"letter": "E", "videoUrl": "/assets/asl/letters/E.mp4", "instructions": "Curl your fingers down to touch your thumb, palm facing out."}', 1, 2)
on conflict (id) do nothing;

-- Lesson 2 (perform)   one camera-validation exercise per letter
insert into public.exercises (id, lesson_id, exercise_type, content, difficulty, order_index)
values
  ('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000202', 'camera-validation',
    '{"letter": "A", "targetConfidence": 0.90, "holdMs": 1500}', 2, 0),
  ('00000000-0000-0000-0000-000000000312', '00000000-0000-0000-0000-000000000202', 'camera-validation',
    '{"letter": "S", "targetConfidence": 0.90, "holdMs": 1500}', 2, 1),
  ('00000000-0000-0000-0000-000000000313', '00000000-0000-0000-0000-000000000202', 'camera-validation',
    '{"letter": "E", "targetConfidence": 0.90, "holdMs": 1500}', 2, 2)
on conflict (id) do nothing;

-- Lesson 3 (recall)   multiple-choice quiz questions
insert into public.exercises (id, lesson_id, exercise_type, content, difficulty, order_index)
values
  ('00000000-0000-0000-0000-000000000321', '00000000-0000-0000-0000-000000000203', 'multiple-choice',
    '{"prompt": "Which letter is this?", "imageUrl": "/assets/asl/letters/A.png", "options": ["A", "S", "E"], "answer": "A"}', 2, 0),
  ('00000000-0000-0000-0000-000000000322', '00000000-0000-0000-0000-000000000203', 'multiple-choice',
    '{"prompt": "Which letter is this?", "imageUrl": "/assets/asl/letters/S.png", "options": ["A", "S", "E"], "answer": "S"}', 2, 1),
  ('00000000-0000-0000-0000-000000000323', '00000000-0000-0000-0000-000000000203', 'multiple-choice',
    '{"prompt": "Which letter is this?", "imageUrl": "/assets/asl/letters/E.png", "options": ["A", "S", "E"], "answer": "E"}', 2, 2)
on conflict (id) do nothing;

-- ============================================================================
-- Achievements   meaningful milestones only (AI_project_bible.md §12)
-- ============================================================================
insert into public.achievements (id, name, description, icon)
values
  ('00000000-0000-0000-0000-000000000401', 'First Steps', 'Complete your first lesson.', 'footprints'),
  ('00000000-0000-0000-0000-000000000402', 'Hand Shape Novice', 'Master your first letter group (A, S, E).', 'hand'),
  ('00000000-0000-0000-0000-000000000403', 'On a Roll', 'Reach a 7-day practice streak.', 'flame'),
  ('00000000-0000-0000-0000-000000000404', 'Dedicated Learner', 'Reach a 30-day practice streak.', 'calendar-check'),
  ('00000000-0000-0000-0000-000000000405', 'Alphabet Complete', 'Achieve mastery on all 26 letters.', 'trophy')
on conflict (id) do nothing;
