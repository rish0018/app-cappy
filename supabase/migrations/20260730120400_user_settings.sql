-- user_settings -- backing store for Profile.tsx's/profile.tsx's
-- accessibility toggles (reduced motion, high contrast, text size), which
-- previously only lived in local component state and reset on every
-- reload. One row per user, same shape as streaks (PK = user_id).

create table if not exists public.user_settings (
  user_id        uuid primary key references public.users (id) on delete cascade,
  reduced_motion boolean not null default false,
  high_contrast  boolean not null default false,
  text_size      text not null default 'medium' check (text_size in ('small', 'medium', 'large'))
);

alter table public.user_settings enable row level security;

create policy "user_settings_select_own"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "user_settings_insert_own"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "user_settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Deliberately no delete policy -- settings are recreated with defaults on
-- next toggle rather than explicitly deleted, same convention as streaks.
