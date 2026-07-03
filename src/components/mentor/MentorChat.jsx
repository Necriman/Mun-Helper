import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import Navbar from '../Navbar';
import Emblem from '../Emblem';

/**
 * AI Delegate Mentor — "Personal preparation assistant for registered users."
 * Reached via /mentor; since that's a directly-navigable URL now (not just a
 * button gated by session state), this component itself checks `session`
 * rather than relying on the Navbar link being hidden for logged-out users.
 * Calls POST /api/mentor (Vercel function in prod, vite.config.js middleware
 * in dev) which forwards to Gemini server-side — the API key never reaches
 * the browser.
 */
export default function MentorChat() {
  const { session, profile } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: `Hello${profile?.full_name ? `, ${profile.full_name}` : ''}! I'm your AI Delegate Mentor. Ask me about position papers, rules of procedure, bloc strategy, or public speaking.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Mentor is unavailable right now.');
      setMessages((m) => [...m, { role: 'model', content: data.reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-dvh">
        <Navbar />
        <div className="mx-auto max-w-md pt-40 text-center">
          <Sparkles size={28} className="mx-auto text-gold-500" aria-hidden="true" />
          <p className="mt-3 font-serif text-xl font-semibold text-un-900">Sign in required</p>
          <p className="mt-2 text-sm text-un-600">
            The AI Delegate Mentor is a personal assistant for registered users.
          </p>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-un-700 underline">
            Back to the registry
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-un-700 transition-colors hover:bg-un-50 hover:text-un-900"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to site
        </Link>
        <span className="flex items-center gap-2 font-serif text-lg font-semibold text-un-900">
          <Sparkles size={18} className="text-gold-500" aria-hidden="true" />
          AI Delegate Mentor
        </span>
        <span className="w-20" aria-hidden="true" />
      </div>

      <div className="plaque flex-1 space-y-4 overflow-y-auto rounded-md p-5">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {m.role === 'model' && <Emblem size={26} className="mt-0.5 shrink-0" />}
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-md px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user' ? 'bg-un-800 text-white' : 'border border-un-800/10 bg-un-50/60 text-un-900'
              }`}
            >
              {m.content}
            </div>
          </motion.div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-un-500">
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            Thinking…
          </div>
        )}
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>

      <form onSubmit={send} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your position paper, RoP, bloc strategy…"
          className="h-12 flex-1 rounded-md border border-un-800/15 bg-white px-4 text-sm text-un-900 placeholder:text-un-500/70 focus:border-un-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-md bg-un-800 text-white transition-colors hover:bg-un-900 disabled:opacity-50"
          aria-label="Send"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}
