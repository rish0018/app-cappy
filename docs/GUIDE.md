# Guide — Running Cappy Locally

This is the practical "how do I actually run this thing" doc. For product/architecture context see `PROJECT_BIBLE.md`; for what's built vs. not, see `PROGRESS.md`.

---

## 1. Prerequisites — install these first

| Tool | Version | Why | Install |
|---|---|---|---|
| **Node.js** | 18.x or newer (LTS recommended) | Runs everything JS | https://nodejs.org (or a version manager like `nvm`/`fnm`) |
| **pnpm** | 9.x | Package manager for the monorepo (workspaces) | `npm install -g pnpm` (or `corepack enable` then `corepack prepare pnpm@9 --activate`) |
| **Git** | any recent | Version control | https://git-scm.com |

Check versions:
```bash
node -v      # should print v18.x or higher
pnpm -v      # should print 9.x
git --version
```

### For mobile development, also install:
| Tool | Why |
|---|---|
| **Android Studio** | Provides the Android SDK, `adb`, and the Android Emulator — required to run the app as a standalone (non–Expo Go) build |
| **Xcode** (Mac only) | Provides the iOS Simulator — required for the equivalent iOS flow |
| **EAS CLI** (`npm install -g eas-cli`) | Used to log in to Expo/EAS and trigger cloud builds (`eas build`) |
| **Expo account** (free, https://expo.dev) | Needed to run `eas login` / `eas init` and to build/publish through EAS |

We've moved off the Expo Go app for day-to-day development. The mobile app uses **`expo-dev-client`**, which builds a standalone native app once and installs it on the emulator/device directly — no scanning a QR code into a generic Expo Go client.

---

## 2. First-time setup

> **Note on pnpm + Expo:** this repo ships a root `.npmrc` with `node-linker=hoisted`. This is required — pnpm's default strict/symlinked `node_modules` layout is not fully compatible with Expo's Gradle autolinking scripts (a known pnpm + Expo/React Native issue) and native Android builds will fail with a `Plugin [id: 'expo-module-gradle-plugin'] was not found` error without it. Don't delete or "fix" this `.npmrc` — it's intentional. It's already committed, so a fresh `git clone` + `pnpm install` picks it up automatically; nothing extra to do here.

From the repo root (`d:\app-cappy`), one command sets up everything (JS workspace **and** the Python training pipeline):

```bash
pnpm setup
```

This runs `pnpm install` (installs dependencies for every package/app in the monorepo — `apps/*`, `packages/*` — in one shot via pnpm's workspace linking) followed by `pip install -r apps/training/requirements.txt` (the Python deps for `apps/training`, see §8). You need Python + `pip` on your `PATH` for the second half to succeed; if you don't plan to touch `apps/training`, `pnpm install` alone is enough for web/mobile work.

If you only want the JS side:
```bash
pnpm install
```

If you ever see workspace/dependency-resolution errors after pulling new changes, re-run `pnpm setup` (or `pnpm install`) from the root first.

> **Note on `.gitignore`:** build-only artifacts that aren't needed to run or ship the app — `dist/`/`build/` output, `*.tsbuildinfo` incremental-build caches, `coverage/` from test runs, editor folders (`.vscode/`, `.idea/`), and package-manager debug logs — are all gitignored. If any of these show up as untracked/modified in `git status`, that's expected; they're regenerated locally and shouldn't be committed.

---

## 3. Running the web app

```bash
pnpm dev:web
```

or directly:
```bash
pnpm --filter @cappy/web dev
```

This starts the Vite dev server (default: http://localhost:5173). Open that URL in your browser — hot reload is automatic on save.

**Build for production / verify it compiles:**
```bash
pnpm --filter @cappy/web build
```

**Typecheck only (no build):**
```bash
pnpm --filter @cappy/web typecheck
```

---

## 4. Running the mobile app

The mobile app runs as a standalone native app (via `expo-dev-client`), not inside the generic Expo Go client. There's a one-time native build step, then fast iteration afterwards via the Metro bundler.

### 4.1 One-time EAS setup

```bash
eas login          # log in with your Expo account
cd apps/mobile
eas init            # links this project to EAS, fills in the real projectId in app.json
```

`app.json` has a placeholder `extra.eas.projectId` — `eas init` replaces it with the real one. You only need to do this once per machine/checkout.

### 4.2 Run on the Android Emulator

1. Start an emulator from Android Studio (Device Manager), or from the CLI: `emulator -avd <your_avd_name>`.
2. From the repo root:
   ```bash
   pnpm --filter @cappy/mobile android
   ```
   This runs `expo run:android`, which does a native Gradle build, installs the dev-client app on the running emulator, and starts Metro automatically. The **first run takes a few minutes** (native build); subsequent runs are much faster. This also regenerates the `android/` folder — it's gitignored (build artifact, not source), so it's normal for it not to exist right after a fresh clone.
3. Once installed, for day-to-day work you can just restart the bundler without rebuilding natively:
   ```bash
   pnpm --filter @cappy/mobile start
   ```
   This runs `expo start --dev-client` — open the already-installed dev-client app on the emulator and it connects automatically.

### 4.3 Run on iOS Simulator (Mac only)

```bash
pnpm --filter @cappy/mobile ios
```
Same idea as Android: one native build via `expo run:ios`, then `pnpm --filter @cappy/mobile start` for subsequent bundler-only runs.

### 4.4 Web preview of the mobile app

Still available for a quick layout check without a device:
```bash
pnpm --filter @cappy/mobile web
```

### 4.5 Typecheck only

```bash
pnpm --filter @cappy/mobile typecheck
```

### 4.6 Creating an EAS build (once you're confident in a change)

Instead of (or in addition to) running locally, you can build installable artifacts via EAS's cloud build service:

```bash
cd apps/mobile
pnpm build:dev       # development build (has the dev-client + debug menu, connects to Metro)
pnpm build:preview   # standalone release-like APK — install and use with no dev server, good for sharing with testers
pnpm build:prod      # production Android App Bundle — for the Play Store
```

Each of these runs `eas build --platform android` under the hood with the matching profile from `apps/mobile/eas.json`. EAS builds in the cloud and gives you a download link/QR code for the resulting APK/AAB.

---

## 5. Running everything at once

```bash
pnpm dev
```

Runs `dev` in every app in parallel via Turborepo (currently: web + mobile). Useful once both are being actively worked on side by side.

---

## 6. Environment variables

`packages/api` now has a real `createSupabaseClient()` and real repository implementations — but there is still no live Supabase project, so the apps run today with auth/data calls throwing a clear "not configured yet" error at call time (both the web and mobile route guards fail open when this happens, so the app stays usable without a backend).

To connect a real project, copy the example env files and fill in the values from your Supabase dashboard (Settings → API):
```
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

Variable names by context (first pair found wins, checked in this order in `packages/api/src/client.ts`):
```
# Root / plain Node
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# apps/web (Vite)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# apps/mobile (Expo)
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Once you provision the project and set these, run the schema/RLS/seed migrations under `supabase/migrations/` and `supabase/seed.sql`, then follow `docs/BACKEND_SSO_SETUP.md` to configure Google + Apple OAuth. See `docs/DB_SETUP_GUIDE.md` for the full provisioning checklist.

---

## 7. Repo layout cheat sheet

```
cappy/
├── apps/
│   ├── web/          # pnpm --filter @cappy/web ...
│   ├── mobile/        # pnpm --filter @cappy/mobile ...
│   └── training/     # Python ML pipeline (separate from the JS workspace — see apps/training/README.md)
├── packages/
│   ├── ui/            # web-only React components + design tokens (colors, spacing, etc.)
│   ├── core/           # framework-agnostic business logic (XP, streaks, ML prediction contract)
│   ├── api/            # Supabase abstraction layer (stubbed for now)
│   ├── types/          # shared TypeScript types used by everything
│   ├── shared/         # small cross-cutting utilities
│   └── config/         # shared tsconfig/eslint config
└── docs/               # PROJECT_BIBLE.md (spec), PROGRESS.md (status), this file
```

To run any script scoped to one package/app: `pnpm --filter <name> <script>`, where `<name>` is the `name` field in that package's `package.json` (e.g. `@cappy/web`, `@cappy/core`).

---

## 8. `apps/training` (Python ML pipeline) — separate toolchain

This is **not** part of the pnpm/Node workspace — it's a standalone Python project, though `pnpm setup` (§2) already installs its `requirements.txt` for you. See `apps/training/README.md` for details, but at a glance:

```bash
cd apps/training
pip install -r requirements.txt   # already done if you ran `pnpm setup`
python scripts/download_dataset.py
python scripts/inspect_dataset.py
```

You mentioned training the model separately — once you have exported weights (`TensorFlow.js` for web, `TensorFlow Lite` for mobile), they'll drop into a `models/` directory at the repo root (per `PROJECT_BIBLE.md`), and `packages/core`'s `HandPosePredictor` interface is the contract both apps will call to use them.

---

## 9. Common issues

| Problem | Fix |
|---|---|
| `pnpm: command not found` | Install pnpm globally (see §1), or use `corepack enable` |
| Workspace package not found / stale types after editing `packages/*` | Re-run `pnpm install` from root; restart your editor's TS server |
| Port `5173` already in use (web) | Vite will auto-pick the next free port — check the terminal output for the actual URL |
| Metro bundler cache issues (mobile) | `pnpm --filter @cappy/mobile start -- --clear` |
| `expo run:android` fails with `Plugin [id: 'expo-module-gradle-plugin'] was not found` | Almost always a pnpm node_modules layout issue. Confirm the root `.npmrc` has `node-linker=hoisted` (see §2), then delete `apps/mobile/android/`, re-run `pnpm install` from the repo root, and re-run `pnpm --filter @cappy/mobile android`. |
| `expo run:android` / Metro pulls in a wrong, way-too-new version of `expo-constants` or `expo-linking` (e.g. `57.x` when the rest of the app is on Expo SDK 51) | `expo-router` declares these as unconstrained peer dependencies (`"*"`), so pnpm can resolve them to whatever's newest instead of the SDK-51-correct version. They're pinned explicitly in `apps/mobile/package.json` (`expo-constants: ~16.0.2`, `expo-linking: ~6.3.1`) to prevent this — if you see it recur (e.g. after upgrading `expo-router`), re-pin to the versions that match your installed `expo` SDK and re-run `pnpm install`. |
| `expo run:android` fails / can't find a device | Make sure an emulator is running first (`adb devices` should list it), or an Android Studio AVD exists (Device Manager) |
| `eas build`/`eas init` asks to log in or fails with "no project" | Run `eas login`, then `eas init` from `apps/mobile` once per machine |
| Dev-client app on emulator shows "can't connect to Metro" | Make sure `pnpm --filter @cappy/mobile start` is running and the emulator/device has network access to your machine; shake the device / press `r` in the terminal to reload |
| Native code changed but app didn't update (e.g. new native dependency added) | Re-run `pnpm --filter @cappy/mobile android` to rebuild the native dev-client; plain `start` only refreshes JS |
