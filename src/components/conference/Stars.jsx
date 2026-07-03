import { Star } from 'lucide-react';

/** Read-only star rating display (1–5), used on cards and in the review list. */
export default function Stars({ value, size = 15 }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(value) ? 'fill-gold-500 text-gold-500' : 'text-un-800/15'}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
