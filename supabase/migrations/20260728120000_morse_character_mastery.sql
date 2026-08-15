-- Cappy   Morse character mastery table
--
-- Closes the gap noted in docs/PROGRESS.md ("adaptive review AI" task #2):
-- `letter_mastery` is ASL-letter-shaped only (`char(1)` constrained to
-- A-Z), so it can't hold Morse's A-Z + 0-9 character set under one row per
-- (user, character). Rather than overload `letter_mastery` with a
-- curriculum discriminator column, this mirrors it as its own table   same
-- reasoning as keeping `letter_mastery` separate from `user_progress`
-- (curriculum-specific mastery signals, not the generic per-lesson row).
--
-- Source type: MorseCharacterMastery (packages/types/src/morse.ts). Note
-- that type tracks sendAccuracy/receiveAccuracy separately (Morse has two
-- distinct skills per character   tapping it out vs. recognizing it by
-- ear) instead of ASL's single `accuracy`/`avg_confidence` pair.
--
-- Run `supabase db push` against the live project (ref cewsjfxtvhxvawsfgxpf,
-- see docs/PROGRESS.md) to apply.

create table if not exists public.morse_character_mastery (
  user_id          uuid not null references public.users (id) on delete cascade,
  character        text not null check (character ~ '^[A-Z0-9]$'),
  mastery_score    numeric not null default 0,
  last_practiced   timestamptz,
  send_accuracy    numeric not null default 0,
  receive_accuracy numeric not null default 0,
  practice_count   integer not null default 0,
  primary key (user_id, character)
);

comment on table public.morse_character_mastery is
  'Per-user, per-character Morse mastery (A-Z, 0-9). Mirrors letter_mastery''s shape/RLS pattern but keyed on the wider Morse character set; kept as a separate table rather than widening letter_mastery''s CHECK constraint.';

create index if not exists idx_morse_character_mastery_user_id
  on public.morse_character_mastery (user_id);

-- ============================================================================
-- Row-Level Security   identical pattern to letter_mastery
-- (supabase/migrations/20260716120001_rls_policies.sql)
-- ============================================================================
alter table public.morse_character_mastery enable row level security;

create policy "morse_character_mastery_select_own"
  on public.morse_character_mastery for select
  using (auth.uid() = user_id);

create policy "morse_character_mastery_insert_own"
  on public.morse_character_mastery for insert
  with check (auth.uid() = user_id);

create policy "morse_character_mastery_update_own"
  on public.morse_character_mastery for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "morse_character_mastery_delete_own"
  on public.morse_character_mastery for delete
  using (auth.uid() = user_id);
