# Mun Helper — Model UN Registry & Academy

A diplomatic-styled registry and academy for the Model UN community of Uzbekistan.
Two pillars: a **live conference registry** (real-time status via Supabase) and
an **Academy** (guides & rules of procedure by experience level).

## Design language

Inspired by the visual register of formal international institutions — not a
copy of any organization's protected emblem, but the same restrained toolkit:
warm paper-white canvas, institutional blue (`un-*` scale) with a gold/bronze
accent, EB Garamond serif headings over Inter body text, hairline "plaque"
borders instead of glass/blur, and an original circular seal (globe meridians
framed by laurel-inspired branches) as the mark. Generated with the
`ui-ux-pro-max-cli` design-system tool (`.claude/skills/ui-ux-pro-max`).

## Stack

React 18 (Vite) · Tailwind CSS · Framer Motion · Lucide React · Supabase (Postgres + Auth + Realtime)

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173 — runs on mock data, zero setup
```

## Going live with Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Paste `supabase/schema.sql` into the SQL Editor and run it
   (tables + RLS + realtime + the full 2026 season seed).
3. `cp .env.example .env` and fill in the URL + anon key.
4. Restart `npm run dev`. The registry now reads live rows, and any status
   change an organizer makes appears on every open dashboard instantly.

## Project structure

```
src/
  data/conferences.js      # mock season data + status/color config
  hooks/useConferences.js  # mock-first feed, swaps to Supabase + realtime
  lib/supabase.js          # client (null-safe when .env is absent)
  lib/utils.js             # date range / countdown helpers
  components/
    Emblem.jsx             # original circular seal (SVG)
    Navbar.jsx             # fixed white letterhead-style top bar
    Hero.jsx               # kicker, serif headline, gold rule, live stats
    FilterBar.jsx          # underline-tab status filter + search ("/" to focus)
    ConferenceCard.jsx     # dated conference plaque (register / notify)
    ConferenceGrid.jsx     # animated responsive grid
    PlannedSection.jsx     # date-TBA watchlist
    AcademySection.jsx     # knowledge hub teaser
    EmptyState.jsx / Footer.jsx
supabase/schema.sql        # full DB schema — see comments inside
```

## Accessibility & polish baked in

- `prefers-reduced-motion` respected globally (`MotionConfig reducedMotion="user"`)
- Keyboard: visible focus rings, `/` focuses search, aria labels on icon buttons
- All touch targets ≥ 44 px; no emoji-as-icons; tabular numerals for countdowns
- Text contrast checked against the paper background (WCAG AA/AAA per the
  "Accessible & Ethical" style guidance used to build this design system)
