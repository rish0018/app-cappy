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

## Guardrails for future decisions
- Do not expand scope without documenting the reason and tradeoff.
- Do not present assumptions as facts.
- Do not replace a decision without recording the change and the justification.
