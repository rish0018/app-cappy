# ADR-009 — Lesson engine must be content-agnostic
Status: Accepted
Date: 2026-06

## Context
Bible §2 requires the architecture to "support ASL, Braille, Morse, and future systems without rewrites," even though v1's stated scope was ASL-only (ADR-005). Building lesson ordering, mastery tracking, and recommendations tied to ASL-specific assumptions (e.g. a hardcoded A-Z letter type) would make every future curriculum a rewrite rather than an extension.

## Options Considered
- **ASL-specific engine** (types and functions hardcoded to the `Letter` union) — fastest for v1 alone, but bible §2 explicitly rules this out as a long-term architecture.
- **Generic engine parameterized over `character: string`** — one set of ordering/mastery/recommendation functions serves any curriculum that can express its content as a sequence of characters/units.

## Decision
Core lesson logic (`packages/core/src/lessons/*`, `packages/core/src/morse/*`) is written generically wherever the underlying concept is curriculum-agnostic (recommendation rules, confidence classification, XP/streak math); curriculum-specific data (the ASL `Letter` union, `MORSE_GROUPS`, mastery table shapes) stays in `packages/types` and is passed in as data, not hardcoded into the logic.

## Why
This was validated directly by the Morse expansion (ADR-005's flagged deviation): adding `level-7` (a new bonus level) and a `sentences-1` word stage required zero changes to `groupForCharacter`/`isBonusLevelUnlocked` (`packages/core/src/morse/ordering.ts`) because those functions already generalize across "any group with zero characters," confirmed directly in code rather than assumed.

## Consequences
- `morse_character_mastery` (a new table, not a widened `letter_mastery`) was added because Morse's A-Z+0-9 character set doesn't fit `letter_mastery`'s single-A-Z-letter constraint — a real limit of the "content-agnostic" claim at the schema layer, worked around with a parallel table using the same RLS pattern rather than by loosening the constraint.
- `recommendReviewCharacters`/`isReviewDue`/`recommendNextCharacter` (ADR-008) are generic over `character: string` specifically because of this rule.
