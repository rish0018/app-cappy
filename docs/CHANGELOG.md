# Changelog

## Unreleased

### Visual redesign   themed backgrounds, ASL "5-letter groups", achievements bookshelf (in progress, uncommitted)
- **ASL curriculum restructured from one lesson per letter to one lesson per 5-letter group** (`apps/web/src/mockData.ts`, `apps/mobile/src/mockData.ts`): lesson ids changed shape from `lesson-${group.id}-${letter}` to `lesson-${group.id}` (e.g. `lesson-a-e`), so all mock progress/streak data tied to per-letter ids was regenerated. **No real persisted progress exists yet (still pre-launch/mock-data-only), so this is safe now but would need a migration map if done after a live Supabase project has real user progress.**
- `LessonList.tsx` (web) and `lessons.tsx` (mobile) rebuilt as a card grid ("Levels") mirroring `MorseDashboard`'s level-card style, replacing the old per-letter dashed-path layout; added the same `STATE_CHIP` (locked/active/completed) convention used by Morse so both curricula read as one family.
- New `apps/web/src/lessonBackgrounds.ts` / mobile equivalent: `ASL_LESSON_BACKGROUNDS` maps each 5-letter group lesson id to a distinct backdrop scene, shown on both the lesson-list card and the lesson-step pages.
- `NavLayout.tsx` (web) now picks a themed background per authenticated route (`backgroundFor()`): ASL lesson-step routes get their group's scene (falling back to a shared default), `/morse*` routes share one constellation backdrop, and `/dashboard`, `/achievements`, `/profile` each get their own scene.
- New per-letter reference/background art assets added under `apps/mobile/assets/background_*.jpg` and corresponding web `scene_*.png` assets; 4 new Cappy character prompts added to `brand-assets/Cappy_Brand_Prompt_Library_v1.txt` (Signing, Encouraging, Greeting, Listening Cappy) documenting the art direction behind the new imagery.
- Achievements screen (web) rebuilt around a new `apps/web/src/screens/achievements/BookshelfLibrary.tsx` + `libraryData.ts`, replacing the flat `AchievementBadge` grid with a bookshelf metaphor; mobile's achievements tab updated to match.
- Mobile `Loader.tsx` reworked to use `SafeAreaView`/`Dimensions` instead of a fixed-size `Image`, fixing slide sizing on devices with different screen dimensions/notches.
- Misc: `packages/ui/src/components/Card.tsx`, `DashboardDock.tsx`, `(tabs)/_layout.tsx`, `Login`/`Signup` (both apps), `LessonDemo`/`LessonQuiz`/`LessonPractice`/`review.tsx`, `MorseDashboard.tsx`, and both `tailwind.config` files touched in support of the above (background layering, spacing/token tweaks).
- **Not yet committed as of this entry** — this whole section describes the working tree's uncommitted diff on `Feature/backend`, written retroactively because the branch had moved forward without a matching docs/changelog update. Verify web/mobile typecheck and a manual click-through before committing; `docs/PROGRESS.md` §1 "What's Done" still describes the pre-redesign, per-letter lesson structure and needs a follow-up pass once this lands.

### Morse Code   words & staged curriculum
- Added word-level Morse logic to `@cappy/core` (`morse/words.ts`): word/phrase → per-letter patterns, full audio timelines with standard 3-unit letter gaps and 7-unit word gaps, gap classification for tap streams, and `validateWordSendAttempt` for scoring word-level sending (shared by web and mobile).
- Added the word & phrase curriculum to `@cappy/types` (`MORSE_WORD_STAGES`): five active stages (First Words, Everyday Words, Full Alphabet Words, Short Phrases, On the Air). Active stages are now immediately testable.
- New `/morse/words/:stageId` practice screen (listen to a whole word, pick it, pattern revealed per letter after answering), with the unlock guard simplified so all active stages are accessible during testing.
- Added a dedicated Morse learn lesson before each practice block so learners can review dot/dash patterns and hear the sounds for every character.
- Redesigned the Morse learn screen to use a two-column review layout and simplified the action flow to a single Practice button.

### Bug fixes from real-device/browser testing (2026-07-21, part 2)
- **Fixed `apps/mobile` failing to bundle at all**: `expo run:android`/`expo start` errored with `Unable to resolve module ./node_modules/expo-router/entry` (a 404 on the dev server's own entry-bundle request). Root cause: Expo's dev server requests the `main: "expo-router/entry"` entry point as a literal *relative path* (`./node_modules/expo-router/entry`) from the project root, not a bare specifier — relative-path resolution never consults `resolver.nodeModulesPaths`/hierarchical lookup (only bare imports do), so with this repo's pnpm hoisted layout (`apps/mobile/node_modules` has no local `expo-router` — it's hoisted to the workspace root) that literal path never resolves, even though `require.resolve("expo-router/entry")` succeeds fine from the same directory. Fixed in `apps/mobile/metro.config.js` with a custom `resolver.resolveRequest` that re-resolves any unresolvable `./node_modules/<pkg>/...` request as a bare specifier instead. Verified against a real running Metro server (not just a code read): confirmed the exact 404 first, then confirmed a real HTTP 200 + valid ~9MB bundle after the fix, with a fully fresh cache and no manual `node_modules` changes.
- **Fixed web signup showing a generic, unhelpful error** for Supabase's `over_email_send_rate_limit` (429) — a real, expected limitation of the default/free email provider's very low hourly send cap (easily exhausted between testing and real signups), not an app bug. Added `isAuthRateLimitError()` to `packages/api/src/repositories/auth.ts`; both Signup screens now show "We're sending a lot of emails right now — please wait a few minutes and try again" specifically for this case instead of the generic message.


### Bug fixes from real-device/browser testing (2026-07-21)
- **Fixed a real bug that let unauthenticated users straight into the app**: `packages/api/src/client.ts`'s env-var reader used `(import.meta as any)?.env`   Vite's dev server statically pattern-matches the literal, unwrapped `import.meta.env` expression to inject real env values; the optional-chaining (`?.`) form defeats that match and silently evaluates to `undefined` even with a valid `.env.local`. This made `createSupabaseClient()` always throw "not configured," which made every route guard fail open. Confirmed via a headless-browser repro before and after the fix   `/lessons/:id/demo` now correctly redirects an unauthenticated visitor to `/login`, with zero console warnings once actually authenticated.
- **Fixed `apps/mobile/android/gradlew` missing its executable bit** (`git ls-files -s` shows it's tracked as mode `100644`)   this breaks `expo run:android` with `spawn .../gradlew EACCES` on every fresh clone. Fixed locally (`chmod +x`); **needs `git update-index --chmod=+x apps/mobile/android/gradlew` committed** so this doesn't regress for the next person who clones the repo.
- **Fixed cropped/misaligned ASL reference images on web**: `ReferenceImage.tsx` forced the (square, 200×200) dataset photos into a 16:9 `aspect-video` box with `object-cover`, cropping most of the frame. Changed to `aspect-square` + `object-contain`, matching the source images and mobile's existing (already-correct) implementation. Note: the underlying dataset photos are inherently close-up/tightly-cropped shots (verified by opening the raw source file)   this fix removes the *additional* CSS-driven crop, but doesn't change the photos' own composition; that's a known limitation of this placeholder dataset until real Cappy-illustrated signs replace it.
- **Fixed `LessonQuiz.tsx` always showing a generic 🤟 emoji regardless of the actual letter being tested**, instead of the real per-letter photo `LessonDemo` uses   added a `ReferenceImage` there too, with an `alt` override (`"Sign to identify"`) so the fix doesn't leak the quiz answer to screen-reader users via the default per-letter alt text.

### QA fixes   auth guard fail-open scope, signup email-confirmation handling
- Found by an independent QA pass: `RequireAuth` (web) and `useAuthGate` (mobile) failed open on **any** thrown error from `getSession()`/`onAuthStateChange()`, not just "Supabase not configured"   now that a live backend exists, this meant a real outage, network failure, or expired/malformed token would silently let a user into the protected app instead of redirecting to `/login`. Fixed by adding a distinguishable `SupabaseNotConfiguredError` class (`packages/api/src/client.ts`) and narrowing both guards to fail open ONLY on that specific error; every other error now correctly resolves to "unauthenticated".
- Found by the same QA pass: both Signup screens (`apps/web/src/screens/Signup.tsx`, `apps/mobile/app/signup.tsx`) navigated straight to the authenticated app after a successful `signUp()` call even when Supabase's response has a `null` session   which happens whenever email confirmation is required (the case for this project). The user would land on a screen that isn't actually signed in. Fixed: both screens now check for a `null` session and show a "check your email to confirm" message instead of navigating forward.

### Auth   native Apple Sign-In on mobile
- Closed the known gap from the previous entry: added `expo-apple-authentication@~6.4.2` to `apps/mobile`, registered its config plugin in `app.json`, and added `signInWithAppleIdToken(idToken, nonce?)` to `packages/api/src/repositories/auth.ts` (exchanges the identity token via `supabase.auth.signInWithIdToken`, same `mapSession` convention as the rest of the file).
- `apps/mobile/app/login.tsx` and `signup.tsx` now branch on platform in `handleSSO`: iOS uses `AppleAuthentication.signInAsync()` for the native sheet, Android/web keep `signInWithOAuth("apple")`. Added `apps/mobile/src/lib/appleAuth.ts`'s `isAppleCancellation()` so a user dismissing the sheet isn't shown an error.
- Updated `docs/BACKEND_SSO_SETUP.md` §5c and `docs/DECISIONS.md`'s 2026-07-17 entry to reflect this as done rather than a follow-up.
- **Verified:** `pnpm --filter @cappy/api typecheck` and `pnpm --filter @cappy/mobile typecheck` both pass. **Not verified:** the actual native sign-in flow on a real iOS device/simulator (none available in this environment)   no Apple ID sign-in, no confirmation the identity token round-trips through Supabase successfully. Nonce hashing (SHA-256, for replay protection) is also not implemented   `signInWithAppleIdToken`'s `nonce` param is left unset from the call sites.

### ML   mobile model-loading wired for real; landmark detection remains a gap
- `apps/mobile/src/ml/rnPredictor.ts`'s `RNHandPosePredictor` implements `packages/core`'s `HandPosePredictor` for React Native using `@tensorflow/tfjs-react-native` + `expo-gl` (added as dependencies), loading the same exported model as the web app via `bundleResourceIO` against assets bundled at `apps/mobile/assets/ml/asl-alphabet/` (copied from `apps/training/exports/tensorflowjs/`   copy is a manual step until there's a shared build script). `metro.config.js` updated to treat `.bin` as a bundleable asset extension.
- Normalization/standardization logic (wrist-relative translation, max-distance scaling, then `preprocessing.json`'s StandardScaler mean/scale) ported verbatim from `apps/web/src/ml/tfjsPredictor.ts`   same math, not reinvented.
- **Verified:** typechecks; `bundleResourceIO` confirmed to exist in the installed `@tensorflow/tfjs-react-native` type definitions. **Not verified:** whether the model actually loads and produces correct predictions at runtime   no iOS/Android device or simulator available in this environment to run it.
- **Real gap, not attempted:** nothing on React Native currently produces the `HandLandmarks` input `RNHandPosePredictor.predict()` needs. The web app's landmark source, `@mediapipe/tasks-vision`, is WASM + browser-canvas only. No maintained RN-native equivalent (e.g. a `react-native-vision-camera` frame-processor plugin providing MediaPipe-equivalent hand landmarks) was found working/available this session; a WASM-in-WebView bridge was considered and rejected as unverifiable/likely-too-slow for real-time use without a device to test on. `apps/mobile/app/lesson/[id]/practice.tsx`'s TODO comment was updated to point at this file and explain the gap, but the screen still shows the mock confidence-tier cycler   this is deliberately left as an honest, documented gap rather than a fake integration.

### ML   real landmark extraction, training, and browser integration
- Discovered and fixed a documentation/reality gap: `apps/training`'s status table claimed landmark extraction and model training were complete, but neither the trained model file nor the processed CSV existed on disk   only summary reports had survived. Re-ran the entire pipeline from scratch.
- Fixed two real bugs in `scripts/extract_landmarks.py`: a stale dataset path (didn't match the actual Kaggle folder nesting), and an incompatible MediaPipe API call (`mp.solutions.hands`, removed from the installed MediaPipe build)   ported to the current Tasks API (`HandLandmarker`). Also fixed a quadratic-slowdown bug in the resume-checkpoint writer (was rewriting the full processed-files list to disk on every image).
- Extracted landmarks from all 87,000 training images (63,581 successful, 0 failures) and normalized them (`datasets/csv/landmarks_normalized.csv`).
- Retrained the Random Forest baseline for real: **98.7% validation accuracy** (`models/random_forest.pkl`), excluding the `nothing` class (no hand visible by definition   not a landmark-classifiable target).
- New `scripts/train_tfjs_model.py`: trains a Keras MLP (128→64→28, dropout 0.2) on the same data, since sklearn's RandomForest can't convert to TF.js directly   **98.8% validation accuracy**.
- New `scripts/export_tfjs.py`: converts the Keras model to `exports/tensorflowjs/` (graph model + weights + `preprocessing.json` with the scaler mean/scale and label list).
- New `apps/web/src/ml/` module: `handLandmarker.ts` (MediaPipe Tasks API for live video), `tfjsPredictor.ts` (loads the exported model, replicates the training normalization pipeline exactly, implements `packages/core`'s `HandPosePredictor` contract), `useHandPosePrediction.ts` (React hook tying camera + model together). Wired into `apps/web/src/screens/LessonPractice.tsx`   live webcam feed, prediction + confidence display only, per the training README's Phase 9 scope.
- Corrected `packages/core/src/ml/predictor.ts`'s `HandLandmarks` type: the doc comment said 42 numbers (x, y only), but the actual training pipeline uses all three MediaPipe axes   63 numbers (x, y, z).
- **Mobile ML integration:** see the "ML   mobile model-loading wired for real" entry above for what was subsequently built (model loading) and what remains a gap (landmark detection).

### Backend   Supabase schema, RLS, and API wiring
- Added `supabase/migrations/` with the full v1 schema (users, courses, units, lessons, exercises, user_progress, lesson_progress, letter_mastery, streaks, achievements, user_achievements, daily_activity) and Row-Level Security policies (`auth.uid() = user_id` on every user-data table; public-read on curriculum tables). Added `supabase/seed.sql` seeding the ASL Alphabet course, its first unit (A/S/E), and starter achievements.
- `packages/api`'s repositories (`courses`, `lessons`, `progress`, `achievements`) now call a real Supabase client instead of throwing "not implemented"; `createSupabaseClient()` reads env vars from root/Vite/Expo conventions and throws a clear "not configured yet" error at call time until real project keys exist.
- New `packages/api` repositories: `auth.ts` (`signUp`, `signInWithPassword`, `signInWithOAuth`, `signOut`, `getSession`, `onAuthStateChange`) and `profile.ts` (`getProfile`, `updateProfile`).
- New `packages/types/src/auth.ts`: `AuthUser`, `Session`, `LoginCredentials`, `SignupCredentials`, `OAuthProvider` (`"google" | "apple"`).
- Added `.env.example` at the repo root and inside `apps/web`/`apps/mobile` documenting the expected Supabase env vars.
- New `docs/BACKEND_SSO_SETUP.md`: step-by-step runbook for provisioning a real Supabase project and configuring Google + Apple OAuth once credentials are available. `docs/DB_SETUP_GUIDE.md` and `docs/PROGRESS.md` updated to reflect what's implemented in code vs. what still needs a live project.
- **Native Apple Sign-In:** see the "Auth   native Apple Sign-In on mobile" entry above for the follow-up that closed this gap.

### Auth UI   login, signup, SSO, route guards
- New Login/Signup screens on web (`apps/web/src/screens/{Login,Signup}.tsx`) and mobile (`apps/mobile/app/{login,signup}.tsx`), both with email/password fields and Google/Apple SSO buttons, following the existing brand voice (encouraging error copy, never "Incorrect"/"Failed").
- New shared form components: `packages/ui` gained `Input`, `SSOButton`, `Divider` (web); `apps/mobile/src/components` gained the same set styled with NativeWind for native.
- New route guards: web's `RequireAuth` wraps the authenticated route group in `App.tsx`; mobile's `useAuthGate()` in `(tabs)/_layout.tsx` redirects to `/login` after onboarding. Both fail open (don't block navigation) if the backend isn't configured yet, so local dev stays usable.
- Profile screens on both apps now have a working "Sign out" action, visually aligned with the new auth screens.

### ASL reference images   placeholder removal
- Added real per-letter ASL fingerspelling reference photos (sourced from the training dataset's curated test set) to `apps/web/src/assets/asl-samples/` and `apps/mobile/assets/asl-samples/`.
- Web: new `ReferenceImage` component wired into `LessonDemo.tsx`, with a graceful emoji fallback if an image is missing.
- Mobile: `apps/mobile/app/lesson/[id]/demo.tsx` no longer shows the literal "Demonstration video placeholder" text   it now renders the real per-letter photo (with a letter picker when a lesson covers multiple letters).

### Bug fixes found during this pass
- Fixed malformed/duplicated JSON in `apps/mobile/app.json` (a `"plugins"` array was declared twice with a missing comma   would have broken Expo builds).

### Morse Code   words & staged curriculum
- Added word-level Morse logic to `@cappy/core` (`morse/words.ts`): word/phrase → per-letter patterns, full audio timelines with standard 3-unit letter gaps and 7-unit word gaps, gap classification for tap streams, and `validateWordSendAttempt` for scoring word-level sending (shared by web and mobile).
- Added the word & phrase curriculum to `@cappy/types` (`MORSE_WORD_STAGES`): two active stages (First Words, Everyday Words) and three fully-authored dormant stages (Full Alphabet Words, Short Phrases, On the Air). Dormant stages ship with the app but stay hidden behind a "coming soon" state   flip `status` to `"active"` to release one, no other change needed.
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
