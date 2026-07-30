-- sign_word_mastery: per-word mastery for the ASL Signs (word-level) curriculum.
-- Mirrors letter_mastery exactly — same columns, same RLS policy pattern.
-- Keyed on (user_id, sign_word); sign_word is the lowercase Google ASL Signs
-- label (e.g. "hello", "thank_you") and must match preprocessing.json labels
-- from apps/training/exports/tensorflowjs-signs/.

create table if not exists sign_word_mastery (
  user_id        uuid        not null references auth.users(id) on delete cascade,
  sign_word      text        not null,
  mastery_score  numeric     not null default 0,
  last_practiced timestamptz,
  accuracy       numeric     not null default 0,
  avg_confidence numeric     not null default 0,
  practice_count integer     not null default 0,
  primary key (user_id, sign_word)
);

alter table sign_word_mastery enable row level security;

create policy "users can read own sign word mastery"
  on sign_word_mastery for select
  using (auth.uid() = user_id);

create policy "users can insert own sign word mastery"
  on sign_word_mastery for insert
  with check (auth.uid() = user_id);

create policy "users can update own sign word mastery"
  on sign_word_mastery for update
  using (auth.uid() = user_id);
