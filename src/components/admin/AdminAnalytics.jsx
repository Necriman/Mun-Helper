import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { ANALYTICS_WIDGETS } from '../../data/analytics';

const TREND_STYLE = {
  up: 'text-un-600',
  down: 'text-rose-600',
  flat: 'text-gold-600',
};

/** Analytics widget grid — mock stats standing in for live `analytics_logs` aggregates. */
export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-un-900">Analytics</h1>
        <p className="mt-1 text-sm text-un-600">Ecosystem-wide activity across the web app and Telegram bot.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ANALYTICS_WIDGETS.map(({ id, label, value, delta, icon: Icon, trend }, i) => (
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
