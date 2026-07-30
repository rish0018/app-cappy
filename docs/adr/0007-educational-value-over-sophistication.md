# ADR-007 — Educational value > technical sophistication
Status: Accepted
Date: 2026-06

## Context
Bible §2 (Core Principles, non-negotiable) lists "Education Before Entertainment — gamification supports learning; never distracts from it" and "Simplicity Wins — prefer the simpler maintainable solution unless complexity is justified." §2's product philosophy test: "Every lesson must answer: Can the learner confidently use this outside the app? If no, redesign the lesson."

## Options Considered
- **Feature/technology-driven roadmap** — chase the most technically impressive ML/gamification features regardless of pedagogical payoff.
- **Pedagogy-driven roadmap, technology in service of it** — every feature justified by "does this help someone actually learn ASL/Morse," not by novelty.

## Decision
Every product and engineering decision is filtered through educational value first; technical sophistication (a fancier model, a flashier animation) is only pursued when it serves the learning outcome.

## Why
Bible §2's own scope filter (§5) is explicit: "Does this improve v1? Does it help learn the ASL alphabet? Can it wait?" A confidence-classified ML prediction (ADR-003) exists to give the learner actionable feedback, not to showcase ML sophistication; the rule-based adaptive engine (ADR-008) was chosen over an LLM specifically because it's simpler and sufficiently effective for v1's actual pedagogical need.

## Consequences
- Feature requests and technical proposals should be evaluated against "does this help someone learn," not "is this more advanced" — this is a judgment call, not something enforced by tooling, so it depends on continued discipline in code review / product decisions.
- Encouragement-only feedback copy (`LessonPractice.tsx`: "Nice attempt — try adjusting your hand angle" rather than "Incorrect") is a direct expression of this principle in shipped code.
