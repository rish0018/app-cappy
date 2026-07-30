# ADR-011 — All new features validated on web before porting to mobile
Status: Accepted
Date: 2026-06

## Context
Distinct from ADR-006 (which platform launches first, overall), this ADR covers the per-feature development order once both platforms exist: where does a *new* feature get built and proven first, web or mobile?

## Options Considered
- **Build new features on mobile first** — native build/deploy cycles (Gradle, Xcode, EAS builds) are slower to iterate against than a browser reload, and mobile-specific concerns (camera permissions, native modules) add friction to early-stage feature validation.
- **Build new features on web first, port to mobile once the design/logic is proven** — bible's stated convention (§7, "Repo Principles: shared logic lives once"; reflected in the ADR-012 table entry this ADR backfills).

## Decision
New curriculum/feature work (e.g. Morse Code) is built and validated on web first; the mobile port follows once the web version's logic and UX are settled, reusing `@cappy/{types,core,api}` rather than re-deriving the logic.

## Why
Confirmed directly in `docs/CHANGELOG.md`: Morse Code shipped web-only first ("Morse Code — words & staged curriculum," "more content: punctuation, richer prosigns, a sentences stage (web only — Morse doesn't exist on mobile yet)"), then was ported to mobile as its own dedicated changelog entry ("Morse Code ported to mobile ... sharing the exact same `@cappy/core`/`@cappy/types` logic as web"). The mobile port needed new RN-native UI primitives (`MorseSequenceDisplay`, `MorseAudioPlayer`, `MorseKeyer`) but zero new business logic, because the logic layer was already proven on web.

## Consequences
- A feature is considered proven (bugs found, UX validated) on web before mobile engineering time is spent on it — reduces wasted native work on designs that might still change.
- This creates a lag: mobile is, by construction, always "one curriculum behind" web at any snapshot in time (e.g. Morse existed web-only for a period before the mobile port shipped).
