import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open now' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'planned', label: 'Date TBA' },
];

/**
 * Registry control bar: underline-style status tabs (a formal document-tab
 * look, not a pill toggle) plus a search input focusable via the "/" key.
 */
export default function FilterBar({ query, onQueryChange, status, onStatusChange, counts }) {
  const inputRef = useRef(null);

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
    <div className="plaque sticky top-24 z-30 flex flex-col gap-4 rounded-md p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Status tabs */}
      <div role="tablist" aria-label="Filter by registration status" className="flex flex-wrap gap-1 border-b border-un-800/10 sm:border-b-0">
        {FILTERS.map((f) => {
          const active = status === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onStatusChange(f.id)}
              className="relative cursor-pointer px-3.5 pb-3 pt-1 text-sm font-medium uppercase tracking-wide text-un-600 transition-colors hover:text-un-900"
            >
              <span className={active ? 'text-un-900' : ''}>
                {f.label}
                <span className="ml-1.5 rounded-sm bg-un-50 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-un-700">
                  {counts[f.id]}
                </span>
              </span>
              {active && (
                <motion.span
                  layoutId="active-filter-underline"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute inset-x-2 -bottom-px h-0.5 bg-gold-500"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative sm:w-72">
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
          placeholder="Search conferences…"
          aria-label="Search conferences"
          className="h-11 w-full rounded-md border border-un-800/15 bg-white pl-10 pr-16 text-sm text-un-900 placeholder:text-un-500/70 focus:border-un-400 focus:outline-none"
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
