import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Gauge, ListChecks, Sparkles } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

const COMMITTEES = ['General Assembly', 'Security Council', 'UNICEF', 'WHO', 'UNHRC'];

export default function ReadinessPanel() {
  const { t } = useLanguage();
  const [country, setCountry] = useState('');
  const [committee, setCommittee] = useState(COMMITTEES[0]);
  const [experience, setExperience] = useState(35);

  const plan = useMemo(() => {
    const level = experience < 45 ? t('beginner') : t('advanced');
    const delegation = country.trim() || 'your delegation';
    return [
      `Research ${delegation}'s official position in ${committee}.`,
      experience < 45 ? 'Review rules of procedure and opening speech structure.' : 'Prepare amendments and crisis-style arguments.',
      'Save one upcoming MUN and compare registration deadlines.',
      `Current level: ${level}.`,
    ];
  }, [committee, country, experience, t]);

  return (
    <section className="scroll-mt-28" aria-labelledby="readiness-title">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        className="overflow-hidden rounded-sm border border-un-200 bg-[linear-gradient(135deg,#ffffff_0%,#eef7ff_55%,#ffffff_100%)] shadow-[0_20px_60px_rgba(11,31,58,0.08)]"
      >
        <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-b border-un-200 p-6 lg:border-b-0 lg:border-r">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-un-600">
              <Sparkles size={15} aria-hidden="true" />
              AI readiness layer
            </p>
            <h2 id="readiness-title" className="mt-3 text-3xl font-bold leading-tight text-un-900">
              {t('readinessTitle')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-un-700">{t('readinessText')}</p>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-un-900">{t('countryLabel')}</span>
              <input
                type="text"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder={t('countryPlaceholder')}
                className="mt-2 h-12 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-un-900 outline-none transition-colors placeholder:text-slate-400 focus:border-un-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-un-900">{t('committeeLabel')}</span>
              <select
                value={committee}
                onChange={(event) => setCommittee(event.target.value)}
                className="mt-2 h-12 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm font-semibold text-un-900 outline-none transition-colors focus:border-un-500"
              >
                {COMMITTEES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="flex items-center justify-between text-sm font-semibold text-un-900">
                {t('experienceLabel')}
                <span className="tabular-nums text-un-600">{experience}%</span>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={experience}
                onChange={(event) => setExperience(Number(event.target.value))}
                className="mt-3 w-full accent-un-500"
              />
              <div className="mt-1 flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>{t('beginner')}</span>
                <span>{t('advanced')}</span>
              </div>
            </label>

            <div className="rounded-sm border border-un-200 bg-white p-4 md:col-span-2">
              <p className="flex items-center gap-2 text-sm font-bold text-un-900">
                <Gauge size={17} className="text-un-600" aria-hidden="true" />
                {t('generatedPlan')}
              </p>
              <ul className="mt-3 grid gap-2 text-sm text-un-700 sm:grid-cols-2">
                {plan.map((item) => (
                  <li key={item} className="flex gap-2">
                    <ListChecks size={16} className="mt-0.5 shrink-0 text-un-500" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
