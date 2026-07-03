import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, Bookmark, BookmarkCheck, CalendarDays, ExternalLink, MapPin } from 'lucide-react';
import { STATUS } from '../data/conferences';
import { countdownLabel, formatDateRange } from '../lib/utils';

/**
 * Formal "plaque" card for a dated conference: solid monogram seal, status
 * tag, date + countdown, and the primary action (Register / Notify me).
 * Bookmark is local-state demo — wire it to `saved_muns` once auth lands.
 *
 * forwardRef is required: AnimatePresence mode="popLayout" measures exiting
 * children through a ref.
 */
const ConferenceCard = forwardRef(function ConferenceCard({ conference }, ref) {
  const [saved, setSaved] = useState(false);
  const [watching, setWatching] = useState(false);

  const status = STATUS[conference.status];
  const countdown = countdownLabel(conference.startDate);
  const isOpen = conference.status === 'open';

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="plaque plaque-hover flex flex-col gap-4 rounded-md p-5"
    >
      {/* Top row: seal · status tag · bookmark */}
      <div className="flex items-start justify-between gap-3">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-sm font-serif text-sm font-bold text-white"
          style={{ backgroundColor: conference.color }}
          aria-hidden="true"
        >
          {conference.short}
        </span>

        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${status.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
            {status.label}
          </span>

          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            aria-label={saved ? `Remove ${conference.name} from saved` : `Save ${conference.name}`}
            aria-pressed={saved}
            className={`grid h-9 w-9 cursor-pointer place-items-center rounded-sm transition-colors ${
              saved ? 'text-gold-600' : 'text-un-500/70 hover:bg-un-50 hover:text-un-800'
            }`}
          >
            {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
          </button>
        </div>
      </div>

      {/* Title + location */}
      <div>
        <h3 className="font-serif text-lg font-semibold leading-snug text-un-900">
          {conference.name}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-un-600">
          <MapPin size={13} aria-hidden="true" />
          {conference.city}
        </p>
      </div>

      {/* Date + countdown chips */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-sm bg-un-50 px-2.5 py-1.5 font-medium text-un-800">
          <CalendarDays size={14} className="text-un-600" aria-hidden="true" />
          {formatDateRange(conference.startDate, conference.endDate)}
        </span>
        {countdown && (
          <span className="rounded-sm bg-un-50 px-2.5 py-1.5 text-xs font-medium tabular-nums text-un-600">
            {countdown}
          </span>
        )}
      </div>

      {/* Primary action — pinned to the bottom so all cards align */}
      <div className="mt-auto pt-1">
        {isOpen ? (
          <a
            href={conference.registrationUrl ?? '#'}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-un-800 text-sm font-semibold text-white transition-colors hover:bg-un-900"
          >
            Register now
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setWatching((v) => !v)}
            aria-pressed={watching}
            className={`flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border text-sm font-semibold transition-colors ${
              watching
                ? 'border-gold-400 bg-gold-50 text-gold-700'
                : 'border-un-800/15 text-un-700 hover:border-un-400 hover:text-un-900'
            }`}
          >
            <BellRing size={15} aria-hidden="true" />
            {watching ? 'Watching — we’ll notify you' : 'Notify me when it opens'}
          </button>
        )}
      </div>
    </motion.article>
  );
});

export default ConferenceCard;
