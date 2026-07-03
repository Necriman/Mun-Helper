/**
 * Mun Helper Telegram bot.
 *
 * Talks to Supabase using ONLY the public anon/publishable key — never a
 * service_role secret. Privileged writes (creating a profile, submitting a
 * conference, posting a review) go through the SECURITY DEFINER RPC
 * functions in supabase/bot_functions.sql, which is the whole point of that
 * file: a compromised bot process can only call those whitelisted
 * functions, never run arbitrary queries.
 *
 * Run: npm install && npm start (inside bot/), after copying .env.example to .env.
 *
 * NOTE on formatting: nothing in this file uses Telegram's `parse_mode`.
 * Legacy Markdown treats a single "_" as an italic delimiter, and Postgres
 * identifiers/error messages are full of underscores (e.g.
 * "column registration_status...") — sending those with parse_mode:
 * 'Markdown' silently mangles the text (drops/misreads the underscores).
 * Plain text sidesteps the whole bug class.
 */
import 'dotenv/config';
import { Bot, InlineKeyboard, Keyboard, session } from 'grammy';
import { createClient } from '@supabase/supabase-js';

const { TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_ANON_KEY, SITE_URL } = process.env;

if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN is required (see .env.example)');
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('SUPABASE_URL / SUPABASE_ANON_KEY are required');
if (!SITE_URL || SITE_URL.includes('localhost')) {
  console.warn(
    '⚠️  SITE_URL is unset or points at localhost — the "Link my account" button will be ' +
      'unreachable for real Telegram users. Deploy the site and set SITE_URL to its public URL.',
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const bot = new Bot(TELEGRAM_BOT_TOKEN);

bot.use(session({ initial: () => ({ step: null, draft: {} }) }));

const MAIN_MENU = new Keyboard()
  .text('📋 View MUN list')
  .text('✍️ Submit a MUN')
  .row()
  .text('⭐ Leave a review')
  .text('🔗 Link my account')
  .resized();

const STATUS_LABEL = { open: '🟢 Open', upcoming: '🟡 Upcoming', planned: '⚪ Planned' };

function formatDate(iso) {
  if (!iso) return 'Date TBA';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

async function sendLinkPrompt(ctx, telegramId) {
  const { data: token, error } = await supabase.rpc('bot_mint_link_token', { p_telegram_id: telegramId });
  if (error || !token) {
    await ctx.reply('Could not generate a link right now — please try again in a moment.');
    return;
  }
  const keyboard = new InlineKeyboard().url('Create / link my account', `${SITE_URL}/link?token=${token}`);
  await ctx.reply('This link expires in 15 minutes:', { reply_markup: keyboard });
}

// ── /start ────────────────────────────────────────────────────────────────
bot.command('start', async (ctx) => {
  const telegramId = ctx.from.id;
  await supabase.rpc('bot_upsert_profile', {
    p_telegram_id: telegramId,
    p_telegram_handle: ctx.from.username ?? null,
  });
  await supabase.from('analytics_logs').insert({ event_type: 'bot_start' });

  ctx.session.step = null;
  await ctx.reply(
    "Welcome to Mun Helper — the registry for Uzbekistan's Model UN community.\n\n" +
      'Use the menu below to browse conferences, submit a new one, or leave a review.',
    { reply_markup: MAIN_MENU },
  );
});

// ── View MUN list (gated by Format-B "Mandatory Verification") ────────────
bot.hears('📋 View MUN list', async (ctx) => {
  const telegramId = ctx.from.id;
  const { data: verified, error: verifyError } = await supabase.rpc('bot_is_verified', {
    p_telegram_id: telegramId,
  });

  if (verifyError) {
    await ctx.reply(`Something went wrong checking your account: ${verifyError.message}`);
    return;
  }

  if (!verified) {
    await ctx.reply('🔒 The conference list is available to verified delegates only.');
    await sendLinkPrompt(ctx, telegramId);
    return;
  }

  const { data, error } = await supabase
    .from('conferences')
    .select('title, short_name, registration_status, date_start, date_end, registration_link')
    .eq('status', 'approved')
    .in('registration_status', ['open', 'upcoming', 'planned'])
    .order('date_start', { ascending: true, nullsFirst: false });

  if (error) {
    await ctx.reply(`Something went wrong loading the list: ${error.message}`);
    return;
  }
  if (!data?.length) {
    await ctx.reply('No conferences on record right now — check back soon.');
    return;
  }

  const lines = data.map((c) => {
    const date = c.date_end ? `${formatDate(c.date_start)}–${formatDate(c.date_end)}` : formatDate(c.date_start);
    const link = c.registration_link ? `\n   ${c.registration_link}` : '';
    return `${STATUS_LABEL[c.registration_status] ?? '⚪'} ${c.title} — ${date}${link}`;
  });

  await ctx.reply(lines.join('\n\n'));
});

// ── Submit a MUN (multi-step) ──────────────────────────────────────────────
bot.hears('✍️ Submit a MUN', async (ctx) => {
  ctx.session.step = 'submit_title';
  ctx.session.draft = {};
  await ctx.reply('What\'s the conference called? (e.g. "RVSU MUN")');
});

// ── Leave a review — pick from an inline list, never type a name ─────────
bot.hears('⭐ Leave a review', async (ctx) => {
  const { data, error } = await supabase
    .from('conferences')
    .select('id, title')
    .eq('status', 'approved')
    .order('title', { ascending: true })
    .limit(20);

  if (error || !data?.length) {
    await ctx.reply('No conferences available to review yet.');
    return;
  }

  const keyboard = new InlineKeyboard();
  data.forEach((c, i) => {
    keyboard.text(c.title, `review_conf:${c.id}`);
    if (i % 2 === 1) keyboard.row();
  });

  ctx.session.step = null;
  await ctx.reply('Which conference would you like to review?', { reply_markup: keyboard });
});

bot.callbackQuery(/^review_conf:(.+)$/, async (ctx) => {
  const conferenceId = ctx.match[1];
  const title = ctx.callbackQuery.message?.reply_markup?.inline_keyboard
    ?.flat()
    .find((b) => b.callback_data === ctx.callbackQuery.data)?.text;

  ctx.session.step = 'review_rating';
  ctx.session.draft = { conferenceId, conferenceTitle: title ?? 'this conference' };

  const rating = new InlineKeyboard();
  [1, 2, 3, 4, 5].forEach((n) => rating.text('⭐'.repeat(n), `review_rate:${n}`));

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(`Rate "${title}" from 1 to 5:`, { reply_markup: rating });
});

bot.callbackQuery(/^review_rate:(\d)$/, async (ctx) => {
  const rating = Number(ctx.match[1]);
  ctx.session.draft.rating = rating;
  ctx.session.step = 'review_comment';

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(`You rated "${ctx.session.draft.conferenceTitle}" ${'⭐'.repeat(rating)}.`);
  await ctx.reply('Add a short comment (or send "-" to skip):');
});

// ── Link account ────────────────────────────────────────────────────────────
bot.hears('🔗 Link my account', async (ctx) => {
  await sendLinkPrompt(ctx, ctx.from.id);
});

// ── Multi-step conversation handler (free-text steps only) ─────────────────
bot.on('message:text', async (ctx) => {
  const step = ctx.session.step;
  if (!step) return; // not mid-flow — ignore (menu buttons are handled above)

  const text = ctx.message.text.trim();
  const telegramId = ctx.from.id;

  switch (step) {
    // — Submit MUN flow —
    case 'submit_title':
      ctx.session.draft.title = text;
      ctx.session.step = 'submit_date';
      await ctx.reply('When does it start? Send a date as YYYY-MM-DD, or "skip" if not yet set.');
      return;

    case 'submit_date': {
      const dateStart = /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
      ctx.session.draft.dateStart = dateStart;
      ctx.session.step = 'submit_contact';
      await ctx.reply('Contact handle for this proposal? (e.g. @your_handle)');
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
          : `Thanks! "${title}" was submitted for review — a moderator will approve it shortly.`,
        { reply_markup: MAIN_MENU },
      );
      return;
    }

    // — Review flow (final step: free-text comment) —
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
console.log('Mun Helper bot is running (long polling)…');
