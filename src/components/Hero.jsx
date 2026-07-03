import { lazy, Suspense, useEffect, useRef } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, BookOpen, CalendarClock, Globe2, Gavel, Radar, Sparkles } from 'lucide-react';
import Emblem from './Emblem';

const DiplomacyScene = lazy(() => import('./DiplomacyScene'));

function CountUp({ to, suffix = '' }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (reduceMotion) {
      node.textContent = `${to}${suffix}`;
      return undefined;
    }
    const controls = animate(0, to, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => {
        node.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [to, suffix, reduceMotion]);

  return <span ref={ref}>0</span>;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Hero({ stats }) {
  const tiles = [
    { icon: Globe2, label: 'Open registrations', value: stats.open },
    { icon: CalendarClock, label: 'Dates announced', value: stats.upcoming },
    { icon: Radar, label: 'Planned conferences', value: stats.planned },
    { icon: BookOpen, label: 'Academy guides', value: stats.guides, suffix: '+' },
  ];

  return (
    <section id="top" className="relative min-h-[820px] overflow-hidden bg-[#061525] pb-16 pt-28 text-white sm:pb-20 sm:pt-32">
      <div className="bg-meridians absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 opacity-95" aria-hidden="true">
        <Suspense fallback={null}>
          <DiplomacyScene />
        </Suspense>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_19%,rgba(76,147,214,0.2),transparent_32%),radial-gradient(circle_at_20%_45%,rgba(212,175,95,0.12),transparent_24%),linear-gradient(180deg,rgba(6,21,37,0.4),rgba(6,21,37,0.98))]" aria-hidden="true" />
      <div className="hero-scanline absolute inset-0 opacity-40" aria-hidden="true" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex min-h-[680px] max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={item} className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 1.4, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <span className="absolute -inset-3 rounded-full border border-white/15 bg-white/5 blur-[1px]" />
            <Emblem size={92} className="relative drop-shadow-[0_18px_34px_rgba(76,147,214,0.35)]" />
            <motion.span
              animate={{ rotate: [0, -10, 8, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-1 -right-2 grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-gold-50 text-gold-700 shadow-plaque"
            >
              <Gavel size={18} aria-hidden="true" />
            </motion.span>
          </motion.div>

          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-un-50 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur">
            <Sparkles size={13} className="text-gold-300" aria-hidden="true" />
            Uzbekistan Model UN Command Center
          </span>

          <h1 className="mt-6 max-w-4xl font-serif text-5xl font-semibold leading-[0.95] text-white sm:text-7xl lg:text-8xl">
            Mun Helper
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-un-50/85 sm:text-xl">
            Discover upcoming conferences, compare organizers, read reviews, and train for committee with a real
            preparation library before you raise your placard.
          </p>
          <motion.div
            variants={item}
            className="mt-7 grid w-full max-w-2xl grid-cols-1 gap-2 text-left sm:grid-cols-3"
          >
            {['Public MUN registry', 'Prep library', 'Telegram bot sync'].map((label) => (
              <span key={label} className="rounded-md border border-white/10 bg-white/[0.07] px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-un-50/80 backdrop-blur">
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#registry"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-un-900 shadow-[0_18px_50px_rgba(238,245,252,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-un-50"
          >
            View MUN registry
            <ArrowDown size={15} className="transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </a>
          <a
            href="#academy"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15"
          >
            Start preparation
          </a>
        </motion.div>

        <motion.dl variants={item} className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {tiles.map(({ icon: Icon, label, value, suffix }) => (
            <motion.div
              key={label}
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="rounded-lg border border-white/15 bg-white/[0.08] p-4 text-center shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-5"
            >
              <Icon size={20} className="mx-auto text-un-100" aria-hidden="true" />
              <dd className="mt-3 font-serif text-3xl font-semibold tabular-nums text-white">
                <CountUp to={value} suffix={suffix ?? ''} />
              </dd>
              <dt className="mt-1 text-xs font-medium uppercase tracking-wide text-un-100/80">{label}</dt>
            </motion.div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  );
}
