# Decisions Log

## Current Architecture Decisions
- Use a Turborepo monorepo with pnpm for shared packages and app coordination.
- Use Supabase for authentication, storage, and database needs.
- Use MediaPipe for hand landmark extraction and a lightweight classifier for on-device inference.
- Build the web experience first, then port to mobile with Expo.
- Keep the MVP focused on ASL alphabet learning rather than broader translation or social features.

## Decision Records
- Web-first delivery for faster validation and easier iteration.
- Shared packages for UI, business logic, API access, and types to keep logic consistent across platforms.
- Keep ML inference on-device for privacy, latency, and lower infrastructure overhead.
- Keep documentation and product rationale explicit so the project remains understandable over time.

## Scope deviations from PROJECT_BIBLE.md

- **Morse Code module built ahead of the documented roadmap.** PROJECT_BIBLE.md places Morse Code in a future phase (after the ASL alphabet module is validated), and separately warns against expanding into Braille/Morse before the ASL learning engine is mature. The user made a deliberate, informed decision to build a Morse Code module now anyway, as a scoped UI/UX experiment — not a reversal of the roadmap's priority reasoning, but a parallel exploration run alongside continued ASL work. Tradeoff accepted: engineering time spent on a second module before the first is backend/ML-complete, in exchange for validating early that the lesson-engine architecture (curriculum types, XP/streak logic, design system) actually generalizes across accessibility systems as intended. See `docs/PROGRESS_MORSE.md` for the module's status.
- Both the ASL and Morse modules remain at the same "UI scaffold, no backend/ML" maturity — this decision did not accelerate either module past the other; it added a second module at the same stage.

## Guardrails for future decisions
- Do not expand scope without documenting the reason and tradeoff.
- Do not present assumptions as facts.
- Do not replace a decision without recording the change and the justification.
