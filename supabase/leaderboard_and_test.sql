-- ============================================================================
-- Mun Helper — migration 3: XP economy, leaderboard, delegate level test.
-- Run AFTER schema.sql and bot_functions.sql in the Supabase SQL Editor.
-- Safe to re-run (create or replace / drop-if-exists guards).
-- ============================================================================

-- ── XP for reviews ───────────────────────────────────────────────────────────
-- +20 XP the first time a delegate reviews a conference. AFTER INSERT only —
-- editing an existing review (upsert path) doesn't farm XP because ON CONFLICT
-- UPDATE fires the UPDATE trigger path, not INSERT.
create or replace function public.award_review_xp()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.user_profiles set xp = xp + 20 where id = new.user_id;
  return new;
end $$;

drop trigger if exists trg_reviews_award_xp on public.reviews;
create trigger trg_reviews_award_xp after insert on public.reviews
  for each row execute function public.award_review_xp();

-- ── Delegate level test ──────────────────────────────────────────────────────
-- Called by the website when a signed-in user finishes the quiz. Grades into
-- an experience_level, updates the profile (never touches chair/organizer
-- ranks — those are earned outside a quiz), awards XP once per day (so
-- retaking for practice is fine but XP can't be farmed by spamming).
create table if not exists public.level_test_attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.user_profiles (id) on delete cascade,
  correct     smallint not null,
  total       smallint not null,
  level       public.experience_level not null,
  xp_awarded  smallint not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists level_test_attempts_user_idx on public.level_test_attempts (user_id, created_at desc);

alter table public.level_test_attempts enable row level security;

drop policy if exists "users read own attempts" on public.level_test_attempts;
create policy "users read own attempts"
  on public.level_test_attempts for select
  using (user_id in (select id from public.user_profiles where auth_user_id = auth.uid()));

create or replace function public.submit_level_test(p_correct int, p_total int)
returns table (result_level public.experience_level, xp_awarded int, total_xp int)
language plpgsql security definer set search_path = public as $$
declare
  v_profile public.user_profiles;
  v_level public.experience_level;
  v_xp int := 0;
  v_ratio numeric;
begin
  if p_total <= 0 or p_correct < 0 or p_correct > p_total then
    raise exception 'Invalid test result';
  end if;

  select * into v_profile from public.user_profiles
  where auth_user_id = auth.uid() and not is_banned;
  if not found then
    raise exception 'No active profile for this session';
  end if;

  v_ratio := p_correct::numeric / p_total;
  v_level := case
    when v_ratio >= 0.8 then 'advanced'
    when v_ratio >= 0.5 then 'intermediate'
    else 'rookie'
  end;

  -- XP only for the first attempt each day
  if not exists (
    select 1 from public.level_test_attempts
    where user_id = v_profile.id and created_at > now() - interval '1 day'
  ) then
    v_xp := p_correct * 10;
  end if;

  -- quiz can only place delegates on the rookie→advanced ladder;
  -- chair/organizer ranks are never downgraded by a quiz score
  update public.user_profiles
  set xp = xp + v_xp,
      level = case when level in ('rookie', 'intermediate', 'advanced') then v_level else level end
  where id = v_profile.id;

  insert into public.level_test_attempts (user_id, correct, total, level, xp_awarded)
  values (v_profile.id, p_correct, p_total, v_level, v_xp);

  return query
    select v_level, v_xp, (select xp from public.user_profiles where id = v_profile.id);
end $$;

grant execute on function public.submit_level_test(int, int) to authenticated;

-- ── Leaderboard ──────────────────────────────────────────────────────────────
-- Public top-50 by XP. user_profiles is already world-readable, the view just
-- shapes it (display name preference, banned users excluded).
create or replace view public.leaderboard as
select
  id,
  coalesce(nullif(full_name, ''), username, 'Delegate') as display_name,
  level,
  xp,
  telegram_handle
from public.user_profiles
where not is_banned and xp > 0
order by xp desc, created_at asc
limit 50;
