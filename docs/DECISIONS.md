# Decisions Log

## Current Architecture Decisions
- Use a Turborepo monorepo with pnpm for shared packages and app coordination.
- Use Supabase for authentication, storage, and database needs.
- Use MediaPipe for hand landmark extraction and a lightweight classifier for on-device inference.
- Normalize landmarks by wrist-relative translation and max-distance scaling before training and inference so the model sees the same feature distribution in both contexts.
- Use a top-5 acceptance policy for lesson practice so ambiguous letter pairs can be accepted as close matches rather than rejected too aggressively.
- Build the web experience first, then port to mobile with Expo.
- Keep the MVP focused on ASL alphabet learning rather than broader translation or social features.

## Decision Records
- Web-first delivery for faster validation and easier iteration.
- Shared packages for UI, business logic, API access, and types to keep logic consistent across platforms.
- Keep ML inference on-device for privacy, latency, and lower infrastructure overhead.
- Keep documentation and product rationale explicit so the project remains understandable over time.
- **2026-07-17   Apple Sign-In pulled into v1 auth** (was previously listed as "Future" in `docs/AI_project_bible.md` §9). CTO decision: the login UI should support SSO from launch, specifically Google + Apple. Backend contract (`packages/api`'s `signInWithOAuth`, `packages/types`'s `OAuthProvider`) and both apps' login/signup UI now include Apple alongside Google. **Update (2026-07-21):** native Apple Sign-In on mobile is now implemented   `expo-apple-authentication` installed, `signInWithAppleIdToken` added to `packages/api`, both sign-in screens branch to the native flow on iOS. Typechecked but not yet verified on a real device/simulator (no Apple ID available in the dev environment); nonce hardening (SHA-256 hashed nonce round-trip) also still open. See `docs/BACKEND_SSO_SETUP.md` §5c for details.
- **2026-07-17   Backend/API code built against placeholder env vars, no live Supabase project yet.** Schema migrations, RLS policies, seed data, and `packages/api`'s real repository implementations are all written and typecheck clean, but nothing has been run against an actual Supabase instance. `createSupabaseClient()` throws a clear "not configured" error at call time; both apps' route guards fail open on that error so local dev stays usable. See `docs/BACKEND_SSO_SETUP.md` and `docs/DB_SETUP_GUIDE.md` for what's left once a real project exists.

## Guardrails for future decisions
- Do not expand scope without documenting the reason and tradeoff.
- Do not present assumptions as facts.
- Do not replace a decision without recording the change and the justification.
