# Architecture Decision Records

Format required by `docs/AI_project_bible.md` §14. Every ADR uses this structure:

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

Create a new ADR when changing: repo structure, backend provider, ML architecture, design system, auth, data model, state management, build system, deployment pipeline (per bible §14).

## Index

| ADR | Decision |
|---|---|
| [001](0001-turborepo-monorepo.md) | Turborepo monorepo |
| [002](0002-supabase-backend.md) | Supabase as backend |
| [003](0003-mediapipe-tf-classifier.md) | MediaPipe + TF classifier for ML |
| [004](0004-tensorflow-ml-framework.md) | TensorFlow (.js + Lite) as ML framework |
| [005](0005-v1-scope-asl-only.md) | v1 scope = ASL alphabet only |
| [006](0006-web-first-deployment.md) | Web-first deployment, mobile follows |
| [007](0007-educational-value-over-sophistication.md) | Educational value > technical sophistication |
| [008](0008-rule-based-before-llm.md) | Rule-based personalization before LLM |
| [009](0009-content-agnostic-lesson-engine.md) | Lesson engine must be content-agnostic |
| [010](0010-on-device-ml-inference.md) | ML inference runs on-device |
| [011](0011-web-validated-before-mobile-port.md) | All new features validated on web before porting to mobile |
| [012](0012-single-cross-platform-design-system.md) | Single cross-platform design system |

These 12 were previously recorded only as a one-line summary table in `AI_project_bible.md` §14; this directory backfills the full Context/Options/Decision/Why/Consequences format the bible itself requires. `AI_project_bible.md`'s table remains the index of record for new entries going forward — add a row there and a file here together.
