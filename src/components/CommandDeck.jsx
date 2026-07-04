import { motion } from 'framer-motion';
import { Activity, Bot, CheckCircle2, Cpu, MousePointer2, Orbit, RadioTower, Route } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

function SignalBar({ value, label }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-un-100/80">
        <span>{label}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-[linear-gradient(90deg,#5B92E5,#FFFFFF)]"
        />
      </div>
    </div>
  );
}

export default function CommandDeck({ stats }) {
  const { t } = useLanguage();
  const pipeline = [t('commandStepOne'), t('commandStepTwo'), t('commandStepThree'), t('commandStepFour')];
  const total = Math.max(stats.open + stats.upcoming + stats.planned, 1);
  const readiness = Math.min(96, Math.round(((stats.open + stats.upcoming) / total) * 72 + 18));

  return (
    <section className="relative scroll-mt-28 overflow-hidden rounded-[28px] border border-white/12 bg-[#061b36] p-4 text-white shadow-[0_36px_100px_rgba(6,27,54,0.22)] sm:p-6 lg:p-8">
      <div className="tech-grid absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-un-400/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-[#193e9a]/35 blur-3xl" aria-hidden="true" />

      <div className="relative grid gap-6 lg:grid-cols-[0.9fr_1.15fr_0.8fr]">
        <div className="flex flex-col justify-between rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-un-100">
              <RadioTower size={15} aria-hidden="true" />
              {t('commandEyebrow')}
            </p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">{t('commandTitle')}</h2>
            <p className="mt-4 text-sm leading-relaxed text-un-50/78">{t('commandText')}</p>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2">
            {[
              { icon: Activity, label: t('commandSignal'), value: `${readiness}%` },
              { icon: Bot, label: t('commandSynced'), value: '24/7' },
              { icon: CheckCircle2, label: t('commandVerified'), value: stats.open },
            ].map(({ icon: Icon, label, value }) => (
              <motion.div key={label} whileHover={{ y: -4, scale: 1.02 }} className="rounded-xl border border-white/12 bg-white/[0.08] p-3">
                <Icon size={17} className="text-un-100" aria-hidden="true" />
                <p className="mt-2 text-xl font-extrabold tabular-nums">{value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-un-100/70">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-white/12 bg-white/[0.05] p-5">
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-un-200/30" />
          <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-un-200/20" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-un-100/25"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/[0.08] shadow-[0_0_80px_rgba(91,146,229,0.28)]"
          >
            <Orbit size={42} className="text-white" aria-hidden="true" />
          </motion.div>

          {[
            ['Tashkent', 'left-[12%] top-[22%]'],
            ['Samarkand', 'right-[10%] top-[28%]'],
            ['Bot', 'left-[18%] bottom-[18%]'],
            ['Academy', 'right-[14%] bottom-[16%]'],
          ].map(([label, position], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className={`absolute ${position} rounded-full border border-white/15 bg-white/[0.08] px-3 py-2 text-xs font-bold uppercase tracking-wide text-un-50 backdrop-blur`}
            >
              {label}
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-un-100">
              <Route size={15} aria-hidden="true" />
              {t('commandPipeline')}
            </p>
            <div className="mt-4 space-y-3">
              {pipeline.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-un-400 text-xs font-extrabold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-un-50/86">{step}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-un-100">
              <Cpu size={15} aria-hidden="true" />
              {t('commandPulse')}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-un-50/75">{t('commandPulseText')}</p>
            <div className="mt-4 space-y-4">
              <SignalBar label="Registry" value={readiness} />
              <SignalBar label="Academy" value={Math.min(98, stats.guides * 5)} />
              <SignalBar label="Bot" value={92} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-un-50/80">
        <span className="flex items-center gap-2 font-semibold">
          <MousePointer2 size={16} aria-hidden="true" />
          Move through the registry, academy and bot as one connected workflow.
        </span>
        <a href="#registry" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-un-900 transition-colors hover:bg-un-50">
          Open registry
        </a>
      </div>
    </section>
  );
}
