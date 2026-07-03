import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Menu, Sparkles, ShieldCheck, X } from 'lucide-react';
import Emblem from './Emblem';
import { useAuth } from '../lib/auth-context';

const LINKS = [
  { href: '#registry', label: 'Registry' },
  { href: '#academy', label: 'Academy' },
  { href: '#planned', label: 'Planned' },
];

/**
 * Fixed top bar: white, formal, thin gold rule at the foot — a letterhead,
 * not a glass panel. Auth state comes from `useAuth()` (real Supabase Auth —
 * see src/lib/auth-context.jsx). The Admin link only renders for
 * `profile.role in ('moderator','admin')`; real enforcement still happens
 * server-side via the `is_staff()` RLS helper, this is just UX.
 */
export default function Navbar({ onOpenAdmin, onOpenMentor, onOpenAuth }) {
  const [open, setOpen] = useState(false);
  const { session, profile, isStaff, signOut } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold-400/50 bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <a href="#top" className="flex items-center gap-3" aria-label="Mun Helper home">
          <Emblem size={38} />
          <span className="leading-tight">
            <span className="block font-serif text-lg font-semibold tracking-tight text-un-900">
              Mun Helper
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-un-600">
              Uzbekistan · Est. 2026
            </span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3.5 py-2 text-sm font-medium uppercase tracking-wide text-un-700 transition-colors hover:bg-un-50 hover:text-un-900"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Auth actions */}
        <div className="hidden items-center gap-2 md:flex">
          {isStaff && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide text-un-500 transition-colors hover:bg-un-50 hover:text-un-800"
            >
              <ShieldCheck size={14} aria-hidden="true" />
              Admin
            </button>
          )}

          {session && (
            <button
              type="button"
              onClick={onOpenMentor}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-un-700 transition-colors hover:bg-un-50 hover:text-un-900"
            >
              <Sparkles size={14} className="text-gold-500" aria-hidden="true" />
              AI Mentor
            </button>
          )}

          {session ? (
            <div className="flex items-center gap-2 pl-1">
              <span className="text-sm font-medium text-un-800">
                {profile?.full_name || profile?.username || session.user.email}
              </span>
              <button
                type="button"
                onClick={signOut}
                aria-label="Sign out"
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-md text-un-500 transition-colors hover:bg-un-50 hover:text-un-800"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-un-700 transition-colors hover:bg-un-50 hover:text-un-900"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="cursor-pointer rounded-md bg-un-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-un-900"
              >
                Register delegation
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-md text-un-800 transition-colors hover:bg-un-50 md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden border-t border-un-800/10 md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-wide text-un-700 transition-colors hover:bg-un-50 hover:text-un-900"
                >
                  {link.label}
                </a>
              ))}
              {isStaff && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium uppercase tracking-wide text-un-700 hover:bg-un-50"
                >
                  Admin
                </button>
              )}
              {session ? (
                <>
                  <button
                    type="button"
                    onClick={onOpenMentor}
                    className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-un-700 hover:bg-un-50"
                  >
                    AI Mentor
                  </button>
                  <button
                    type="button"
                    onClick={signOut}
                    className="mt-2 w-full cursor-pointer rounded-md border border-un-800/15 px-4 py-2.5 text-sm font-semibold text-un-700"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuth('signup')}
                  className="mt-2 w-full cursor-pointer rounded-md bg-un-800 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Register delegation
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
