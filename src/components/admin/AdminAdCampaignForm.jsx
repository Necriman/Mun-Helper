import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ImagePlus, Megaphone } from 'lucide-react';

const PLATFORMS = [
  { id: 'bot', label: 'Bot' },
  { id: 'site', label: 'Site' },
  { id: 'both', label: 'Both' },
];

/**
 * Ad Campaign Creator — writes a row to `ad_campaigns` (see schema.sql).
 * `requiresBotSubscription` maps to that table's `requires_bot_subscription`
 * flag, which is Format B's sponsor-channel gate (see docs/AD_ARCHITECTURE.md).
 */
export default function AdminAdCampaignForm() {
  const [form, setForm] = useState({
    title: '',
    destinationUrl: '',
    platform: 'both',
    countdownSeconds: 5,
    requiresBotSubscription: false,
    fileName: '',
  });
  const [saved, setSaved] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production: supabase.from('ad_campaigns').insert({...form, status: 'paused'})
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-un-900">Ad Campaigns</h1>
        <p className="mt-1 text-sm text-un-600">
          New campaigns are created paused — flip to Active from the campaign list to go live.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="plaque space-y-5 rounded-md p-6">
        {/* Title */}
        <div>
          <label htmlFor="ad-title" className="block text-sm font-semibold text-un-800">
            Campaign title
          </label>
          <input
            id="ad-title"
            type="text"
            required
            value={form.title}
            onChange={(e) => set('title')(e.target.value)}
            placeholder="e.g. AEGIS MUN 2026 — Registration Open"
            className="mt-1.5 h-11 w-full rounded-md border border-un-800/15 bg-white px-3.5 text-sm text-un-900 placeholder:text-un-500/70 focus:border-un-400 focus:outline-none"
          />
        </div>

        {/* Ad material upload (UI only — real upload goes to Supabase Storage) */}
        <div>
          <span className="block text-sm font-semibold text-un-800">Ad material</span>
          <label
            htmlFor="ad-upload"
            className="mt-1.5 flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-un-800/20 bg-un-50/40 text-un-600 transition-colors hover:border-un-400 hover:text-un-800"
          >
            <ImagePlus size={22} aria-hidden="true" />
            <span className="text-xs font-medium">
              {form.fileName || 'Click to upload banner image (JPG/PNG)'}
            </span>
            <input
              id="ad-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => set('fileName')(e.target.files?.[0]?.name ?? '')}
            />
          </label>
        </div>

        {/* Destination URL */}
        <div>
          <label htmlFor="ad-url" className="block text-sm font-semibold text-un-800">
            Destination URL
          </label>
          <input
            id="ad-url"
            type="url"
            required
            value={form.destinationUrl}
            onChange={(e) => set('destinationUrl')(e.target.value)}
            placeholder="https://…"
            className="mt-1.5 h-11 w-full rounded-md border border-un-800/15 bg-white px-3.5 text-sm text-un-900 placeholder:text-un-500/70 focus:border-un-400 focus:outline-none"
          />
        </div>

        {/* Platform selector */}
        <div>
          <span className="block text-sm font-semibold text-un-800">Platform</span>
          <div role="radiogroup" aria-label="Platform" className="mt-1.5 grid grid-cols-3 gap-2">
            {PLATFORMS.map((p) => {
              const active = form.platform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set('platform')(p.id)}
                  className={`cursor-pointer rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-un-800 bg-un-800 text-white'
                      : 'border-un-800/15 text-un-700 hover:border-un-400'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Countdown seconds (site popup only) */}
        <div>
          <label htmlFor="ad-countdown" className="block text-sm font-semibold text-un-800">
            Popup countdown (seconds)
          </label>
          <input
            id="ad-countdown"
            type="number"
            min={0}
            max={30}
            value={form.countdownSeconds}
            onChange={(e) => set('countdownSeconds')(Number(e.target.value))}
            className="mt-1.5 h-11 w-32 rounded-md border border-un-800/15 bg-white px-3.5 text-sm tabular-nums text-un-900 focus:border-un-400 focus:outline-none"
          />
          <p className="mt-1 text-xs text-un-500">How long the close (X) button stays disabled on the web popup.</p>
        </div>

        {/* Mandatory bot-subscription toggle */}
        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-un-800/10 bg-un-50/40 p-4">
          <input
            type="checkbox"
            checked={form.requiresBotSubscription}
            onChange={(e) => set('requiresBotSubscription')(e.target.checked)}
            className="mt-0.5 h-5 w-5 cursor-pointer accent-un-800"
          />
          <span>
            <span className="block text-sm font-semibold text-un-800">
              Require sponsor-channel subscription (Telegram)
            </span>
            <span className="mt-0.5 block text-xs text-un-600">
              When enabled, the bot checks channel membership via <code>getChatMember</code> before
              showing this campaign's content — see docs/AD_ARCHITECTURE.md, Format B.
            </span>
          </span>
        </label>

        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-un-800 text-sm font-semibold text-white transition-colors hover:bg-un-900"
        >
          <Megaphone size={16} aria-hidden="true" />
          Save campaign
        </button>

        {saved && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-sm font-medium text-un-700"
          >
            <Check size={15} aria-hidden="true" />
            Campaign saved as paused. Activate it from the campaign list.
          </motion.p>
        )}
      </form>
    </div>
  );
}
