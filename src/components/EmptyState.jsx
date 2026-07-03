import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';

/** Shown when the current search + filter combination matches nothing. */
export default function EmptyState({ query, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="plaque flex flex-col items-center gap-4 rounded-md px-6 py-16 text-center"
    >
      <span className="grid h-14 w-14 place-items-center rounded-sm bg-un-50 text-un-500">
        <SearchX size={26} aria-hidden="true" />
      </span>
      <div>
        <p className="font-serif text-lg font-semibold text-un-900">No conferences found</p>
        <p className="mt-1 text-sm text-un-600">
          {query
            ? `Nothing matches “${query}” with the current filter.`
            : 'Nothing matches the current filter.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="cursor-pointer rounded-md border border-un-800/15 px-5 py-2.5 text-sm font-semibold text-un-700 transition-colors hover:border-un-400 hover:text-un-900"
      >
        Clear search &amp; filters
      </button>
    </motion.div>
  );
}
