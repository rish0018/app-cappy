# Changelog

## Unreleased
- Scaffolded the full monorepo: Turborepo + pnpm workspace, shared packages (`types`, `ui`, `core`, `api`, `shared`, `config`), and fully styled ASL-module UI mockups on both `apps/web` and `apps/mobile` (no backend/ML wiring yet).
- Added a Morse Code learning module (web + mobile) as a deliberate scope deviation ahead of the documented roadmap — see `docs/DECISIONS.md`. Six-level curriculum (A–E/0–4 through U–Z, plus a bonus prosign level), with Learn → Calibrate → Send → Receive → Checkout → Review flow.
- Added a Learn step to the Morse flow (per-character pattern + audio playback + plain-language caption) after feedback that the module tested recall without ever teaching the pattern first.
- Added a per-user tap-timing calibration step for Morse sending exercises (`calibrateUnitMs`), replacing a fixed guessed timing default.
- Fixed `MorseKeyer`'s tap/hold detection on web: switched from separate mouse/touch handlers (which cancelled a hold if the pointer drifted off the button) to the Pointer Events API with pointer capture.
- Fixed a real cross-platform bug: `LetterMastery.masteryScore` was 0–1 on web's ASL mock data but 0–100 on mobile's, for the same shared type. Standardized on 0–100 and documented the scale on the type.
- Fixed `ConfidenceIndicator` (web) duplicating its own confidence thresholds instead of importing `classifyConfidence` from `@cappy/core`.
- Fixed a Morse calibration UX bug: the calibration screen re-prompted on every Send lesson instead of only the learner's first.
- Hardened `.gitignore` for the Node/pnpm/Turborepo/Vite/Expo stack (build outputs, `.turbo/`, `.expo/`, env files, editor noise) — previously only covered the Python training pipeline and OS files.
- Expanded the documentation set to reflect the broader project bible context.
- Added a root project context file with explicit guardrails for truthful, clear documentation.
- Added documentation guidance for keeping future decisions explicit and traceable.
- Added `docs/PROGRESS.md`, `docs/PROGRESS_MORSE.md`, and `docs/GUIDE.md` to track implementation status and onboarding separately from the product spec.

## 0.1.0
- Created initial documentation structure for the monorepo.
- Added product, vision, decisions, and contributor guidance files.
