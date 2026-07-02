# Progress — Cappy

**Last updated:** 2026-07-02
**Status:** UI structure scaffolded across web + mobile. No backend, no ML wiring yet.

---

## 1. What's Done

### Monorepo foundation
- Turborepo + pnpm workspace set up at repo root (`package.json`, `pnpm-workspace.yaml`, `turbo.json`).
- Repo tree matches `docs/PROJECT_BIBLE.md` §7 exactly: `apps/{web,mobile,training}`, `packages/{ui,core,api,types,shared,config}`.
- `pnpm install` from root resolves cleanly across all workspace packages.

### `packages/types` — shared domain types
- `User`, `Course`, `Unit`, `Lesson`, `Exercise`, `UserProgress`, `LessonProgress`, `LetterMastery`, `Streak`, `Achievement`, `UserAchievement`, `Statistics`.
- `Letter` (A–Z union) and `LETTER_GROUPS` / `ALL_LETTERS` constants encoding the v1 curriculum letter groupings.

### `packages/ui` — web design system (React DOM + Tailwind)
- Design tokens as plain TS objects: `colors.ts`, `spacing.ts`, `typography.ts`, `radius.ts`, `motion.ts` — the single source of truth for brand identity (teal primary `#3e948c`, tan `#d9aa78`, warm neutral `#cec1ae`, navy info `#2c5f8a`, orange accent `#e8823c`, plus derived success/warning/error scales).
- `tailwind-preset.js` mirrors those tokens for consumption by both apps.
- Components: `Button`, `Card`, `ProgressBar`, `StreakBadge`, `XPBadge`, `LessonTile` (locked/active/completed), `AchievementBadge`, `MascotMoment` (mascot only renders for onboarding/milestone/mistake-explanation contexts), `ConfidenceIndicator` (high/medium/low, always color + icon + text).
- Accessibility built in: 44px min touch targets, visible focus rings, `motion-reduce` handling.
- **Scope note:** this package is web-only (React DOM). Mobile has its own parallel RN component set (see below) — no shared native UI package yet.

### `packages/core` — framework-agnostic business logic
- `HandPosePredictor` interface: `predict(landmarks: number[]) => { letter, confidence }` — the stable contract both apps will call once a real model is dropped in. Input shape matches PROJECT_BIBLE's 42-value (21 landmarks × x,y) spec.
- `classifyConfidence()` + `CONFIDENCE_THRESHOLDS` (high ≥0.90, medium ≥0.70, else low).
- XP calculation, streak calculation, and letter-group-based lesson ordering helpers.

### `packages/api` — Supabase abstraction (stub only)
- `createSupabaseClient()` placeholder documenting expected env vars (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) — not wired to a real project.
- Typed repository stubs (`courses`, `lessons`, `progress`, `achievements`) with real signatures using `@cappy/types`, currently throwing "not implemented" — establishes the "apps never talk to the DB directly" rule from day one.

### `packages/config` / `packages/shared`
- Shared `tsconfig.base.json` (strict mode) and ESLint preset.
- Small framework-agnostic utilities (`clamp`, date helpers) used by core/api.

### `apps/web` — Vite + React + Tailwind + React Router
Fully styled static-mockup screens (real layout & styling, mock data, no live backend/ML):
- Onboarding (mascot moment)
- Dashboard (streak/XP badges, continue-lesson card, weekly summary, letter mastery grid)
- Lesson List (units → lessons, locked/active/completed states)
- Lesson Demo (demonstration screen)
- Lesson Practice (camera viewport shell + `ConfidenceIndicator`, encouraging copy — never "Incorrect")
- Lesson Quiz (timed multiple-choice)
- Lesson Review (spaced repetition of weak letters)
- Achievements (badge grid + mascot milestone moment)
- Profile (stats, per-letter mastery, accessibility toggle stubs)
- Persistent, keyboard-navigable nav shell with skip-link and visible focus states.
- **Verified:** `pnpm --filter @cappy/web typecheck` and `pnpm --filter @cappy/web build` both pass cleanly.

### `apps/mobile` — Expo Router + React Native + NativeWind
Same 9 screens ported to native, mirroring web's visual language:
- `app/onboarding.tsx`, `app/(tabs)/{index,lessons,achievements,profile}.tsx`, `app/lesson/[id]/{demo,practice,quiz,review}.tsx`.
- Local RN component set (`Button`, `Card`, `ProgressBar`, `StreakBadge`, `XPBadge`, `LessonTile`, `AchievementBadge`, `MascotMoment`, `ConfidenceIndicator`) styled with NativeWind against the same shared token-derived Tailwind preset, so it visually matches web.
- Practice screen scaffolds `expo-camera`'s `CameraView` as the viewport placeholder, with a `TODO` marking exactly where `HandPosePredictor` inference plugs in later.
- Depends only on `@cappy/types`, `@cappy/core`, `@cappy/api` (not `@cappy/ui`, since that package is React DOM only).
- **Verified:** `pnpm --filter @cappy/mobile typecheck` passes cleanly.

---

## 2. What's Left

### Backend (not started)
- Real Supabase project provisioning (auth, Postgres, storage).
- Actual DB schema/migrations matching `packages/types` shapes.
- Row-Level Security policies on every user-data table.
- Wiring `packages/api` repository stubs to real Supabase calls.
- Auth flows (email/password + Google OAuth) in both apps — currently no login screen exists in either app.

### ML (explicitly deferred — you're training separately)
- Actual MediaPipe landmark extraction + classifier training (`apps/training`).
- Exporting to TF.js (web) and TFLite (mobile).
- Implementing `HandPosePredictor` for real in both apps and replacing the mocked confidence-tier cycling in `apps/mobile`'s practice screen and the static states in `apps/web`'s practice screen.
- Real camera capture → landmark → prediction pipeline (camera permission UI exists as a shell only; no `getUserMedia`/live inference wired on web, no live landmark feed on mobile).

### Product surfaces not yet built
- No login/signup screens (onboarding jumps straight into the app; no actual auth gate).
- No real routing guards (e.g. redirect unauthenticated users).
- Settings/accessibility toggles (reduced motion, text size) are stubbed — not functionally wired to a real settings store.
- No error/empty/loading states designed yet (screens assume mock data is always present).
- No responsive/tablet layout pass on web beyond default Tailwind behavior.

### Cross-cutting design system gap
- `packages/ui` (web) and `apps/mobile/src/components` (native) are two separate implementations kept visually in sync only by convention + shared tokens — there is no single shared native component package (`packages/ui-native`) yet. Low risk today (one app each), but will need consolidating if a second native surface is ever added.

### Engineering hygiene
- No unit tests written yet for any package or app (Definition of Done in PROJECT_BIBLE requires this).
- No CI/CD (GitHub Actions) configured — lint/typecheck/test-on-PR and deploy-on-merge don't exist yet.
- No ADRs written to `docs/adr/` yet, despite PROJECT_BIBLE §14 requiring them for decisions like this scaffold.
- `apps/training` currently only has dataset-download/inspect scripts — no actual training pipeline code.

---

## 3. Suggested Next Steps (in rough priority order)
1. Stand up Supabase project + schema + RLS, wire `packages/api`.
2. Build auth screens (login/signup) + route guards in both apps.
3. Once your model is trained and exported, implement `HandPosePredictor` for web (TF.js) and mobile (TFLite) and wire real camera capture.
4. Add basic unit tests + a CI workflow.
5. Decide whether to extract `packages/ui-native` once/if a second native surface is justified.
