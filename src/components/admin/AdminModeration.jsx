import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, MessagesSquare, ShieldCheck, User, X } from 'lucide-react';
import { PENDING_APPLICATIONS } from '../../data/moderationQueue';
import { supabase } from '../../lib/supabase';

/**
 * Pending MUN Applications — conferences.status = 'pending_review'.
 * Approve/Reject are real UPDATE statements, allowed by the "staff moderate
 * conferences" RLS policy (only works for a signed-in moderator/admin).
 * Falls back to the mock PENDING_APPLICATIONS array in mock mode.
 */
export default function AdminModeration() {
  const [queue, setQueue] = useState(supabase ? [] : PENDING_APPLICATIONS);
  const [loading, setLoading] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    supabase
      .from('conferences')
      .select('id, title, date_start, created_at, contact_telegram, description')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return;
        setQueue(
          (data ?? []).map((row) => ({
            id: row.id,
            title: row.title,
            submittedBy: row.contact_telegram ?? 'Unknown',
            submittedVia: 'Telegram bot',
            submittedAt: new Date(row.created_at).toLocaleString(),
            proposedDate: row.date_start ?? 'Date not yet set',
            committees: 0,
          })),
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const decide = async (id, nextStatus) => {
    setQueue((q) => q.filter((app) => app.id !== id)); // optimistic
    if (!supabase) return;
    await supabase.from('conferences').update({ status: nextStatus }).eq('id', id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-un-900">Moderation</h1>
        <p className="mt-1 text-sm text-un-600">
          Conferences submitted via the Telegram bot, awaiting approval before they appear publicly.
          {loading && ' Loading…'}
        </p>
      </div>

      {queue.length === 0 && !loading ? (
        <div className="plaque flex flex-col items-center gap-3 rounded-md px-6 py-16 text-center">
          <ShieldCheck size={28} className="text-un-500" aria-hidden="true" />
          <p className="font-serif text-lg font-semibold text-un-900">Queue clear</p>
          <p className="text-sm text-un-600">No pending applications right now.</p>
        </div>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence mode="popLayout">
            {queue.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="plaque flex flex-col gap-4 rounded-md p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-lg font-semibold text-un-900">{app.title}</h3>
                    <span className="rounded-sm border border-gold-400/40 bg-gold-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold-700">
                      Pending review
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-un-600">
                    <span className="flex items-center gap-1.5">
                      <User size={13} aria-hidden="true" />
                      {app.submittedBy} via {app.submittedVia}
                    </span>
                    <span>{app.submittedAt}</span>
                    <span>Proposed: {app.proposedDate}</span>
                    {app.committees > 0 && (
                      <span className="flex items-center gap-1.5">
                        <MessagesSquare size={13} aria-hidden="true" />
                        {app.committees} committees
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => decide(app.id, 'rejected')}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-un-800/15 px-3.5 py-2 text-sm font-semibold text-un-700 transition-colors hover:border-rose-400 hover:text-rose-600"
                  >
                    <X size={15} aria-hidden="true" />
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(app.id, 'approved')}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-un-800 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-un-900"
                  >
                    <Check size={15} aria-hidden="true" />
                    Approve
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
