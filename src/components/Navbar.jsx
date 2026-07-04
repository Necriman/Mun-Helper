import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe2, LogOut, Menu, Search, ShieldCheck, X } from 'lucide-react';
import Emblem from './Emblem';
import { useAuth } from '../lib/auth-context';
import { useLanguage } from '../lib/i18n';

// Plain anchors (not react-router Links) — these jump to sections on the
// homepage, and a full navigation reliably scrolls to a URL hash on load
// from any other page, which client-side routing doesn't do out of the box.
const LINKS = [
  { href: '/#registry', labelKey: 'navConferences' },
  { href: '/#academy', labelKey: 'navPreparation' },
  { href: '/#tools', labelKey: 'navTools' },
  { href: '/#planned', labelKey: 'navPlanned' },
];

/**
 * Fixed top bar: white, formal, thin gold rule at the foot — a letterhead,
 * not a glass panel. Auth state comes from `useAuth()` (real Supabase Auth —
 * see src/lib/auth-context.jsx). The Admin link only renders for
 * `profile.role in ('moderator','admin')`; real enforcement still happens
 * server-side via the `is_staff()` RLS helper, this is just UX.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { session, profile, isStaff, signOut, openAuth } = useAuth();
  const { language, languages, setLanguage, t } = useLanguage();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="h-1 bg-un-400" aria-hidden="true" />
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3" aria-label="MUNIVERSE home">
          <Emblem size={46} />
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-[0.08em] text-un-900">
              {t('brandName')}
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-un-600">
              {t('brandTagline')}
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="min-h-11 rounded-sm border-b-2 border-transparent px-3.5 py-3 text-sm font-semibold text-un-800 transition-colors hover:border-un-400 hover:bg-un-50 hover:text-un-900"
            >
              {t(link.labelKey)}
            </a>
          ))}
        </div>

        {/* Auth actions */}
        <div className="hidden items-center gap-2 md:flex">
          {isStaff && (
            <Link
              to="/admin"
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold uppercase tracking-wide text-un-700 transition-colors hover:bg-un-50 hover:text-un-900"
            >
              <ShieldCheck size={14} aria-hidden="true" />
              Admin
            </Link>
          )}

          {session && (
            <Link
              to="/mentor"
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-semibold text-un-700 transition-colors hover:bg-un-50 hover:text-un-900"
            >
              <Search size={14} className="text-un-500" aria-hidden="true" />
              AI Mentor
            </Link>
          )}

          <a
            href="/#registry"
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border border-slate-200 px-3 py-2 text-sm font-semibold text-un-800 transition-colors hover:border-un-300 hover:bg-un-50"
          >
            <Search size={15} aria-hidden="true" />
            Search
          </a>

          <div className="flex min-h-11 items-center gap-1 border-l border-slate-200 pl-3" aria-label="Language selector">
            <Globe2 size={15} className="text-un-600" aria-hidden="true" />
            {languages.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLanguage(item)}
                aria-pressed={language === item}
                className={`h-8 cursor-pointer rounded-sm px-2 text-xs font-bold transition-colors ${
                  language === item ? 'bg-un-900 text-white' : 'text-un-700 hover:bg-un-50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {session ? (
            <div className="flex items-center gap-2 pl-1">
              <span className="text-sm font-medium text-un-800">
                {profile?.full_name || profile?.username || session.user.email}
              </span>
              <button
                type="button"
                onClick={signOut}
                aria-label="Sign out"
                className="grid h-11 w-11 cursor-pointer place-items-center rounded-sm text-un-500 transition-colors hover:bg-un-50 hover:text-un-800"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuth('signin')}
                className="min-h-11 cursor-pointer rounded-sm px-4 py-2 text-sm font-semibold text-un-700 transition-colors hover:bg-un-50 hover:text-un-900"
              >
                {t('signIn')}
              </button>
              <button
                type="button"
                onClick={() => openAuth('signup')}
                className="min-h-11 cursor-pointer rounded-sm bg-un-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-un-800"
              >
                {t('registerDelegation')}
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
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-sm text-un-800 transition-colors hover:bg-un-50 md:hidden"
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
            className="overflow-hidden border-t border-slate-200 bg-white md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              <div className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-3" aria-label="Language selector">
                <Globe2 size={15} className="text-un-600" aria-hidden="true" />
                {languages.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLanguage(item)}
                    aria-pressed={language === item}
                    className={`h-9 cursor-pointer rounded-sm px-3 text-xs font-bold transition-colors ${
                      language === item ? 'bg-un-900 text-white' : 'text-un-700 hover:bg-un-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-sm px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-un-700 transition-colors hover:bg-un-50 hover:text-un-900"
                >
                  {t(link.labelKey)}
                </a>
              ))}
              {isStaff && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-sm px-3 py-2.5 text-left text-sm font-semibold uppercase tracking-wide text-un-700 hover:bg-un-50"
                >
                  Admin
                </Link>
              )}
              {session ? (
                <>
                  <Link
                    to="/mentor"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-sm px-3 py-2.5 text-left text-sm font-semibold text-un-700 hover:bg-un-50"
                  >
                    AI Mentor
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    className="mt-2 w-full cursor-pointer rounded-sm border border-un-800/15 px-4 py-2.5 text-sm font-semibold text-un-700"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuth('signup')}
                  className="mt-2 w-full cursor-pointer rounded-sm bg-un-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  {t('registerDelegation')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
