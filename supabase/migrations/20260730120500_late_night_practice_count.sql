-- Backs the "ach-night-owl" achievement ("Practiced after 9pm five times"),
-- previously deliberately unimplemented -- daily_activity only tracked
-- `date`, not time of day, so there was no way to detect a late-night
-- session. Adding a simple per-user cumulative counter on `streaks`
-- (already a per-user singleton row) rather than a new table, since the
-- achievement only cares about a running total, not per-day history.

alter table public.streaks
  add column if not exists late_night_practice_count integer not null default 0;
