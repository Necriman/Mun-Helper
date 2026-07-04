import { lazy, Suspense, useEffect, useRef } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, BookOpen, CalendarClock, Globe2, Gavel, Radar } from 'lucide-react';
import Emblem from './Emblem';
import { useLanguage } from '../lib/i18n';

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
  const { t } = useLanguage();
  const tiles = [
    { icon: Globe2, label: t('openRegistrations'), value: stats.open },
    { icon: CalendarClock, label: t('datesAnnounced'), value: stats.upcoming },
    { icon: Radar, label: t('plannedConferences'), value: stats.planned },
    { icon: BookOpen, label: t('academyGuides'), value: stats.guides, suffix: '+' },
  ];

  return (
    <section id="top" className="relative min-h-[780px] overflow-hidden bg-un-900 pb-16 pt-28 text-white sm:pb-20 sm:pt-32">
      <div className="bg-meridians absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 opacity-95" aria-hidden="true">
        <Suspense fallback={null}>
          <DiplomacyScene />
        </Suspense>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,31,58,0.52),rgba(11,31,58,0.96))]" aria-hidden="true" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex min-h-[640px] max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={item} className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="relative">
            <span className="absolute -inset-3 rounded-full border border-white/15 bg-white/5" />
            <Emblem size={118} className="relative rounded-full drop-shadow-[0_18px_42px_rgba(91,146,229,0.32)]" />
            <span className="absolute -bottom-1 -right-2 grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white text-un-900 shadow-plaque">
              <Gavel size={18} aria-hidden="true" />
            </span>
          </div>

          <span className="mt-6 inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-un-50">
            {t('heroEyebrow')}
          </span>

          <h1 className="mt-6 max-w-5xl text-4xl font-extrabold leading-tight text-white sm:text-6xl lg:text-7xl">
            {t('heroTitle')}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-un-50/90 sm:text-xl">
            {t('heroText')}
          </p>
          <motion.div
            variants={item}
            className="mt-7 grid w-full max-w-2xl grid-cols-1 gap-2 text-left sm:grid-cols-3"
          >
            {[t('heroRegistry'), t('heroPrep'), t('heroBot')].map((label) => (
              <span key={label} className="rounded-sm border border-white/20 bg-white/[0.08] px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-un-50/85">
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#registry"
            className="group inline-flex h-12 items-center gap-2 rounded-sm bg-white px-6 text-sm font-semibold text-un-900 transition-colors hover:bg-un-50"
          >
            {t('viewRegistry')}
            <ArrowDown size={15} className="transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </a>
          <a
            href="#academy"
            className="inline-flex h-12 items-center gap-2 rounded-sm border border-white/30 bg-transparent px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {t('startPreparation')}
          </a>
        </motion.div>

        <motion.dl variants={item} className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {tiles.map(({ icon: Icon, label, value, suffix }) => (
            <motion.div
              key={label}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="rounded-sm border border-white/18 bg-white/[0.08] p-4 text-center sm:p-5"
            >
              <Icon size={20} className="mx-auto text-un-100" aria-hidden="true" />
              <dd className="mt-3 text-3xl font-bold tabular-nums text-white">
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
