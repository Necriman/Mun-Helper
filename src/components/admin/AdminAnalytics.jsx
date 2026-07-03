import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, Eye, MessageSquareText, MousePointerClick, Send, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { ANALYTICS_WIDGETS } from '../../data/analytics';
import { supabase } from '../../lib/supabase';

const TREND_STYLE = { up: 'text-un-600', down: 'text-rose-600', flat: 'text-gold-600' };

const ICONS = { dau: Users, reviews: MessageSquareText, ctr: MousePointerClick, 'bot-starts': Send, impressions: Eye, pending: BellRing };

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Analytics widget grid. Live mode queries `analytics_logs` + the
 * `ad_campaign_ctr` view directly (gated by the "staff read analytics" RLS
 * policy — only works for a signed-in moderator/admin). Falls back to the
 * mock ANALYTICS_WIDGETS when Supabase isn't configured.
 */
export default function AdminAnalytics() {
  const [widgets, setWidgets] = useState(ANALYTICS_WIDGETS);
  const [loading, setLoading] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;
    const since = `${todayIso()}T00:00:00Z`;

    (async () => {
      const [siteVisits, reviewsToday, botStarts, impressions, pending, ctrRows] = await Promise.all([
        supabase.from('analytics_logs').select('id', { count: 'exact', head: true }).eq('event_type', 'site_visit').gte('occurred_at', since),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).gte('created_at', since),
        supabase.from('analytics_logs').select('id', { count: 'exact', head: true }).eq('event_type', 'bot_start').gte('occurred_at', since),
        supabase.from('analytics_logs').select('id', { count: 'exact', head: true }).eq('event_type', 'ad_impression').gte('occurred_at', since),
        supabase.from('conferences').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('ad_campaign_ctr').select('ctr_percent').order('impressions', { ascending: false }).limit(1),
      ]);

      if (cancelled) return;

      const ctr = ctrRows.data?.[0]?.ctr_percent;

      setWidgets([
        { id: 'dau', label: 'Site Visits Today', value: (siteVisits.count ?? 0).toLocaleString(), delta: 'live', icon: ICONS.dau, trend: 'flat' },
        { id: 'reviews', label: 'Reviews Written Today', value: String(reviewsToday.count ?? 0), delta: 'live', icon: ICONS.reviews, trend: 'flat' },
        { id: 'ctr', label: 'Ad Banner CTR', value: ctr != null ? `${ctr}%` : '—', delta: 'live', icon: ICONS.ctr, trend: 'flat' },
        { id: 'bot-starts', label: 'Bot Starts Today', value: String(botStarts.count ?? 0), delta: 'live', icon: ICONS['bot-starts'], trend: 'flat' },
        { id: 'impressions', label: 'Ad Impressions Today', value: (impressions.count ?? 0).toLocaleString(), delta: 'live', icon: ICONS.impressions, trend: 'flat' },
        { id: 'pending', label: 'Pending Approvals', value: String(pending.count ?? 0), delta: 'needs review', icon: ICONS.pending, trend: 'flat' },
      ]);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-un-900">Analytics</h1>
        <p className="mt-1 text-sm text-un-600">
          {supabase ? 'Live figures from analytics_logs.' : 'Ecosystem-wide activity across the web app and Telegram bot.'}
          {loading && ' Loading…'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {widgets.map(({ id, label, value, delta, icon: Icon, trend }, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="plaque rounded-md p-5"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-sm bg-un-50 text-un-700">
                <Icon size={18} aria-hidden="true" />
              </span>
              {trend !== 'flat' ? (
                <span className={`flex items-center gap-1 text-xs font-semibold ${TREND_STYLE[trend]}`}>
                  {trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {delta}
                </span>
              ) : (
                <span className={`text-xs font-semibold ${TREND_STYLE.flat}`}>{delta}</span>
              )}
            </div>
            <p className="mt-4 font-serif text-3xl font-semibold tabular-nums text-un-900">{value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-un-500">{label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
