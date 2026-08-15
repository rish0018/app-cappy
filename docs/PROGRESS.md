# Progress   Cappy

**Last updated:** 2026-07-28
**Status:** Backend (schema/RLS/API wiring) and auth UI (login/signup/SSO buttons/route guards) are now implemented in code on both web and mobile, awaiting a live Supabase project + real keys to actually connect. TF.js browser integration is still pending (see §2).

**2026-07-24 update:** the visual redesign (5-letter lesson groups, themed backgrounds, achievements bookshelf) is committed. **A live Supabase project exists and is fully wired in** (project ref `cewsjfxtvhxvawsfgxpf`): schema + RLS migrations applied, seed data live, `.env`/`.env.local` files hold real project URL + publishable key, and **email/password signup → confirm → login → logout is now verified working end-to-end against the real project**. Remaining backend gap: Google/Apple OAuth providers aren't configured in the Supabase dashboard yet (auth settings show both `false`), so SSO buttons are still UI-only.

**2026-07-28 update:** Morse Code is now fully ported to mobile (previously web-only) — all 7 screens (dashboard, learn, send, receive, checkout, words, plus the levels list) built natively with real audio playback via `expo-av`, mirroring web's logic exactly. The Cappy logo's rectangular cream-canvas artifact (visible as an unwanted white/cream box behind the circular badge inside every circular mobile container) was fixed at the asset level — recropped and alpha-masked to a true transparent circle — and confirmed live on-device (splash + login screens). A creative/QA agent pass also added themed backgrounds (matching ASL's pattern) across all Morse mobile screens, fixed a real navigation bug (Practice button on the dashboard always routing to the same level regardless of which card was tapped), and fixed a `learn.tsx` → `send.tsx` id-mismatch bug. See `CHANGELOG.md` "Unreleased" for full detail.

**2026-07-28 update (adaptive review AI, tasks 1-5 of 6):** the rule-based adaptive engine described in PROJECT_BIBLE §C.5/§C.6/§M.11-M.12 is now real, not mock: (1) every practice/quiz/checkout/words screen across both curricula and both apps now writes real progress/mastery/streak data to Supabase via a new `useProgressRecorder` hook — previously every screen ran on mock data only, despite the repository layer existing since the initial backend pass; (2) a new `morse_character_mastery` table + migration extends mastery tracking to Morse's A-Z+0-9 set (send/receive accuracy tracked separately, per curriculum's existing `MorseCharacterMastery` type); (3) `packages/core` gained `recommendReviewCharacters`/`recommendNextCharacter`/`isReviewDue` — pure, no-LLM rule functions (low accuracy, stale review, unmastered-next) with full unit test coverage; (4) both dashboards now show a real "Review due" card driven by this engine instead of always showing the same hardcoded "Continue" card; (5) the end-of-unit review screen (`LessonReview`/`review.tsx`) now generates its character list from real weak-mastery data instead of the `mockReviewItems`/`mockWeakLetters` fixtures, falling back to those fixtures only when no real data exists yet. Task 6 (final cross-cutting QA pass) in progress. See `CHANGELOG.md` "Unreleased" for full detail.

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
- **Morse Code ported to mobile (2026-07-28), closing the "web only" gap:** all 7 screens now exist natively — `app/(tabs)/morse.tsx` (dashboard), `app/morse/levels/[id]/{learn,send,receive,checkout}.tsx`, `app/morse/words/[stageId].tsx` — sharing the same `@cappy/core`/`@cappy/types` Morse logic as web (pattern lookup, tap scoring, word timelines). New `src/morseMockData.ts` mirrors web's mock data; new `src/components/morse/{MorseSequenceDisplay,MorseAudioPlayer,MorseKeyer}.tsx` are the RN-native equivalents of web's Morse UI primitives, with `MorseAudioPlayer` using `expo-av` to scrub a bundled tone clip on/off per timing segment (no Web Audio API on native). All screens wrapped in themed `ImageBackground` + scrim, matching ASL's existing lesson-screen pattern.
- **Cappy logo asset fixed (2026-07-28):** the source PNG (`assets/cappy-logo.png`) was a fully-opaque rectangular canvas with the circular badge centered on a cream/off-white background — every circular-container usage in the app (login, splash, mascot moments) showed that cream box as an unwanted ring around the mascot. Fixed at the asset level: recropped to the badge's true bounding box and applied a supersampled anti-aliased circular alpha mask, so pixels outside the circle are now fully transparent. Verified both numerically (corner alpha = 0) and live on-device (splash + login screens render a clean circle with no background box).

---

## 2. What's Left

### Product surfaces
- Login/signup screens now exist on both web (`apps/web/src/screens/{Login,Signup}.tsx`) and mobile (`apps/mobile/app/{login,signup}.tsx`), with a Google SSO button (Apple removed, no Apple Developer Program membership   see `docs/DECISIONS.md`). Google OAuth is now configured and verified working end-to-end.
- Route guards now exist: web's `RequireAuth` wraps the `NavLayout` route group; mobile's `useAuthGate()` in `(tabs)/_layout.tsx` redirects to `/login`. Both **fail open** (don't block navigation) if the backend throws "not configured"   this is intentional so dev stays usable pre-launch, but means there's currently no real enforcement until a live project exists.
- Profile screens on both apps now have a working "Sign out" action.
- ASL per-letter reference photos are wired in: `apps/web/src/assets/asl-samples/` + `ReferenceImage` component (used in `LessonDemo.tsx`), `apps/mobile/assets/asl-samples/` + `aslSamples.ts` (used in mobile's lesson `demo.tsx`, replacing the old "Demonstration video placeholder" text).
- Settings/accessibility toggles (reduced motion, high contrast, text size) now persist to a real `user_settings` table (`packages/api/src/repositories/settings.ts`) via `useUserSettings()` on both apps. Web additionally makes the settings take real effect (`MotionConfig` + `data-contrast`/`data-text-size` CSS on `<html>`, see `App.tsx`/`index.css`); mobile only persists so far   no rendering effect yet beyond the splash screen respecting the OS-level reduce-motion setting.
- No error/empty/loading states designed yet (screens assume mock data is always present).
- Responsive/tablet + high-contrast CSS passes done on web (see `Feature/backend-03`).

### ML   real-time hand-landmark detection on Android
- **✅ Implemented and verified on-device (2026-07-27):** `apps/mobile/android/app/src/main/java/com/cappy/mobile/HandLandmarksFrameProcessorPlugin.kt` wraps MediaPipe Tasks Vision's `HandLandmarker` as a native `react-native-vision-camera` (v4) frame-processor plugin, feeding real 21-point landmarks into `RNHandPosePredictor` (see that file's header comment for the two real bugs fixed to get here: a YUV-vs-RGBA image-format mismatch, and a Float-vs-Double JSI marshaling error). Verified end-to-end on an Android emulator using real webcam-passthrough video (not synthetic/mock frames): `ConfidenceIndicator` on the practice screen responded live to an actual hand entering and leaving frame.
- **Not verified:** a physical Android device (only an emulator was available), and iOS entirely — no Swift equivalent of the plugin exists yet. `docs/BACKEND_SSO_SETUP.md`-style porting from the reference implementation (lukaszkurantdev/blog-hand-landmarks, which does have an iOS Swift version using the same MediaPipe HandLandmarker) is the natural next step for iOS parity.
- Chose `react-native-vision-camera` **v4**, not the latest v5 — v5 requires React Native's New Architecture (Nitro modules), which this app doesn't have enabled (`newArchEnabled=false`); v4 uses the older, well-documented `FrameProcessorPlugin`/`FrameProcessorPluginRegistry` API and matches the available reference implementation.

### Cross-cutting design system gap
- `packages/ui` (web) and `apps/mobile/src/components` (native) are two separate implementations kept visually in sync only by convention + shared tokens   there is no single shared native component package (`packages/ui-native`) yet. Low risk today (one app each), but will need consolidating if a second native surface is ever added.

### Engineering hygiene
- **✅ Unit tests added (2026-07-24)** for the framework-agnostic logic in `packages/core`, `packages/shared`, `packages/api` using vitest (pinned to v1.6, since v4 requires vite 6+ and both apps are still on vite 5): XP/streak/letter-ordering calculations, confidence classification, Morse tap-scoring, `toDayKey`/`clamp`, `isAuthRateLimitError`, and `createSupabaseClient`'s configured/not-configured behavior. 44 tests total, all passing (`pnpm test`). UI components and app screens are not covered yet   only the pure logic layer.
- **✅ CI added (2026-07-24):** `.github/workflows/ci.yml` runs `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test` on every PR/push to `main`/`develop`. No deploy-on-merge step yet   out of scope for this pass.
- No ADRs written to `docs/adr/` yet, despite PROJECT_BIBLE §14 requiring them for decisions like this scaffold.
- `apps/training` currently only has dataset-download/inspect scripts   no actual training pipeline code.

---

## 3. Suggested Next Steps (in rough priority order)
1. ~~Configure Google OAuth provider in the Supabase dashboard~~ — done (2026-07-30), verified working end-to-end.
2. Verify Android hand-landmark detection on a physical device (only an emulator was available this session), then port the same MediaPipe HandLandmarker approach to iOS (Swift) for parity.
3. Expand test coverage beyond the pure-logic layer (component/UI tests) and write the first ADRs for decisions already made (backend choice, monorepo scaffold, lesson-group restructure, vision-camera v4 over v5).
4. Decide whether to extract `packages/ui-native` once/if a second native surface is justified.
5. Build the rule-based adaptive review engine described in `PROJECT_BIBLE.md` §C.5/§C.6/§M.11–M.12 (no LLM required for v1): "what should this learner study next" using letter/character mastery, accuracy, time-since-practice, and confidence — see the "What's Missing" note below for scope and estimate.
