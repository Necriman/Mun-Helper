import { lazy, Suspense, useEffect, useRef } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { BookOpen, CalendarClock, Globe2, Gavel, Radar } from 'lucide-react';
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
    <section id="top" className="relative min-h-[760px] overflow-hidden bg-un-900 pb-16 pt-28 text-white sm:pb-20 sm:pt-32">
      <div className="bg-meridians absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 opacity-95" aria-hidden="true">
        <Suspense fallback={null}>
          <DiplomacyScene />
        </Suspense>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(76,147,214,0.16),transparent_34%),linear-gradient(180deg,rgba(10,32,56,0.44),rgba(10,32,56,0.94))]" aria-hidden="true" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={item} className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="relative">
            <Emblem size={86} />
            <span className="absolute -bottom-1 -right-2 grid h-9 w-9 place-items-center rounded-full border border-white bg-gold-50 text-gold-700 shadow-plaque">
              <Gavel size={18} aria-hidden="true" />
            </span>
          </div>

          <span className="mt-5 inline-flex items-center gap-2 rounded-sm border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-un-50 backdrop-blur">
            Uzbekistan Model UN Command Center
          </span>

          <h1 className="mt-6 max-w-4xl font-serif text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            Mun Helper
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-un-50/90 sm:text-xl">
            Discover upcoming conferences, compare organizers, read reviews, and train for committee with a real
            preparation library before you raise your placard.
          </p>
        </motion.div>

        <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#registry"
            className="inline-flex h-12 items-center gap-2 rounded-md bg-un-800 px-6 text-sm font-semibold text-white transition-colors hover:bg-un-900"
          >
            View MUN registry
          </a>
          <a
            href="#academy"
            className="inline-flex h-12 items-center gap-2 rounded-md border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/15"
          >
            Start preparation
          </a>
        </motion.div>

        <motion.dl variants={item} className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {tiles.map(({ icon: Icon, label, value, suffix }) => (
            <div key={label} className="rounded-md border border-white/15 bg-white/10 p-4 text-center shadow-plaque backdrop-blur sm:p-5">
              <Icon size={20} className="mx-auto text-un-100" aria-hidden="true" />
              <dd className="mt-3 font-serif text-3xl font-semibold tabular-nums text-white">
                <CountUp to={value} suffix={suffix ?? ''} />
              </dd>
              <dt className="mt-1 text-xs font-medium uppercase tracking-wide text-un-100/80">{label}</dt>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  );
}
