-- Cappy   switch achievements.id (+ user_achievements.achievement_id) from
-- uuid to text, matching the same reasoning as
-- 20260730120000_text_curriculum_ids.sql.
--
-- Why: the Achievements screen's bookshelf styling (apps/web/src/screens/
-- achievements/libraryData.ts ACHIEVEMENT_LIBRARY/MENTOR_NOTE) is keyed by
-- the app's real achievement ids ("ach-first-lesson", "ach-streak-7",
-- "ach-night-owl", "ach-comeback", "ach-group-ae", "ach-perfect-quiz") --
-- hand-authored category/rarity/mentor-note content per id. The seeded
-- achievements table used different uuid ids with different names
-- entirely, so wiring real reads would show achievement rows the bookshelf
-- UI has no styling/copy for. Safe as a type change: zero real
-- user_achievements rows exist yet (pre-launch, confirmed).

alter table public.user_achievements drop constraint if exists user_achievements_achievement_id_fkey;

alter table public.achievements alter column id drop default;
alter table public.achievements alter column id type text using id::text;
alter table public.user_achievements alter column achievement_id type text using achievement_id::text;

alter table public.user_achievements
  add constraint user_achievements_achievement_id_fkey foreign key (achievement_id) references public.achievements (id) on delete cascade;
