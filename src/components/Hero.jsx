import { useEffect, useRef } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { BookOpen, CalendarClock, Globe2, Radar } from 'lucide-react';

/** Number that counts up on mount; renders instantly for reduced-motion users. */
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

/**
 * Hero: kicker, serif headline, gold rule, CTAs and four "plaque" stats.
 * `stats` = { open, upcoming, planned, guides } computed in App from real data.
 */
export default function Hero({ stats }) {
  const tiles = [
    { icon: Globe2, label: 'Open registrations', value: stats.open },
    { icon: CalendarClock, label: 'Dates announced', value: stats.upcoming },
    { icon: Radar, label: 'Planned conferences', value: stats.planned },
    { icon: BookOpen, label: 'Academy guides', value: stats.guides, suffix: '+' },
  ];

  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-40">
      <div className="bg-meridians absolute inset-0" aria-hidden="true" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {/* Kicker */}
        <motion.div variants={item} className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-sm border border-gold-400/50 bg-gold-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gold-700">
            Season 2026 Registry
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="mx-auto mt-6 max-w-3xl text-center font-serif text-4xl font-semibold leading-tight tracking-tight text-un-900 sm:text-5xl lg:text-6xl"
        >
          Every Model UN conference in Uzbekistan, formally on record.
        </motion.h1>

        {/* Gold rule */}
        <motion.div variants={item} className="mx-auto mt-6 h-px w-24 bg-gold-400" aria-hidden="true" />

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-un-700 sm:text-lg"
        >
          Track registrations as they open, never miss a deadline, and study the Academy's guides
          and rules of procedure — from your first placard to chairing the dais.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#registry"
            className="inline-flex items-center gap-2 rounded-md bg-un-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-un-900"
          >
            View the registry
          </a>
          <a
            href="#academy"
            className="plaque plaque-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-un-800"
          >
            Explore the Academy
          </a>
        </motion.div>

        {/* Stats — formal data plaques */}
        <motion.dl variants={item} className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {tiles.map(({ icon: Icon, label, value, suffix }) => (
            <div key={label} className="plaque plaque-hover rounded-md p-4 text-center sm:p-5">
              <Icon size={20} className="mx-auto text-un-600" aria-hidden="true" />
              <dd className="mt-3 font-serif text-3xl font-semibold tabular-nums text-un-900">
                <CountUp to={value} suffix={suffix ?? ''} />
              </dd>
              <dt className="mt-1 text-xs font-medium uppercase tracking-wide text-un-600">{label}</dt>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  );
}
