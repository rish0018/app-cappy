# ADR-008 — Rule-based personalization before LLM
Status: Accepted
Date: 2026-06 (implemented 2026-07-28)

## Context
Bible §4 explicitly excludes "AI tutor / LLM integration" from v1 scope. The product still needs to answer "what should this learner study next" — recommend review characters based on accuracy, staleness, and mastery.

## Options Considered
- **LLM-based recommendation** (prompt a model with the learner's history, ask what to review) — adds latency, cost, an external API dependency, and non-determinism to a core learning-loop decision; excluded outright by bible §4.
- **Rule-based engine** — deterministic functions over mastery/accuracy/time-since-practice data already in Postgres.

## Decision
A rule-based, no-LLM adaptive engine: `recommendReviewCharacters` (low-accuracy-first, then stale-after-7-days), `isReviewDue`, `recommendNextCharacter` (first unmastered character in curriculum order) — `packages/core/src/lessons/recommendations.ts`.

## Why
The decision rules bible describes (§C.5/§C.6/§M.11-M.12, referenced in `docs/CHANGELOG.md`'s implementation entry) are simple enough to express as pure, deterministic, unit-testable functions — no model training, no inference cost, no non-determinism, and instantly explainable ("this character is due because accuracy is low" vs. an LLM's opaque reasoning).

## Consequences
- 11 unit tests cover the exact rules described in the bible's own examples (`packages/core/src/lessons/recommendations.test.ts`).
- Generic over `character: string`, so one engine already serves both ASL letters and Morse characters without duplication (ADR-009).
- Real progress persistence (`useProgressRecorder` hook, both apps) had to ship alongside this — previously every practice/quiz/checkout screen ran on mock data only, so the recommendation engine would have had nothing real to read from.
- A live-UI QA pass of the full write → read → recommend → render flow against a populated account is tracked separately, not yet done as of this ADR.
