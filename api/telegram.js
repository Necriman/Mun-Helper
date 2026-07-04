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
const userLanguages = new Map();

const I18N = {
  EN: {
    chooseLanguage: 'Choose your language:',
    languageSaved: 'Language saved.',
    welcomeTitle: "Welcome to MUNIVERSE, Uzbekistan's Model UN delegate desk.",
    welcomeBody: 'Browse upcoming MUNs, open registration links, read reviews, and train with preparation materials before committee.',
    viewMuns: 'View MUN list',
    materials: 'Preparation materials',
    review: 'Leave a review',
    link: 'Link my account',
    munsIntro: 'Upcoming MUNs are public. Choose a MUN to see registration, Telegram channel and reviews:',
    noMuns: 'No conferences on record right now. Check back soon.',
    registration: 'Registration',
    telegram: 'Telegram channel',
    reviews: 'Reviews on site',
    backMuns: 'Back to MUN list',
    backCategories: 'Back to categories',
    backMaterials: 'Back to materials',
    openAcademy: 'Open full Academy on site',
    openMaterial: 'Open material',
    materialsIntro: 'Preparation materials\n\nChoose what you want to train: basics, research, position papers, resolutions, committees, or videos.',
    chooseMaterial: 'Choose a material:',
    unavailableMun: 'This MUN is no longer available. Please refresh the list.',
    unavailableCategory: 'This category is not available anymore. Please refresh the list.',
    unavailableMaterial: 'This material is not available anymore. Please refresh the list.',
    status: { open: 'Open', upcoming: 'Upcoming', planned: 'Date TBA' },
    city: 'City',
    venue: 'Venue',
    secretariat: 'Secretariat',
    committees: 'Committees',
    capacityFee: 'Capacity / fee',
    time: 'Time',
  },
  RU: {
    chooseLanguage: 'Выбери язык:',
    languageSaved: 'Язык сохранён.',
    welcomeTitle: 'Добро пожаловать в MUNIVERSE — центр делегата Model UN в Узбекистане.',
    welcomeBody: 'Смотри предстоящие МУНы, открывай регистрацию, читай отзывы и готовься к комитету.',
    viewMuns: 'Список МУНов',
    materials: 'Материалы',
    review: 'Оставить отзыв',
    link: 'Привязать аккаунт',
    munsIntro: 'Предстоящие МУНы доступны всем. Выбери конференцию, чтобы увидеть регистрацию, Telegram-канал и отзывы:',
    noMuns: 'Сейчас конференций нет. Проверь позже.',
    registration: 'Регистрация',
    telegram: 'Telegram-канал',
    reviews: 'Отзывы на сайте',
    backMuns: 'Назад к списку',
    backCategories: 'Назад к категориям',
    backMaterials: 'Назад к материалам',
    openAcademy: 'Открыть все материалы на сайте',
    openMaterial: 'Открыть материал',
    materialsIntro: 'Материалы для подготовки\n\nВыбери тему: основы, research, position paper, резолюции, комитеты или видео.',
    chooseMaterial: 'Выбери материал:',
    unavailableMun: 'Этот МУН больше недоступен. Обнови список.',
    unavailableCategory: 'Эта категория больше недоступна. Обнови список.',
    unavailableMaterial: 'Этот материал больше недоступен. Обнови список.',
    status: { open: 'Открыто', upcoming: 'Скоро', planned: 'Дата позже' },
    city: 'Город',
    venue: 'Место',
    secretariat: 'Секретариат',
    committees: 'Комитеты',
    capacityFee: 'Места / взнос',
    time: 'Время',
  },
  UZ: {
    chooseLanguage: 'Tilni tanlang:',
    languageSaved: 'Til saqlandi.',
    welcomeTitle: 'MUNIVERSEga xush kelibsiz — O‘zbekiston Model UN delegat markazi.',
    welcomeBody: 'Yaqin MUNlarni ko‘ring, ro‘yxatdan o‘tish havolalarini oching, fikrlarni o‘qing va tayyorlaning.',
    viewMuns: 'MUN ro‘yxati',
    materials: 'Materiallar',
    review: 'Fikr qoldirish',
    link: 'Akkauntni ulash',
    munsIntro: 'Yaqin MUNlar hammaga ochiq. Ro‘yxatdan o‘tish, Telegram-kanal va fikrlarni ko‘rish uchun MUN tanlang:',
    noMuns: 'Hozircha konferensiyalar yo‘q. Keyinroq tekshiring.',
    registration: 'Ro‘yxatdan o‘tish',
    telegram: 'Telegram-kanal',
    reviews: 'Saytdagi fikrlar',
    backMuns: 'Ro‘yxatga qaytish',
    backCategories: 'Kategoriyalarga qaytish',
    backMaterials: 'Materiallarga qaytish',
    openAcademy: 'Saytdagi barcha materiallar',
    openMaterial: 'Materialni ochish',
    materialsIntro: 'Tayyorgarlik materiallari\n\nMavzuni tanlang: asoslar, research, position paper, rezolyutsiyalar, qo‘mitalar yoki videolar.',
    chooseMaterial: 'Material tanlang:',
    unavailableMun: 'Bu MUN endi mavjud emas. Ro‘yxatni yangilang.',
    unavailableCategory: 'Bu kategoriya endi mavjud emas. Ro‘yxatni yangilang.',
    unavailableMaterial: 'Bu material endi mavjud emas. Ro‘yxatni yangilang.',
    status: { open: 'Ochiq', upcoming: 'Yaqinda', planned: 'Sana keyin' },
    city: 'Shahar',
    venue: 'Joy',
    secretariat: 'Sekretariat',
    committees: 'Qo‘mitalar',
    capacityFee: 'Joylar / to‘lov',
    time: 'Vaqt',
  },
};

function lang(ctx) {
  return userLanguages.get(ctx.from?.id) || 'EN';
}

function tr(ctx) {
  return I18N[lang(ctx)] || I18N.EN;
}

function menuFor(ctx) {
  const t = tr(ctx);
  return new Keyboard()
    .text(t.viewMuns)
    .text(t.materials)
    .row()
    .text(t.review)
    .text(t.link)
    .resized();
}

function languageKeyboard() {
  return new InlineKeyboard().text('English', 'lang:EN').text('Русский', 'lang:RU').text('O‘zbek', 'lang:UZ');
}

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

function conferenceKeyboard(ctx, conference) {
  const t = tr(ctx);
  const keyboard = new InlineKeyboard();
  if (conference.registrationLink) keyboard.url(t.registration, conference.registrationLink);
  if (conference.telegramUrl) keyboard.url(t.telegram, conference.telegramUrl);
  keyboard.row();
  const pageUrl = siteConferenceUrl(conference.slug);
  if (pageUrl) keyboard.url(t.reviews, `${pageUrl}#reviews`);
  keyboard.text(t.backMuns, 'mun:list');
  return keyboard;
}

function conferenceText(ctx, conference) {
  const t = tr(ctx);
  const committees = conference.committees?.length ? conference.committees.join(', ') : 'Committees TBA';
  return [
    `${conference.title}`,
    `${t.status[conference.status] ?? conference.status} / ${formatDateRange(conference.dateStart, conference.dateEnd)}`,
    `${t.city}: ${conference.city ?? 'Tashkent'}`,
    `${t.venue}: ${conference.venue ?? 'Venue TBA'}`,
    `${t.secretariat}: ${conference.secretariat ?? 'Secretariat TBA'}`,
    `${t.committees}: ${committees}`,
    `${t.capacityFee}: ${conference.capacity ?? 'TBA'} / ${conference.fee ?? 'TBA'}`,
    '',
    conference.description ?? 'More details will be published by the organizer soon.',
  ].join('\n');
}

async function sendMunList(ctx, edit = false) {
  const conferences = (await loadConferences()).filter((conference) => conference.status !== 'planned' || !conference.dateStart);
  if (!conferences.length) {
    await ctx.reply(tr(ctx).noMuns);
    return;
  }
  const text = tr(ctx).munsIntro;
  const reply_markup = listKeyboard(conferences);
  if (edit) await ctx.editMessageText(text, { reply_markup });
  else await ctx.reply(text, { reply_markup });
}

function materialCategoryKeyboard(ctx) {
  const t = tr(ctx);
  const keyboard = new InlineKeyboard();
  MATERIAL_CATEGORIES.filter((category) => category.id !== 'all').forEach((category, index) => {
    keyboard.text(category.label, `prep:cat:${category.id}`);
    if (index % 2 === 1) keyboard.row();
  });
  if (siteUrl) keyboard.row().url(t.openAcademy, `${siteUrl}/#academy`);
  return keyboard;
}

function materialListKeyboard(ctx, categoryId) {
  const keyboard = new InlineKeyboard();
  PREP_MATERIALS.filter((material) => material.category === categoryId)
    .slice(0, 12)
    .forEach((material) => keyboard.text(material.title.slice(0, 58), `prep:item:${material.id}`).row());
  keyboard.text(tr(ctx).backCategories, 'prep:list');
  return keyboard;
}

function materialText(ctx, material) {
  const t = tr(ctx);
  return [`${material.title}`, `${material.type} / ${material.language} / ${material.level}`, `${t.time}: ${material.time}`, '', material.summary].join('\n');
}

async function sendMaterialCategories(ctx, edit = false) {
  const text = tr(ctx).materialsIntro;
  const reply_markup = materialCategoryKeyboard(ctx);
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
  await ctx.reply(tr(ctx).chooseLanguage, { reply_markup: languageKeyboard() });
});

bot.command('language', (ctx) => ctx.reply(tr(ctx).chooseLanguage, { reply_markup: languageKeyboard() }));
bot.command('muns', (ctx) => sendMunList(ctx));
bot.command('materials', (ctx) => sendMaterialCategories(ctx));
bot.hears(/^(?:📋\s*)?(View MUN list|Список МУНов|МУНы|MUN ro‘yxati|MUN ro'yxati)$/i, (ctx) => sendMunList(ctx));
bot.hears(/^(Preparation materials|Материалы|Подготовка|Materiallar|Tayyorgarlik)$/i, (ctx) => sendMaterialCategories(ctx));

bot.callbackQuery(/^lang:(EN|RU|UZ)$/, async (ctx) => {
  userLanguages.set(ctx.from.id, ctx.match[1]);
  await ctx.answerCallbackQuery({ text: tr(ctx).languageSaved });
  await ctx.reply([tr(ctx).welcomeTitle, '', tr(ctx).welcomeBody].join('\n'), { reply_markup: menuFor(ctx) });
});

bot.callbackQuery('mun:list', async (ctx) => {
  await ctx.answerCallbackQuery();
  await sendMunList(ctx, true);
});

bot.callbackQuery(/^mun:(?!list$)(.+)$/, async (ctx) => {
  const conference = (await loadConferences()).find((item) => item.slug === ctx.match[1]);
  await ctx.answerCallbackQuery();
  if (!conference) {
    await ctx.editMessageText(tr(ctx).unavailableMun);
    return;
  }
  await ctx.editMessageText(conferenceText(ctx, conference), { reply_markup: conferenceKeyboard(ctx, conference) });
});

bot.callbackQuery('prep:list', async (ctx) => {
  await ctx.answerCallbackQuery();
  await sendMaterialCategories(ctx, true);
});

bot.callbackQuery(/^prep:cat:(.+)$/, async (ctx) => {
  const category = MATERIAL_CATEGORIES.find((item) => item.id === ctx.match[1]);
  await ctx.answerCallbackQuery();
  if (!category) {
    await ctx.editMessageText(tr(ctx).unavailableCategory);
    return;
  }
  await ctx.editMessageText(`${category.label}\n\n${tr(ctx).chooseMaterial}`, {
    reply_markup: materialListKeyboard(ctx, category.id),
  });
});

bot.callbackQuery(/^prep:item:(.+)$/, async (ctx) => {
  const material = PREP_MATERIALS.find((item) => item.id === ctx.match[1]);
  await ctx.answerCallbackQuery();
  if (!material) {
    await ctx.editMessageText(tr(ctx).unavailableMaterial);
    return;
  }
  const keyboard = new InlineKeyboard().url(tr(ctx).openMaterial, material.url).row().text(tr(ctx).backMaterials, `prep:cat:${material.category}`);
  await ctx.editMessageText(materialText(ctx, material), { reply_markup: keyboard });
});

bot.catch((err) => console.error('[telegram webhook]', err.error ?? err));

const handleUpdate = webhookCallback(bot, 'http');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ ok: true, endpoint: 'MUNIVERSE Telegram webhook' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  await handleUpdate(req, res);
}
