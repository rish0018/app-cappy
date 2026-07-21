# Changelog

## Unreleased

### ML — real landmark extraction, training, and browser integration
- Discovered and fixed a documentation/reality gap: `apps/training`'s status table claimed landmark extraction and model training were complete, but neither the trained model file nor the processed CSV existed on disk — only summary reports had survived. Re-ran the entire pipeline from scratch.
- Fixed two real bugs in `scripts/extract_landmarks.py`: a stale dataset path (didn't match the actual Kaggle folder nesting), and an incompatible MediaPipe API call (`mp.solutions.hands`, removed from the installed MediaPipe build) — ported to the current Tasks API (`HandLandmarker`). Also fixed a quadratic-slowdown bug in the resume-checkpoint writer (was rewriting the full processed-files list to disk on every image).
- Extracted landmarks from all 87,000 training images (63,581 successful, 0 failures) and normalized them (`datasets/csv/landmarks_normalized.csv`).
- Retrained the Random Forest baseline for real: **98.7% validation accuracy** (`models/random_forest.pkl`), excluding the `nothing` class (no hand visible by definition — not a landmark-classifiable target).
- New `scripts/train_tfjs_model.py`: trains a Keras MLP (128→64→28, dropout 0.2) on the same data, since sklearn's RandomForest can't convert to TF.js directly — **98.8% validation accuracy**.
- New `scripts/export_tfjs.py`: converts the Keras model to `exports/tensorflowjs/` (graph model + weights + `preprocessing.json` with the scaler mean/scale and label list).
- New `apps/web/src/ml/` module: `handLandmarker.ts` (MediaPipe Tasks API for live video), `tfjsPredictor.ts` (loads the exported model, replicates the training normalization pipeline exactly, implements `packages/core`'s `HandPosePredictor` contract), `useHandPosePrediction.ts` (React hook tying camera + model together). Wired into `apps/web/src/screens/LessonPractice.tsx` — live webcam feed, prediction + confidence display only, per the training README's Phase 9 scope.
- Corrected `packages/core/src/ml/predictor.ts`'s `HandLandmarks` type: the doc comment said 42 numbers (x, y only), but the actual training pipeline uses all three MediaPipe axes — 63 numbers (x, y, z).
- **Known gap:** mobile ML integration is a follow-up — `apps/mobile/app/lesson/[id]/practice.tsx` still has its `HandPosePredictor` TODO; react-native TF.js is a different runtime from the web path above.

### Backend — Supabase schema, RLS, and API wiring
- Added `supabase/migrations/` with the full v1 schema (users, courses, units, lessons, exercises, user_progress, lesson_progress, letter_mastery, streaks, achievements, user_achievements, daily_activity) and Row-Level Security policies (`auth.uid() = user_id` on every user-data table; public-read on curriculum tables). Added `supabase/seed.sql` seeding the ASL Alphabet course, its first unit (A/S/E), and starter achievements.
- `packages/api`'s repositories (`courses`, `lessons`, `progress`, `achievements`) now call a real Supabase client instead of throwing "not implemented"; `createSupabaseClient()` reads env vars from root/Vite/Expo conventions and throws a clear "not configured yet" error at call time until real project keys exist.
- New `packages/api` repositories: `auth.ts` (`signUp`, `signInWithPassword`, `signInWithOAuth`, `signOut`, `getSession`, `onAuthStateChange`) and `profile.ts` (`getProfile`, `updateProfile`).
- New `packages/types/src/auth.ts`: `AuthUser`, `Session`, `LoginCredentials`, `SignupCredentials`, `OAuthProvider` (`"google" | "apple"`).
- Added `.env.example` at the repo root and inside `apps/web`/`apps/mobile` documenting the expected Supabase env vars.
- New `docs/BACKEND_SSO_SETUP.md`: step-by-step runbook for provisioning a real Supabase project and configuring Google + Apple OAuth once credentials are available. `docs/DB_SETUP_GUIDE.md` and `docs/PROGRESS.md` updated to reflect what's implemented in code vs. what still needs a live project.
- **Known gap:** native Apple Sign-In (`expo-apple-authentication` + `signInWithIdToken`) isn't implemented on mobile yet — `signInWithOAuth("apple")` will error until it's added as a follow-up.

### Auth UI — login, signup, SSO, route guards
- New Login/Signup screens on web (`apps/web/src/screens/{Login,Signup}.tsx`) and mobile (`apps/mobile/app/{login,signup}.tsx`), both with email/password fields and Google/Apple SSO buttons, following the existing brand voice (encouraging error copy, never "Incorrect"/"Failed").
- New shared form components: `packages/ui` gained `Input`, `SSOButton`, `Divider` (web); `apps/mobile/src/components` gained the same set styled with NativeWind for native.
- New route guards: web's `RequireAuth` wraps the authenticated route group in `App.tsx`; mobile's `useAuthGate()` in `(tabs)/_layout.tsx` redirects to `/login` after onboarding. Both fail open (don't block navigation) if the backend isn't configured yet, so local dev stays usable.
- Profile screens on both apps now have a working "Sign out" action, visually aligned with the new auth screens.

### ASL reference images — placeholder removal
- Added real per-letter ASL fingerspelling reference photos (sourced from the training dataset's curated test set) to `apps/web/src/assets/asl-samples/` and `apps/mobile/assets/asl-samples/`.
- Web: new `ReferenceImage` component wired into `LessonDemo.tsx`, with a graceful emoji fallback if an image is missing.
- Mobile: `apps/mobile/app/lesson/[id]/demo.tsx` no longer shows the literal "Demonstration video placeholder" text — it now renders the real per-letter photo (with a letter picker when a lesson covers multiple letters).

### Bug fixes found during this pass
- Fixed malformed/duplicated JSON in `apps/mobile/app.json` (a `"plugins"` array was declared twice with a missing comma — would have broken Expo builds).

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
