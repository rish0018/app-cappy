# ADR-012 — Single cross-platform design system
Status: Accepted (partially implemented — see Consequences)
Date: 2026-06

## Context
Bible §11 (Design System) and §2's "Consistency — users should feel one product across all modules and platforms" call for one design language (colors, spacing, typography, motion, component behavior) shared across web and mobile, not two products that happen to have the same name.

## Options Considered
- **Fully shared native-capable component package** (e.g. React Native Web, or a components library built mobile-first and rendered on web too) — one implementation, but bigger upfront investment and less idiomatic per-platform code (web gets RN-shaped components instead of real DOM/Tailwind).
- **Shared design tokens, separate platform component implementations** — `packages/ui` (web, React DOM + Tailwind) and a parallel native component set in `apps/mobile/src/components` (NativeWind), both consuming the same token source (`tailwind-preset.js` derived from `packages/ui`'s `colors.ts`/`spacing.ts`/etc.).
- **No shared design system at all** — two apps evolve independently; ruled out immediately by bible §2.

## Decision
Shared design tokens (colors, spacing, typography, radius, motion) as the single source of truth, consumed by two separate, platform-idiomatic component implementations — not a single shared component package.

## Why
Bible §11 defines the tokens as "the single source of truth for brand identity"; it does not mandate a single component *implementation*, and a real shared native+web component package is a bigger, riskier investment than the current one-app-each usage justifies.

## Consequences
- **This is a real, acknowledged gap against the "single design system" framing**, not fully implemented: `packages/ui` (web) and `apps/mobile/src/components` (native) are two separate component implementations kept visually in sync only by convention + shared tokens — there is no `packages/ui-native` package. `docs/PROGRESS.md` itself calls this "low risk today (one app each), but will need consolidating if a second native surface is ever added" — flagged here rather than papered over, since the bible's language ("single design system") reads stronger than what's actually built.
- If a second native surface is ever justified, extracting `packages/ui-native` (or unifying via React Native Web) should get its own ADR at that point — not decided now.
