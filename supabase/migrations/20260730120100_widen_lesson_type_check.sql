-- Cappy   widen lessons.lesson_type's CHECK constraint to also accept
-- Morse's lesson-step vocabulary.
--
-- Why: packages/types' MorseLesson uses exerciseType values "learn" /
-- "send" / "receive" / "checkout" (packages/types/src/morse.ts), distinct
-- from ASL's Lesson.lessonType vocabulary the original constraint was
-- written against. Both curricula share the same public.lessons table (per
-- ADR-009, "content-agnostic lesson engine"), so the constraint must accept
-- both vocabularies rather than assume ASL's alone.

alter table public.lessons drop constraint if exists lessons_lesson_type_check;

alter table public.lessons add constraint lessons_lesson_type_check check (
  lesson_type in (
    'observe', 'recognize', 'perform', 'recall',
    'mixed-review', 'timed-practice', 'assessment',
    'learn', 'send', 'receive', 'checkout'
  )
);
