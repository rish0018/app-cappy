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

We've moved off the Expo Go app for day-to-day development. The mobile app now uses **`expo-dev-client`**, which builds a standalone native app once and installs it on the emulator/device directly — no scanning a QR code into a generic Expo Go client, no Expo Go feature limitations.

---

## 2. First-time setup

From the repo root (`d:\app-cappy`):

```bash
pnpm install
```

This installs dependencies for every package/app in the monorepo (`apps/*`, `packages/*`) in one shot, using pnpm's workspace linking — you never need to `cd` into a package and install separately.

If you ever see workspace/dependency-resolution errors after pulling new changes, re-run `pnpm install` from the root first.

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

The mobile app runs as a standalone native app (via `expo-dev-client`), not inside the generic Expo Go client. This means there's a one-time native build step, then fast iteration afterwards via the Metro bundler.

### 4.1 One-time EAS setup

```bash
eas login          # log in with your Expo account
cd apps/mobile
eas init            # links this project to EAS, fills in the real projectId in app.json
```
cd apps/mobile
npx expo install @expo/metro-runtime
or directly:
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

**None are required yet.** The backend (`packages/api`) is currently a typed stub — no real Supabase project is wired up, so there's nothing to configure to run the apps today.

Once Supabase is provisioned (see `PROGRESS.md` → "What's Left"), you'll need a `.env` file (not committed — check `.gitignore`) with at minimum:
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```
This doc will be updated with exact variable names and where to place them (web uses Vite's `import.meta.env.VITE_*` convention; mobile uses Expo's `EXPO_PUBLIC_*` convention) once that work starts.

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

This is **not** part of the pnpm/Node workspace — it's a standalone Python project. See `apps/training/README.md` for details, but at a glance:

```bash
cd apps/training
pip install -r requirements.txt
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
| `expo run:android` fails / can't find a device | Make sure an emulator is running first (`adb devices` should list it), or an Android Studio AVD exists (Device Manager) |
| `eas build`/`eas init` asks to log in or fails with "no project" | Run `eas login`, then `eas init` from `apps/mobile` once per machine |
| Dev-client app on emulator shows "can't connect to Metro" | Make sure `pnpm --filter @cappy/mobile start` is running and the emulator/device has network access to your machine; shake the device / press `r` in the terminal to reload |
| Native code changed but app didn't update (e.g. new native dependency added) | Re-run `pnpm --filter @cappy/mobile android` to rebuild the native dev-client, plain `start` only refreshes JS |
