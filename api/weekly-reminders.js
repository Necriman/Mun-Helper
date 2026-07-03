import { Bot } from 'grammy';
import { createClient } from '@supabase/supabase-js';
import { CONFERENCES } from '../src/data/conferences.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '');

if (!token) throw new Error('TELEGRAM_BOT_TOKEN is required');
if (!supabaseUrl || !supabaseAnonKey) throw new Error('SUPABASE_URL / SUPABASE_ANON_KEY are required');

const bot = new Bot(token);
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const ONE_DAY_MS = 86_400_000;

function formatDate(iso) {
  if (!iso) return 'Date TBA';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatDateRange(start, end) {
  if (!start) return 'Date TBA';
  return end ? `${formatDate(start)} - ${formatDate(end)}` : formatDate(start);
}

function daysUntilDate(iso) {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${iso}T00:00:00`);
  return Math.round((target - today) / ONE_DAY_MS);
}

function mapRow(row) {
  return {
    slug: row.slug,
    title: row.title,
    dateStart: row.date_start,
    dateEnd: row.date_end,
    city: row.city,
    registrationLink: row.registration_link,
  };
}

async function loadConferences() {
  const { data, error } = await supabase
    .from('conferences')
    .select('slug, title, date_start, date_end, city, registration_link')
    .eq('status', 'approved')
    .in('registration_status', ['open', 'upcoming'])
    .order('date_start', { ascending: true, nullsFirst: false });

  if (!error && data?.length) return data.map(mapRow);
  return CONFERENCES.filter((item) => item.startDate).map((item) => ({
    slug: item.id,
    title: item.name,
    dateStart: item.startDate,
    dateEnd: item.endDate,
    city: item.city,
    registrationLink: item.registrationUrl,
  }));
}

async function loadRecipients() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('telegram_id')
    .not('telegram_id', 'is', null)
    .eq('is_banned', false);

  if (error) throw error;
  return [...new Set((data ?? []).map((row) => row.telegram_id).filter(Boolean))];
}

async function alreadySent(conference, telegramId) {
  const { data, error } = await supabase
    .from('analytics_logs')
    .select('id')
    .eq('event_type', 'bot_start')
    .contains('metadata', {
      kind: 'weekly_mun_reminder',
      conference_slug: conference.slug,
      date_start: conference.dateStart,
      telegram_id: String(telegramId),
    })
    .maybeSingle();

  if (error) return false;
  return !!data;
}

async function markSent(conference, telegramId) {
  await supabase.from('analytics_logs').insert({
    event_type: 'bot_start',
    metadata: {
      kind: 'weekly_mun_reminder',
      conference_slug: conference.slug,
      date_start: conference.dateStart,
      telegram_id: String(telegramId),
    },
  });
}

function reminderText(conference) {
  return [
    `One week left until ${conference.title}`,
    '',
    `Date: ${formatDateRange(conference.dateStart, conference.dateEnd)}`,
    `City: ${conference.city ?? 'Tashkent'}`,
    conference.registrationLink ? `Registration: ${conference.registrationLink}` : null,
    siteUrl ? `Details: ${siteUrl}/conferences/${conference.slug}` : null,
    '',
    'Use /muns to check all upcoming MUNs.',
  ]
    .filter(Boolean)
    .join('\n');
}

export default async function handler(req, res) {
  if (process.env.CRON_SECRET) {
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (req.headers.authorization !== expected) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  const dueConferences = (await loadConferences()).filter((conference) => daysUntilDate(conference.dateStart) === 7);
  const recipients = await loadRecipients();
  let sent = 0;

  for (const conference of dueConferences) {
    for (const telegramId of recipients) {
      if (await alreadySent(conference, telegramId)) continue;
      try {
        await bot.api.sendMessage(telegramId, reminderText(conference));
        await markSent(conference, telegramId);
        sent += 1;
      } catch (err) {
        console.warn('[weekly reminders]', telegramId, err?.description ?? err?.message ?? err);
      }
    }
  }

  res.status(200).json({ ok: true, dueConferences: dueConferences.length, recipients: recipients.length, sent });
}
