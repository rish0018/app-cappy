# ADR-006 — Web-first deployment, mobile follows
Status: Accepted
Date: 2026-06

## Context
Bible §16 (Implementation Order) sequences the build: monorepo → Supabase → ML training pipeline → React web app (auth → lessons → camera validation → progress) → deploy continuously to Vercel → test with real users → iterate → *then* port to Expo mobile, reusing shared packages.

## Options Considered
- **Mobile-first** — native camera/ML integration is harder to iterate on (build/deploy cycle, device testing) than a browser reload; would slow down early product validation.
- **Both platforms in lockstep from day one** — doubles the surface area for every early iteration, when the product direction is least settled.
- **Web-first, mobile ports proven features** — bible §16's order.

## Decision
Build and validate every new feature on web first; port to mobile once proven (this is also ADR-011's decision, tracked separately for the *within-a-feature* development-order rule — this ADR covers the *platform launch* order).

## Why
Web's tighter iteration loop (instant reload, browser devtools, no app-store/build friction) makes it the cheaper place to find product-level mistakes before investing native-specific engineering (MediaPipe frame processors, Expo build config) into a feature that might change.

## Consequences
- `apps/mobile` mirrors `apps/web`'s screens once they're validated (`docs/PROGRESS.md`: Morse Code shipped web-first, ported to mobile later; ASL screens followed the same order originally).
- Both apps depend on the same `@cappy/{types,core,api}` packages, so the port work is mostly UI, not logic — confirmed by `apps/mobile`'s `package.json` depending only on those three, not on any web-specific package.
