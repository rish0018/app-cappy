# Changelog

## Unreleased

### Morse Code — words & staged curriculum
- Added word-level Morse logic to `@cappy/core` (`morse/words.ts`): word/phrase → per-letter patterns, full audio timelines with standard 3-unit letter gaps and 7-unit word gaps, gap classification for tap streams, and `validateWordSendAttempt` for scoring word-level sending (shared by web and mobile).
- Added the word & phrase curriculum to `@cappy/types` (`MORSE_WORD_STAGES`): two active stages (First Words, Everyday Words) and three fully-authored dormant stages (Full Alphabet Words, Short Phrases, On the Air). Dormant stages ship with the app but stay hidden behind a "coming soon" state — flip `status` to `"active"` to release one, no other change needed.
- New `/morse/words/:stageId` practice screen (listen to a whole word, pick it, pattern revealed per letter after answering), with locked/dormant guard states.
- Redesigned the Morse dashboard: level cards with state chips, first-character pattern previews, and mastery bars; new "Words & phrases" section surfacing the staged curriculum.

### Dashboard
- Added two additive dashboard components (existing components untouched): `DailyGoalCard` (today's minutes vs. daily goal as a traced ring) and `ExploreMorseCard` (cross-skill teaser with real level-1 mastery).

### Mobile & navigation fixes
- The quick-nav dock now stays at the bottom on mobile during lesson/level steps (the vertical side dock is desktop-only), and lesson-step content gets its full width back on small screens.
- Fixed the dock rendering with stale animation state after switching between vertical and horizontal layouts (remount on orientation change).
- Removed duplicated streak/XP badges on mobile dashboards (the header already shows them).
- Onboarding browser-mockup traffic lights now use the standard red/yellow/green.

- Expanded the documentation set to reflect the broader project bible context.
- Added a root project context file with explicit guardrails for truthful, clear documentation.
- Added documentation guidance for keeping future decisions explicit and traceable.
- Updated the training and product documentation to reflect the completed ML milestones: dataset inspection, landmark extraction, normalization, training, evaluation, and webcam testing.

## 0.1.0
- Created initial documentation structure for the monorepo.
- Added product, vision, decisions, and contributor guidance files.
