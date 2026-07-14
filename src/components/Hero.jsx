import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../lib/i18n';

const DiplomacyScene = lazy(() => import('./DiplomacyScene'));

/** Shared easing for the whole entrance choreography. */
const EASE = [0.16, 1, 0.3, 1];

/**
 * Minimal monochrome hero. Layout follows the reference composition:
 * full-viewport section, the 3D diplomacy scene as a centered background
 * layer (80%-ish frame on mobile, full-bleed on desktop), and the actual
 * content pinned to the bottom over a white fade-up gradient — light
 * 300-weight display heading, one black pill CTA + one outline CTA,
 * small tag pills on the right.
 */
export default function Hero({ stats }) {
  const { t } = useLanguage();

  return (
    <section id="top" className="relative flex min-h-screen flex-col justify-end overflow-hidden bg-white">
      {/* ── Background: 3D scene in a centered frame ── */}
      <div className="absolute inset-0 z-0 grid place-items-center" aria-hidden="true">
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease: EASE }}
          className="h-[72%] w-[88%] overflow-hidden rounded-[2rem] bg-[#061b36] md:h-full md:w-full md:rounded-none"
        >
          <Suspense fallback={null}>
            <DiplomacyScene />
          </Suspense>
        </motion.div>
        {/* White fades: top keeps the navbar readable, bottom carries the content */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white via-white/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-white via-white/80 to-transparent" />
      </div>

      {/* ── Bottom-pinned content ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: EASE }}
        className="relative z-30 mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="max-w-3xl">
            <motion.p
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
              className="flex items-center gap-2 text-[13px] text-black/55"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-black" aria-hidden="true" />
              {t('heroEyebrow')}
            </motion.p>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
              className="mt-4 text-[clamp(2rem,8vw,4.5rem)] font-light leading-[1] tracking-[-0.03em] text-black md:text-[clamp(2.5rem,5.5vw,4.5rem)]"
            >
              {t('heroTitle')}
            </motion.h1>

            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0, ease: EASE }}
              className="mt-6 flex flex-wrap items-center gap-2.5"
            >
              <a
                href="#registry"
                className="inline-flex h-11 items-center rounded-full bg-black px-6 text-[13px] font-medium text-white transition-opacity hover:opacity-80"
              >
                {t('viewRegistry')}
              </a>
              <a
                href="#academy"
                className="inline-flex h-11 items-center rounded-full border border-black/35 px-6 text-[13px] font-medium text-black transition-colors hover:bg-black/5"
              >
                {t('startPreparation')}
              </a>
              <span className="ml-1 text-[13px] tabular-nums text-black/45">
                {stats.open} open · {stats.upcoming} upcoming · {stats.planned} planned · {stats.guides}+ guides
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0, ease: EASE }}
            className="flex flex-wrap gap-2 md:justify-end"
          >
            {[t('heroRegistry'), t('heroPrep'), t('heroBot')].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/12 bg-white px-3.5 py-2 text-[11px] font-medium text-black"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
