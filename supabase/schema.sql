-- ============================================================================
-- Mun Helper — Ecosystem-wide Supabase / PostgreSQL schema
--
-- Backs FOUR clients against one database:
--   1. Web app (React)              — public reads, authenticated writes
--   2. Telegram bot (Node/Edge Fn)  — service-role writes, telegram_id identity
--   3. Admin & Analytics panel      — moderator/admin-gated reads+writes
--   4. AI Delegate Mentor           — reads user_profiles + conferences (no
--      dedicated tables yet; out of scope for this pass, see comment at EOF)
--
-- Run in the Supabase SQL Editor (or `supabase db push`). Safe on a fresh
-- project; review before re-running on one with existing data.
-- ============================================================================

create extension if not exists pgcrypto; -- gen_random_uuid(), gen_random_bytes()

-- ── Enums ───────────────────────────────────────────────────────────────────

create type public.user_role as enum ('user', 'moderator', 'admin');

-- Moderation workflow state (bot submissions land here as 'pending_review').
-- 'rejected' is not in the original spec's literal list but is added because
-- the Admin Panel's "Reject" button needs a terminal state distinct from
-- 'closed' (closed = the event happened/ended; rejected = never published).
create type public.conference_review_status as enum (
  'pending_review', 'approved', 'rejected', 'closed'
);

-- Separate from the review status above: once a conference is APPROVED, this
-- is what actually drives the tracker's "Open / Upcoming / Planned" badges.
-- Kept as its own column instead of overloading conference_review_status,
-- since "approved but registration not open yet" and "approved and open" are
-- both just `status = 'approved'` from a moderation standpoint.
create type public.registration_status as enum (
  'open', 'upcoming', 'planned', 'ongoing', 'completed', 'cancelled'
);

create type public.experience_level as enum (
  'rookie', 'intermediate', 'advanced', 'chair', 'organizer'
);

create type public.resource_kind as enum (
  'guide', 'rules_of_procedure', 'template', 'video', 'glossary', 'sample_paper'
);

create type public.participation_status as enum (
  'bookmarked', 'applied', 'accepted', 'waitlisted', 'attended', 'awarded'
);

-- Spec lists: site_visit, bot_start, ad_click, reg_click.
-- 'ad_impression' is added because without it the Admin Panel's "Ad Banner
-- CTR" widget has no denominator to divide ad_click by.
create type public.analytics_event_type as enum (
  'site_visit', 'bot_start', 'ad_click', 'ad_impression', 'reg_click'
);

create type public.ad_platform as enum ('site', 'bot', 'both');
create type public.ad_campaign_status as enum ('active', 'paused', 'archived');

-- ── user_profiles ────────────────────────────────────────────────────────────
--
-- IMPORTANT design decision: `id` is NOT the same as `auth.users.id`.
-- A person can exist here via the bot alone (telegram_id set, auth_user_id
-- null) long before — or without ever — creating a website account. This is
-- what makes the Format-B "linked account" paywall meaningful: the bot can
-- check `auth_user_id is not null` to decide whether someone is "verified".

create table public.user_profiles (
  id               uuid primary key default gen_random_uuid(),
  auth_user_id     uuid unique references auth.users (id) on delete set null,
  telegram_id      bigint unique,
  email            text unique,
  full_name        text,
  username         text unique check (username ~ '^[a-z0-9_]{3,30}$'),
  avatar_url       text,
  institution      text,
  city             text not null default 'Tashkent',
  level            public.experience_level not null default 'rookie',
  telegram_handle  text,
  bio              text check (char_length(bio) <= 500),
  xp               integer not null default 0 check (xp >= 0),
  role             public.user_role not null default 'user',
  is_banned        boolean not null default false,
  banned_reason    text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- every row must be reachable by at least one channel
  constraint user_profiles_has_identity check (auth_user_id is not null or telegram_id is not null)
);

create index user_profiles_role_idx on public.user_profiles (role) where role <> 'user';
create index user_profiles_banned_idx on public.user_profiles (is_banned) where is_banned;

-- ── telegram_link_tokens ─────────────────────────────────────────────────────
--
-- Powers the Format-B "Mandatory Verification" flow: the bot mints a
-- short-lived token and deep-links the user to `site.example/link?token=...`.
-- After they sign in/up there, the handle_new_user() trigger below attaches
-- auth_user_id + email onto the EXISTING bot-created profile instead of
-- creating a duplicate one.

create table public.telegram_link_tokens (
  id          uuid primary key default gen_random_uuid(),
  telegram_id bigint not null,
  token       text not null unique default encode(gen_random_bytes(16), 'hex'),
  expires_at  timestamptz not null default now() + interval '15 minutes',
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index telegram_link_tokens_telegram_id_idx on public.telegram_link_tokens (telegram_id);

-- ── ad_campaigns ─────────────────────────────────────────────────────────────
-- Created before conferences/analytics_logs reference it, but its own FK
-- (created_by_user_id) only needs user_profiles, which already exists above.

create table public.ad_campaigns (
  id                        uuid primary key default gen_random_uuid(),
  title                     text not null,
  image_url                 text,
  destination_url           text not null,
  platform                  public.ad_platform not null default 'both',
  status                    public.ad_campaign_status not null default 'paused',
  countdown_seconds         smallint not null default 5 check (countdown_seconds between 0 and 30),
  -- Format-B "locked gate": when true, the bot's MUN list command refuses to
  -- run until the requesting user has joined the sponsor's channel/group.
  requires_bot_subscription boolean not null default false,
  required_channel_handle   text, -- e.g. '@sponsor_channel', read when the flag above is true
  starts_at                 timestamptz,
  ends_at                   timestamptz,
  created_by_user_id        uuid references public.user_profiles (id) on delete set null,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  constraint ad_campaigns_date_order check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create index ad_campaigns_active_idx on public.ad_campaigns (platform) where status = 'active';

-- ── conferences ──────────────────────────────────────────────────────────────

create table public.conferences (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null check (slug ~ '^[a-z0-9-]{2,60}$'),
  title                 text not null,
  short_name            text check (char_length(short_name) <= 6),
  description           text,
  status                public.conference_review_status not null default 'pending_review',
  registration_status   public.registration_status not null default 'planned',
  date_start            date,                     -- null while unscheduled
  date_end              date,                     -- null for single-day events
  city                  text not null default 'Tashkent',
  venue                 text,
  registration_link     text,
  registration_deadline timestamptz,
  logo_url              text,
  banner_url            text,
  fee_amount            numeric(12, 2) check (fee_amount >= 0),
  fee_currency          char(3) not null default 'UZS',
  delegate_capacity     integer check (delegate_capacity > 0),
  committees            jsonb not null default '[]'::jsonb, -- [{name, topic, level}]
  contact_telegram      text,
  created_by_user_id    uuid references public.user_profiles (id) on delete set null,
  reviewed_by_user_id   uuid references public.user_profiles (id) on delete set null,
  reviewed_at           timestamptz,
  rejection_reason      text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint conferences_date_order
    check (date_end is null or date_start is null or date_end >= date_start),
  constraint conferences_open_requires_date
    check (registration_status <> 'open' or date_start is not null)
);

create index conferences_status_idx on public.conferences (status);
create index conferences_registration_status_idx
  on public.conferences (registration_status) where status = 'approved';
create index conferences_date_start_idx
  on public.conferences (date_start) where date_start is not null;
create index conferences_created_by_idx on public.conferences (created_by_user_id);

-- ── reviews (Review Forum) ───────────────────────────────────────────────────

create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  conference_id  uuid not null references public.conferences (id) on delete cascade,
  user_id        uuid not null references public.user_profiles (id) on delete cascade,
  rating         smallint not null check (rating between 1 and 5),
  comment_text   text check (char_length(comment_text) <= 2000),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  unique (conference_id, user_id) -- one review per delegate per conference
);

create index reviews_conference_id_idx on public.reviews (conference_id);
create index reviews_user_id_idx on public.reviews (user_id);

-- ── guides_and_resources (Knowledge Hub) ─────────────────────────────────────

create table public.guides_and_resources (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null check (slug ~ '^[a-z0-9-]{2,80}$'),
  title         text not null,
  summary       text check (char_length(summary) <= 300),
  kind          public.resource_kind not null default 'guide',
  level         public.experience_level not null default 'rookie',
  topic         text,
  content_md    text,
  external_url  text,
  file_url      text,
  read_minutes  smallint check (read_minutes between 1 and 240),
  language      char(2) not null default 'en' check (language in ('en', 'ru', 'uz')),
  author_id     uuid references public.user_profiles (id) on delete set null,
  view_count    integer not null default 0,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint resource_has_content
    check (content_md is not null or external_url is not null or file_url is not null)
);

create index guides_level_idx on public.guides_and_resources (level);
create index guides_published_idx on public.guides_and_resources (is_published) where is_published;

-- ── saved_muns (bookmarks + participation history) ──────────────────────────

create table public.saved_muns (
  user_id        uuid not null references public.user_profiles (id) on delete cascade,
  conference_id  uuid not null references public.conferences (id) on delete cascade,
  status         public.participation_status not null default 'bookmarked',
  committee      text,
  country        text,
  award          text,
  notify_on_open boolean not null default true,
  created_at     timestamptz not null default now(),

  primary key (user_id, conference_id)
);

-- ── analytics_logs ───────────────────────────────────────────────────────────
--
-- High write-volume table: bigint identity PK (cheaper than uuid at scale),
-- everything but event_type + occurred_at is nullable since most event types
-- don't apply to every dimension (a site_visit has no conference_id, an
-- anonymous visit has no user_id). Column named `occurred_at` rather than the
-- spec's `timestamp` to avoid colliding with the reserved `timestamp` type.
-- At real scale, consider partitioning this table by month (occurred_at).

create table public.analytics_logs (
  id              bigint generated always as identity primary key,
  event_type      public.analytics_event_type not null,
  conference_id   uuid references public.conferences (id) on delete set null,
  ad_campaign_id  uuid references public.ad_campaigns (id) on delete set null,
  user_id         uuid references public.user_profiles (id) on delete set null,
  metadata        jsonb not null default '{}'::jsonb,
  occurred_at     timestamptz not null default now()
);

create index analytics_logs_event_time_idx on public.analytics_logs (event_type, occurred_at desc);
create index analytics_logs_conference_idx on public.analytics_logs (conference_id) where conference_id is not null;
create index analytics_logs_ad_campaign_idx on public.analytics_logs (ad_campaign_id) where ad_campaign_id is not null;

-- ── Housekeeping triggers ───────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_user_profiles_touch before update on public.user_profiles
  for each row execute function public.touch_updated_at();
create trigger trg_conferences_touch before update on public.conferences
  for each row execute function public.touch_updated_at();
create trigger trg_reviews_touch before update on public.reviews
  for each row execute function public.touch_updated_at();
create trigger trg_guides_touch before update on public.guides_and_resources
  for each row execute function public.touch_updated_at();
create trigger trg_ad_campaigns_touch before update on public.ad_campaigns
  for each row execute function public.touch_updated_at();

-- Auto-stamp reviewed_at whenever a moderator flips a conference's status.
create or replace function public.stamp_conference_review()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status and new.status in ('approved', 'rejected') then
    new.reviewed_at = now();
  end if;
  return new;
end $$;

create trigger trg_conferences_review_stamp before update on public.conferences
  for each row execute function public.stamp_conference_review();

-- Identity handshake: creates a profile on website signup, OR — if the
-- signup metadata carries a valid `link_token` minted by the bot — attaches
-- this auth identity onto the EXISTING telegram-first profile instead.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_token record;
begin
  if new.raw_user_meta_data ? 'link_token' then
    select * into v_token
    from public.telegram_link_tokens
    where token = new.raw_user_meta_data ->> 'link_token'
      and used_at is null
      and expires_at > now();

    if found then
      update public.user_profiles
      set auth_user_id = new.id,
          email = coalesce(email, new.email)
      where telegram_id = v_token.telegram_id;

      update public.telegram_link_tokens
      set used_at = now()
      where id = v_token.id;

      return new;
    end if;
  end if;

  -- No valid link token: plain website signup, no bot history yet.
  insert into public.user_profiles (auth_user_id, email, username, full_name, avatar_url)
  values (
    new.id,
    new.email,
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '_', 'gi'))
      || '_' || substr(new.id::text, 1, 4),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row Level Security ──────────────────────────────────────────────────────

alter table public.user_profiles         enable row level security;
alter table public.telegram_link_tokens  enable row level security;
alter table public.ad_campaigns          enable row level security;
alter table public.conferences           enable row level security;
alter table public.reviews               enable row level security;
alter table public.guides_and_resources  enable row level security;
alter table public.saved_muns            enable row level security;
alter table public.analytics_logs        enable row level security;

-- Reused in several policies below: is the requesting auth user staff
-- (moderator/admin) and not banned?
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_profiles
    where auth_user_id = auth.uid()
      and role in ('moderator', 'admin')
      and not is_banned
  );
$$;

-- user_profiles: public directory (reviews need to join author names),
-- self-service edits, staff can moderate (ban/unban, change role).
create policy "profiles are viewable by everyone"
  on public.user_profiles for select using (true);
create policy "users update own profile"
  on public.user_profiles for update
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid() and role = 'user'); -- can't self-promote
create policy "staff can moderate profiles"
  on public.user_profiles for update using (public.is_staff());

-- telegram_link_tokens: no direct client access — only the bot's service
-- role and the SECURITY DEFINER trigger above touch this table.

-- ad_campaigns: everyone can read ACTIVE campaigns (the popup/bot need this);
-- only staff manage the full lifecycle.
create policy "active campaigns are viewable by everyone"
  on public.ad_campaigns for select using (status = 'active' or public.is_staff());
create policy "staff manage ad campaigns"
  on public.ad_campaigns for all using (public.is_staff()) with check (public.is_staff());

-- conferences: public sees approved events; submitters see their own
-- pending/rejected ones; staff see and moderate everything.
create policy "approved conferences are viewable by everyone"
  on public.conferences for select
  using (
    status = 'approved'
    or created_by_user_id in (select id from public.user_profiles where auth_user_id = auth.uid())
    or public.is_staff()
  );
create policy "authenticated users submit conferences"
  on public.conferences for insert
  with check (
    status = 'pending_review'
    and created_by_user_id in (select id from public.user_profiles where auth_user_id = auth.uid())
  );
create policy "staff moderate conferences"
  on public.conferences for update using (public.is_staff());

-- reviews: public read; authenticated, non-banned users manage their own.
create policy "reviews are viewable by everyone"
  on public.reviews for select using (true);
create policy "users manage own reviews"
  on public.reviews for all
  using (user_id in (
    select id from public.user_profiles where auth_user_id = auth.uid() and not is_banned
  ))
  with check (user_id in (
    select id from public.user_profiles where auth_user_id = auth.uid() and not is_banned
  ));

-- guides_and_resources: published ones are public; authors manage drafts.
create policy "published guides are viewable by everyone"
  on public.guides_and_resources for select
  using (is_published or public.is_staff());
create policy "staff manage guides"
  on public.guides_and_resources for all using (public.is_staff()) with check (public.is_staff());

-- saved_muns: strictly private to each user.
create policy "users manage own saved muns"
  on public.saved_muns for all
  using (user_id in (select id from public.user_profiles where auth_user_id = auth.uid()))
  with check (user_id in (select id from public.user_profiles where auth_user_id = auth.uid()));

-- analytics_logs: anyone (incl. anonymous) can INSERT their own event beacon;
-- only staff can read the aggregated data back.
create policy "anyone can log an event"
  on public.analytics_logs for insert with check (true);
create policy "staff read analytics"
  on public.analytics_logs for select using (public.is_staff());

-- ── Reporting view: Ad Banner CTR (used by the Admin Panel widget) ─────────

create view public.ad_campaign_ctr as
select
  c.id,
  c.title,
  count(*) filter (where l.event_type = 'ad_impression') as impressions,
  count(*) filter (where l.event_type = 'ad_click')      as clicks,
  round(
    100.0 * count(*) filter (where l.event_type = 'ad_click')
      / nullif(count(*) filter (where l.event_type = 'ad_impression'), 0),
    2
  ) as ctr_percent
from public.ad_campaigns c
left join public.analytics_logs l on l.ad_campaign_id = c.id
group by c.id, c.title;

-- ── Realtime: push live changes to every open dashboard ─────────────────────

alter publication supabase_realtime add table public.conferences;
alter publication supabase_realtime add table public.ad_campaigns;

-- ── Seed: the 2026 season + a few bot-submitted proposals for the demo ──────

insert into public.conferences (slug, title, short_name, status, registration_status, date_start, date_end) values
  -- registration open
  ('yq-mun',    'Yashil Qo''llar MUN', 'YQ',   'approved', 'open', '2026-07-11', null),
  ('gs-mun',    'Global Step MUN',     'GS',   'approved', 'open', '2026-07-12', null),
  ('sol-mun-2', 'SOL MUN 2',           'SOL',  'approved', 'open', '2026-07-17', '2026-07-18'),
  ('fs-mun',    'FS MUN',              'FS',   'approved', 'open', '2026-07-19', null),
  ('pdp-mun',   'PDP MUN',             'PDP',  'approved', 'open', '2026-07-26', null),
  ('aegis-mun', 'AEGIS MUN',           'AEG',  'approved', 'open', '2026-08-02', null),
  -- upcoming (dates announced, registration not open yet)
  ('ou-mun',    'OU MUN',              'OU',   'approved', 'upcoming', '2026-08-15', '2026-08-16'),
  ('piima-mun', 'PIIMA MUN',           'PIA',  'approved', 'upcoming', '2026-08-23', null),
  ('js-mun',    'JS MUN',              'JS',   'approved', 'upcoming', '2026-09-06', null),
  ('ois-mun-4', 'OIS MUN 4.0',         'OIS',  'approved', 'upcoming', '2026-09-12', '2026-09-13'),
  ('wist-mun',  'WIST MUN',            'WIST', 'approved', 'upcoming', '2026-09-19', null),
  -- planned, date TBA
  ('special-mun', 'Special MUN', 'SPL',  'approved', 'planned', null, null),
  ('aluwed-mun',  'ALUWED MUN',  'ALU',  'approved', 'planned', null, null),
  ('tiiame-mun',  'TIIAME MUN',  'TIA',  'approved', 'planned', null, null),
  ('ns-mun',      'NS MUN',      'NS',   'approved', 'planned', null, null),
  ('tsuos-mun',   'TSUOS MUN',   'TSU',  'approved', 'planned', null, null),
  ('mdist-mun',   'MDIST MUN',   'MDT',  'approved', 'planned', null, null),
  ('target-mun',  'Target MUN',  'TGT',  'approved', 'planned', null, null),
  ('newuu-mun',   'NewUU MUN',   'NUU',  'approved', 'planned', null, null),
  ('emu-mun',     'EMU MUN',     'EMU',  'approved', 'planned', null, null),
  ('eis-mun',     'EIS MUN',     'EIS',  'approved', 'planned', null, null),
  ('ptu-mun',     'PTU MUN',     'PTU',  'approved', 'planned', null, null),
  ('jdu-mun',     'JDU MUN',     'JDU',  'approved', 'planned', null, null),
  -- pending moderation queue — simulates bot-submitted proposals awaiting review
  ('rvsu-mun',  'RVSU MUN',  'RVS', 'pending_review', 'planned', null, null),
  ('inha-mun',  'INHA MUN',  'INH', 'pending_review', 'planned', null, null),
  ('wiut-mun',  'WIUT MUN',  'WIU', 'pending_review', 'planned', null, null);

insert into public.ad_campaigns (title, image_url, destination_url, platform, status, countdown_seconds, requires_bot_subscription) values
  ('AEGIS MUN 2026 — Registration Open', '/ads/aegis-sponsor.jpg', '#register-aegis', 'both', 'active', 5, true);

-- ============================================================================
-- Out of scope for this pass: AI Delegate Mentor tables (e.g. a
-- `mentor_sessions` / `mentor_messages` pair keyed on user_profiles.id).
-- Not requested in this task; add when that feature is actually built.
-- ============================================================================
