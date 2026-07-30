-- Cappy   seed data
--
-- Real ASL (5 letter groups) + Morse (7 levels + 6 word/phrase stages)
-- curriculum, matching the ids/content the apps already generate
-- client-side from packages/types' LETTER_GROUPS/MORSE_GROUPS/
-- MORSE_WORD_STAGES (apps/web/src/mockData.ts, apps/web/src/morseMockData.ts).
-- Ids are the real slugs both apps already send to recordLessonProgress()
-- (e.g. "lesson-a-e", "level-1-learn", "morse-words-words-1")   this is
-- what makes those calls succeed against user_progress/lesson_progress's
-- lesson_id FK now that it's text-typed (see
-- 20260730120100_widen_lesson_type_check.sql / 20260730120000_text_curriculum_ids.sql).
--
-- Supersedes the original placeholder seed (one uuid-keyed "Group 1: A, S,
-- E" unit/lessons/exercises)   deleted below since its ids never matched
-- the app's real lesson ids and no real user rows reference them yet
-- (pre-launch, confirmed via docs/PROGRESS.md).

-- ============================================================================
-- Clear the superseded placeholder content
-- ============================================================================
delete from public.exercises where lesson_id in (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000203'
);
delete from public.lessons where id in (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000203'
);
delete from public.units where id = '00000000-0000-0000-0000-000000000101';
delete from public.courses where id = '00000000-0000-0000-0000-000000000001';

-- ============================================================================
-- Course: ASL Fingerspelling   matches apps/web/src/mockData.ts's mockCourse
-- ============================================================================
insert into public.courses (id, title, description, order_index)
values (
  'course-asl-1',
  'ASL Fingerspelling',
  'Learn the ASL manual alphabet, one letter group at a time.',
  0
)
on conflict (id) do nothing;

-- ============================================================================
-- ASL units + lessons   one per LETTER_GROUPS entry (packages/types/src/letters.ts)
-- ============================================================================
insert into public.units (id, course_id, title, order_index, description)
values
  ('unit-a-e', 'course-asl-1', 'Letters A–E', 0, 'Learn to fingerspell A, B, C, D, E.'),
  ('unit-f-j', 'course-asl-1', 'Letters F–J', 1, 'Learn to fingerspell F, G, H, I, J.'),
  ('unit-k-o', 'course-asl-1', 'Letters K–O', 2, 'Learn to fingerspell K, L, M, N, O.'),
  ('unit-p-t', 'course-asl-1', 'Letters P–T', 3, 'Learn to fingerspell P, Q, R, S, T.'),
  ('unit-u-z', 'course-asl-1', 'Letters U–Z', 4, 'Learn to fingerspell U, V, W, X, Y, Z.')
on conflict (id) do nothing;

insert into public.lessons (id, unit_id, title, description, lesson_type, difficulty, estimated_minutes, xp_reward, order_index)
values
  ('lesson-a-e', 'unit-a-e', 'Letters A–E', 'Learn all 5 signs in this group together: A, B, C, D, E.', 'observe', 1, 9, 100, 0),
  ('lesson-f-j', 'unit-f-j', 'Letters F–J', 'Learn all 5 signs in this group together: F, G, H, I, J.', 'recognize', 2, 9, 100, 0),
  ('lesson-k-o', 'unit-k-o', 'Letters K–O', 'Learn all 5 signs in this group together: K, L, M, N, O.', 'perform', 3, 9, 100, 0),
  ('lesson-p-t', 'unit-p-t', 'Letters P–T', 'Learn all 5 signs in this group together: P, Q, R, S, T.', 'recall', 4, 9, 100, 0),
  ('lesson-u-z', 'unit-u-z', 'Letters U–Z', 'Learn all 6 signs in this group together: U, V, W, X, Y, Z.', 'mixed-review', 5, 10, 120, 0)
on conflict (id) do nothing;

-- ============================================================================
-- Course: Morse Code
-- ============================================================================
insert into public.courses (id, title, description, order_index)
values (
  'course-morse-1',
  'Morse Code',
  'Learn to send and receive Morse code, one level at a time.',
  1
)
on conflict (id) do nothing;

-- ============================================================================
-- Morse units   one per MORSE_GROUPS entry (packages/types/src/morse.ts)
-- ============================================================================
insert into public.units (id, course_id, title, order_index, description)
values
  ('morse-unit-level-1', 'course-morse-1', 'Level 1 — A–E, 0–4', 0, 'Learn to send and receive A, B, C, D, E, 0, 1, 2, 3, 4.'),
  ('morse-unit-level-2', 'course-morse-1', 'Level 2 — F–J, 5–9', 1, 'Learn to send and receive F, G, H, I, J, 5, 6, 7, 8, 9.'),
  ('morse-unit-level-3', 'course-morse-1', 'Level 3 — K–O', 2, 'Learn to send and receive K, L, M, N, O.'),
  ('morse-unit-level-4', 'course-morse-1', 'Level 4 — P–T', 3, 'Learn to send and receive P, Q, R, S, T.'),
  ('morse-unit-level-5', 'course-morse-1', 'Level 5 — U–Z', 4, 'Learn to send and receive U, V, W, X, Y, Z.'),
  ('morse-unit-level-6', 'course-morse-1', 'Level 6 — Bonus: Prosigns', 5, 'Bonus prosigns — put everything together.'),
  ('morse-unit-level-7', 'course-morse-1', 'Level 7 — Bonus: Punctuation', 6, 'Bonus prosigns — put everything together.'),
  ('morse-unit-words', 'course-morse-1', 'Words & Phrases', 7, 'Send and receive whole words, phrases, and sentences.')
on conflict (id) do nothing;

-- ============================================================================
-- Morse level lessons   4 steps (learn/send/receive/checkout) per level for
-- levels 1-5 (real characters); levels 6-7 (bonus prosign levels) only get
-- learn + checkout, matching mockMorseLessons' filter (send/receive need a
-- real character set, bonus levels have none).
-- ============================================================================
insert into public.lessons (id, unit_id, title, description, lesson_type, difficulty, estimated_minutes, xp_reward, order_index)
values
  -- Level 1
  ('level-1-learn', 'morse-unit-level-1', 'Level 1 — A–E, 0–4 — Learn', 'Review the dot/dash patterns and hear the sounds for these characters.', 'learn', 1, 5, 20, 0),
  ('level-1-send', 'morse-unit-level-1', 'Level 1 — A–E, 0–4 — Sending', 'Tap and hold the key to send each pattern.', 'send', 1, 5, 25, 1),
  ('level-1-receive', 'morse-unit-level-1', 'Level 1 — A–E, 0–4 — Receiving', 'Listen to the pattern and pick the right character.', 'receive', 1, 5, 25, 2),
  ('level-1-checkout', 'morse-unit-level-1', 'Level 1 — A–E, 0–4 — Checkout', 'A mixed review to confirm you''ve got this level down.', 'checkout', 1, 8, 50, 3),
  -- Level 2
  ('level-2-learn', 'morse-unit-level-2', 'Level 2 — F–J, 5–9 — Learn', 'Review the dot/dash patterns and hear the sounds for these characters.', 'learn', 2, 5, 20, 0),
  ('level-2-send', 'morse-unit-level-2', 'Level 2 — F–J, 5–9 — Sending', 'Tap and hold the key to send each pattern.', 'send', 2, 5, 25, 1),
  ('level-2-receive', 'morse-unit-level-2', 'Level 2 — F–J, 5–9 — Receiving', 'Listen to the pattern and pick the right character.', 'receive', 2, 5, 25, 2),
  ('level-2-checkout', 'morse-unit-level-2', 'Level 2 — F–J, 5–9 — Checkout', 'A mixed review to confirm you''ve got this level down.', 'checkout', 2, 8, 50, 3),
  -- Level 3
  ('level-3-learn', 'morse-unit-level-3', 'Level 3 — K–O — Learn', 'Review the dot/dash patterns and hear the sounds for these characters.', 'learn', 3, 5, 20, 0),
  ('level-3-send', 'morse-unit-level-3', 'Level 3 — K–O — Sending', 'Tap and hold the key to send each pattern.', 'send', 3, 5, 25, 1),
  ('level-3-receive', 'morse-unit-level-3', 'Level 3 — K–O — Receiving', 'Listen to the pattern and pick the right character.', 'receive', 3, 5, 25, 2),
  ('level-3-checkout', 'morse-unit-level-3', 'Level 3 — K–O — Checkout', 'A mixed review to confirm you''ve got this level down.', 'checkout', 3, 8, 50, 3),
  -- Level 4
  ('level-4-learn', 'morse-unit-level-4', 'Level 4 — P–T — Learn', 'Review the dot/dash patterns and hear the sounds for these characters.', 'learn', 4, 5, 20, 0),
  ('level-4-send', 'morse-unit-level-4', 'Level 4 — P–T — Sending', 'Tap and hold the key to send each pattern.', 'send', 4, 5, 25, 1),
  ('level-4-receive', 'morse-unit-level-4', 'Level 4 — P–T — Receiving', 'Listen to the pattern and pick the right character.', 'receive', 4, 5, 25, 2),
  ('level-4-checkout', 'morse-unit-level-4', 'Level 4 — P–T — Checkout', 'A mixed review to confirm you''ve got this level down.', 'checkout', 4, 8, 50, 3),
  -- Level 5
  ('level-5-learn', 'morse-unit-level-5', 'Level 5 — U–Z — Learn', 'Review the dot/dash patterns and hear the sounds for these characters.', 'learn', 5, 5, 20, 0),
  ('level-5-send', 'morse-unit-level-5', 'Level 5 — U–Z — Sending', 'Tap and hold the key to send each pattern.', 'send', 5, 5, 25, 1),
  ('level-5-receive', 'morse-unit-level-5', 'Level 5 — U–Z — Receiving', 'Listen to the pattern and pick the right character.', 'receive', 5, 5, 25, 2),
  ('level-5-checkout', 'morse-unit-level-5', 'Level 5 — U–Z — Checkout', 'A mixed review to confirm you''ve got this level down.', 'checkout', 5, 8, 50, 3),
  -- Level 6 (bonus: prosigns   learn + checkout only)
  ('level-6-learn', 'morse-unit-level-6', 'Level 6 — Bonus: Prosigns — Learn', 'Review the dot/dash patterns and hear the sounds for these characters.', 'learn', 6, 5, 20, 0),
  ('level-6-checkout', 'morse-unit-level-6', 'Level 6 — Bonus: Prosigns — Checkout', 'A mixed review to confirm you''ve got this level down.', 'checkout', 6, 8, 50, 3),
  -- Level 7 (bonus: punctuation   learn + checkout only)
  ('level-7-learn', 'morse-unit-level-7', 'Level 7 — Bonus: Punctuation — Learn', 'Review the dot/dash patterns and hear the sounds for these characters.', 'learn', 7, 5, 20, 0),
  ('level-7-checkout', 'morse-unit-level-7', 'Level 7 — Bonus: Punctuation — Checkout', 'A mixed review to confirm you''ve got this level down.', 'checkout', 7, 8, 50, 3)
on conflict (id) do nothing;

-- ============================================================================
-- Morse word/phrase stage lessons   one per MORSE_WORD_STAGES entry
-- (packages/types/src/morse.ts); ids match `morse-words-${stage.id}` per
-- apps/web/src/screens/morse/MorseWords.tsx's recordLessonProgress() call.
-- ============================================================================
insert into public.lessons (id, unit_id, title, description, lesson_type, difficulty, estimated_minutes, xp_reward, order_index)
values
  ('morse-words-words-1', 'morse-unit-words', 'First Words', 'Short words built only from Levels 1–2 characters.', 'checkout', 1, 10, 40, 0),
  ('morse-words-words-2', 'morse-unit-words', 'Everyday Words', 'Longer words using everything through Level 3.', 'checkout', 2, 10, 40, 1),
  ('morse-words-words-3', 'morse-unit-words', 'Full Alphabet Words', 'Words that reach across the whole alphabet.', 'checkout', 3, 10, 40, 2),
  ('morse-words-phrases-1', 'morse-unit-words', 'Short Phrases', 'Two-word phrases — your first real messages.', 'checkout', 4, 10, 40, 3),
  ('morse-words-radio-1', 'morse-unit-words', 'On the Air', 'Real operator shorthand: greetings, sign-offs, and calls.', 'checkout', 5, 10, 40, 4),
  ('morse-words-sentences-1', 'morse-unit-words', 'Full Sentences', 'Longer messages — the real test of everything you''ve learned.', 'checkout', 6, 10, 40, 5)
on conflict (id) do nothing;

-- ============================================================================
-- Achievements   meaningful milestones only (AI_project_bible.md §12).
-- Unchanged from the original seed (ids/content untouched by the
-- curriculum-id migration; achievements.id stays uuid).
-- ============================================================================
insert into public.achievements (id, name, description, icon)
values
  ('00000000-0000-0000-0000-000000000401', 'First Steps', 'Complete your first lesson.', 'footprints'),
  ('00000000-0000-0000-0000-000000000402', 'Hand Shape Novice', 'Master your first letter group (A, S, E).', 'hand'),
  ('00000000-0000-0000-0000-000000000403', 'On a Roll', 'Reach a 7-day practice streak.', 'flame'),
  ('00000000-0000-0000-0000-000000000404', 'Dedicated Learner', 'Reach a 30-day practice streak.', 'calendar-check'),
  ('00000000-0000-0000-0000-000000000405', 'Alphabet Complete', 'Achieve mastery on all 26 letters.', 'trophy')
on conflict (id) do nothing;
