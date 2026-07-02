# Guide — Running Cappy Locally

This is the practical "how do I actually run this thing" doc. For product/architecture context see `PROJECT_BIBLE.md`; for what's built vs. not, see `PROGRESS.md` (ASL + overall) and `PROGRESS_MORSE.md` (Morse Code module).

Both the ASL and Morse learning modules live in the same web/mobile apps — once running, web shows a "Morse" tab in the top nav alongside Dashboard/Lessons, and mobile shows a "Morse" tab in the bottom tab bar alongside Home/Lessons. No separate setup or commands are needed to reach either module.

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
| **Expo Go app** (iOS App Store / Google Play) | Easiest way to run the mobile app on your own phone — scan a QR code, no build step |
| **Xcode** (Mac only, optional) | Only needed for the iOS Simulator instead of a physical device |
| **Android Studio** (optional) | Only needed for the Android Emulator instead of a physical device |

You do **not** need Xcode/Android Studio to get started — Expo Go on your phone is the fastest path.

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

```bash
pnpm dev:mobile
```

or directly:
```bash
pnpm --filter @cappy/mobile start
```

This starts the Expo dev server and prints a QR code in the terminal.

- **On your phone:** open the Expo Go app and scan the QR code (same Wi-Fi network as your computer).
- **iOS Simulator (Mac only):** press `i` in the terminal once the dev server is running.
- **Android Emulator:** press `a` in the terminal (emulator must already be running via Android Studio).
- **Web preview of the mobile app** (useful for a quick layout check without a device): press `w`, or run `pnpm --filter @cappy/mobile web`.

**Typecheck only:**
```bash
pnpm --filter @cappy/mobile typecheck
```

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
│   ├── ui/            # web-only React components + design tokens (colors, spacing, etc.) — depends on @cappy/core
│   ├── core/           # framework-agnostic business logic (XP, streaks, ML prediction contract, Morse encode/decode + timing)
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
| Expo Go can't connect / QR code doesn't load | Ensure your phone and computer are on the **same Wi-Fi network**; corporate/guest networks often block this — try a personal hotspot |
| Port `5173` already in use (web) | Vite will auto-pick the next free port — check the terminal output for the actual URL |
| Metro bundler cache issues (mobile) | `pnpm --filter @cappy/mobile start -- --clear` |
