# PROJECT_BIBLE — Cappy
**Version:** 1.0 (Planning Edition) | **Author:** Rishit Kohli | **Updated:** June 2026
**Status:** Living document. Update alongside implementation.

---

## QUICK REFERENCE

| Area | Decision | Confidence |
|---|---|---|
| MVP Scope | ASL Alphabet only (v1) | 100% |
| Backend | Supabase | 99% |
| ML Pipeline | MediaPipe + TF Classifier | 99% |
| Web | React (Vite) on Vercel | 99% |
| Mobile | Expo (React Native) + EAS | 98% |
| Monorepo | Turborepo + pnpm | 99% |
| ML Framework | TensorFlow (.js + Lite) | 95% |
| Auth | Email/Password + Google OAuth | 99% |
| Deployment | Web-first, Mobile follows | 99% |

---

## 1. IDENTITY

**What is Cappy?**
An accessibility-first educational platform teaching communication systems used by people with disabilities — starting with ASL fingerspelling, then Braille and Morse Code.

**What Cappy is NOT:** "Duolingo for Sign Language." It is a platform for accessibility education.

**Mission:** Enable millions of people to confidently communicate using accessibility-focused languages through technology, AI, and engaging educational experiences.

**Vision:** Become the world's most approachable platform for learning accessibility communication.

**Mascot:** A capybara — the brand's emotional symbol, not the product. It appears intentionally at meaningful moments (onboarding, milestones, celebrations). Not on every screen.

---

## 2. CORE PRINCIPLES (Non-Negotiable)

1. **Accessibility First** — Evaluated on every screen before implementation.
2. **Education Before Entertainment** — Gamification supports learning; never distracts from it.
3. **Simplicity Wins** — Prefer the simpler maintainable solution unless complexity is justified.
4. **Build for Scale** — Architecture must support ASL, Braille, Morse, and future systems without rewrites.
5. **Consistency** — Users should feel one product across all modules and platforms.

**Product Philosophy:** Every lesson must answer: *"Can the learner confidently use this outside the app?"* If no, redesign the lesson.

---

## 3. BRAND VOICE

| Avoid | Prefer |
|---|---|
| "Incorrect." | "Nice attempt. Let's try that one again." |
| "You failed." | "You're getting closer. One more try." |

Tone: Calm, friendly, patient, encouraging, inclusive. Never childish, punishing, or guilt-inducing.

---

## 4. MVP DEFINITION (v1.0)

**The single question v1 must answer:**
> *Can someone learn the ASL alphabet more effectively using Cappy than traditional resources?*

**v1.0 Includes:**
- ASL alphabet lessons + progression
- Camera-based hand sign validation (MediaPipe + classifier)
- User accounts, XP, streaks, achievements
- Web app (React) on Vercel
- Mobile app (Expo) via EAS

**v1.0 Explicitly Excludes:**
- Braille, Morse Code, other sign languages
- AI tutor / LLM integration
- Full sentence/word recognition
- Live translation, speech-to-sign
- Multiplayer, social, classroom features
- Offline-first sync

---

## 5. PRODUCT ROADMAP

| Phase | Focus | Status |
|---|---|---|
| 1 | ASL Alphabet Recognition | **Active (MVP)** |
| 2 | Word Recognition (letter sequences) | Planned |
| 3 | Sentence Formation (short phrases) | Planned |
| 4 | Adaptive AI (personalized sessions) | Future |
| 5+ | Braille, Morse, BSL, ISL, etc. | Future |
| 6+ | Schools, community, AI tutor | Long-term |

**Scope Filter (use before adding any feature):**
1. Does this improve v1?
2. Does it help learn the ASL alphabet?
3. Can it wait? → If yes, backlog it.

---

## 6. SUCCESS METRICS

| Metric | Target |
|---|---|
| Alphabet Recognition Accuracy | >95% |
| Lesson Completion Rate | >80% |
| Average Session Duration | 10–15 min |
| Weekly Retention | >40% |
| Model Inference Latency | <100ms |
| Crash-Free Sessions | >99% |

**Primary success measure:** Learning outcomes, not downloads or engagement metrics.

---

## 7. TECHNICAL ARCHITECTURE

### High-Level System
```
Web (React)   Mobile (Expo RN)
      │               │
      └───── Shared Packages ─────┐
             ui / core / api      │
                   │              │
            Supabase Backend      │
        Auth | PostgreSQL | Storage
                   │
         ML Inference (Client-Side)
         MediaPipe → Classifier
```

**Key Architectural Rules:**
- Apps never talk to DB tables directly — all access goes through the shared `api` package.
- ML predicts. Application decides. Never embed lesson logic in the model.
- One source of truth for every piece of logic (no duplication between web/mobile).

### Repository Structure (Turborepo + pnpm)
```
cappy/
├── apps/
│   ├── web/          # React (Vite)
│   ├── mobile/       # Expo React Native
│   └── training/     # ML pipeline (Python)
├── packages/
│   ├── ui/           # Shared component library
│   ├── core/         # Shared business logic
│   ├── api/          # Supabase abstraction layer
│   ├── types/        # Shared TypeScript types
│   ├── shared/       # Utilities
│   └── config/       # ESLint, TS, build configs
├── supabase/         # Migrations, RLS, edge functions
├── docs/
├── models/           # Exported TF.js + TFLite models
├── assets/
├── scripts/
└── .github/          # CI/CD workflows
```

**Repo Principles:** Feature-first folder structure (not file-type-first). Shared logic lives once.

---

## 8. MACHINE LEARNING PIPELINE

### Strategy
- **Do NOT train end-to-end vision models.** Use MediaPipe for landmark extraction, train only the classifier.
- **Do NOT run inference server-side** (v1). All ML runs on-device (browser / mobile) for privacy, latency, and cost.

### Pipeline
```
Camera Frame
  → MediaPipe (21 hand landmarks, x/y/z)
  → Normalization (wrist-relative, scale, handedness)
  → TF Classifier (lightweight MLP/DNN)
  → Prediction + Confidence Score
  → Application Layer (decides UI response)
```

### Model I/O
- **Input:** 42 values (21 landmarks × x,y normalized coordinates)
- **Output:** Letter (A–Z) + confidence score (0–1)
- **Confidence thresholds:** High (≥0.90 → pass), Medium (ask to hold longer), Low (show demo again)

### Export Formats
- `TensorFlow.js` → Web
- `TensorFlow Lite` → Expo/Mobile

### Data Strategy
```
v0.1: Public ASL image datasets → landmark extraction
v0.5: Merged/cleaned public datasets
v0.8: Curated landmark CSV dataset
v1.0: Custom Cappy dataset (controlled)
v2+:  Community-assisted (opt-in, consented)
```

**Dataset evaluation criteria:** License (critical), label accuracy, class balance, diversity, image quality. Never adopt a dataset without documenting its license.

**Train/Val/Test Split:** 70 / 15 / 15. Test set stays untouched until final evaluation.

**Augmentation:** Small rotations, scale variation, coordinate perturbation. Never create impossible hand positions.

---

## 9. BACKEND (Supabase)

### Why Supabase
PostgreSQL + Auth + RLS + Storage + Migrations + Type generation — everything v1 needs, with minimal maintenance overhead for a solo developer.

### Database Schema (Core Entities)
```
users → user_progress → lesson_progress
                      → letter_mastery
                      → streaks
                      → achievements → user_achievements
courses → units → lessons → exercises
daily_activity
```

**Letter Mastery table** (critical for adaptive learning):
`mastery_score`, `last_practiced`, `accuracy`, `avg_confidence`, `practice_count`

### Key Rules
- **RLS on every user-data table.** Never rely on frontend-only restrictions.
- Lesson definitions and user progress are separate tables (curriculum updates don't break user data).
- Achievements are event-driven; backend records them, frontend presents them.
- ML models are **not** stored in Supabase Storage. They ship with the app.

### Auth
- v1: Email/password + Google OAuth
- Future: Apple Sign-In, GitHub, anonymous guest mode

### Cost (v1 stays free tier)
| Service | Purpose |
|---|---|
| Supabase | Backend |
| Vercel | Web hosting |
| Expo EAS | Mobile builds |
| GitHub | Source control |

---

## 10. API LAYER

```
React / Expo
    ↓
packages/api/   ← abstraction layer (all DB calls here)
    ↓
Supabase SDK
    ↓
PostgreSQL
```

**Shared Types** (exported from `packages/types`): `User`, `Course`, `Lesson`, `Exercise`, `Progress`, `Achievement`, `LetterMastery`, `Statistics`

**Performance Targets:**
| Operation | Target |
|---|---|
| Login | <2s |
| Lesson load | <1s |
| Dashboard | <1s |
| Progress save | <500ms |
| Camera feedback | Real-time |

**Caching:** Cache courses/lessons/exercises/assets. Do not cache auth state or progress writes.

---

## 11. DESIGN SYSTEM

### Emotional Goal
When someone opens Cappy: *"I can actually learn this."* — not overwhelmed, not anxious.

### Visual Principles
- **Calm** — no visual clutter
- **Clear** — one primary action per screen
- **Predictable** — user knows what happens next
- **Accessible** — WCAG-compliant (contrast, keyboard nav, screen readers, touch targets)
- **Delightful** — small moments of joy, not constant stimulation

### Spacing Scale
`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64` — all margins/padding derive from this.

### Color Semantics
Primary (main actions), Success (completed lessons), Warning (gentle reminders), Error (technical issues only, not wrong answers), Info (guidance). Never use color as the only indicator.

### Motion
Animations exist to explain, confirm, celebrate, or transition — not to impress. Respect `prefers-reduced-motion`.

### UX References (study, don't copy)
| Product | Study For |
|---|---|
| Duolingo | Lesson progression, habit loops |
| Headspace | Calm interactions |
| Notion | Information hierarchy |
| Linear | Clean minimal UI |

### Mascot Usage
Appears at: onboarding, achievements, milestone celebrations, weekly summaries, explaining mistakes. **Does not appear after every answer.**

---

## 12. CURRICULUM (ASL v1)

### Learning Progression
```
Letters (A–Z)
  → Words (CAT, DOG, HELLO…)  [Phase 2]
  → Sentences / phrases        [Phase 3]
  → Adaptive sessions          [Phase 4]
```

### Lesson Types
- **Demonstration** — Watch and understand the sign
- **Guided Practice** — Camera validation with prompts
- **Quiz** — Timed recognition challenge
- **Review** — Spaced repetition of weak letters
- **Free Practice** — Open camera mode

### Letter Groupings (teach by hand shape similarity)
Group 1: A, S, E | Group 2: B, F, I, D | Group 3: C, G, O | Group 4: H, K, R, U, V | Group 5: L, Y | Group 6: M, N, T | Group 7: J, Z (motion letters — special handling)

### Gamification
- **XP** — awarded for completion, accuracy, streaks (not for attempts)
- **Streaks** — daily practice tracking
- **Achievements** — meaningful milestones only (not hundreds)
- **Leaderboards** — weekly, opt-in

---

## 13. ENGINEERING WORKFLOW

### Git Strategy (Trunk-Based)
```
main (production)
  ↑
  feature/* branches → PR → review → merge
  fix/* branches
  chore/* branches
```

**Commit format:** `type(scope): description` (feat, fix, chore, docs, test, refactor)

**Branch naming:** `feature/camera-validation`, `fix/streak-sync`

### CI/CD (GitHub Actions)
- On PR: lint, type-check, unit tests
- On merge to main: deploy web to Vercel (auto), trigger mobile build if needed

### Definition of Done
- [ ] Functionality works as specified
- [ ] Unit tests written
- [ ] Accessibility reviewed
- [ ] Documentation updated
- [ ] No console errors in production builds

---

## 14. ARCHITECTURE DECISION RECORDS (ADRs)

All significant decisions live in `docs/adr/`. Format:

```markdown
# ADR-XXX — Title
Status: Accepted | Proposed | Deprecated | Superseded
Date: YYYY-MM-DD

## Context
## Options Considered
## Decision
## Why
## Consequences
```

**Accepted ADRs Summary:**

| ADR | Decision |
|---|---|
| 001 | Turborepo monorepo |
| 002 | Supabase as backend |
| 003 | MediaPipe + TF classifier for ML |
| 004 | TensorFlow (.js + Lite) as ML framework |
| 005 | v1 scope = ASL alphabet only |
| 006 | Web-first deployment, mobile follows |
| 007 | Educational value > technical sophistication |
| 008 | Rule-based personalization before LLM |
| 009 | Lesson engine must be content-agnostic |
| 010 | ML inference runs on-device |
| 011 | All new features validated on web before porting to mobile |
| 012 | Single cross-platform design system |

**Create a new ADR when changing:** repo structure, backend provider, ML architecture, design system, auth, data model, state management, build system, deployment pipeline.

---

## 15. RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Poor model accuracy | Medium | High | Diverse test data, better normalization, real-world evaluation set |
| Browser camera API inconsistencies | High | Medium | Early cross-browser testing, progressive enhancement |
| MediaPipe tracking failures | Low | Medium | Teach users optimal positioning; allow retries; never punish |
| Scope creep | High | Very High | Use scope filter before every feature; backlog ruthlessly |
| Burnout (solo dev) | Medium | High | Sustainable pace; one objective per session |
| Building features no one wants | High | Very High | Ship early; observe behavior; validate before building |
| Overengineering | Medium | Medium | Optimize for maintainability, not hypothetical scale |

---

## 16. IMPLEMENTATION ORDER

1. Establish Turborepo monorepo + pnpm workspace
2. Set up Supabase (local dev → production)
3. Build ML training pipeline (data → landmark extraction → classifier → export)
4. Build React Web app (auth → lessons → camera validation → progress)
5. Deploy continuously to Vercel from day one
6. Test with real users
7. Iterate based on evidence
8. Port to Expo Mobile (reuse shared packages)

---

## 17. COMPETITIVE LANDSCAPE

| Competitor | Strength | Weakness | Cappy's Opportunity |
|---|---|---|---|
| Duolingo | Habit loops, polish, UX | Not built for gesture/camera validation | Better feedback loop |
| Lingvano | Native signing videos | Passive learning, no real-time validation | Active validation |
| Pocket Sign | Beginner-friendly | Memorization focus, low engagement | Gamified progression |
| ASL Bloom | Educational quality | Largely passive | Real-time correction |
| Braille apps | Reference quality | Flashcard-only, low engagement | Unified platform |

**Cappy's differentiator:** Not more lessons — better *experience*. Modern UX + accessibility-first + real-time gesture validation + reusable learning engine.

---

## 18. LAWS (Non-Negotiable Engineering Rules)

1. **Learner before technology.** Educational value wins over technical elegance.
2. **One source of truth.** No duplicate logic, components, or APIs.
3. **Every feature earns its place.** Must answer: What learner problem does this solve? Why now? How is success measured?
4. **Ship small, improve often.** Prefer incremental releases over big-bang launches.
5. **Build platforms, not features.** The lesson engine — not a "Braille screen."
6. **v1 is allowed to be incomplete.** Its only job: prove people can learn the ASL alphabet with Cappy.
7. **Document technical debt.** Every shortcut gets a note: reason, replacement plan, estimated time to fix.

---

## 19. CHANGELOG

| Version | Summary |
|---|---|
| 0.1 | Initial planning document |
| 1.0 | Planning edition completed |
| 1.x | Update with implementation findings |
| 2.x | Update with production learnings |

---

## 20. FINAL PRINCIPLES

> **Build deliberately. Teach effectively. Protect trust. Learn continuously. Finish what matters.**

> *"Teach the learner first. Everything else is implementation."*

---

## 21. COLOR PALLETE for AI context
#d9aa78
#cec1ae
#8ab8ae
#3e948c
#3e948c
*This document is the map. VISION.md (one page, four questions) is the compass. Both should be updated as the product evolves. Never erase old decisions — document how thinking changed.*