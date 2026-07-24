# Progress   Cappy

**Last updated:** 2026-07-23
**Status:** Backend (schema/RLS/API wiring) and auth UI (login/signup/SSO buttons/route guards) are now implemented in code on both web and mobile, awaiting a live Supabase project + real keys to actually connect. TF.js browser integration is still pending (see §2).

**2026-07-24 update:** the visual redesign (5-letter lesson groups, themed backgrounds, achievements bookshelf) is committed. **A live Supabase project exists and is fully wired in** (project ref `cewsjfxtvhxvawsfgxpf`): schema + RLS migrations applied, seed data live, `.env`/`.env.local` files hold real project URL + publishable key, and **email/password signup → confirm → login → logout is now verified working end-to-end against the real project**. Remaining backend gap: Google/Apple OAuth providers aren't configured in the Supabase dashboard yet (auth settings show both `false`), so SSO buttons are still UI-only.

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
- **✅ Unit tests added (2026-07-24)** for the framework-agnostic logic in `packages/core`, `packages/shared`, `packages/api` using vitest (pinned to v1.6, since v4 requires vite 6+ and both apps are still on vite 5): XP/streak/letter-ordering calculations, confidence classification, Morse tap-scoring, `toDayKey`/`clamp`, `isAuthRateLimitError`, and `createSupabaseClient`'s configured/not-configured behavior. 44 tests total, all passing (`pnpm test`). UI components and app screens are not covered yet   only the pure logic layer.
- **✅ CI added (2026-07-24):** `.github/workflows/ci.yml` runs `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test` on every PR/push to `main`/`develop`. No deploy-on-merge step yet   out of scope for this pass.
- No ADRs written to `docs/adr/` yet, despite PROJECT_BIBLE §14 requiring them for decisions like this scaffold.
- `apps/training` currently only has dataset-download/inspect scripts   no actual training pipeline code.

---

## 3. Suggested Next Steps (in rough priority order)
1. Configure Google + Apple OAuth providers in the Supabase dashboard (currently deferred; email/password auth is live and verified).
2. Solve real-time hand-landmark extraction on React Native (documented, unresolved gap   model-loading is done, nothing feeds it real landmarks yet).
3. Expand test coverage beyond the pure-logic layer (component/UI tests) and write the first ADRs for decisions already made (backend choice, monorepo scaffold, lesson-group restructure).
4. Decide whether to extract `packages/ui-native` once/if a second native surface is justified.
