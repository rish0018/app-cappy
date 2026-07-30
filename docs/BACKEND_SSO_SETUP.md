# Backend & SSO Setup Runbook

**Purpose:** A concrete, step-by-step runbook for the CTO to execute **once a real Supabase project exists**. Everything referenced here (schema, RLS, seed data, `packages/api` wiring) is already built against placeholder env vars   see `docs/DB_SETUP_GUIDE.md` for what's already implemented. This doc is the remaining piece: connecting that code to a real Supabase project and configuring the two v1 social auth providers.

**Scope:** Email/password (needs no extra provider config   Supabase Auth handles it out of the box) + Google OAuth. This is "SSO" in the product sense (social login), **not** enterprise SAML/OIDC SSO   that is explicitly out of scope for v1. Apple Sign-In was considered for v1 but removed (no Apple Developer Program membership) — see `docs/DECISIONS.md`.

**Prerequisite reading:** `docs/AI_project_bible.md` §9 (Backend), `docs/DB_SETUP_GUIDE.md` (schema/RLS/seed already written), `packages/api/src/client.ts` (env var contract).

---

## 0. What already exists in the repo (nothing left to write, only to run)

- `supabase/migrations/20260716120000_init_schema.sql`   full schema (users, courses, units, lessons, exercises, user_progress, lesson_progress, letter_mastery, streaks, achievements, user_achievements, daily_activity).
- `supabase/migrations/20260716120001_rls_policies.sql`   RLS enabled on every table, `auth.uid() = user_id` baseline on user-data tables, public-read on curriculum tables.
- `supabase/seed.sql`   "ASL Alphabet" course, Group 1 (A/S/E) unit/lessons/exercises, 5 achievement rows.
- `packages/api/src/client.ts`   reads `SUPABASE_URL`/`SUPABASE_ANON_KEY` (or the Vite/Expo-prefixed equivalents) and throws a clear error if unset; no code changes needed to go live, only real env vars.
- `packages/api/src/repositories/auth.ts`   `signUp`, `signInWithPassword`, `signInWithOAuth('google')`, `signOut`, `getSession`, `onAuthStateChange`.

Everything below is dashboard/CLI configuration, not application code.

---

## 1. Provision the project

1. Create/sign in to a Supabase account at [supabase.com](https://supabase.com).
2. **New project** → pick a region close to your expected user base → note the auto-generated Postgres password somewhere safe (a password manager, not `.env`).
3. Wait for provisioning to finish (~2 min), then go to **Settings → API** and copy:
   - **Project URL** → this is `SUPABASE_URL` / `VITE_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_URL`.
   - **anon public key** → this is `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
   - Do **not** copy the `service_role` key into any app `.env`   it bypasses RLS and must never ship to a client.
4. Fill these into `.env` (root), `apps/web/.env.local`, and `apps/mobile/.env.local` per the comments in each `.env.example` file.

---

## 2. Run the migrations and seed data against the real project

**Project already provisioned (2026-07):** URL `https://cewsjfxtvhxvawsfgxpf.supabase.co`, project ref `cewsjfxtvhxvawsfgxpf`. Real values are already filled into `.env` (root), `apps/web/.env.local`, `apps/mobile/.env` (all gitignored   never commit them).

**Every time you (re)open this project on a new machine, or the CLI session expires, do this first** before running any `supabase` command:

1. Install the CLI if needed: `npm install -g supabase`.
2. **Generate a personal access token** at [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) (name it anything, e.g. "cappy-cli"). This is separate from the project's anon key and from your DB password   it authenticates *you* to the CLI, not the app to the DB. Revocable anytime from that same page.
3. Either run `supabase login` (opens a browser, pastes the token in for you), or set `export SUPABASE_ACCESS_TOKEN=<token>` in your shell for a non-interactive session.
4. Link the local repo to the hosted project: `supabase link --project-ref cewsjfxtvhxvawsfgxpf` (prompts for the database password   the one set when the project was created, resettable at Dashboard → Settings → Database if lost. **Not** the anon key, **not** the access token from step 2).
5. Push the migrations that already exist in `supabase/migrations/`: `supabase db push`. This applies `20260716120000_init_schema.sql` then `20260716120001_rls_policies.sql` in order.
6. Run the seed file. Supabase's CLI seeds automatically on `supabase db reset` for **local** dev only; for the **hosted** project, run it directly with `psql` (connection string is in Settings → Database → Connection string):
   ```bash
   psql "<connection-string-from-dashboard>" -f supabase/seed.sql
   ```
7. **Checkpoint:** Open Supabase Studio → Table Editor → confirm `courses` has one "ASL Alphabet" row, `lessons` has 3 rows under it, and `achievements` has 5 rows. Then open Authentication → Policies and confirm every user-data table shows RLS enabled with policies listed (not "No policies created yet").

---

## 3. Configure email/password auth

No provider setup needed   it's on by default. Two things worth doing before go-live:

1. **Authentication → Providers → Email**: confirm "Confirm email" is enabled if you want email verification before first login (recommended for production; can stay off during internal testing).
2. **Authentication → URL Configuration**: set **Site URL** to your production web domain (e.g. `https://cappy.app`) and add `http://localhost:5173` (Vite's default dev port) to **Redirect URLs** so local dev doesn't get rejected post-auth.

---

## 4. Configure Google OAuth

### 4a. Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create a new project (or reuse an existing org project) named e.g. "Cappy".
2. **APIs & Services → OAuth consent screen**:
   - User type: **External** (unless restricting to a Google Workspace org).
   - App name: "Cappy". Add your support email and the Cappy logo if you want it on the consent screen.
   - Scopes: default (`email`, `profile`, `openid`)   no extra scopes needed.
   - Add test users if the app is still in "Testing" publish status (required for anyone but you to sign in until you submit for verification).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application** (Supabase's OAuth flow is server-mediated even for mobile   you only ever need one Web client ID, not separate iOS/Android client IDs, because Supabase's own callback URL is what Google redirects to).
   - Name: "Cappy   Supabase Auth".
   - **Authorized redirect URIs**   add exactly this one (get the exact value from Supabase dashboard → Authentication → Providers → Google, it auto-fills a callback URL in this shape):
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
   - Save → copy the generated **Client ID** and **Client Secret**.

### 4b. Supabase dashboard

1. **Authentication → Providers → Google** → toggle enabled.
2. Paste the Client ID and Client Secret from step 4a.
3. Save.

### 4c. Redirect URIs per environment (app-side, not Google-side)

Google only needs the one Supabase callback URL above. What varies per environment is where **Supabase** redirects the user back to after that, which is controlled by the `redirectTo` option `signInWithOAuth()` accepts (see `packages/api/src/repositories/auth.ts`) and by Supabase's **Redirect URLs allow-list** (Authentication → URL Configuration → Redirect URLs). Add all of these to that allow-list:

| Environment | Redirect URL to add |
|---|---|
| Local web dev | `http://localhost:5173/**` |
| Production web | `https://<your-vercel-domain>/**` |
| Expo dev (Expo Go / auth proxy) | `https://auth.expo.io/@<your-expo-username>/cappy-mobile` |
| Expo standalone/dev-client (deep link) | `cappy://` (matches `"scheme": "cappy"` in `apps/mobile/app.json`) |

For mobile, use `expo-auth-session`'s `AuthSession.makeRedirectUri()` at runtime to generate the correct value automatically for whichever mode the app is running in (Expo Go via the auth proxy vs. a standalone/dev-client build via the `cappy://` deep link) rather than hardcoding one   pass its result as the `redirectTo` in the `signInWithOAuth('google')` call.

---

## 5. Smoke test

1. Confirm `pnpm --filter @cappy/api typecheck` still passes (no code changes should be needed for this step   only env vars and dashboard config).
2. Web: run `pnpm --filter @cappy/web dev`, attempt email/password sign-up, then Google sign-in, against the real project. Confirm a row appears in `auth.users` (Studio → Authentication → Users) and that you can call `getProfile()`/`updateProfile()` from `packages/api` afterward once a matching `public.users` row is created.
3. Mobile: run `pnpm --filter @cappy/mobile start`, repeat the same flows in Expo Go first (uses the `auth.expo.io` proxy redirect), then in a dev-client build (uses the `cappy://` deep link) to confirm both redirect paths work.
4. Confirm RLS: while signed in as user A, attempt to fetch user B's `user_progress` row via the REST API directly (Studio → API docs has a ready-made `curl` snippet)   it must come back empty, not an error and not real data.

---

## 6. Open items / known gaps

- Login/signup screens and route guards now exist on both `apps/web` and `apps/mobile` (`apps/web/src/screens/{Login,Signup}.tsx`, `apps/mobile/app/{login,signup}.tsx`, web's `RequireAuth`, mobile's `useAuthGate()`) — see `docs/PROGRESS.md` → "Product surfaces" for current state. This doc still only covers backend/provider configuration, not UI.
- Google's OAuth consent screen verification (needed once you go beyond "Testing" status with real users) takes real calendar time   start that well before a public launch date, not the week of.
- Apple Sign-In was removed from v1 scope (no Apple Developer Program membership) — see `docs/DECISIONS.md` for the reversal and what was torn out.
