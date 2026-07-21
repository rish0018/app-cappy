# Backend & SSO Setup Runbook

**Purpose:** A concrete, step-by-step runbook for the CTO to execute **once a real Supabase project exists**. Everything referenced here (schema, RLS, seed data, `packages/api` wiring) is already built against placeholder env vars — see `docs/DB_SETUP_GUIDE.md` for what's already implemented. This doc is the remaining piece: connecting that code to a real Supabase project and configuring the two v1 social auth providers.

**Scope:** Email/password (needs no extra provider config — Supabase Auth handles it out of the box) + Google OAuth + Apple Sign-In. This is "SSO" in the product sense (social login), **not** enterprise SAML/OIDC SSO — that is explicitly out of scope for v1.

**Prerequisite reading:** `docs/AI_project_bible.md` §9 (Backend), `docs/DB_SETUP_GUIDE.md` (schema/RLS/seed already written), `packages/api/src/client.ts` (env var contract).

---

## 0. What already exists in the repo (nothing left to write, only to run)

- `supabase/migrations/20260716120000_init_schema.sql` — full schema (users, courses, units, lessons, exercises, user_progress, lesson_progress, letter_mastery, streaks, achievements, user_achievements, daily_activity).
- `supabase/migrations/20260716120001_rls_policies.sql` — RLS enabled on every table, `auth.uid() = user_id` baseline on user-data tables, public-read on curriculum tables.
- `supabase/seed.sql` — "ASL Alphabet" course, Group 1 (A/S/E) unit/lessons/exercises, 5 achievement rows.
- `packages/api/src/client.ts` — reads `SUPABASE_URL`/`SUPABASE_ANON_KEY` (or the Vite/Expo-prefixed equivalents) and throws a clear error if unset; no code changes needed to go live, only real env vars.
- `packages/api/src/repositories/auth.ts` — `signUp`, `signInWithPassword`, `signInWithOAuth('google' | 'apple')`, `signOut`, `getSession`, `onAuthStateChange`.

Everything below is dashboard/CLI configuration, not application code.

---

## 1. Provision the project

1. Create/sign in to a Supabase account at [supabase.com](https://supabase.com).
2. **New project** → pick a region close to your expected user base → note the auto-generated Postgres password somewhere safe (a password manager, not `.env`).
3. Wait for provisioning to finish (~2 min), then go to **Settings → API** and copy:
   - **Project URL** → this is `SUPABASE_URL` / `VITE_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_URL`.
   - **anon public key** → this is `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
   - Do **not** copy the `service_role` key into any app `.env` — it bypasses RLS and must never ship to a client.
4. Fill these into `.env` (root), `apps/web/.env.local`, and `apps/mobile/.env.local` per the comments in each `.env.example` file.

---

## 2. Run the migrations and seed data against the real project

**Project already provisioned (2026-07):** URL `https://cewsjfxtvhxvawsfgxpf.supabase.co`, project ref `cewsjfxtvhxvawsfgxpf`. Real values are already filled into `.env` (root), `apps/web/.env.local`, `apps/mobile/.env` (all gitignored — never commit them).

**Every time you (re)open this project on a new machine, or the CLI session expires, do this first** before running any `supabase` command:

1. Install the CLI if needed: `npm install -g supabase`.
2. **Generate a personal access token** at [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) (name it anything, e.g. "cappy-cli"). This is separate from the project's anon key and from your DB password — it authenticates *you* to the CLI, not the app to the DB. Revocable anytime from that same page.
3. Either run `supabase login` (opens a browser, pastes the token in for you), or set `export SUPABASE_ACCESS_TOKEN=<token>` in your shell for a non-interactive session.
4. Link the local repo to the hosted project: `supabase link --project-ref cewsjfxtvhxvawsfgxpf` (prompts for the database password — the one set when the project was created, resettable at Dashboard → Settings → Database if lost. **Not** the anon key, **not** the access token from step 2).
5. Push the migrations that already exist in `supabase/migrations/`: `supabase db push`. This applies `20260716120000_init_schema.sql` then `20260716120001_rls_policies.sql` in order.
6. Run the seed file. Supabase's CLI seeds automatically on `supabase db reset` for **local** dev only; for the **hosted** project, run it directly with `psql` (connection string is in Settings → Database → Connection string):
   ```bash
   psql "<connection-string-from-dashboard>" -f supabase/seed.sql
   ```
7. **Checkpoint:** Open Supabase Studio → Table Editor → confirm `courses` has one "ASL Alphabet" row, `lessons` has 3 rows under it, and `achievements` has 5 rows. Then open Authentication → Policies and confirm every user-data table shows RLS enabled with policies listed (not "No policies created yet").

---

## 3. Configure email/password auth

No provider setup needed — it's on by default. Two things worth doing before go-live:

1. **Authentication → Providers → Email**: confirm "Confirm email" is enabled if you want email verification before first login (recommended for production; can stay off during internal testing).
2. **Authentication → URL Configuration**: set **Site URL** to your production web domain (e.g. `https://cappy.app`) and add `http://localhost:5173` (Vite's default dev port) to **Redirect URLs** so local dev doesn't get rejected post-auth.

---

## 4. Configure Google OAuth

### 4a. Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create a new project (or reuse an existing org project) named e.g. "Cappy".
2. **APIs & Services → OAuth consent screen**:
   - User type: **External** (unless restricting to a Google Workspace org).
   - App name: "Cappy". Add your support email and the Cappy logo if you want it on the consent screen.
   - Scopes: default (`email`, `profile`, `openid`) — no extra scopes needed.
   - Add test users if the app is still in "Testing" publish status (required for anyone but you to sign in until you submit for verification).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application** (Supabase's OAuth flow is server-mediated even for mobile — you only ever need one Web client ID, not separate iOS/Android client IDs, because Supabase's own callback URL is what Google redirects to).
   - Name: "Cappy — Supabase Auth".
   - **Authorized redirect URIs** — add exactly this one (get the exact value from Supabase dashboard → Authentication → Providers → Google, it auto-fills a callback URL in this shape):
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

For mobile, use `expo-auth-session`'s `AuthSession.makeRedirectUri()` at runtime to generate the correct value automatically for whichever mode the app is running in (Expo Go via the auth proxy vs. a standalone/dev-client build via the `cappy://` deep link) rather than hardcoding one — pass its result as the `redirectTo` in the `signInWithOAuth('google')` call.

---

## 5. Configure Apple Sign-In

Apple's setup has more moving pieces than Google's. Budget extra time here, and note this **requires an active Apple Developer Program membership** ($99/year) — there is no free tier for Sign in with Apple configuration.

### 5a. Apple Developer account

1. Go to [developer.apple.com/account](https://developer.apple.com/account) → **Certificates, IDs & Profiles**.
2. **Identifiers → App IDs**: confirm (or create) an App ID matching `apps/mobile/app.json`'s `ios.bundleIdentifier`: `com.cappy.mobile`. Under **Capabilities**, enable **Sign In with Apple**.
3. **Identifiers → Services IDs → +** : create a new Services ID — this is the identifier Supabase will use as the "Client ID" for web-based Apple auth (distinct from the App ID above).
   - Identifier: e.g. `com.cappy.mobile.signin` (must be different from the App ID string).
   - Enable **Sign In with Apple** on this Services ID → **Configure**:
     - Primary App ID: select `com.cappy.mobile` from step 2.
     - **Domains and Subdomains**: `<your-project-ref>.supabase.co`.
     - **Return URLs**: `https://<your-project-ref>.supabase.co/auth/v1/callback` (same shape as Google's).
4. **Keys → +**: create a new key, enable **Sign In with Apple**, associate it with the App ID from step 2. Download the `.p8` key file **immediately** — Apple only lets you download it once. Note the **Key ID** shown on this page.
5. Note your **Team ID** (top-right of the Apple Developer account page, or **Membership** tab).

You now have four values Supabase needs: **Services ID** (from step 3), **Team ID**, **Key ID**, and the **.p8 private key contents** (from step 4).

### 5b. Supabase dashboard

1. **Authentication → Providers → Apple** → toggle enabled.
2. Fill in:
   - **Client ID**: the Services ID from step 5a.3 (e.g. `com.cappy.mobile.signin`).
   - **Secret Key**: Supabase generates the required signed JWT client secret for you if you provide the Team ID, Key ID, and paste the `.p8` file contents into the fields provided — follow the in-dashboard field labels exactly; do not hand-roll the JWT.
3. Save.

### 5c. iOS-specific native flow (`expo-apple-authentication`)

Apple Sign-In has two valid flows: the web-based OAuth redirect (works everywhere, same as Google above) and Apple's **native** in-app sign-in sheet on iOS, which Apple requires you to *offer* if you offer any other third-party login on iOS (App Store Review Guideline 4.8) — plain email/password alone would be exempt, but since Google OAuth is also offered, native Apple Sign-In should be the iOS path, not just the web redirect.

1. Install the native module in `apps/mobile`: `npx expo install expo-apple-authentication`.
2. Add the plugin to `apps/mobile/app.json` under `expo.plugins`: `"expo-apple-authentication"`.
3. In `apps/mobile/app.json`, confirm `ios.bundleIdentifier` is `com.cappy.mobile` (already set) — this must match the App ID from step 5a.2 exactly.
4. In the sign-in screen, branch on platform: iOS uses `AppleAuthentication.signInAsync()` to get an identity token natively, then exchanges it with Supabase via `supabase.auth.signInWithIdToken({ provider: 'apple', token, nonce })` — **not** `signInWithOAuth('apple')`, which is the web-redirect path meant for Android/web. `packages/api/src/repositories/auth.ts` currently only implements the `signInWithOAuth` path; add a small `signInWithAppleIdToken(token: string, nonce?: string)` function there when building this screen, following the same pattern as the existing functions (map the returned session with the existing `mapSession` helper).
5. Android and web continue to use `signInWithOAuth('apple')` (the same redirect-based flow as Google, reusing the redirect URL allow-list from §4c — add `cappy://` and your web domains there too, they're shared across providers).

---

## 6. Smoke test

1. Confirm `pnpm --filter @cappy/api typecheck` still passes (no code changes should be needed for this step — only env vars and dashboard config).
2. Web: run `pnpm --filter @cappy/web dev`, attempt email/password sign-up, then Google sign-in, against the real project. Confirm a row appears in `auth.users` (Studio → Authentication → Users) and that you can call `getProfile()`/`updateProfile()` from `packages/api` afterward once a matching `public.users` row is created.
3. Mobile: run `pnpm --filter @cappy/mobile start`, repeat the same flows in Expo Go first (uses the `auth.expo.io` proxy redirect), then in a dev-client build (uses the `cappy://` deep link) to confirm both redirect paths work.
4. Confirm RLS: while signed in as user A, attempt to fetch user B's `user_progress` row via the REST API directly (Studio → API docs has a ready-made `curl` snippet) — it must come back empty, not an error and not real data.

---

## 7. Open items / known gaps

- No login/signup screens exist yet in `apps/web` or `apps/mobile` (out of scope for this backend runbook — see `docs/PROGRESS.md` → "Product surfaces not yet built"). This doc only covers backend/provider configuration; UI screens and route guards are separate work.
- `signInWithIdToken` for native Apple Sign-In (§5c.4) is not yet implemented in `packages/api/src/repositories/auth.ts` — only the OAuth-redirect path (`signInWithOAuth`) exists today. Add it when building the iOS sign-in screen.
- Apple's consent screen review and Google's OAuth consent screen verification (needed once you go beyond "Testing" status with real users) both take real calendar time — start those Apple Developer Program / Google verification steps well before a public launch date, not the week of.
