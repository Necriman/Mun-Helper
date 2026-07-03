import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Lock, Mail, User, X } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';

/**
 * Sign in / Register modal — real Supabase Auth (email + password).
 * `mode` seeds which tab opens first; the user can still switch.
 */
export default function AuthModal({ open, mode = 'signin', onClose }) {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState(mode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  if (!open) return null;

  const reset = () => {
    setError('');
    setConfirmSent(false);
  };

  const switchTab = (next) => {
    setTab(next);
    reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!supabase) {
      setError('Supabase is not configured yet — add VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to .env.');
      return;
    }

    setBusy(true);
    const { error: authError } =
      tab === 'signup' ? await signUp(email, password, fullName) : await signIn(email, password);
    setBusy(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (tab === 'signup') {
      setConfirmSent(true); // Supabase sends a confirmation email by default
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center bg-un-900/60 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.99 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm rounded-md border border-un-800/10 bg-white p-6 shadow-plaque"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full text-un-500 transition-colors hover:bg-un-50 hover:text-un-800"
          >
            <X size={16} />
          </button>

          {/* Tabs */}
          <div className="mb-5 flex gap-1 border-b border-un-800/10">
            {[
              { id: 'signin', label: 'Sign in' },
              { id: 'signup', label: 'Register' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => switchTab(t.id)}
                className={`relative px-3.5 pb-3 pt-1 text-sm font-medium transition-colors ${
                  tab === t.id ? 'text-un-900' : 'text-un-500 hover:text-un-800'
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <motion.span
                    layoutId="auth-tab-underline"
                    className="absolute inset-x-2 -bottom-px h-0.5 bg-gold-500"
                  />
                )}
              </button>
            ))}
          </div>

          <h2 id="auth-modal-title" className="mb-4 font-serif text-xl font-semibold text-un-900">
            {tab === 'signup' ? 'Register your delegation' : 'Welcome back'}
          </h2>

          {confirmSent ? (
            <p className="rounded-md border border-un-500/30 bg-un-50 p-4 text-sm text-un-800">
              Check <strong>{email}</strong> for a confirmation link to finish creating your account.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === 'signup' && (
                <div className="relative">
                  <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-un-500" />
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 w-full rounded-md border border-un-800/15 bg-white pl-10 pr-3.5 text-sm text-un-900 placeholder:text-un-500/70 focus:border-un-400 focus:outline-none"
                  />
                </div>
              )}
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-un-500" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-md border border-un-800/15 bg-white pl-10 pr-3.5 text-sm text-un-900 placeholder:text-un-500/70 focus:border-un-400 focus:outline-none"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-un-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-md border border-un-800/15 bg-white pl-10 pr-3.5 text-sm text-un-900 placeholder:text-un-500/70 focus:border-un-400 focus:outline-none"
                />
              </div>

              {error && <p className="text-sm text-rose-600">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-un-800 text-sm font-semibold text-white transition-colors hover:bg-un-900 disabled:opacity-60"
              >
                {busy && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
                {tab === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
