import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';

/**
 * Review submission form for signed-in delegates — an upsert into `reviews`
 * (one review per delegate per conference, same as the bot's
 * `bot_submit_review` RPC; the unique(conference_id, user_id) constraint on
 * the table is what makes both channels behave consistently).
 */
export default function ReviewForm({ conferenceId, onSubmitted }) {
  const { session, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!session) {
    return (
      <p className="rounded-md border border-un-800/10 bg-un-50/50 p-4 text-sm text-un-600">
        Sign in to leave a review for this conference.
      </p>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Pick a star rating first.');
      return;
    }
    setBusy(true);
    setError('');

    const { error: upsertError } = await supabase
      .from('reviews')
      .upsert(
        { conference_id: conferenceId, user_id: profile.id, rating, comment_text: comment || null },
        { onConflict: 'conference_id,user_id' },
      );

    setBusy(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setDone(true);
    onSubmitted?.();
  };

  if (done) {
    return (
      <p className="flex items-center gap-2 rounded-md border border-un-500/30 bg-un-50 p-4 text-sm font-medium text-un-800">
        <Check size={16} aria-hidden="true" />
        Thanks — your review is posted.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="plaque space-y-3.5 rounded-md p-5">
      <p className="text-sm font-semibold text-un-800">Leave a review</p>

      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            className="cursor-pointer p-0.5"
          >
            <Star
              size={22}
              className={n <= (hoverRating || rating) ? 'fill-gold-500 text-gold-500' : 'text-un-800/20'}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was the committee, chairs, organization?"
        rows={3}
        className="w-full rounded-md border border-un-800/15 bg-white p-3 text-sm text-un-900 placeholder:text-un-500/70 focus:border-un-400 focus:outline-none"
      />

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="h-10 rounded-md bg-un-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-un-900 disabled:opacity-60"
      >
        {busy ? 'Posting…' : 'Post review'}
      </button>
    </form>
  );
}
