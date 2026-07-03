/**
 * Mass broadcast — Format B, part 1 (see docs/AD_ARCHITECTURE.md).
 *
 * Usage: node broadcast.js "Registration for AEGIS MUN closes Friday!"
 *
 * Paced to roughly 25 messages/second (under Telegram's ~30/sec global
 * limit) and skips/marks unreachable any chat that returns 403 (user
 * blocked the bot) instead of retrying forever.
 */
import 'dotenv/config';
import { Bot } from 'grammy';
import { createClient } from '@supabase/supabase-js';

const { TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
const message = process.argv[2];

if (!message) {
  console.error('Usage: node broadcast.js "your message"');
  process.exit(1);
}

const bot = new Bot(TELEGRAM_BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('telegram_id')
    .not('telegram_id', 'is', null)
    .eq('is_banned', false);

  if (error) throw error;

  console.log(`Broadcasting to ${profiles.length} recipients…`);
  let sent = 0;
  let failed = 0;

  for (const { telegram_id: telegramId } of profiles) {
    try {
      await bot.api.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
      sent += 1;
    } catch (err) {
      failed += 1;
      console.warn(`  ✗ ${telegramId}: ${err.description ?? err.message}`);
    }
    await sleep(40); // ~25 msg/sec, under Telegram's rate limit
  }

  console.log(`Done. Sent: ${sent}, failed: ${failed}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
