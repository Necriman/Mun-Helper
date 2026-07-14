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
    <div className="glass-panel sticky top-24 z-30 flex flex-col gap-4 rounded-[24px] p-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status tabs */}
      <div role="tablist" aria-label="Filter by registration status" className="flex flex-wrap gap-1 rounded-[18px] bg-white/[0.06] p-1">
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
                active ? 'text-white' : 'text-un-100/76 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="relative z-10">
                {t(f.labelKey)}
                <span className={`ml-1.5 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                  active ? 'bg-white text-un-900' : 'bg-white/10 text-un-100'
                }`}>
                  {counts[f.id]}
                </span>
              </span>
              {active && (
                <motion.span
                  layoutId="active-filter-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-[15px] bg-un-500 shadow-[0_12px_34px_rgba(0,158,219,0.22)]"
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
          className="h-11 w-full rounded-[16px] border border-white/12 bg-white/[0.07] pl-10 pr-16 text-sm text-white placeholder:text-un-100/50 focus:border-un-300 focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-un-100 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/12 bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-un-100/70 sm:block"
            aria-hidden="true"
          >
            /
          </kbd>
        )}
      </div>
    </div>
  );
}
