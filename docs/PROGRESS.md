# Progress   Cappy

**Last updated:** 2026-07-17
**Status:** Backend (schema/RLS/API wiring) and auth UI (login/signup/SSO buttons/route guards) are now implemented in code on both web and mobile, awaiting a live Supabase project + real keys to actually connect. TF.js browser integration is still pending (see §2).

---

## 1. What's Done

### Monorepo foundation
- Turborepo + pnpm workspace set up at repo root (`package.json`, `pnpm-workspace.yaml`, `turbo.json`).
- Repo tree matches `docs/PROJECT_BIBLE.md` §7 exactly: `apps/{web,mobile,training}`, `packages/{ui,core,api,types,shared,config}`.
- `pnpm install` from root resolves cleanly across all workspace packages.

### `packages/types`   shared domain types
- `User`, `Course`, `Unit`, `Lesson`, `Exercise`, `UserProgress`, `LessonProgress`, `LetterMastery`, `Streak`, `Achievement`, `UserAchievement`, `Statistics`.
- `Letter` (A–Z union) and `LETTER_GROUPS` / `ALL_LETTERS` constants encoding the v1 curriculum letter groupings.

### `packages/ui`   web design system (React DOM + Tailwind)
- Design tokens as plain TS objects: `colors.ts`, `spacing.ts`, `typography.ts`, `radius.ts`, `motion.ts`   the single source of truth for brand identity (teal primary `#3e948c`, tan `#d9aa78`, warm neutral `#cec1ae`, navy info `#2c5f8a`, orange accent `#e8823c`, plus derived success/warning/error scales).
- `tailwind-preset.js` mirrors those tokens for consumption by both apps.
- Components: `Button`, `Card`, `ProgressBar`, `StreakBadge`, `XPBadge`, `LessonTile` (locked/active/completed), `AchievementBadge`, `MascotMoment` (mascot only renders for onboarding/milestone/mistake-explanation contexts), `ConfidenceIndicator` (high/medium/low, always color + icon + text).
- Accessibility built in: 44px min touch targets, visible focus rings, `motion-reduce` handling.
- **Scope note:** this package is web-only (React DOM). Mobile has its own parallel RN component set (see below)   no shared native UI package yet.

### `packages/core`   framework-agnostic business logic
- `HandPosePredictor` interface: `predict(landmarks: number[]) => { letter, confidence }`   the stable contract both apps will call once a real model is dropped in. Input shape matches PROJECT_BIBLE's 42-value (21 landmarks × x,y) spec.
- `classifyConfidence()` + `CONFIDENCE_THRESHOLDS` (high ≥0.90, medium ≥0.70, else low).
- XP calculation, streak calculation, and letter-group-based lesson ordering helpers.

### `packages/api`   Supabase abstraction (stub only)
- `createSupabaseClient()` placeholder documenting expected env vars (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)   not wired to a real project.
- Typed repository stubs (`courses`, `lessons`, `progress`, `achievements`) with real signatures using `@cappy/types`, currently throwing "not implemented"   establishes the "apps never talk to the DB directly" rule from day one.

### `packages/config` / `packages/shared`
- Shared `tsconfig.base.json` (strict mode) and ESLint preset.
- Small framework-agnostic utilities (`clamp`, date helpers) used by core/api.

### `apps/web`   Vite + React + Tailwind + React Router
Fully styled static-mockup screens (real layout & styling, mock data, no live backend/ML):
- Onboarding (mascot moment)
- Dashboard (streak/XP badges, continue-lesson card, weekly summary, letter mastery grid)
- Lesson List (units → lessons, locked/active/completed states)
- Lesson Demo (demonstration screen)
- Lesson Practice (camera viewport shell + `ConfidenceIndicator`, encouraging copy   never "Incorrect")
- Lesson Quiz (timed multiple-choice)
- Lesson Review (spaced repetition of weak letters)
- Achievements (badge grid + mascot milestone moment)
- Profile (stats, per-letter mastery, accessibility toggle stubs)
- Persistent, keyboard-navigable nav shell with skip-link and visible focus states.
- **Verified:** `pnpm --filter @cappy/web typecheck` and `pnpm --filter @cappy/web build` both pass cleanly.

### `apps/mobile`   Expo Router + React Native + NativeWind
Same 9 screens ported to native, mirroring web's visual language:
- `app/onboarding.tsx`, `app/(tabs)/{index,lessons,achievements,profile}.tsx`, `app/lesson/[id]/{demo,practice,quiz,review}.tsx`.
- Local RN component set (`Button`, `Card`, `ProgressBar`, `StreakBadge`, `XPBadge`, `LessonTile`, `AchievementBadge`, `MascotMoment`, `ConfidenceIndicator`) styled with NativeWind against the same shared token-derived Tailwind preset, so it visually matches web.
- Practice screen scaffolds `expo-camera`'s `CameraView` as the viewport placeholder, with a `TODO` marking exactly where `HandPosePredictor` inference plugs in later.
- Depends only on `@cappy/types`, `@cappy/core`, `@cappy/api` (not `@cappy/ui`, since that package is React DOM only).
- **Verified:** `pnpm --filter @cappy/mobile typecheck` passes cleanly.
- **Verified (2026-07-03):** `expo run:android` builds and runs the dev-client successfully on an emulator, following the fixes documented in `docs/GUIDE.md` §9 (pnpm `node-linker=hoisted`, pinned `expo-constants`/`expo-linking`, Metro config adjustments). New real app icon/splash/adaptive-icon assets and a real logo mark are now wired in (`app.json`, `app/_layout.tsx`), replacing placeholders.

---

## 2. What's Left

### Backend (schema/RLS/API code complete, no live project yet)
- `supabase/migrations/`   full schema (users, courses, units, lessons, exercises, user_progress, lesson_progress, letter_mastery, streaks, achievements, user_achievements, daily_activity) + RLS policies (`auth.uid() = user_id` baseline on user-data tables, public-read on curriculum tables). `supabase/seed.sql` seeds the ASL Alphabet course + A/S/E unit + achievements.
- `packages/api` now has a real `createSupabaseClient()` and real repository implementations (courses/lessons/progress/achievements/auth/profile)   no more "not implemented" throws. Reads env vars from root/Vite/Expo conventions; throws a clear "not configured" error at call time until real keys exist.
- `packages/types/src/auth.ts`   `AuthUser`, `Session`, `LoginCredentials`, `SignupCredentials`, `OAuthProvider` ('google' | 'apple').
- **Still needed:** a real Supabase project + keys (`.env.example` files show exactly what's expected), then run the migrations/seed against it. See `docs/BACKEND_SSO_SETUP.md` for the full runbook (Google + Apple OAuth provider setup, redirect URIs) and `docs/DB_SETUP_GUIDE.md` for the original step-by-step plan (now annotated with what's done in code vs. what needs the live project).
- **Closed (2026-07-21):** native Apple Sign-In (`expo-apple-authentication` + `signInWithIdToken`) is now implemented on mobile   `packages/api`'s `signInWithAppleIdToken`, both sign-in screens branch to the native flow on iOS. Typechecked; not yet run on a real device/simulator (no Apple ID in the dev environment). See `docs/BACKEND_SSO_SETUP.md` §5c.

### ML   landmark extraction, training, and web integration complete; mobile model-loading done, landmark detection still a gap
- Landmark extraction, normalization, and model training all re-run for real (the previously reported artifacts weren't actually on disk   see `docs/CHANGELOG.md`). Random Forest baseline: 98.7% accuracy. Keras MLP (for TF.js export, since RF can't convert directly): 98.8% accuracy.
- `apps/training/exports/tensorflowjs/` has the real exported model; `apps/web/src/ml/` implements `HandPosePredictor` for real using it, replacing the mocked confidence-tier cycling and camera shell in `apps/web/src/screens/LessonPractice.tsx` with a live `getUserMedia` feed + MediaPipe `HandLandmarker` + TF.js inference.
- **Mobile, done (2026-07-21):** `apps/mobile/src/ml/rnPredictor.ts`'s `RNHandPosePredictor` implements the model-loading + inference half of `HandPosePredictor` for real   `@tensorflow/tfjs-react-native` + `expo-gl` load the same exported model (copied into `apps/mobile/assets/ml/asl-alphabet/`, bundled via `bundleResourceIO`/`require()` since RN has no static file server for local assets), and normalization/standardization is ported verbatim from `apps/web/src/ml/tfjsPredictor.ts`. Typechecks; confirmed `bundleResourceIO` exists in the installed `@tensorflow/tfjs-react-native` types. **Not run on-device**   no simulator/device available in this environment to confirm the model actually loads and infers at runtime.
- **Mobile, still a real gap:** nothing produces the `HandLandmarks` (63-number MediaPipe-shaped) input that `RNHandPosePredictor.predict()` needs. The web pipeline's landmark source (`@mediapipe/tasks-vision`, WASM + browser canvas) has no direct RN equivalent; no maintained `react-native-vision-camera` frame-processor plugin providing MediaPipe-equivalent hand landmarks was found this session, and a WASM-in-WebView bridge was considered but not attempted (unverifiable without a device, likely poor real-time latency). `apps/mobile/app/lesson/[id]/practice.tsx` still shows the mock confidence-tier cycler   this is an honest gap, not wired to anything real yet. TFLite export for mobile also still not done.
- Webcam testing (`apps/training/scripts/webcam_test.py`) exists but wasn't re-verified against the freshly retrained model in this pass.

### Product surfaces
- Login/signup screens now exist on both web (`apps/web/src/screens/{Login,Signup}.tsx`) and mobile (`apps/mobile/app/{login,signup}.tsx`), with Google/Apple SSO buttons (UI only   SSO wiring depends on a live Supabase project, see Backend above).
- Route guards now exist: web's `RequireAuth` wraps the `NavLayout` route group; mobile's `useAuthGate()` in `(tabs)/_layout.tsx` redirects to `/login`. Both **fail open** (don't block navigation) if the backend throws "not configured"   this is intentional so dev stays usable pre-launch, but means there's currently no real enforcement until a live project exists.
- Profile screens on both apps now have a working "Sign out" action.
- ASL per-letter reference photos are wired in: `apps/web/src/assets/asl-samples/` + `ReferenceImage` component (used in `LessonDemo.tsx`), `apps/mobile/assets/asl-samples/` + `aslSamples.ts` (used in mobile's lesson `demo.tsx`, replacing the old "Demonstration video placeholder" text).
- Settings/accessibility toggles (reduced motion, text size) are stubbed   not functionally wired to a real settings store.
- No error/empty/loading states designed yet (screens assume mock data is always present).
- No responsive/tablet layout pass on web beyond default Tailwind behavior.

### Cross-cutting design system gap
- `packages/ui` (web) and `apps/mobile/src/components` (native) are two separate implementations kept visually in sync only by convention + shared tokens   there is no single shared native component package (`packages/ui-native`) yet. Low risk today (one app each), but will need consolidating if a second native surface is ever added.

### Engineering hygiene
- No unit tests written yet for any package or app (Definition of Done in PROJECT_BIBLE requires this).
- No CI/CD (GitHub Actions) configured   lint/typecheck/test-on-PR and deploy-on-merge don't exist yet.
- No ADRs written to `docs/adr/` yet, despite PROJECT_BIBLE §14 requiring them for decisions like this scaffold.
- `apps/training` currently only has dataset-download/inspect scripts   no actual training pipeline code.

---

## 3. Suggested Next Steps (in rough priority order)
1. Stand up Supabase project + schema + RLS, wire `packages/api`.
2. Build auth screens (login/signup) + route guards in both apps.
3. Once your model is trained and exported, implement `HandPosePredictor` for web (TF.js) and mobile (TFLite) and wire real camera capture.
4. Add basic unit tests + a CI workflow.
5. Decide whether to extract `packages/ui-native` once/if a second native surface is justified.
