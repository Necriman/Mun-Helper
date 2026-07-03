/**
 * Mock conference data for the 2026 season.
 *
 * Shape mirrors the `conferences` table in supabase/schema.sql so swapping to
 * live data is a pure mapping exercise (see src/hooks/useConferences.js).
 *
 * status: 'open'     → registration is live right now
 *         'upcoming' → dates announced, registration not open yet
 *         'planned'  → confirmed by organizers, date TBA
 *
 * Mirrors the DB's `registration_status` enum (separate from the
 * moderation `status` enum — see supabase/schema.sql).
 */

// Solid, formal monogram colors — evoke delegation plaques rather than a
// SaaS gradient palette. Deterministic per conference so cards keep their
// color across re-renders/refetches.
const PALETTE = [
  '#0F3355', // navy
  '#7A2E2E', // burgundy
  '#2F5233', // forest
  '#8F7124', // gold
  '#3A4750', // slate
  '#1F6F78', // teal
  '#5C3A63', // plum
  '#8C4A2F', // rust
];

export function colorFor(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

/** Visual + label config per status, consumed by badges, pills and cards. */
export const STATUS = {
  open: {
    label: 'Registration open',
    dot: 'bg-un-500',
    badge: 'border-un-500/30 bg-un-50 text-un-700',
  },
  upcoming: {
    label: 'Upcoming',
    dot: 'bg-gold-500',
    badge: 'border-gold-500/30 bg-gold-50 text-gold-700',
  },
  planned: {
    label: 'Date TBA',
    dot: 'bg-slate-400',
    badge: 'border-slate-300 bg-slate-50 text-slate-600',
  },
};

const dated = (id, name, short, status, startDate, endDate = null) => ({
  id,
  name,
  short,
  status,
  startDate,
  endDate,
  city: 'Tashkent',
  registrationUrl: status === 'open' ? '#register' : null,
  color: colorFor(id),
});

const planned = (name) => {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    id,
    name,
    short: name.replace(/\s*MUN.*$/i, '').slice(0, 4).toUpperCase(),
    status: 'planned',
    startDate: null,
    endDate: null,
    city: 'Tashkent',
    registrationUrl: null,
    color: colorFor(id),
  };
};

export const CONFERENCES = [
  // ── Registration open ─────────────────────────────────────────────
  dated('yq-mun', "Yashil Qo'llar MUN", 'YQ', 'open', '2026-07-11'),
  dated('gs-mun', 'Global Step MUN', 'GS', 'open', '2026-07-12'),
  dated('sol-mun-2', 'SOL MUN 2', 'SOL', 'open', '2026-07-17', '2026-07-18'),
  dated('fs-mun', 'FS MUN', 'FS', 'open', '2026-07-19'),
  dated('pdp-mun', 'PDP MUN', 'PDP', 'open', '2026-07-26'),
  dated('aegis-mun', 'AEGIS MUN', 'AEG', 'open', '2026-08-02'),

  // ── Dates announced, registration not open yet ────────────────────
  dated('ou-mun', 'OU MUN', 'OU', 'upcoming', '2026-08-15', '2026-08-16'),
  dated('piima-mun', 'PIIMA MUN', 'PIA', 'upcoming', '2026-08-23'),
  dated('js-mun', 'JS MUN', 'JS', 'upcoming', '2026-09-06'),
  dated('ois-mun-4', 'OIS MUN 4.0', 'OIS', 'upcoming', '2026-09-12', '2026-09-13'),
  dated('wist-mun', 'WIST MUN', 'WIST', 'upcoming', '2026-09-19'),

  // ── Planned, date TBA ──────────────────────────────────────────────
  planned('Special MUN'),
  planned('ALUWED MUN'),
  planned('TIIAME MUN'),
  planned('NS MUN'),
  planned('TSUOS MUN'),
  planned('MDIST MUN'),
  planned('Target MUN'),
  planned('NewUU MUN'),
  planned('EMU MUN'),
  planned('EIS MUN'),
  planned('PTU MUN'),
  planned('JDU MUN'),
];

/** Academy teaser content (pillar 2) — becomes `guides_and_resources` rows later. */
export const ACADEMY_TRACKS = [
  {
    id: 'starter-pack',
    title: 'Delegate Starter Pack',
    level: 'Rookie',
    guides: 12,
    blurb: 'Dress code, placards, your first speech — everything you need before day one.',
  },
  {
    id: 'rules-of-procedure',
    title: 'Rules of Procedure, Decoded',
    level: 'All levels',
    guides: 8,
    blurb: 'Motions, points and yields turned into an interactive cheat-sheet.',
  },
  {
    id: 'chairs-handbook',
    title: "The Chair's Handbook",
    level: 'Advanced',
    guides: 6,
    blurb: 'Flow control, crisis management and fair scoring for committee chairs.',
  },
];
