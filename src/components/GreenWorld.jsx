import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BellRing,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Gavel,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import Emblem from './Emblem';
import { PREP_MATERIALS } from '../data/prepMaterials';
import { countdownLabel, formatDateRange } from '../lib/utils';
import { useLanguage } from '../lib/i18n';

const EASE = [0.16, 1, 0.3, 1];

const FILTERS = [
  { id: 'all', label: 'All MUNs' },
  { id: 'open', label: 'Open' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'planned', label: 'Planned' },
];

/** Monochrome status treatment — black for live, grays for the rest. */
const MONO_STATUS = {
  open: { label: 'Registration open', cls: 'bg-black text-white border-black' },
  upcoming: { label: 'Upcoming', cls: 'border-black/30 text-black/70 bg-white' },
  planned: { label: 'Date TBA', cls: 'border-black/12 text-black/45 bg-white' },
};

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="inline-flex items-center gap-2 text-[13px] text-black/55">
        <span className="h-2 w-2 rounded-full bg-black" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 className="mt-4 text-[clamp(1.8rem,4.5vw,3.2rem)] font-light leading-[1.05] tracking-[-0.03em] text-black">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-black/55">{text}</p>
    </div>
  );
}

function ConferenceRow({ conference }) {
  const status = MONO_STATUS[conference.status] ?? MONO_STATUS.planned;
  const countdown = countdownLabel(conference.startDate);
  const isOpen = conference.status === 'open';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="rounded-3xl border border-black/10 bg-white p-4 transition-shadow hover:shadow-[0_18px_60px_rgba(0,0,0,0.08)] sm:p-5"
    >
      <div className="grid gap-5 lg:grid-cols-[0.72fr_1.25fr_0.88fr] lg:items-center">
        <div className="flex items-center gap-4">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-black text-base font-semibold text-white"
            aria-hidden="true"
          >
            {conference.short}
          </span>
          <div>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${status.cls}`}
            >
              {status.label}
            </span>
            <h3 className="mt-2 text-lg font-semibold leading-tight tracking-tight text-black">
              <Link to={`/conferences/${conference.id}`} className="hover:opacity-70">
                {conference.name}
              </Link>
            </h3>
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-3">
          <span className="rounded-2xl bg-[#F4F4F6] p-3 text-[13px] text-black/70">
            <MapPin size={14} className="mb-1.5 text-black/40" aria-hidden="true" />
            {conference.city}
            {conference.venue && <span className="block text-[11px] text-black/40">{conference.venue}</span>}
          </span>
          <span className="rounded-2xl bg-[#F4F4F6] p-3 text-[13px] text-black/70">
            <CalendarDays size={14} className="mb-1.5 text-black/40" aria-hidden="true" />
            {formatDateRange(conference.startDate, conference.endDate)}
            {countdown && <span className="block text-[11px] tabular-nums text-black/40">{countdown}</span>}
          </span>
          <span className="rounded-2xl bg-[#F4F4F6] p-3 text-[13px] text-black/70">
            <UsersRound size={14} className="mb-1.5 text-black/40" aria-hidden="true" />
            {conference.capacity}
            <span className="block text-[11px] text-black/40">{conference.fee}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {isOpen ? (
            <a
              href={conference.registrationUrl ?? conference.websiteUrl ?? '#'}
              target="_blank"
              rel="noreferrer"
              className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-[13px] font-medium text-white transition-opacity hover:opacity-80"
            >
              Register
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          ) : (
            <button
              type="button"
              className="col-span-2 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-black/35 px-5 text-[13px] font-medium text-black transition-colors hover:bg-black/5"
            >
              <BellRing size={14} aria-hidden="true" />
              Notify me
            </button>
          )}
          <a
            href={conference.telegramUrl ?? conference.websiteUrl ?? '#'}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-black/12 text-[12px] font-medium text-black/70 transition-colors hover:border-black/30 hover:text-black"
          >
            <Send size={13} aria-hidden="true" />
            Channel
          </a>
          <Link
            to={`/conferences/${conference.id}#reviews`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-black/12 text-[12px] font-medium text-black/70 transition-colors hover:border-black/30 hover:text-black"
          >
            <MessageCircle size={13} aria-hidden="true" />
            Reviews
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function GreenWorld({ conferences, stats }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return conferences
      .filter((conference) => status === 'all' || conference.status === status)
      .filter(
        (conference) =>
          !normalized ||
          conference.name.toLowerCase().includes(normalized) ||
          conference.city.toLowerCase().includes(normalized) ||
          (conference.short ?? '').toLowerCase().includes(normalized),
      );
  }, [conferences, query, status]);

  const featured = visible.slice(0, 5);
  const materials = PREP_MATERIALS.slice(0, 6);

  return (
    <>
      <main className="relative z-10 bg-white text-black">
        {/* ── Registry ── */}
        <section id="registry" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <p className="flex items-center gap-2 text-[13px] text-black/55">
                <span className="h-2 w-2 rounded-full bg-black" aria-hidden="true" />
                Live Uzbekistan MUN map
              </p>
              <h2 className="mt-4 text-[clamp(2rem,4.5vw,3.4rem)] font-light leading-[1.02] tracking-[-0.03em] text-black">
                One calm command center for every delegation.
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-black/55">
                Search conferences, compare dates, open registrations, channels and reviews without digging through
                chats.
              </p>
              <div className="mt-7 grid grid-cols-3 gap-2.5">
                {[
                  ['Open', stats.open],
                  ['Upcoming', stats.upcoming],
                  ['Planned', stats.planned],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-[#F4F4F6] p-4">
                    <p className="text-3xl font-light tabular-nums tracking-tight text-black">{value}</p>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-black/45">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ duration: 0.7, ease: EASE }}
              className="rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8"
            >
              <div className="mx-auto grid h-40 w-40 place-items-center rounded-full border border-black/10">
                <Emblem size={104} />
              </div>
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {['Verified links', 'Reviews', 'Telegram channels', 'Preparation path'].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 rounded-2xl bg-[#F4F4F6] p-3.5">
                    <CheckCircle2 size={16} className="shrink-0 text-black" aria-hidden="true" />
                    <span className="text-[13px] font-medium text-black/75">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Search + filters + featured rows */}
          <div className="mt-12 rounded-[2rem] border border-black/10 bg-white p-3">
            <div className="grid gap-2.5 p-2 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by MUN, city, or abbreviation"
                  className="h-12 w-full rounded-full bg-[#F4F4F6] pl-11 pr-5 text-[13px] font-medium text-black outline-none placeholder:text-black/35 focus:ring-2 focus:ring-black/20"
                  type="search"
                />
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0" aria-label="Filter conferences">
                {FILTERS.map((filter) => {
                  const active = status === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setStatus(filter.id)}
                      className={`inline-flex h-12 shrink-0 cursor-pointer items-center rounded-full px-5 text-[13px] font-medium transition-colors ${
                        active
                          ? 'bg-black text-white'
                          : 'border border-black/12 bg-white text-black/60 hover:border-black/30 hover:text-black'
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-2 space-y-2.5 p-2">
              {featured.map((conference) => (
                <ConferenceRow key={conference.id} conference={conference} />
              ))}
              {featured.length === 0 && (
                <p className="p-8 text-center text-sm text-black/45">Nothing matches — try a different query.</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Academy ── */}
        <section id="academy" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Preparation materials"
            title="Learn like a delegate before the first roll call."
            text="A cleaner preparation flow: basics, research, committees, position papers, resolutions and videos in one guided path."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {materials.map((material, index) => (
              <motion.a
                key={material.id}
                href={material.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.05, duration: 0.5, ease: EASE }}
                whileHover={{ y: -5 }}
                className="group flex min-h-[240px] flex-col rounded-3xl border border-black/10 bg-white p-6 transition-shadow hover:shadow-[0_18px_60px_rgba(0,0,0,0.08)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white">
                  <BookOpenCheck size={19} aria-hidden="true" />
                </span>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/40">
                  {material.type}
                </p>
                <h3 className="mt-1.5 text-lg font-semibold leading-tight tracking-tight text-black">
                  {material.title}
                </h3>
                <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-black/55">{material.summary}</p>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="rounded-full bg-[#F4F4F6] px-3 py-1 text-[11px] font-medium text-black/60">
                    {material.time}
                  </span>
                  <ArrowUpRight
                    size={17}
                    className="text-black/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black"
                  />
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* ── Tools / journey ── */}
        <section id="tools" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ duration: 0.7, ease: EASE }}
              className="rounded-[2rem] bg-black p-7 text-white sm:p-10"
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
                <Gavel size={13} aria-hidden="true" />
                Gavel-ready workflow
              </p>
              <h2 className="mt-6 max-w-2xl text-[clamp(1.8rem,4vw,3rem)] font-light leading-[1.05] tracking-[-0.03em]">
                From first guide to final speech, the site feels like one system.
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/60">
                {t('brandName')} connects the registry, preparation library, reviews and Telegram bot into one smooth
                delegate journey.
              </p>
              <div className="mt-8 flex flex-wrap gap-2.5">
                <a
                  href="#registry"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[13px] font-medium text-black transition-opacity hover:opacity-85"
                >
                  Explore MUNs
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
                <Link
                  to="/mentor"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-6 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
                >
                  AI assistant
                  <Sparkles size={14} aria-hidden="true" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
              className="rounded-[2rem] border border-black/10 bg-white p-7 sm:p-8"
            >
              <div className="relative mx-auto grid h-52 w-full place-items-center" aria-hidden="true">
                <motion.div
                  animate={{ rotate: [0, -16, 0], y: [0, 14, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-6 h-10 w-36 rounded-xl border border-black/15 bg-[#F4F4F6]"
                />
                <motion.div
                  animate={{ scale: [0.5, 1.2], opacity: [0.35, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute bottom-12 h-20 w-20 rounded-full border border-black/30"
                />
                <Gavel size={72} className="relative text-black" />
              </div>
              <div className="space-y-2.5">
                {[
                  ['Find', 'Choose MUNs without registration barriers.'],
                  ['Prepare', `${PREP_MATERIALS.length}+ guides and videos in one path.`],
                  ['Return', 'Reviews and channels stay attached to each MUN.'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl bg-[#F4F4F6] p-4">
                    <p className="text-[13px] font-semibold text-black">{title}</p>
                    <p className="mt-0.5 text-[13px] text-black/55">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-black/10 bg-white px-4 py-12 text-black sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Emblem size={38} />
            <div>
              <p className="text-sm font-semibold tracking-tight">{t('brandName')}</p>
              <p className="text-xs text-black/45">{t('brandTagline')}</p>
            </div>
          </div>
          <p className="max-w-xl text-[13px] leading-relaxed text-black/50">
            A minimal public desk for Uzbekistan's Model UN community: registry, knowledge, reviews and support in one
            place.
          </p>
          <a
            href="https://t.me/mun_helperBot"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-6 text-[13px] font-medium text-white transition-opacity hover:opacity-80"
          >
            Telegram bot
            <Send size={14} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </>
  );
}
