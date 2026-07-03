export default async function handler(req, res) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '');

  if (!token) {
    res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN is missing' });
    return;
  }
  if (!siteUrl) {
    res.status(500).json({ error: 'SITE_URL or VITE_SITE_URL is missing' });
    return;
  }

  if (process.env.CRON_SECRET) {
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (req.headers.authorization !== expected) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  const webhookUrl = `${siteUrl}/api/telegram`;
  const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      drop_pending_updates: false,
    }),
  });
  const data = await response.json();

  res.status(response.ok ? 200 : 500).json({ webhookUrl, telegram: data });
}
