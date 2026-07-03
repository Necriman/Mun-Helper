-- ============================================================================
-- Mun Helper — Bot RPC functions (migration 2, run after schema.sql)
--
-- Why this file exists: the Telegram bot only ever holds the PUBLIC
-- (anon/publishable) key, never the service_role secret. Rather than widen
-- RLS policies (which would weaken security for every client), the bot's
-- privileged writes go through a small, explicit set of SECURITY DEFINER
-- functions. Each one does exactly one thing, so a compromised bot process
-- can never run arbitrary queries against the database — only these.
--
-- Run this whole file in the Supabase SQL Editor once, after schema.sql.
-- ============================================================================

-- ── bot_upsert_profile ───────────────────────────────────────────────────────
-- Called on every /start. Creates a telegram-only profile on first contact,
-- otherwise just updates the handle and returns the existing row.
create or replace function public.bot_upsert_profile(
  p_telegram_id bigint,
  p_telegram_handle text default null
)
returns public.user_profiles
language plpgsql security definer set search_path = public as $$
declare
  v_profile public.user_profiles;
begin
  select * into v_profile from public.user_profiles where telegram_id = p_telegram_id;

  if found then
    update public.user_profiles
    set telegram_handle = coalesce(p_telegram_handle, telegram_handle)
    where telegram_id = p_telegram_id
    returning * into v_profile;
    return v_profile;
  end if;

  insert into public.user_profiles (telegram_id, telegram_handle, username)
  values (
    p_telegram_id,
    p_telegram_handle,
    'tg_' || p_telegram_id::text
  )
  returning * into v_profile;

  return v_profile;
end $$;

grant execute on function public.bot_upsert_profile(bigint, text) to anon, authenticated;

-- ── bot_is_verified ──────────────────────────────────────────────────────────
-- Powers the Format-B "Mandatory Verification" gate (docs/AD_ARCHITECTURE.md):
-- the bot calls this before running the MUN-list command.
create or replace function public.bot_is_verified(p_telegram_id bigint)
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select auth_user_id is not null and not is_banned
     from public.user_profiles where telegram_id = p_telegram_id),
    false
  );
$$;

grant execute on function public.bot_is_verified(bigint) to anon, authenticated;

-- ── bot_mint_link_token ──────────────────────────────────────────────────────
-- Mints the one-time token used in the account-linking deep link.
create or replace function public.bot_mint_link_token(p_telegram_id bigint)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_token text;
begin
  insert into public.telegram_link_tokens (telegram_id)
  values (p_telegram_id)
  returning token into v_token;
  return v_token;
end $$;

grant execute on function public.bot_mint_link_token(bigint) to anon, authenticated;

-- ── bot_submit_conference ────────────────────────────────────────────────────
-- The "SUBMIT new MUN proposals for review" feature. Always lands as
-- pending_review regardless of who calls it — moderators approve via the
-- Admin Panel, never through this function.
create or replace function public.bot_submit_conference(
  p_telegram_id bigint,
  p_title text,
  p_short_name text default null,
  p_description text default null,
  p_date_start date default null,
  p_date_end date default null,
  p_contact_telegram text default null
)
returns public.conferences
language plpgsql security definer set search_path = public as $$
declare
  v_profile_id uuid;
  v_slug text;
  v_conference public.conferences;
begin
  select id into v_profile_id from public.user_profiles where telegram_id = p_telegram_id;
  if v_profile_id is null then
    raise exception 'Unknown telegram_id — call bot_upsert_profile first';
  end if;

  -- slugify + guarantee uniqueness with a short random suffix
  v_slug := lower(regexp_replace(p_title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 5);

  insert into public.conferences (
    slug, title, short_name, description, date_start, date_end,
    contact_telegram, created_by_user_id, status, registration_status
  ) values (
    v_slug, p_title, p_short_name, p_description, p_date_start, p_date_end,
    p_contact_telegram, v_profile_id, 'pending_review',
    case when p_date_start is not null then 'upcoming' else 'planned' end
  )
  returning * into v_conference;

  return v_conference;
end $$;

grant execute on function public.bot_submit_conference(bigint, text, text, text, date, date, text) to anon, authenticated;

-- ── bot_submit_review ────────────────────────────────────────────────────────
-- "read/write reviews" — upsert so re-submitting updates rather than duplicates
-- (the reviews table already has a unique(conference_id, user_id) constraint).
create or replace function public.bot_submit_review(
  p_telegram_id bigint,
  p_conference_id uuid,
  p_rating smallint,
  p_comment_text text default null
)
returns public.reviews
language plpgsql security definer set search_path = public as $$
declare
  v_profile_id uuid;
  v_review public.reviews;
begin
  select id into v_profile_id from public.user_profiles
  where telegram_id = p_telegram_id and not is_banned;
  if v_profile_id is null then
    raise exception 'Unknown or banned telegram_id';
  end if;

  insert into public.reviews (conference_id, user_id, rating, comment_text)
  values (p_conference_id, v_profile_id, p_rating, p_comment_text)
  on conflict (conference_id, user_id)
    do update set rating = excluded.rating, comment_text = excluded.comment_text
  returning * into v_review;

  return v_review;
end $$;

grant execute on function public.bot_submit_review(bigint, uuid, smallint, text) to anon, authenticated;
