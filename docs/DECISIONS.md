# Decisions Log

## Current Architecture Decisions
- Use a Turborepo monorepo with pnpm for shared packages and app coordination.
- Use Supabase for authentication, storage, and database needs.
- Use MediaPipe for hand landmark extraction and a lightweight classifier for on-device inference.
- Build the web experience first, then port to mobile with Expo.

## Decision Records
- Web-first delivery for faster validation.
- Shared packages for UI, business logic, API access, and types.
- Keep ML inference on-device for privacy and low latency.
