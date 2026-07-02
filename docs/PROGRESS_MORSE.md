# Progress — Morse Code Module

**Status:** Actively being built via a designer + builder + tester workflow. This doc is updated as that work lands. See `PROGRESS.md` for the overall project status and `PROJECT_BIBLE.md` for the ASL module this mirrors.

---

## 1. Plan recap

Six-level curriculum (mirrors ASL's letter-group pattern for consistency):

| Level | New letters | New digits |
|---|---|---|
| 1 | A–E | 0–4 |
| 2 | F–J | 5–9 |
| 3 | K–O | — |
| 4 | P–T | — |
| 5 | U–Z | — |
| 6 (bonus) | SOS + prosigns | — |

Each level ends in a scored checkout. Practice includes both **sending** (tap/hold key → dot/dash timing) and **receiving** (audio playback → identify the character). Morse has its own parallel type set (not coupled to ASL's `Letter`/`LetterMastery`), per an explicit decision to avoid any risk of the two modules' progress data colliding.

Per-level flow: **Learn → Calibrate (first send lesson only) → Send → Receive → Checkout → (Review, if the checkout score is below threshold)**. The Learn step (added after initial user feedback that the module "seemed like lesson plans" with nothing actually teaching the pattern first) is what makes Send/Receive an actual recall test rather than a guess — see §2 below.

## 2. What's been built so far

### Shared packages
- `packages/types/src/morse.ts` — `MorseCharacter`, `MORSE_MAP` (dot/dash per character), `MORSE_GROUPS` (the level table above), `MorseLesson`, `MorseCharacterMastery`, etc. Exported from `packages/types/src/index.ts`.
- `packages/core/src/morse/{ordering,sending,receiving}.ts`:
  - `ordering.ts` — `groupForCharacter`/`isCharacterUnlocked`/`isBonusLevelUnlocked`, the Morse-specific equivalent of the ASL ordering helpers (which are hardcoded to ASL's `LETTER_GROUPS` and aren't generic, confirmed via audit).
  - `sending.ts` — `classifyTap`/`tapsToPattern`/`validateSendAttempt`, plus `calibrateUnitMs(taps)` which averages a learner's own tap durations into a personal timing unit (replaces a guessed fixed default).
  - `receiving.ts` — `patternToAudioTimeline`/`validateReceiveAttempt`.
- `packages/ui/src/components/ConfidenceIndicator.tsx` (web) and `apps/mobile/src/components/ConfidenceIndicator.tsx` (mobile) — refactored to accept an optional copy/label override per tier, so Morse can supply its own wording ("Sent perfectly!" etc.) without duplicating the shared 0.9/0.7 confidence-tier logic.
- New shared web components (`packages/ui/src/components/`): `MorseKeyer` (tap/hold input), `MorseAudioPlayer` (Web Audio oscillator playback), `MorseSequenceDisplay` (dot/dash visual).
- `packages/core/src/morse/pattern.ts` — `describeMorsePattern(pattern)` (e.g. `".-"` → `"dot, dash"`), a small shared helper used for screen-reader text and as the plain-language caption on the new Learn screen (previously duplicated inline in `MorseSequenceDisplay`'s aria-label; now a single source of truth).

### apps/web
- Screens: `MorseDashboard`, `MorseLevelList`, `MorseLearn` (new — the actual teaching step; see below), `MorseCalibration` (one-time rhythm calibration before a learner's first Send lesson, with a skip option), `MorseSend`, `MorseReceive`, `MorseCheckout` (scores simulated attempts via the real `validateSendAttempt`/`validateReceiveAttempt` functions, requires 80% average accuracy to pass, and routes to `MorseReview` — mirroring `LessonReview.tsx` — for anything below threshold).
- Routes added under the existing `NavLayout` shell: `/morse`, `/morse/levels`, `/morse/levels/:id/{learn,calibrate,send,receive,checkout,review}`.
- New "Morse" entry in the top nav (`NavLayout.tsx`), alongside Dashboard/Lessons/Achievements/Profile.
- `apps/web/src/morseMockData.ts` — mock units/lessons/mastery built from `MORSE_GROUPS`/`MORSE_MAP`, same pattern as `mockData.ts`. Each level now generates 4 lessons (`learn`/`send`/`receive`/`checkout`), not 3.
- Verified: `pnpm --filter @cappy/web typecheck` and `build` both pass.

### apps/mobile
- New "Morse" tab (`app/(tabs)/morse.tsx` + tab-bar entry) alongside Home/Lessons/Achievements/Profile.
- New stack routes: `app/morse/[id]/{learn,calibrate,send,receive,checkout,review}.tsx`, mirroring the web screens and the existing ASL `app/lesson/[id]/*` stack-route pattern.
- Local RN components: `MorseKeyer` (animated radial hold-feedback, respects OS reduce-motion), `MorseAudioPlayer` (see audio note below), `MorseSequenceDisplay`.
- `apps/mobile/src/morseMockData.ts` mirroring the web version.
- **Audio note:** mobile has no Web Audio API equivalent. `MorseAudioPlayer` schedules playback via `setTimeout` against the same `AudioSegment[]` timeline `packages/core` produces, but since no real dot/dash tone recordings exist in the repo yet, it generates a minimal silent placeholder WAV at runtime so the scheduling/playback architecture is real and correct — actual audio is a follow-up (swap in real tone assets later; the scheduling code doesn't need to change).
- Verified: `pnpm --filter @cappy/mobile typecheck` passes.

### The Learn screen — what was actually missing (added after user feedback)

The user pointed out that the module "just seemed like lesson plans" — meaning Send/Receive asked the learner to reproduce or identify a character's pattern with nothing having taught them that pattern first. There was no equivalent of ASL's Demonstration step. Added `MorseLearn`/`learn.tsx` on both platforms:

- A new `"learn"` value on `MorseExerciseType` (`packages/types/src/morse.ts`), and a new first lesson per level (`{level}-learn`, XP 15, before send/receive/checkout — their `orderIndex` values shifted by one to make room).
- The screen steps through each new character one at a time: big glyph, `MorseSequenceDisplay` of its pattern, a "Play sound" button (`MorseAudioPlayer`) so the learner hears it before being tested on it, a plain-language caption via `describeMorsePattern` (e.g. "dot, dash"), and a short practice tip. A progress bar tracks position through the level's characters.
- The very first Learn lesson (`level-1-learn`) additionally opens with a `MascotMoment` explaining the core concept: dots and dashes, and that a dash is simply 3x a dot's duration.
- On the last character, the button becomes "Start practicing" and routes into Calibrate → Send, so the flow now genuinely teaches before it tests.
- Existing routing helpers (`pathForLesson` in `MorseLevelList.tsx`/mobile's `morse.tsx`, and the Dashboard "Continue" button) needed no changes — they already handled arbitrary exercise types generically, so `"learn"` routed correctly with zero special-casing.
- Verified: both platforms typecheck clean, web build passes, after this addition.

## 3. Bugs found and fixed during the build/test loop

1. Mobile checkout's "Continue"/"Back" buttons both routed to the same tab — fixed to distinguish next-level vs. dashboard, matching web's behavior.
2. Mobile's Send screen used different confidence-tier cutoffs (0.85/0.5) than the shared 0.9/0.7 standard — aligned.
3. Mobile's `ConfidenceIndicator` hardcoded hex colors instead of using the shared token scale — fixed to import from `packages/ui`'s tokens.
4. Checkout's mock-attempt scoring rounded in a way that let a "shaky" (50% quality) short character still score 100% — fixed (`floor` instead of `round`).
5. **Blocker:** mobile's audio player referenced `dot.mp3`/`dash.mp3` files that don't exist in the repo — since RN resolves `require()` paths at bundle time, this would have broken the mobile build. Fixed with the runtime-generated silent-placeholder approach described above.

## 4. How this fits into the existing ASL flow

### Files added vs. modified

Everything Morse-specific is additive (new files), except for a small set of pre-existing files that had to be touched to wire Morse in. Confirmed against `git status` at the time of this pass:

- **New files:** `packages/types/src/morse.ts`; `packages/core/src/morse/{ordering,sending,receiving}.ts`; `packages/ui/src/components/Morse{Keyer,AudioPlayer,SequenceDisplay}.tsx`; `apps/web/src/screens/morse/*.tsx` (7 screens); `apps/web/src/morseMockData.ts`; `apps/mobile/app/(tabs)/morse.tsx`; `apps/mobile/app/morse/[id]/*.tsx` (5 routes); `apps/mobile/src/components/Morse{Keyer,AudioPlayer,SequenceDisplay}.tsx`; `apps/mobile/src/morseMockData.ts`.
- **Modified pre-existing files (the actual integration seams):**
  - `apps/web/src/App.tsx` — added the 7 `/morse*` routes inside the existing `<NavLayout>` element alongside the ASL `/lessons/*` routes.
  - `apps/web/src/components/NavLayout.tsx` — `NAV_ITEMS` gained one `{ to: "/morse", label: "Morse" }` entry; no other change to the shell.
  - `apps/mobile/app/(tabs)/_layout.tsx` — one new `<Tabs.Screen name="morse" .../>` entry (icon: `radio`).
  - `apps/mobile/app/_layout.tsx` — the root `<Stack>` gained 5 `Stack.Screen` entries for `morse/[id]/{calibrate,send,receive,checkout,review}`, mirroring the existing `lesson/[id]/*` entries line-for-line.
  - `apps/mobile/src/components/ConfidenceIndicator.tsx` — extended with the optional `labels` override prop (see below).
  - `apps/mobile/package.json` — dependency bump/addition to support the new components (no ASL-facing behavior change).
  - Also touched post-initial-build (bug fixes, per §3): `apps/web/src/screens/morse/{MorseCheckout,MorseDashboard,MorseLevelList,MorseSend}.tsx`, `packages/core/src/morse/sending.ts`, `packages/ui/src/components/MorseKeyer.tsx` — all Morse-only files, no ASL blast radius.
  - No ASL screen, ASL route, or ASL-only component file was modified anywhere in this workflow.

### Shared components: unmodified vs. extended vs. parallel

- **Shared, unmodified:** `Button`, `Card`, `ProgressBar`, `StreakBadge`, `XPBadge`, `MascotMoment` (web and mobile) are imported and used as-is by Morse screens with no code changes.
- **Shared, extended (backward-compatible):** `ConfidenceIndicator` on both platforms gained an optional per-tier copy override, but the two platforms did it with **different, non-matching APIs** (see inconsistencies below):
  - Web (`packages/ui/src/components/ConfidenceIndicator.tsx`): takes a continuous `score: number` prop, classifies it into a tier internally (0.9/0.7 thresholds), and accepts `copy?: Partial<Record<ConfidenceTier, ConfidenceTierCopy>>` to override `{ text, icon }` per tier. Existing ASL call sites keep working because unspecified tiers/fields fall back to `DEFAULT_TIER_COPY` (the original ASL wording).
  - Mobile (`apps/mobile/src/components/ConfidenceIndicator.tsx`): takes an already-classified `tier: ConfidenceTier` prop (classification happens at the call site, not inside the component) and accepts `labels?: Partial<Record<ConfidenceTier, ConfidenceIndicatorLabelOverride>>` to override `{ label, icon }` per tier. Same backward-compatible-default pattern, different shape.
- **Morse-only parallel implementations:** `packages/core/src/morse/ordering.ts` is a full reimplementation of `packages/core/src/lessons/ordering.ts`'s `groupForLetter`/`isLetterUnlocked` logic, because the ASL version is hardcoded to `LETTER_GROUPS`/`Letter` and isn't generic over group shape — confirmed by reading both files, they're structurally identical algorithms operating on different constants (`MORSE_GROUPS`/`MorseCharacter` vs. `LETTER_GROUPS`/`Letter`). `MorseKeyer`/`MorseAudioPlayer`/`MorseSequenceDisplay` (and their mobile counterparts) have no ASL equivalent at all — they're new interaction primitives, not parallels of anything.

### Cross-platform navigation

- **Web:** top nav bar (`NavLayout`) has a "Morse" link at `/morse` alongside "Dashboard" (`/`), "Lessons" (`/lessons`), "Achievements", "Profile". From there: `/morse/levels` → `/morse/levels/:id/{calibrate,send,receive,checkout,review}`. Nothing routes between `/lessons/*` and `/morse/*` automatically — a user switches modules purely via the top nav.
- **Mobile:** bottom tab bar (`app/(tabs)/_layout.tsx`) has a "Morse" tab (radio icon) alongside Home/Lessons/Achievements/Profile. Tapping it renders `app/(tabs)/morse.tsx`, which pushes to stack routes at `/morse/:id/{calibrate,send,receive,checkout,review}` — a sibling stack to the existing `/lesson/:id/*` routes, both registered in the same root `app/_layout.tsx` `<Stack>`.
- On both platforms the two modules are fully parallel, sibling nav destinations — there is no cross-linking (e.g. no "try Morse next" prompt from the ASL dashboard or vice versa).

### XP, streak, and achievements: siloed, not unified

- **Siloed today.** Each module reads its own mock data: ASL from `apps/{web,mobile}/{src,}/mockData.ts` (`mockLetterMastery`, etc.) and Morse from `{web,mobile}/.../morseMockData.ts` (`mockMorseMastery`). There is one shared `mockUser`/`mockStreak` (in `mockData.ts`, imported directly by `NavLayout.tsx` and mobile's `morse.tsx`) that both the top-bar/tab-bar badges read from — so the *displayed* XP/streak numbers are visually unified (same badge, same source), but no lesson or checkout in either module currently calls a function that changes those numbers.
  - Confirmed by search: `calculateLessonXp`, `updateStreak`, and `calculateReviewXp` (defined in `packages/core/src/lessons/{xp,streak}.ts`) are not called anywhere under `apps/`, in either module. Both modules are still at the "static mock data" stage per §5 — XP/streak *display* is shared, but *earning* isn't wired up for either ASL or Morse yet, so there's nothing to actually diverge or collide between them today.
  - Where this would need to be decided when persistence lands: `packages/core/src/lessons/xp.ts` and `streak.ts` are generic (`LessonCompletionResult`/`StreakState` don't reference `Letter` or `MorseCharacter`), so both modules can call the same functions once real completion events exist — nothing in their signatures forces separate XP pools. The separation is currently only in the *data layer* (`MorseCharacterMastery` vs. `LetterMastery`, separate mock arrays), not in the calculation logic.

### Naming/pattern inconsistencies worth flagging (real audit, not a puff piece)

1. **`ConfidenceIndicator` prop shape diverges by platform** (see above): web takes `score` + `copy`, mobile takes `tier` + `labels`. This predates Morse (it's how the two platforms' components were already built) and was left as-is deliberately — it's a design-consistency smell, not a functional bug, and unifying it would mean reworking every ASL + Morse call site on both platforms for no behavior change. Flagged here for awareness, not fixed.
2. **File organization differs:** ASL's screens live in a flat `apps/web/src/screens/*.tsx` alongside everything else, while Morse screens were given their own `apps/web/src/screens/morse/` subfolder. Not a bug, but it means the two modules don't follow one consistent screen-organization convention within the same app.
3. **Mobile route param passing differs between the two "review" flows.** ASL's mobile stack passes review context via navigation state (implicitly, single lesson id), whereas Morse's mobile checkout passes `weakCharacters` through a URL query string (`?weakCharacters=...`) while the web version passes the same data through React Router `location.state`. So the two platforms exchange the identical "which characters were weak" payload via two structurally different mechanisms, and mobile's approach differs from how mobile ASL screens pass equivalent data.

## 5. Fixes applied after the build workflow

Three genuine issues (not just style nits) were confirmed and fixed once verified against the actual code:

1. **`masteryScore` scale mismatch — ASL only, cross-platform data-contract bug.** Confirmed via direct grep: web's ASL mock data treated `LetterMastery.masteryScore` as a 0–1 fraction while mobile's ASL mock data treated the *same shared type* as 0–100 — a bug that would silently misrender the moment both platforms read from one real backend. (Morse's own `MorseCharacterMastery.masteryScore` was already consistently 0–100 on both platforms — no bug there.) Fixed by standardizing on 0–100 (matching mobile's existing convention and Morse's), documenting the scale directly on the type (`packages/types/src/progress.ts`), and updating web's `mockData.ts`, `Dashboard.tsx`, `Profile.tsx`, and `LessonReview.tsx` accordingly.
2. **`ConfidenceIndicator` (web) duplicated confidence thresholds instead of importing the single source of truth.** `packages/ui`'s component hardcoded its own 0.9/0.7 cutoffs with a comment explaining it was "kept in sync" with `@cappy/core` manually — a real drift risk. Fixed by adding `@cappy/core` as a dependency of `packages/ui` (no circular dependency — `core` doesn't depend on `ui`) and importing `classifyConfidence` directly.
3. **Morse calibration re-ran on every Send lesson, not just the learner's first.** Flagged by the tester in round 3 of the build workflow but left unresolved (hit the round cap). Fixed with an in-memory `getMorseCalibration()`/`setMorseCalibration()` pair in both platforms' `morseMockData.ts` — once a learner calibrates (or explicitly skips), the calibration screen immediately redirects straight through to Send on any subsequent visit for the rest of the session. This is a mock-data-stage fix (resets on page reload / app restart since there's no backend yet); real persistence is still a "not yet done" item below.

Deliberately left unfixed (see inconsistency #1 above): the `ConfidenceIndicator` prop-shape divergence between platforms. It's a consistency smell, not a bug — both work correctly today, and unifying them isn't worth the blast radius until there's a concrete reason to touch both call-site sets at once.

## 6. Still open / not yet done

- Real dot/dash audio recordings for mobile (currently a silent placeholder).
- Persisting calibration (`unitMs`) per user across real sessions — currently held in memory only (see fix #3 above), which is a step better than before but still resets on reload/restart since there's no backend yet.
- Real device testing of the tap/hold keyer feel (explicitly out of scope for this pass — needs a physical phone).
- No backend/auth/persistence for Morse, same as ASL — this is still a UI/mock-data stage for both modules.
