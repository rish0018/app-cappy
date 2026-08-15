# ADR-005 — v1 scope = ASL alphabet only
Status: Accepted (superseded in practice for Morse — see Consequences)
Date: 2026-06

## Context
Bible §4 (MVP Definition) poses one question v1 must answer: "Can someone learn the ASL alphabet more effectively using Cappy than traditional resources?" §4 explicitly excludes Braille, Morse Code, other sign languages, an AI tutor, full sentence/word recognition, and multiplayer/social features from v1. §5's roadmap places Braille/Morse/BSL/ISL at "Phase 5+, Future."

## Options Considered
- **Build all curricula (ASL + Morse + Braille) in parallel** — spreads a solo developer's effort thin, risks shipping nothing polished.
- **ASL alphabet only, ship and validate, then expand** — bible's chosen scope filter (§5: "Does this improve v1? Does it help learn the ASL alphabet? Can it wait? → backlog it.").

## Decision
v1 scope is ASL alphabet lessons + camera-based validation + accounts/XP/streaks/achievements, web + mobile, per bible §4.

## Why
A narrow, validated v1 answers the core product question (does the learning approach work at all) before multiplying it across curricula. Building the lesson/mastery/adaptive-engine architecture generically (ADR-009) means a second curriculum can reuse it rather than starting over.

## Consequences
- **In practice, Morse Code was built and shipped alongside ASL** on both web and mobile before this ADR's "ASL only" scope was formally revisited — a real deviation from the bible's stated v1 exclusion list, not something this backfill invents. This is flagged here rather than silently treated as consistent: bible §4/§5 should be updated to reflect that Morse is now in scope, or a decision recorded for why it was pulled forward.
- `recommendReviewCharacters`/`isReviewDue`/`recommendNextCharacter` (packages/core) are generic over `character: string`, so the same adaptive engine already serves both curricula — the content-agnostic design (ADR-009) is what made the Morse expansion low-cost despite this ADR's original scope.
