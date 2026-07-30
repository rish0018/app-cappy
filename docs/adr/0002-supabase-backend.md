# ADR-002 — Supabase as backend
Status: Accepted
Date: 2026-06

## Context
v1 needs Postgres, auth (email/password + Google + Apple), row-level data isolation per user, and a place for the 12 core tables (`users`, `courses`, `units`, `lessons`, `exercises`, `achievements`, `user_progress`, `lesson_progress`, `letter_mastery`, `streaks`, `user_achievements`, `daily_activity` — bible §9), built and maintained by a solo developer.

## Options Considered
- **Custom Node/Express + Postgres + a chosen auth library** — full control, but auth, RLS-equivalent authorization, migrations, and type generation would all need to be built or wired by hand.
- **Firebase** — real-time and auth are strong, but no native Postgres/SQL, RLS is a different (document-security-rules) model, and relational queries across `letter_mastery`/`streaks`/`user_progress` are more natural in SQL.
- **Supabase** — Postgres + Auth + RLS + Storage + migrations + generated types, one hosted platform.

## Decision
Supabase, with every user-data table protected by RLS (`auth.uid() = user_id`), per bible §9 ("RLS on every user-data table. Never rely on frontend-only restrictions.").

## Why
Bible §9 states it directly: "PostgreSQL + Auth + RLS + Storage + Migrations + Type generation — everything v1 needs, with minimal maintenance overhead for a solo developer." SQL migrations also give a clean audit trail (`supabase/migrations/*.sql`) matching how schema changes are already tracked in this repo.

## Consequences
- All data access goes through `packages/api/src/repositories/*` — apps never construct a Supabase client or query a table directly (enforced by convention, checked in code review).
- A live project (`cewsjfxtvhxvawsfgxpf`) is now provisioned and wired end-to-end (schema + RLS applied, email/password auth verified working); Google/Apple OAuth provider configuration in the Supabase dashboard remains open (tracked separately, not part of this ADR).
- ML models are explicitly **not** stored in Supabase Storage (bible §9) — they ship with the app bundle instead, avoiding a network round-trip on the inference-critical path.
