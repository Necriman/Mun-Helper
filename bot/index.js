/**
 * Mun Helper Telegram bot.
 *
 * Public flow requested by the project:
 * /start -> menu -> MUN list -> choose a MUN -> registration / reviews.
 * Account linking remains available, but browsing the list is no longer gated.
 */
import 'dotenv/config';
import { Bot, InlineKeyboard, Keyboard, session } from 'grammy';
import { createClient } from '@supabase/supabase-js';
import { CONFERENCES } from '../src/data/conferences.js';
import { MATERIAL_CATEGORIES, PREP_MATERIALS } from '../src/data/prepMaterials.js';

const { TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_ANON_KEY, SITE_URL } = process.env;

if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is required (see .env.example)');
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('SUPABASE_URL / SUPABASE_ANON_KEY are required');

const publicSiteUrl = SITE_URL && !SITE_URL.includes('localhost') ? SITE_URL.replace(/\/$/, '') : null;

if (!publicSiteUrl) {
  console.warn('SITE_URL is unset or local. Bot web links will point to the configured fallback only.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const bot = new Bot(TELEGRAM_BOT_TOKEN);

bot.use(session({ initial: () => ({ step: null, draft: {} }) }));

const MAIN_MENU = new Keyboard()
  .text('View MUN list')
  .text('Preparation materials')
  .row()
  .text('Submit a MUN')
  .text('Leave a review')
  .row()
  .text('Link my account')
  .resized();

const STATUS_LABEL = {
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
  return publicSiteUrl ? `${publicSiteUrl}/conferences/${slug}` : null;
}

function siteAcademyUrl() {
  return publicSiteUrl ? `${publicSiteUrl}/#academy` : null;
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
  conferences.forEach((conference, index) => {
    keyboard.text(`${conference.shortName ?? 'MUN'} - ${conference.title}`, `mun:${conference.slug}`);
    if (index % 1 === 0) keyboard.row();
  });
  return keyboard;
}

function conferenceKeyboard(conference) {
  const keyboard = new InlineKeyboard();
  if (conference.registrationLink) keyboard.url('Registration', conference.registrationLink);
  if (conference.telegramUrl) keyboard.url('Telegram channel', conference.telegramUrl);
  keyboard.row();
  const pageUrl = siteConferenceUrl(conference.slug);
  if (pageUrl) keyboard.url('Reviews on site', `${pageUrl}#reviews`);
  keyboard.text('Leave review in bot', `review_conf:${conference.id}`);
  keyboard.row().text('Back to MUN list', 'mun:list');
  return keyboard;
}

function conferenceText(conference) {
  const committees = conference.committees?.length ? conference.committees.join(', ') : 'Committees TBA';
  return [
    `${conference.title}`,
    `${STATUS_LABEL[conference.status] ?? conference.status} / ${formatDateRange(conference.dateStart, conference.dateEnd)}`,
    `City: ${conference.city ?? 'Tashkent'}`,
    `Venue: ${conference.venue ?? 'Venue TBA'}`,
    `Secretariat: ${conference.secretariat ?? 'Secretariat TBA'}`,
    `Committees: ${committees}`,
    `Capacity / fee: ${conference.capacity ?? 'TBA'} / ${conference.fee ?? 'TBA'}`,
    '',
    conference.description ?? 'More details will be published by the organizer soon.',
  ].join('\n');
}

function materialCategoryKeyboard() {
  const keyboard = new InlineKeyboard();
  MATERIAL_CATEGORIES.filter((category) => category.id !== 'all').forEach((category, index) => {
    keyboard.text(category.label, `prep:cat:${category.id}`);
    if (index % 2 === 1) keyboard.row();
  });
  const academyUrl = siteAcademyUrl();
  if (academyUrl) keyboard.row().url('Open full Academy on site', academyUrl);
  return keyboard;
}

function materialListKeyboard(categoryId) {
  const keyboard = new InlineKeyboard();
  const materials = PREP_MATERIALS.filter((material) => material.category === categoryId).slice(0, 12);
  materials.forEach((material) => keyboard.text(material.title.slice(0, 58), `prep:item:${material.id}`).row());
  keyboard.text('Back to categories', 'prep:list');
  return keyboard;
}

function materialKeyboard(material) {
  const keyboard = new InlineKeyboard().url('Open material', material.url);
  const academyUrl = siteAcademyUrl();
  if (academyUrl) keyboard.url('Academy', academyUrl);
  keyboard.row().text('Back to materials', `prep:cat:${material.category}`);
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
  const text = [
    'Preparation materials',
    '',
    'Choose what you want to train: basics, research, position papers, resolutions, committees, or videos.',
  ].join('\n');
  const reply_markup = materialCategoryKeyboard();
  if (edit) await ctx.editMessageText(text, { reply_markup });
  else await ctx.reply(text, { reply_markup });
}

async function sendMunList(ctx, edit = false) {
  const conferences = await loadConferences();
  if (!conferences.length) {
    await ctx.reply('No conferences on record right now. Check back soon.');
    return;
  }

  const text = 'Choose a MUN to see registration, Telegram channel and reviews:';
  const reply_markup = listKeyboard(conferences);
  if (edit) await ctx.editMessageText(text, { reply_markup });
  else await ctx.reply(text, { reply_markup });
}

async function sendLinkPrompt(ctx, telegramId) {
  const { data: token, error } = await supabase.rpc('bot_mint_link_token', { p_telegram_id: telegramId });
  if (error || !token || !publicSiteUrl) {
    await ctx.reply('Could not generate an account link right now. Please try again later.');
    return;
  }
  const keyboard = new InlineKeyboard().url('Create / link my account', `${publicSiteUrl}/link?token=${token}`);
  await ctx.reply('This link expires in 15 minutes:', { reply_markup: keyboard });
}

bot.command('start', async (ctx) => {
  const telegramId = ctx.from.id;
  await supabase.rpc('bot_upsert_profile', {
    p_telegram_id: telegramId,
    p_telegram_handle: ctx.from.username ?? null,
  });
  await supabase.from('analytics_logs').insert({ event_type: 'bot_start' });

  ctx.session.step = null;
  await ctx.reply(
    [
      "Welcome to Mun Helper, Uzbekistan's Model UN delegate desk.",
      '',
      'Browse upcoming MUNs, open registration links, read reviews, and train with preparation materials before committee.',
    ].join('\n'),
    { reply_markup: MAIN_MENU },
  );
});

bot.hears(/^(?:📋\s*)?View MUN list$/, async (ctx) => {
  ctx.session.step = null;
  await sendMunList(ctx);
});

bot.hears(/^Preparation materials$/, async (ctx) => {
  ctx.session.step = null;
  await sendMaterialCategories(ctx);
});

bot.callbackQuery('prep:list', async (ctx) => {
  await ctx.answerCallbackQuery();
  await sendMaterialCategories(ctx, true);
});

bot.callbackQuery(/^prep:cat:(.+)$/, async (ctx) => {
  const categoryId = ctx.match[1];
  const category = MATERIAL_CATEGORIES.find((item) => item.id === categoryId);
  await ctx.answerCallbackQuery();

  if (!category) {
    await ctx.editMessageText('This category is not available anymore. Please refresh the list.');
    return;
  }

  const count = PREP_MATERIALS.filter((material) => material.category === categoryId).length;
  await ctx.editMessageText(`${category.label}\n\nChoose one of ${count} materials:`, {
    reply_markup: materialListKeyboard(categoryId),
  });
});

bot.callbackQuery(/^prep:item:(.+)$/, async (ctx) => {
  const materialId = ctx.match[1];
  const material = PREP_MATERIALS.find((item) => item.id === materialId);
  await ctx.answerCallbackQuery();

  if (!material) {
    await ctx.editMessageText('This material is not available anymore. Please refresh the list.');
    return;
  }

  await ctx.editMessageText(materialText(material), { reply_markup: materialKeyboard(material) });
});

bot.callbackQuery('mun:list', async (ctx) => {
  await ctx.answerCallbackQuery();
  await sendMunList(ctx, true);
});

bot.callbackQuery(/^mun:(?!list$)(.+)$/, async (ctx) => {
  const slug = ctx.match[1];
  const conferences = await loadConferences();
  const conference = conferences.find((item) => item.slug === slug);

  await ctx.answerCallbackQuery();
  if (!conference) {
    await ctx.editMessageText('This MUN is no longer available. Please refresh the list.');
    return;
  }

  await ctx.editMessageText(conferenceText(conference), { reply_markup: conferenceKeyboard(conference) });
});

bot.hears(/^(?:✍️\s*)?Submit a MUN$/, async (ctx) => {
  ctx.session.step = 'submit_title';
  ctx.session.draft = {};
  await ctx.reply('What is the conference called? Example: RVSU MUN');
});

bot.hears(/^(?:⭐\s*)?Leave a review$/, async (ctx) => {
  const conferences = await loadConferences();
  if (!conferences.length) {
    await ctx.reply('No conferences available to review yet.');
    return;
  }

  const keyboard = new InlineKeyboard();
  conferences.slice(0, 24).forEach((conference, index) => {
    keyboard.text(conference.title, `review_conf:${conference.id}`);
    if (index % 1 === 0) keyboard.row();
  });

  ctx.session.step = null;
  await ctx.reply('Which conference would you like to review?', { reply_markup: keyboard });
});

bot.callbackQuery(/^review_conf:(.+)$/, async (ctx) => {
  const conferenceId = ctx.match[1];
  const conferences = await loadConferences();
  const conference = conferences.find((item) => String(item.id) === String(conferenceId));

  ctx.session.step = 'review_rating';
  ctx.session.draft = {
    conferenceId,
    conferenceTitle: conference?.title ?? 'this conference',
  };

  const rating = new InlineKeyboard();
  [1, 2, 3, 4, 5].forEach((n) => rating.text(`${n} star${n === 1 ? '' : 's'}`, `review_rate:${n}`));

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(`Rate "${ctx.session.draft.conferenceTitle}" from 1 to 5:`, { reply_markup: rating });
});

bot.callbackQuery(/^review_rate:(\d)$/, async (ctx) => {
  const rating = Number(ctx.match[1]);
  ctx.session.draft.rating = rating;
  ctx.session.step = 'review_comment';

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(`You rated "${ctx.session.draft.conferenceTitle}" ${rating}/5.`);
  await ctx.reply('Add a short comment, or send "-" to skip:');
});

bot.hears(/^(?:🔗\s*)?Link my account$/, async (ctx) => {
  await sendLinkPrompt(ctx, ctx.from.id);
});

bot.on('message:text', async (ctx) => {
  const step = ctx.session.step;
  if (!step) return;

  const text = ctx.message.text.trim();
  const telegramId = ctx.from.id;

  switch (step) {
    case 'submit_title':
      ctx.session.draft.title = text;
      ctx.session.step = 'submit_date';
      await ctx.reply('When does it start? Send YYYY-MM-DD, or "skip" if not set yet.');
      return;

    case 'submit_date': {
      ctx.session.draft.dateStart = /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
      ctx.session.step = 'submit_contact';
      await ctx.reply('Contact Telegram handle for this proposal? Example: @your_handle');
      return;
    }

    case 'submit_contact': {
      ctx.session.draft.contact = text;
      const { title, dateStart, contact } = ctx.session.draft;
      const { error } = await supabase.rpc('bot_submit_conference', {
        p_telegram_id: telegramId,
        p_title: title,
        p_date_start: dateStart,
        p_contact_telegram: contact,
      });
      ctx.session.step = null;
      await ctx.reply(
        error
          ? `Something went wrong: ${error.message}`
          : `Thanks. "${title}" was submitted for moderator review.`,
        { reply_markup: MAIN_MENU },
      );
      return;
    }

    case 'review_comment': {
      const { conferenceId, conferenceTitle, rating } = ctx.session.draft;
      const comment = text === '-' ? null : text;
      const { error } = await supabase.rpc('bot_submit_review', {
        p_telegram_id: telegramId,
        p_conference_id: conferenceId,
        p_rating: rating,
        p_comment_text: comment,
      });
      ctx.session.step = null;
      await ctx.reply(
        error ? `Something went wrong: ${error.message}` : `Thanks for reviewing "${conferenceTitle}"!`,
        { reply_markup: MAIN_MENU },
      );
      return;
    }

    default:
      ctx.session.step = null;
  }
});

bot.catch((err) => console.error('[bot error]', err.error ?? err));

bot.start();
console.log('Mun Helper bot is running.');
