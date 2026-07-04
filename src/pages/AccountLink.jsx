import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, Loader2, Lock, Mail, ShieldAlert, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Emblem from '../components/Emblem';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';

/**
 * The website half of Format-B's "Mandatory Verification" handshake (see
 * docs/AD_ARCHITECTURE.md). Reached via the bot's "Create / link my
 * account" button: /link?token=<one-time token>.
 *
 * Two paths, both ending with the token consumed and the account linked:
 *  - Already signed in           → one click calls link_telegram_by_token(token)
 *  - Not signed in (new or not)  → sign up (token travels in auth metadata,
 *    consumed by the handle_new_user() trigger) or sign in (consumed by
 *    link_telegram_by_token() right after, since sign-in has no trigger hook)
 */
export default function AccountLink() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const { session, signIn, signUp, authRedirectTo } = useAuth();

  const [tab, setTab] = useState('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  if (!token) {
    return (
      <div className="min-h-dvh">
        <Navbar />
        <div className="mx-auto max-w-md pt-40 text-center">
          <ShieldAlert size={28} className="mx-auto text-rose-500" aria-hidden="true" />
          <p className="mt-3 font-serif text-xl font-semibold text-un-900">Missing link token</p>
          <p className="mt-2 text-sm text-un-600">
            Open this page from the "Create / link my account" button in the Telegram bot.
          </p>
        </div>
      </div>
    );
  }

  const linkNow = async () => {
    setBusy(true);
    setError('');
    const { error: rpcError } = await supabase.rpc('link_telegram_by_token', { p_token: token });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setDone(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    if (tab === 'signup') {
      // The token travels in signup metadata; handle_new_user() reads it.
      const { error: signUpError } = await signUp(email, password, fullName, {
        data: { link_token: token },
        emailRedirectTo: authRedirectTo(`/link?token=${encodeURIComponent(token)}`),
      });
      setBusy(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setConfirmSent(true);
      return;
    }

    const { error: signInError } = await signIn(email, password);
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    await linkNow();
  };

  return (
    <div className="min-h-dvh">
      <Navbar />

      <main className="mx-auto max-w-sm px-4 pb-16 pt-32 sm:px-6">
        <div className="mb-6 flex flex-col items-center text-center">
          <Emblem size={44} />
          <h1 className="mt-3 font-serif text-2xl font-semibold text-un-900">Link your Telegram account</h1>
          <p className="mt-1.5 text-sm text-un-600">
            One tap and the bot's conference list unlocks for you.
          </p>
        </div>

        {done ? (
          <p className="plaque flex items-center gap-2 rounded-md p-5 text-sm font-medium text-un-800">
            <Check size={17} className="shrink-0 text-un-600" aria-hidden="true" />
            Linked! Go back to Telegram and try "View MUN list" again.
          </p>
        ) : session ? (
          <div className="plaque rounded-md p-6 text-center">
            <p className="text-sm text-un-700">
              You're signed in as <strong>{session.user.email}</strong>.
            </p>
            <button
              type="button"
              onClick={linkNow}
              disabled={busy}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-un-800 text-sm font-semibold text-white transition-colors hover:bg-un-900 disabled:opacity-60"
            >
              {busy && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
              Link this account
            </button>
            {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
          </div>
        ) : confirmSent ? (
          <p className="plaque rounded-md p-5 text-sm text-un-800">
            Check <strong>{email}</strong> for a confirmation link — once confirmed, your Telegram
            account will already be linked.
          </p>
        ) : (
          <div className="plaque rounded-md p-6">
            <div className="mb-4 flex gap-1 border-b border-un-800/10">
              {[
                { id: 'signin', label: 'Sign in' },
                { id: 'signup', label: 'Register' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`px-3.5 pb-3 pt-1 text-sm font-medium ${tab === t.id ? 'border-b-2 border-gold-500 text-un-900' : 'text-un-500'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

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
                {tab === 'signup' ? 'Create account & link' : 'Sign in & link'}
              </button>
            </form>
          </div>
        )}

        <Link to="/" className="mt-4 block text-center text-sm font-medium text-un-600 hover:text-un-900">
          Back to MUNIVERSE
        </Link>
      </main>
    </div>
  );
}
