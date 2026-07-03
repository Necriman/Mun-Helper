import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Megaphone, X } from 'lucide-react';

/**
 * Format A — the un-dismissable countdown ad modal (see docs/AD_ARCHITECTURE.md).
 *
 * Rules, straight from the spec:
 *  - Appears once per session per campaign (see `sessionKey` below) — not on
 *    every route change, which the architecture doc explains is deliberate.
 *  - Backdrop click and Escape both no-op: this is intentionally NOT a
 *    dismissable dialog until the countdown finishes.
 *  - The close (X) button is disabled and shows the remaining seconds; once
 *    the timer hits 0 it becomes a normal, clickable close button.
 *  - The sponsor CTA is clickable immediately — only the *escape route* is
 *    gated, never the conversion path.
 *
 * `onEvent(eventType)` is called with 'ad_impression' on mount and
 * 'ad_click' when the CTA is used — wire this to
 * `supabase.from('analytics_logs').insert(...)` in a real deployment.
 */
export default function AdPopupModal({ campaign, onEvent = () => {} }) {
  const sessionKey = `adSeen:${campaign.id}`;
  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(sessionKey) === '1',
  );
  const [secondsLeft, setSecondsLeft] = useState(campaign.countdownSeconds);

  const visible = !dismissed;

  // Log the impression exactly once, the moment the ad is actually shown.
  useEffect(() => {
    if (visible) onEvent('ad_impression');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // The countdown itself — one tick per second, stops at 0.
  useEffect(() => {
    if (!visible || secondsLeft <= 0) return undefined;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [visible, secondsLeft]);

  const canClose = secondsLeft <= 0;

  const close = () => {
    if (!canClose) return; // guarded again here, not just via the disabled attribute
    sessionStorage.setItem(sessionKey, '1');
    setDismissed(true);
  };

  const handleCta = () => {
    onEvent('ad_click');
    window.open(campaign.destinationUrl, '_blank', 'noreferrer');
  };

  // Escape key intentionally does nothing before the countdown ends — this
  // listener exists only to swallow the keypress, not to close the modal.
  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-un-900/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ad-modal-title"
          // Backdrop click is a deliberate no-op — see docs/AD_ARCHITECTURE.md
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md overflow-hidden rounded-md border border-gold-400/50 bg-white shadow-plaque"
          >
            {/* Close button — disabled + counting down until canClose */}
            <button
              type="button"
              onClick={close}
              disabled={!canClose}
              aria-label={canClose ? 'Close advertisement' : `Close available in ${secondsLeft}s`}
              className={`absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition-colors ${
                canClose
                  ? 'cursor-pointer bg-un-900/5 text-un-800 hover:bg-un-900/10'
                  : 'cursor-not-allowed bg-un-900/5 text-un-500 tabular-nums'
              }`}
            >
              {canClose ? <X size={16} /> : secondsLeft}
            </button>

            {/* Sponsor banner area */}
            <div className="flex h-36 items-center justify-center bg-gradient-to-br from-un-800 to-un-900">
              {campaign.imageUrl ? (
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Megaphone size={40} className="text-gold-400/80" aria-hidden="true" />
              )}
            </div>

            <div className="p-6">
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-gold-400/50 bg-gold-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold-700">
                Featured conference
              </span>
              <h2 id="ad-modal-title" className="mt-3 font-serif text-2xl font-semibold text-un-900">
                {campaign.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-un-700">{campaign.tagline}</p>

              <button
                type="button"
                onClick={handleCta}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-un-800 text-sm font-semibold text-white transition-colors hover:bg-un-900"
              >
                Learn more
                <ExternalLink size={15} aria-hidden="true" />
              </button>

              {!canClose && (
                <p className="mt-3 text-center text-xs text-un-500">
                  You can close this in {secondsLeft} second{secondsLeft === 1 ? '' : 's'}…
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
