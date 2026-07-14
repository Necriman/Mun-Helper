import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BellRing,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  ExternalLink,
  Gavel,
  MapPin,
  MessageCircle,
  Send,
  UsersRound,
} from 'lucide-react';
import { STATUS } from '../data/conferences';
import { countdownLabel, formatDateRange } from '../lib/utils';

const ConferenceCard = forwardRef(function ConferenceCard({ conference }, ref) {
  const [saved, setSaved] = useState(false);
  const [watching, setWatching] = useState(false);

  const status = STATUS[conference.status] ?? STATUS.planned;
  const countdown = countdownLabel(conference.startDate);
  const isOpen = conference.status === 'open';

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="plaque plaque-hover group relative flex min-h-[430px] flex-col gap-4 overflow-hidden rounded-[26px] p-5"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-un-300/80 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-un-400/10 blur-3xl transition-opacity group-hover:opacity-100" aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <span
          className="seal-grid grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/30 text-base font-bold text-white shadow-[0_16px_32px_rgba(0,0,0,0.22)]"
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
            className={`grid h-11 w-11 cursor-pointer place-items-center rounded-full transition-colors ${
              saved ? 'bg-gold-300/20 text-gold-200' : 'text-un-100/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold leading-snug text-un-900">
          <Link to={`/conferences/${conference.id}`} className="hover:underline">
            {conference.name}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-un-600">
          <MapPin size={14} aria-hidden="true" />
          {conference.city}
          {conference.venue && <span className="text-un-400">/ {conference.venue}</span>}
        </p>
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed text-un-700">{conference.description}</p>

      <div className="grid gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-2xl bg-white/[0.06] px-2.5 py-1.5 font-medium text-un-50">
          <CalendarDays size={14} className="text-un-600" aria-hidden="true" />
          {formatDateRange(conference.startDate, conference.endDate)}
          {countdown && <span className="ml-auto text-xs font-medium tabular-nums text-un-600">{countdown}</span>}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-2xl bg-white/[0.05] px-2.5 py-1.5 text-un-50/78">
          <Gavel size={14} className="text-un-600" aria-hidden="true" />
          {conference.secretariat}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-2xl bg-white/[0.05] px-2.5 py-1.5 text-un-50/78">
          <UsersRound size={14} className="text-un-600" aria-hidden="true" />
          {conference.capacity} / {conference.fee}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(conference.committees ?? []).slice(0, 3).map((committee) => (
          <span key={committee} className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-un-100/76">
            {committee}
          </span>
        ))}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
        {isOpen ? (
          <a
            href={conference.registrationUrl ?? conference.websiteUrl ?? '#'}
            target="_blank"
            rel="noreferrer"
            className="col-span-2 flex h-11 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-un-900 transition-all hover:-translate-y-0.5 hover:bg-un-50"
          >
            Register now
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setWatching((v) => !v)}
            aria-pressed={watching}
            className={`col-span-2 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-sm border text-sm font-semibold transition-colors duration-200 ${
              watching
                ? 'border-gold-300/50 bg-gold-300/15 text-gold-100'
                : 'border-white/12 text-un-100 hover:border-un-300/60 hover:text-white'
            }`}
          >
            <BellRing size={15} aria-hidden="true" />
            {watching ? 'Watching' : 'Notify me when it opens'}
          </button>
        )}

        <a
          href={conference.telegramUrl ?? conference.websiteUrl ?? '#'}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 items-center justify-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] text-sm font-semibold text-un-50 transition-colors hover:border-un-300/60 hover:bg-white/10"
        >
          <Send size={14} aria-hidden="true" />
          Channel
        </a>
        <Link
          to={`/conferences/${conference.id}#reviews`}
          className="flex h-11 items-center justify-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] text-sm font-semibold text-un-50 transition-colors hover:border-un-300/60 hover:bg-white/10"
        >
          <MessageCircle size={14} aria-hidden="true" />
          Reviews
        </Link>
      </div>
    </motion.article>
  );
});

export default ConferenceCard;
