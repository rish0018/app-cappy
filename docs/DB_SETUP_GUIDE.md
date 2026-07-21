# DB Setup Guide — Supabase for Cappy

**Purpose:** A step-by-step walkthrough for provisioning the real Supabase backend and wiring it into `packages/api`. This is a **self-serve checklist for you to work through**, not something that gets auto-implemented — check items off as you go and update `docs/PROGRESS.md` when done.

> **Status update (2026-07-16):** Steps 2, 3, 4, and 6 below are now **implemented in code** — there is still no live Supabase project or real credentials, but the schema migration, RLS policies, seed data, and `packages/api` wiring all exist and are ready to run the moment a project is provisioned. See the "✅ Done in code" callouts inline below, and `docs/BACKEND_SSO_SETUP.md` for the concrete runbook to execute once a real project exists (provisioning, running these migrations against it, and configuring Google/Apple auth providers).

**Confidence this is buildable exactly as scoped below:** **90%**
The schema is already fully derived from `packages/types` (no unknowns there), and Supabase's CLI/migrations/RLS/generated-types tooling is mature. The 10% risk is entirely in getting RLS policies exactly right on the first pass and in Google OAuth redirect-URI configuration across three environments (local, web, mobile) — both are known-tricky-but-solved problems, not open research.

**Estimated effort (one person, normal work pace, ~focused hours not wall-clock days):** **~14–20 hours total.** See the per-step estimate in each section. This assumes no prior Supabase project exists yet and both apps need at least a smoke-test login flow working against it. With steps 2/3/4/6 already written, remaining effort is mostly steps 1, 5, 7, 8 — see `docs/BACKEND_SSO_SETUP.md`.

---

## 0. Before you start

- Read `docs/AI_project_bible.md` §9 (Backend) and §10 (API Layer) — this guide implements exactly what's specified there. If anything below conflicts with that doc, the doc wins and this guide needs updating.
- Read `docs/PROGRESS.md` → "What's Left → Backend" for the current stub state of `packages/api`.
- You'll be filling in real implementations behind `packages/api/src/client.ts` and `packages/api/src/repositories/*` — the function signatures already exist and are typed against `packages/types`. Don't change those signatures unless the shape in `packages/types` itself needs to change first.

---

## 1. Provision the Supabase project

**Est. time: 1–1.5 hrs**

1. Create a free account at supabase.com if you don't have one.
2. Create a new project (pick a region close to your expected users; free tier is fine for v1 per `AI_project_bible.md` §9 cost table).
3. Install the Supabase CLI locally: `npm install -g supabase` (or via your package manager of choice).
4. From the repo root, run `supabase init` — this creates a `supabase/` directory at the repo root, matching the structure already documented in `AI_project_bible.md` §7 (`supabase/ # Migrations, RLS, edge functions`).
5. Run `supabase login` and `supabase link --project-ref <your-project-ref>` to connect the local CLI to your hosted project.
6. Note down the **Project URL** and **anon public key** from Supabase's dashboard (Settings → API) — you'll need these for `.env` files in step 5.

**Checkpoint:** `supabase status` (with local dev stack running) or the dashboard shows a healthy project with no tables yet.

---

## 2. Write the schema migration

**Est. time: 3–4 hrs** — **✅ Done in code.** `supabase/migrations/20260716120000_init_schema.sql` implements every table below (hand-written since no Supabase CLI was available in the build environment; matches the structure `supabase migration new init_schema` would produce). Not yet applied to any live project — run `supabase db push` once one exists (see `docs/BACKEND_SSO_SETUP.md` §2).

Create your first migration: `supabase migration new init_schema`. This drops a timestamped `.sql` file under `supabase/migrations/`. Write the schema to match `packages/types` **exactly** — every field below maps 1:1 to a TS interface, so cross-check as you go instead of retyping from memory.

Tables to create (snake_case columns; TS layer camelCases them):

| Table | Source type | Notes |
|---|---|---|
| `users` | `User` (`packages/types/src/user.ts`) | Supabase Auth already gives you `auth.users`; this is your **public profile** table (`id` FK → `auth.users.id`), holding `email`, `display_name`, `created_at`, `total_xp`. |
| `courses` | `Course` (`curriculum.ts`) | `id`, `title`, `description`, `order_index`. |
| `units` | `Unit` | `id`, `course_id` FK, `title`, `order_index`, `description`. |
| `lessons` | `Lesson` | `id`, `unit_id` FK, `title`, `description`, `lesson_type` (enum matching `LessonType`), `difficulty`, `estimated_minutes`, `xp_reward`, `order_index`. |
| `exercises` | `Exercise` | `id`, `lesson_id` FK, `exercise_type` (enum matching `ExerciseType`), `content` (jsonb), `difficulty`, `order_index`. |
| `user_progress` | `UserProgress` (`progress.ts`) | `user_id` FK, `lesson_id` FK, `status` (enum: not-started/in-progress/completed), `attempts`, `completion_percentage`, `score`, `started_at`, `completed_at`. Composite PK `(user_id, lesson_id)`. |
| `lesson_progress` | `LessonProgress` | `user_id` FK, `lesson_id` FK, `exercises_completed`, `exercises_total`, `accuracy`. Composite PK `(user_id, lesson_id)`. |
| `letter_mastery` | `LetterMastery` | `user_id` FK, `letter` (single-char, constrained to A–Z), `mastery_score`, `last_practiced`, `accuracy`, `avg_confidence`, `practice_count`. Composite PK `(user_id, letter)`. This is the adaptive-learning table — see `AI_project_bible.md` §9. |
| `streaks` | `Streak` | `user_id` PK/FK, `current_streak`, `longest_streak`, `last_active_date`. |
| `achievements` | `Achievement` | `id`, `name`, `description`, `icon`. Curriculum-style reference table, not per-user. |
| `user_achievements` | `UserAchievement` | `user_id` FK, `achievement_id` FK, `unlocked_at`. Composite PK. |
| `daily_activity` / `statistics` | `Statistics` | `user_id` FK, `date`, `minutes`, `lessons_completed`, `letters_practiced`, `xp_earned`. Composite PK `(user_id, date)`. |

Rules to bake into the migration (per `AI_project_bible.md` §9 "Key Rules"):
- Every FK to `users`/`auth.users` cascades on delete (user deletes their account → their data goes with it).
- Curriculum tables (`courses`, `units`, `lessons`, `exercises`, `achievements`) are separate from user-progress tables — never conflate the two, this is explicitly called out so curriculum updates don't corrupt progress data.
- Add indexes on every FK column and on `(user_id)` columns used for dashboard queries (`user_progress`, `letter_mastery`, `daily_activity`).

**Checkpoint:** `supabase db reset` (local) applies cleanly with no errors; tables visible in Supabase Studio.

---

## 3. Row-Level Security (RLS)

**Est. time: 3–4 hrs** (this is where the 10% risk lives — budget extra time for testing policies, not just writing them) — **✅ Policies written in code** in `supabase/migrations/20260716120001_rls_policies.sql`. **Still needs real-project testing** (the "budget extra time for testing" part below) once a project exists — policy *logic* is done, policy *verification against live data* is not.

Per `AI_project_bible.md` §9: **RLS on every user-data table, no exceptions, never rely on frontend restrictions.**

- Enable RLS on: `users`, `user_progress`, `lesson_progress`, `letter_mastery`, `streaks`, `user_achievements`, `daily_activity`.
- Baseline policy shape for each: `auth.uid() = user_id` for `SELECT`/`INSERT`/`UPDATE`/`DELETE`. Users only ever see/touch their own rows.
- Curriculum tables (`courses`, `units`, `lessons`, `exercises`, `achievements`) are public-read, no-write-from-client (writes only via service role / dashboard / seed scripts). Enable RLS with a permissive `SELECT` policy and no client-facing write policy.
- Test each policy from the Supabase Studio "RLS policy tester" or by hitting the REST API as an anon/authenticated user before writing any app code against it — catching a bad policy here is far cheaper than catching it after `packages/api` is wired up.

**Checkpoint:** As an authenticated test user, you can read/write your own rows but a `curl`/Studio test as a *different* user's JWT gets rejected on every user-data table.

---

## 4. Seed data

**Est. time: 1 hr** — **✅ Done in code.** `supabase/seed.sql` seeds the "ASL Alphabet" course, a Group 1 (A/S/E) unit with observe/perform/recall lessons and their exercises, and 5 achievement rows. Idempotent via explicit UUIDs + `on conflict do nothing`. Run it against a real project per `docs/BACKEND_SSO_SETUP.md` §2.

Write a `supabase/seed.sql` (or a seed script under `scripts/`) that inserts:
- The Phase-1 curriculum: one `course` ("ASL Alphabet"), its `units`, and `lessons`/`exercises` for at least the first letter group (`A, S, E` per `AI_project_bible.md` §12) so you have something real to develop the app screens against.
- A handful of `achievements` rows (first lesson complete, 7-day streak, etc. — "meaningful milestones only" per the bible).

**Checkpoint:** `supabase db reset` seeds automatically; Studio shows real curriculum rows, not empty tables.

---

## 5. Environment variables

**Est. time: 0.5 hr** — **✅ `.env.example` files done in code** (root, `apps/web/.env.example`, `apps/mobile/.env.example`), documenting exactly these variable names. **Still needed:** the real `.env`/`.env.local` files with actual values, which can only exist once step 1 gives you a real project — these are gitignored on purpose (see `.gitignore`).

Per `docs/GUIDE.md` §6 (already stubbed, waiting on this work):

- Add a root-level `.env` (gitignored) with `SUPABASE_URL` and `SUPABASE_ANON_KEY` from step 1. See `.env.example` for the exact shape.
- Web (`apps/web`): expose via Vite's `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — add an `.env.local` in `apps/web` (see `apps/web/.env.example`).
- Mobile (`apps/mobile`): expose via Expo's `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` convention (see `apps/mobile/.env.example`).
- Once done, come back and update `docs/GUIDE.md` §6 with the final variable names/locations — it currently has a placeholder note pointing here.

---

## 6. Wire `packages/api`

**Est. time: 4–5 hrs** — **✅ Done in code.** All four sub-steps below are implemented:

1. ✅ `@supabase/supabase-js` is a real dependency of `packages/api` (`package.json`).
2. ✅ `createSupabaseClient()` in `packages/api/src/client.ts` reads `SUPABASE_URL`/`SUPABASE_ANON_KEY` (root), `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (web), or `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` (mobile) — whichever is present — and throws a clear "Supabase not configured yet" error at **call** time (not import time) if none are set. It remains the only place a client is constructed.
3. ✅ Every repository in `packages/api/src/repositories/` (`courses.ts`, `lessons.ts`, `progress.ts`, `achievements.ts`) is implemented against the real client, mapping snake_case rows to the camelCase `packages/types` shapes. Two new repositories were also added: `auth.ts` (`signUp`, `signInWithPassword`, `signInWithOAuth`, `signOut`, `getSession`, `onAuthStateChange`) and `profile.ts` (`getProfile`, `updateProfile`).
4. ✅ `apps/web`/`apps/mobile` still don't import `@supabase/supabase-js` directly — unchanged, everything goes through `packages/api`.

**Checkpoint (still pending — needs a real project):** A small script or temporary test in `packages/api` can fetch the seeded course/lesson list and get real data back, fully typed. The code is ready; there's just nothing live to call yet.

---

## 7. Auth flows

**Est. time: 2–3 hrs** (screens + route guards; OAuth redirect config is the fiddly part)

**v1 providers, per a later CTO decision superseding the Google-only note in `AI_project_bible.md` §9: email/password + Google OAuth + Apple Sign-In.** ("SSO" here means these two social providers only — no enterprise SAML/OIDC.)

- ✅ `packages/api/src/repositories/auth.ts` is implemented against the real client (`signUp`, `signInWithPassword`, `signInWithOAuth('google' | 'apple')`, `signOut`, `getSession`, `onAuthStateChange`). Native Apple Sign-In (`expo-apple-authentication` + `signInWithIdToken`) is **not yet implemented** — see `docs/BACKEND_SSO_SETUP.md` §5c for why iOS needs it and what to add.
- **Still to do (needs a real project + dashboard access):** configure the Google and Apple providers in the Supabase dashboard, set up redirect URIs for web (Vercel domain + localhost) and mobile (Expo auth proxy + `cappy://` deep link). **Full concrete step-by-step for both providers now lives in `docs/BACKEND_SSO_SETUP.md`** — this section used to have the how-to inline; it's been extracted there since it's a CTO-executed runbook, not implementation work.
- **Still to do (product surface, not backend):** build minimal login/signup screens in both apps (currently absent — see `docs/PROGRESS.md` → "Product surfaces not yet built") and a route guard that redirects unauthenticated users.

**Checkpoint:** You can sign up, log in, log out, and hit a route guard on both web and mobile against the real project. See `docs/BACKEND_SSO_SETUP.md` §6 for the full smoke-test checklist.

---

## 8. Smoke test + wrap-up

**Est. time: 1 hr**

- Confirm `pnpm --filter @cappy/web build` and `pnpm --filter @cappy/mobile typecheck` still pass with the real client wired in.
- Manually walk through: sign up → see seeded lesson list → mark a lesson in-progress → confirm the row appears correctly in Supabase Studio, respecting RLS.
- Update `docs/PROGRESS.md` (mark backend items in "What's Left" as done) and `docs/GUIDE.md` §6 (real env var instructions) once this guide is fully worked through.
- If you deviated from any decision in `AI_project_bible.md` §9/§10 while doing this (e.g. table naming, extra indexes, a different RLS shape), add a note there or a new ADR per §14 — don't let the schema silently drift from the spec doc.

---

## Total estimate

| Step | Hours |
|---|---|
| 1. Provision project | 1–1.5 |
| 2. Schema migration | 3–4 |
| 3. RLS policies | 3–4 |
| 4. Seed data | 1 |
| 5. Env vars | 0.5 |
| 6. Wire `packages/api` | 4–5 |
| 7. Auth flows | 2–3 |
| 8. Smoke test + docs | 1 |
| **Total** | **~14–20 hrs** |

This is focused implementation time for one person already familiar with this codebase (which you are) — spread across however many sessions makes sense; nothing here requires a single unbroken sitting.
