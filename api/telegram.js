import { Bot, InlineKeyboard, Keyboard, webhookCallback } from 'grammy';
import { createClient } from '@supabase/supabase-js';
import { CONFERENCES } from '../src/data/conferences.js';
import { MATERIAL_CATEGORIES, PREP_MATERIALS } from '../src/data/prepMaterials.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '');

if (!token) throw new Error('TELEGRAM_BOT_TOKEN is required');
if (!supabaseUrl || !supabaseAnonKey) throw new Error('SUPABASE_URL / SUPABASE_ANON_KEY are required');

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const bot = new Bot(token);

const menu = new Keyboard()
  .text('View MUN list')
  .text('Preparation materials')
  .row()
  .text('Leave a review')
  .text('Link my account')
  .resized();

const statusLabel = {
  open: 'Open',
  upcoming: 'Upcoming',
  planned: 'Date TBA',
};

function formatDate(iso) {
  if (!iso) return 'Date TBA';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatDateRange(start, end) {
  if (!start) return 'Date TBA';
  return end ? `${formatDate(start)} - ${formatDate(end)}` : formatDate(start);
}

function siteConferenceUrl(slug) {
  return siteUrl ? `${siteUrl}/conferences/${slug}` : null;
}

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortName: row.short_name,
    status: row.registration_status,
    dateStart: row.date_start,
    dateEnd: row.date_end,
    city: row.city,
    venue: row.venue,
    description: row.description,
    registrationLink: row.registration_link,
    telegramUrl: row.contact_telegram ? `https://t.me/${row.contact_telegram.replace(/^@/, '')}` : null,
    secretariat: row.contact_telegram ?? 'Secretariat TBA',
    committees: Array.isArray(row.committees) ? row.committees.map((item) => item.name ?? item).filter(Boolean) : [],
    fee: row.fee_amount ? `${Number(row.fee_amount).toLocaleString()} ${row.fee_currency}` : 'TBA',
    capacity: row.delegate_capacity ? `${row.delegate_capacity} delegates` : 'TBA',
  };
}

function mapMock(item) {
  return {
    id: item.id,
    slug: item.id,
    title: item.name,
    shortName: item.short,
    status: item.status,
    dateStart: item.startDate,
    dateEnd: item.endDate,
    city: item.city,
    venue: item.venue,
    description: item.description,
    registrationLink: item.registrationUrl,
    telegramUrl: item.telegramUrl,
    secretariat: item.secretariat,
    committees: item.committees ?? [],
    fee: item.fee,
    capacity: item.capacity,
  };
}

async function loadConferences() {
  const { data, error } = await supabase
    .from('conferences')
    .select(
      'id, slug, title, short_name, description, registration_status, date_start, date_end, city, venue, registration_link, fee_amount, fee_currency, delegate_capacity, committees, contact_telegram',
    )
    .eq('status', 'approved')
    .in('registration_status', ['open', 'upcoming', 'planned'])
    .order('date_start', { ascending: true, nullsFirst: false });

  if (!error && data?.length) return data.map(mapRow);
  return CONFERENCES.map(mapMock);
}

function listKeyboard(conferences) {
  const keyboard = new InlineKeyboard();
  conferences.forEach((conference) => keyboard.text(`${conference.shortName ?? 'MUN'} - ${conference.title}`, `mun:${conference.slug}`).row());
  return keyboard;
}

function conferenceKeyboard(conference) {
  const keyboard = new InlineKeyboard();
  if (conference.registrationLink) keyboard.url('Registration', conference.registrationLink);
  if (conference.telegramUrl) keyboard.url('Telegram channel', conference.telegramUrl);
  keyboard.row();
  const pageUrl = siteConferenceUrl(conference.slug);
  if (pageUrl) keyboard.url('Reviews on site', `${pageUrl}#reviews`);
  keyboard.text('Back to MUN list', 'mun:list');
  return keyboard;
}

function conferenceText(conference) {
  const committees = conference.committees?.length ? conference.committees.join(', ') : 'Committees TBA';
  return [
    `${conference.title}`,
    `${statusLabel[conference.status] ?? conference.status} / ${formatDateRange(conference.dateStart, conference.dateEnd)}`,
    `City: ${conference.city ?? 'Tashkent'}`,
    `Venue: ${conference.venue ?? 'Venue TBA'}`,
    `Secretariat: ${conference.secretariat ?? 'Secretariat TBA'}`,
    `Committees: ${committees}`,
    `Capacity / fee: ${conference.capacity ?? 'TBA'} / ${conference.fee ?? 'TBA'}`,
    '',
    conference.description ?? 'More details will be published by the organizer soon.',
  ].join('\n');
}

async function sendMunList(ctx, edit = false) {
  const conferences = (await loadConferences()).filter((conference) => conference.status !== 'planned' || !conference.dateStart);
  if (!conferences.length) {
    await ctx.reply('No conferences on record right now. Check back soon.');
    return;
  }
  const text = 'Upcoming MUNs are public. Choose a MUN to see registration, Telegram channel and reviews:';
  const reply_markup = listKeyboard(conferences);
  if (edit) await ctx.editMessageText(text, { reply_markup });
  else await ctx.reply(text, { reply_markup });
}

function materialCategoryKeyboard() {
  const keyboard = new InlineKeyboard();
  MATERIAL_CATEGORIES.filter((category) => category.id !== 'all').forEach((category, index) => {
    keyboard.text(category.label, `prep:cat:${category.id}`);
    if (index % 2 === 1) keyboard.row();
  });
  if (siteUrl) keyboard.row().url('Open full Academy on site', `${siteUrl}/#academy`);
  return keyboard;
}

function materialListKeyboard(categoryId) {
  const keyboard = new InlineKeyboard();
  PREP_MATERIALS.filter((material) => material.category === categoryId)
    .slice(0, 12)
    .forEach((material) => keyboard.text(material.title.slice(0, 58), `prep:item:${material.id}`).row());
  keyboard.text('Back to categories', 'prep:list');
  return keyboard;
}

function materialText(material) {
  return [
    `${material.title}`,
    `${material.type} / ${material.language} / ${material.level}`,
    `Time: ${material.time}`,
    '',
    material.summary,
  ].join('\n');
}

async function sendMaterialCategories(ctx, edit = false) {
  const text = 'Preparation materials\n\nChoose what you want to train: basics, research, position papers, resolutions, committees, or videos.';
  const reply_markup = materialCategoryKeyboard();
  if (edit) await ctx.editMessageText(text, { reply_markup });
  else await ctx.reply(text, { reply_markup });
}

async function rememberProfile(ctx) {
  if (!ctx.from?.id) return;
  const { error } = await supabase.rpc('bot_upsert_profile', {
    p_telegram_id: ctx.from.id,
    p_telegram_handle: ctx.from.username ?? null,
  });
  if (error) console.warn('[telegram webhook] profile upsert failed:', error.message);
}

bot.command('start', async (ctx) => {
  await rememberProfile(ctx);
  await ctx.reply(
    [
      "Welcome to Mun Helper, Uzbekistan's Model UN delegate desk.",
      '',
      'Browse upcoming MUNs, open registration links, read reviews, and train with preparation materials before committee.',
    ].join('\n'),
    { reply_markup: menu },
  );
});

bot.command('muns', (ctx) => sendMunList(ctx));
bot.command('materials', (ctx) => sendMaterialCategories(ctx));
bot.hears(/^(?:📋\s*)?(View MUN list|Список MUN|Предстоящие MUN|Муны)$/i, (ctx) => sendMunList(ctx));
bot.hears(/^(Preparation materials|Материалы|Подготовка)$/i, (ctx) => sendMaterialCategories(ctx));

bot.callbackQuery('mun:list', async (ctx) => {
  await ctx.answerCallbackQuery();
  await sendMunList(ctx, true);
});

bot.callbackQuery(/^mun:(?!list$)(.+)$/, async (ctx) => {
  const conference = (await loadConferences()).find((item) => item.slug === ctx.match[1]);
  await ctx.answerCallbackQuery();
  if (!conference) {
    await ctx.editMessageText('This MUN is no longer available. Please refresh the list.');
    return;
  }
  await ctx.editMessageText(conferenceText(conference), { reply_markup: conferenceKeyboard(conference) });
});

bot.callbackQuery('prep:list', async (ctx) => {
  await ctx.answerCallbackQuery();
  await sendMaterialCategories(ctx, true);
});

bot.callbackQuery(/^prep:cat:(.+)$/, async (ctx) => {
  const category = MATERIAL_CATEGORIES.find((item) => item.id === ctx.match[1]);
  await ctx.answerCallbackQuery();
  if (!category) {
    await ctx.editMessageText('This category is not available anymore. Please refresh the list.');
    return;
  }
  await ctx.editMessageText(`${category.label}\n\nChoose a material:`, {
    reply_markup: materialListKeyboard(category.id),
  });
});

bot.callbackQuery(/^prep:item:(.+)$/, async (ctx) => {
  const material = PREP_MATERIALS.find((item) => item.id === ctx.match[1]);
  await ctx.answerCallbackQuery();
  if (!material) {
    await ctx.editMessageText('This material is not available anymore. Please refresh the list.');
    return;
  }
  const keyboard = new InlineKeyboard().url('Open material', material.url).row().text('Back to materials', `prep:cat:${material.category}`);
  await ctx.editMessageText(materialText(material), { reply_markup: keyboard });
});

bot.catch((err) => console.error('[telegram webhook]', err.error ?? err));

const handleUpdate = webhookCallback(bot, 'http');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ ok: true, endpoint: 'Mun Helper Telegram webhook' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  await handleUpdate(req, res);
}
