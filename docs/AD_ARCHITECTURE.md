# Commercial Advertising Architecture

Two premium ad formats, both driven by the same `ad_campaigns` table (see
`supabase/schema.sql`) so a single admin action can target site, bot, or both.

## Format A — Web Pop-up (un-dismissable countdown modal)

**UX flow**

1. On first paint of any page in a browser session, the client fetches the
   single active campaign where `platform in ('site','both')`
   (`select * from ad_campaigns where status='active' and platform in ('site','both') order by created_at desc limit 1`).
2. If found, and this session hasn't already seen it (`sessionStorage` flag —
   see note below), render a full-screen modal:
   - Backdrop click → no-op (not a dismiss trigger).
   - `Escape` key → no-op (listener installed but intentionally swallows it).
   - Close (X) button starts **disabled**, showing the remaining seconds
     (`countdown_seconds` from the campaign row, default 5) inside or next to
     it.
   - A `setInterval`-driven counter ticks down once per second; at 0 the
     button's `disabled` attribute is removed and its styling switches from
     "inert circle with a number" to an active, hoverable close affordance.
   - The sponsor CTA button is clickable immediately (a user who *wants* to
     engage with the ad shouldn't be blocked by the countdown — only the
     *escape* is gated, not the *conversion*).
3. Analytics beacons:
   - On mount → `insert into analytics_logs (event_type, ad_campaign_id) values ('ad_impression', :id)`.
   - On CTA click → `insert ... ('ad_click', :id)`, then `window.open(destination_url)`.
   - Both inserts go through the public "anyone can log an event" RLS policy
     (anon-safe, write-only — see schema).

**Why session-scoped, not literally "every page load"**

The brief says "appears upon entering the site." Firing it on *every* route
change inside an SPA (not just the first entry) would be actively hostile
UX and would inflate impression counts without inflating real reach. The
reference implementation (`src/components/ads/AdPopupModal.jsx`) gates on
`sessionStorage.getItem('adSeen:<campaignId>')`, keyed by campaign id so a
*new* campaign still shows even if an old one was already dismissed this
session. If the business genuinely wants "every single page load, no
exceptions," delete that one guard clause — the countdown/lock logic is
unaffected either way.

**Why the close button becomes enabled instead of the modal auto-closing**

Auto-closing after N seconds would defeat the purpose (no user attention
guarantee); leaving it permanently locked would be a dark pattern with no
opt-out. Converting the countdown into an *enable* trigger is the standard,
defensible middle ground used by ad-supported gating (comparable to
"Skip Ad in 5s" on video platforms).

## Format B — Telegram Broadcast + Locked Gate

### B1. Mass broadcast

A staff-only action in the Admin Panel's Ad Campaign Creator ("Send to Bot
subscribers now"). Technical flow:

1. Admin panel calls a Supabase Edge Function (`broadcast-campaign`) with
   the campaign id, authenticated as staff (checked against `is_staff()`).
2. The function runs with the **service role key** (bypasses RLS) and
   selects every eligible recipient:
   `select telegram_id from user_profiles where telegram_id is not null and not is_banned`.
3. It calls the Telegram Bot API's `sendMessage` per recipient, respecting
   Telegram's rate limits (≈30 msgs/sec globally, ≈1 msg/sec per individual
   chat) — batch with a small delay between calls, and catch `403 Forbidden`
   (user blocked the bot) to mark that profile's `telegram_id` as
   unreachable rather than retrying forever.
4. Each successful send can optionally log an `analytics_logs` row
   (`event_type = 'ad_impression'`, `metadata: {channel: 'bot'}`) for
   unified CTR reporting alongside the web popup.

This runs as a background job, not a synchronous request — for a broadcast
list in the thousands, the Edge Function should enqueue and return
immediately, with a separate worker (or a chain of function invocations)
doing the actual paced sending.

### B2. Locked Gate ("Mandatory Verification")

This is the more interesting piece: the bot's `/list` (or "View MUNs") command
refuses to run until the user has a **linked, non-anonymous** website
account. It reuses the exact same `auth_user_id` linkage built for
account creation in general — it isn't a separate mechanism, just an
enforcement point in front of one command.

**Flow:**

1. User sends `/start` or taps "View MUN List" in the bot.
2. Bot looks up `user_profiles` by `telegram_id`. Two cases:
   - **No row** → this is this person's first contact. Insert a fresh
     `user_profiles` row with only `telegram_id` set (via service role —
     this is the row `handle_new_user()` in the schema will later *update*
     rather than duplicate, once they link).
   - **Row exists** → check `auth_user_id is not null`.
3. If `auth_user_id is null` (unverified/bot-only), the bot does **not**
   run the list query. Instead it replies with an inline keyboard:
   > "🔒 Create or link your Mun Helper account to view the conference
   > list." → button deep-links to
   > `https://munhelper.example/link?token=<one-time-token>`
   The token is minted server-side into `telegram_link_tokens`
   (`telegram_id`, random `token`, 15-minute expiry) before the button is
   sent.
4. User taps through, lands on the website, signs in or signs up with
   Supabase Auth. The signup call passes `link_token` in the auth
   metadata (`data: { link_token }` on `supabase.auth.signUp`/`signInWithOAuth`).
5. Postgres trigger `handle_new_user()` (see schema) reads that metadata
   key at the moment the `auth.users` row is created, finds the matching
   unexpired `telegram_link_tokens` row, and **updates the existing
   bot-created profile** — setting `auth_user_id` and `email` on it —
   instead of inserting a duplicate profile. The token is marked used.
6. User returns to the bot and re-sends "View MUN List." This time
   `auth_user_id is not null` → the gate opens, the bot runs the normal
   query against `conferences where status='approved'` and replies with
   the list.

**Why gate at the command level, not at `/start`:** blocking `/start`
itself is hostile (the user hasn't even seen what the bot offers yet).
Gating specifically the value-delivering command — the list, or optionally
reviews — lets people explore first ("what is this bot") and hit the wall
only when they try to extract the actual utility, which is the moment
verification friction is most tolerable.

**Relationship to Format A's `requires_bot_subscription` flag:** a *separate*,
optional gate on `ad_campaigns` — when true, the bot also requires the user
to have joined a sponsor's channel (`required_channel_handle`) before
showing ad-adjacent content, checked via the Telegram Bot API's
`getChatMember`. This composes with, but is independent of, the account-link
gate above (list access needs a linked account; sponsor-gated content
additionally needs channel membership).
