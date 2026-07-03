import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Languages,
  PlayCircle,
  Search,
} from 'lucide-react';
import { MATERIAL_CATEGORIES, PREP_MATERIALS, PREP_PATH } from '../data/prepMaterials';

const CATEGORY_ICONS = {
  basics: BookOpen,
  research: Search,
  papers: FileText,
  committees: GraduationCap,
  videos: PlayCircle,
  ru: Languages,
};

function MaterialCard({ material, index }) {
  const Icon = CATEGORY_ICONS[material.category] ?? BookOpen;

  return (
    <motion.a
      href={material.url}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index * 0.035, 0.2), duration: 0.32, ease: 'easeOut' }}
      whileHover={{ y: -6, rotateX: 0.4, rotateY: -0.4 }}
      className="plaque plaque-hover group relative flex min-h-[230px] flex-col overflow-hidden rounded-xl p-5"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-un-500 via-gold-300 to-emerald-500 opacity-70" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-gold-100/50 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-un-50 text-un-700 shadow-inner">
          <Icon size={20} aria-hidden="true" />
        </span>
        <span className="rounded-full border border-un-800/10 bg-white/70 px-2.5 py-1 text-xs font-semibold text-un-600">
          {material.language}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-un-500">{material.type}</p>
        <h3 className="mt-1 font-serif text-lg font-semibold leading-snug text-un-900">{material.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-un-600">{material.summary}</p>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5">
        <div className="flex flex-wrap gap-1.5 text-xs font-medium">
          <span className="rounded-full bg-gold-50 px-2.5 py-1 text-gold-700">{material.level}</span>
          <span className="rounded-full bg-un-50 px-2.5 py-1 text-un-700">{material.time}</span>
        </div>
        <ArrowUpRight
          size={17}
          className="text-un-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-un-800"
          aria-hidden="true"
        />
      </div>
    </motion.a>
  );
}

export default function AcademySection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');

  const visibleMaterials = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return PREP_MATERIALS.filter((material) => {
      const categoryMatch = activeCategory === 'all' || material.category === activeCategory;
      const queryMatch =
        !normalized ||
        material.title.toLowerCase().includes(normalized) ||
        material.summary.toLowerCase().includes(normalized) ||
        material.type.toLowerCase().includes(normalized);
      return categoryMatch && queryMatch;
    });
  }, [activeCategory, query]);

  const materialById = useMemo(() => new Map(PREP_MATERIALS.map((material) => [material.id, material])), []);

  return (
    <section id="academy" className="scroll-mt-28">
      <div className="mb-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-un-600">
            <GraduationCap size={16} aria-hidden="true" />
            MUN preparation library
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-un-900 sm:text-4xl">Train before committee</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-un-600">
            A structured pack of beginner explainers, research guides, position paper help, resolution writing, and
            English/Russian videos from the MUN BAG channel.
          </p>
        </div>

        <div className="glass-panel rounded-xl p-4">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-un-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search preparation materials..."
              aria-label="Search preparation materials"
              className="h-11 w-full rounded-lg border border-un-800/15 bg-white/90 pl-10 pr-3 text-sm text-un-900 shadow-inner placeholder:text-un-500/70 focus:border-un-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {MATERIAL_CATEGORIES.map((category) => {
          const active = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              aria-pressed={active}
              className={`h-10 shrink-0 cursor-pointer rounded-full border px-3.5 text-sm font-semibold transition-all duration-300 ${
                active
                  ? 'border-un-900 bg-un-900 text-white shadow-[0_10px_24px_rgba(15,51,85,0.14)]'
                  : 'border-un-800/15 bg-white/80 text-un-700 hover:-translate-y-0.5 hover:border-un-400'
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {PREP_PATH.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: index * 0.05, duration: 0.32, ease: 'easeOut' }}
            className="plaque plaque-hover rounded-xl p-5"
          >
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-un-800 text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="font-serif text-base font-semibold text-un-900">{step.title}</h3>
            </div>
            <div className="mt-4 space-y-2">
              {step.materialIds.map((id) => {
                const material = materialById.get(id);
                if (!material) return null;
                return (
                  <a
                    key={id}
                    href={material.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-2 rounded-lg p-1.5 text-sm text-un-600 transition-colors hover:bg-un-50 hover:text-un-900"
                  >
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-un-500" aria-hidden="true" />
                    {material.title}
                  </a>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {visibleMaterials.length === 0 ? (
        <div className="plaque rounded-xl p-10 text-center">
          <p className="font-serif text-lg font-semibold text-un-900">No materials found</p>
          <p className="mt-1 text-sm text-un-600">Try another category or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleMaterials.map((material, index) => (
            <MaterialCard key={material.id} material={material} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
