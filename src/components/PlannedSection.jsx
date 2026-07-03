import { forwardRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Radar } from 'lucide-react';

/**
 * Compact row for a date-TBA conference with a "watch" toggle.
 * forwardRef: AnimatePresence mode="popLayout" measures children via ref.
 */
const PlannedItem = forwardRef(function PlannedItem({ conference }, ref) {
  const [watching, setWatching] = useState(false);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="plaque plaque-hover flex items-center gap-3 rounded-md p-3.5"
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-sm font-serif text-xs font-bold text-white"
        style={{ backgroundColor: conference.color }}
        aria-hidden="true"
      >
        {conference.short}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-un-900">
          <Link to={`/conferences/${conference.id}`} className="hover:underline">
            {conference.name}
          </Link>
        </p>
        <p className="text-xs text-un-500">Date to be announced</p>
      </div>
      <button
        type="button"
        onClick={() => setWatching((v) => !v)}
        aria-pressed={watching}
        aria-label={watching ? `Stop watching ${conference.name}` : `Watch ${conference.name}`}
        className={`grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-sm border transition-colors ${
          watching
            ? 'border-gold-400 bg-gold-50 text-gold-700'
            : 'border-un-800/15 text-un-500 hover:border-un-400 hover:text-un-800'
        }`}
      >
        <Radar size={16} aria-hidden="true" />
      </button>
    </motion.div>
  );
});

/** "Planned MUNs (Date N/A)" — the dense watchlist under the main grid. */
export default function PlannedSection({ conferences }) {
  if (conferences.length === 0) return null;

  return (
    <section id="planned" className="scroll-mt-28">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2.5 font-serif text-xl font-semibold text-un-900 sm:text-2xl">
            <Radar size={20} className="text-un-600" aria-hidden="true" />
            Planned conferences
            <span className="rounded-sm bg-un-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-un-700">
              {conferences.length}
            </span>
          </h2>
          <p className="mt-1.5 text-sm text-un-600">
            Confirmed by organizers, dates to be announced. Watch a listing to be notified the
            moment registration opens.
          </p>
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {conferences.map((conference) => (
            <PlannedItem key={conference.id} conference={conference} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
