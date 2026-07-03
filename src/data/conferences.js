/**
 * Mock conference data for the 2026 season.
 *
 * The shape mirrors the public `conferences` feed, with a few UI-only fields
 * used while Supabase rows do not yet store every organizer detail.
 */

const PALETTE = [
  '#3B82C4',
  '#0F3355',
  '#164876',
  '#1F6F78',
  '#2F5233',
  '#7A2E2E',
  '#8F7124',
  '#5C3A63',
];

export function colorFor(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export const STATUS = {
  open: {
    label: 'Registration open',
    dot: 'bg-un-500',
    badge: 'border-un-500/30 bg-un-50 text-un-800',
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

const openLinks = {
  'yq-mun': 'https://docs.google.com/forms/',
  'gs-mun': 'https://t.me/globalstepmun',
  'sol-mun-2': 'https://docs.google.com/forms/',
  'fs-mun': 'https://t.me/fsmun',
  'pdp-mun': 'https://pdp.uz',
  'aegis-mun': 'https://t.me/aegismun',
};

const telegramFor = (id) => `https://t.me/${id.replace(/-/g, '')}`;

const conference = ({
  id,
  name,
  short,
  status,
  startDate = null,
  endDate = null,
  city = 'Tashkent',
  venue = 'Venue TBA',
  secretariat = 'Secretariat TBA',
  telegramUrl,
  registrationUrl,
  websiteUrl,
  description,
  committees = ['General Assembly', 'Crisis Cabinet'],
  fee = 'TBA',
  capacity = '80-140 delegates',
}) => ({
  id,
  name,
  short,
  status,
  startDate,
  endDate,
  city,
  venue,
  secretariat,
  telegramUrl: telegramUrl ?? telegramFor(id),
  registrationUrl: registrationUrl ?? (status === 'open' ? openLinks[id] ?? telegramFor(id) : null),
  websiteUrl: websiteUrl ?? telegramFor(id),
  description:
    description ??
    'A student-led Model UN conference in Uzbekistan with committee debate, chair feedback, and delegate networking.',
  committees,
  fee,
  capacity,
  color: colorFor(id),
});

const planned = (name, extra = {}) => {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return conference({
    id,
    name,
    short: name.replace(/\s*MUN.*$/i, '').slice(0, 4).toUpperCase(),
    status: 'planned',
    venue: 'Announcing soon',
    secretariat: 'Organizer team TBA',
    committees: ['Committees TBA'],
    capacity: 'TBA',
    ...extra,
  });
};

export const CONFERENCES = [
  conference({
    id: 'yq-mun',
    name: "Yashil Qo'llar MUN",
    short: 'YQ',
    status: 'open',
    startDate: '2026-07-11',
    venue: 'Tashkent youth hub',
    secretariat: 'Yashil Qo\'llar Secretariat',
    committees: ['UNEP', 'UNICEF'],
    fee: '120,000 UZS',
    description: 'Environment-focused MUN for delegates interested in climate policy and sustainable cities.',
  }),
  conference({
    id: 'gs-mun',
    name: 'Global Step MUN',
    short: 'GS',
    status: 'open',
    startDate: '2026-07-12',
    venue: 'Global Step Academy',
    secretariat: 'Global Step Secretariat',
    committees: ['UNSC', 'WHO'],
    fee: '150,000 UZS',
  }),
  conference({
    id: 'sol-mun-2',
    name: 'SOL MUN 2',
    short: 'SOL',
    status: 'open',
    startDate: '2026-07-17',
    endDate: '2026-07-18',
    venue: 'SOL Education',
    secretariat: 'SOL MUN Secretariat',
    committees: ['DISEC', 'Crisis Committee', 'UNHRC'],
    fee: '180,000 UZS',
  }),
  conference({
    id: 'fs-mun',
    name: 'FS MUN',
    short: 'FS',
    status: 'open',
    startDate: '2026-07-19',
    secretariat: 'FS organizing board',
    committees: ['ECOFIN', 'UN Women'],
    fee: '100,000 UZS',
  }),
  conference({
    id: 'pdp-mun',
    name: 'PDP MUN',
    short: 'PDP',
    status: 'open',
    startDate: '2026-07-26',
    venue: 'PDP University',
    secretariat: 'PDP MUN Secretariat',
    committees: ['UNSC', 'IT & Cybersecurity Council'],
    fee: 'TBA',
    websiteUrl: 'https://pdp.uz',
  }),
  conference({
    id: 'aegis-mun',
    name: 'AEGIS MUN',
    short: 'AEG',
    status: 'open',
    startDate: '2026-08-02',
    venue: 'AEGIS School',
    secretariat: 'AEGIS Secretariat',
    committees: ['NATO', 'UNODC'],
    fee: '160,000 UZS',
  }),
  conference({
    id: 'ou-mun',
    name: 'OU MUN',
    short: 'OU',
    status: 'upcoming',
    startDate: '2026-08-15',
    endDate: '2026-08-16',
    venue: 'Oriental University',
    secretariat: 'OU MUN Secretariat',
    committees: ['General Assembly', 'UNSC'],
  }),
  conference({
    id: 'piima-mun',
    name: 'PIIMA MUN',
    short: 'PIA',
    status: 'upcoming',
    startDate: '2026-08-23',
    venue: 'PIIMA campus',
    secretariat: 'PIIMA Secretariat',
  }),
  conference({
    id: 'js-mun',
    name: 'JS MUN',
    short: 'JS',
    status: 'upcoming',
    startDate: '2026-09-06',
    secretariat: 'JS MUN board',
  }),
  conference({
    id: 'ois-mun-4',
    name: 'OIS MUN 4.0',
    short: 'OIS',
    status: 'upcoming',
    startDate: '2026-09-12',
    endDate: '2026-09-13',
    venue: 'OIS campus',
    secretariat: 'OIS Secretariat',
    committees: ['UNSC', 'UNHRC', 'Press Corps'],
  }),
  conference({
    id: 'wist-mun',
    name: 'WIST MUN',
    short: 'WIST',
    status: 'upcoming',
    startDate: '2026-09-19',
    venue: 'WIST campus',
    secretariat: 'WIST MUN Secretariat',
  }),
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

export const ACADEMY_TRACKS = [
  {
    id: 'starter-pack',
    title: 'Delegate Starter Pack',
    level: 'Rookie',
    guides: 12,
    blurb: 'Dress code, placards, opening speeches and what to do before your first committee.',
  },
  {
    id: 'rules-of-procedure',
    title: 'Rules of Procedure, Decoded',
    level: 'All levels',
    guides: 8,
    blurb: 'Motions, points, yields and moderated caucuses explained without committee panic.',
  },
  {
    id: 'chairs-handbook',
    title: "The Chair's Handbook",
    level: 'Advanced',
    guides: 6,
    blurb: 'Flow control, crisis management and fair scoring for committee chairs.',
  },
];
