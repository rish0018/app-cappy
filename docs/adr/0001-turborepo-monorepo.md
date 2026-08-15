# ADR-001 — Turborepo monorepo
Status: Accepted
Date: 2026-06

## Context
Cappy ships two client apps (web, mobile) that need to share domain logic (lessons, mastery, XP, streak, ML contracts), types, and a Supabase data-access layer, per `AI_project_bible.md` §2 ("Build for Scale — architecture must support ASL, Braille, Morse, and future systems without rewrites") and §7 ("One source of truth for every piece of logic — no duplication between web/mobile").

## Options Considered
- **Separate repos per app**, sharing logic via a published npm package — extra release/versioning overhead for a solo developer, slower iteration on shared code.
- **Single repo, no workspace tooling** — apps would either duplicate logic or use fragile relative-path imports across app boundaries.
- **Turborepo + pnpm workspaces** — one repo, `workspace:*` package references, cached/parallelized task running (`build`/`typecheck`/`test`/`lint`).

## Decision
Turborepo + pnpm workspace at the repo root, with `apps/{web,mobile,training}` and `packages/{ui,core,api,types,shared,config}` (bible §7's exact structure).

## Why
Solo/small-team velocity matters more than publish-boundary discipline at this stage; a workspace monorepo gives immediate cross-package imports (`@cappy/core`, `@cappy/types`, etc.) with no publish step, while `turbo.json`'s task graph (`build`, `typecheck`, `test`, now `lint`) gives per-package caching without a separate CI matrix per app.

## Consequences
- Every new shared concept (a type, a domain function) has one obvious home (`packages/core` or `packages/types`), enforced by convention rather than tooling.
- `pnpm-workspace.yaml` + `.npmrc`'s `node-linker=hoisted` were required to make Expo/Metro's module resolution work inside a pnpm workspace (see `apps/mobile/metro.config.js`'s resolver override, documented inline).
- A future public release of any shared package (e.g. `@cappy/core` as a standalone library) would require extracting it from this workspace — not needed for v1.
