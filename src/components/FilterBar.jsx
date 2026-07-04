import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

const FILTERS = [
  { id: 'all', labelKey: 'all' },
  { id: 'open', labelKey: 'openNow' },
  { id: 'upcoming', labelKey: 'upcoming' },
  { id: 'planned', labelKey: 'dateTba' },
];

/**
 * Registry control bar: underline-style status tabs (a formal document-tab
 * look, not a pill toggle) plus a search input focusable via the "/" key.
 */
export default function FilterBar({ query, onQueryChange, status, onStatusChange, counts }) {
  const inputRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="glass-panel sticky top-24 z-30 flex flex-col gap-4 rounded-sm p-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status tabs */}
      <div role="tablist" aria-label="Filter by registration status" className="flex flex-wrap gap-1 rounded-sm bg-slate-100 p-1">
        {FILTERS.map((f) => {
          const active = status === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onStatusChange(f.id)}
              className={`relative min-h-10 cursor-pointer rounded-sm px-3.5 text-sm font-semibold uppercase tracking-wide transition-colors duration-200 ${
                active ? 'text-un-900' : 'text-un-600 hover:bg-white/70 hover:text-un-900'
              }`}
            >
              <span className="relative z-10">
                {t(f.labelKey)}
                <span className={`ml-1.5 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                  active ? 'bg-un-100 text-un-900' : 'bg-white text-un-700'
                }`}>
                  {counts[f.id]}
                </span>
              </span>
              {active && (
                <motion.span
                  layoutId="active-filter-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-sm bg-white shadow-[0_4px_14px_rgba(11,31,58,0.08)]"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative sm:w-80">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-un-500"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t('searchConferences')}
          aria-label={t('searchConferences')}
          className="h-11 w-full rounded-sm border border-slate-300 bg-white pl-10 pr-16 text-sm text-un-900 placeholder:text-un-500/70 focus:border-un-400 focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded-sm text-un-500 transition-colors hover:bg-un-50 hover:text-un-900"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-sm border border-un-800/15 bg-un-50 px-1.5 py-0.5 text-[11px] font-medium text-un-600 sm:block"
            aria-hidden="true"
          >
            /
          </kbd>
        )}
      </div>
    </div>
  );
}
