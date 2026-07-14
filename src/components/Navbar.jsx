import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LogOut, Plus, ShieldCheck, Sparkles, X } from 'lucide-react';
import Emblem from './Emblem';
import { useAuth } from '../lib/auth-context';
import { useLanguage } from '../lib/i18n';

const EASE = [0.16, 1, 0.3, 1];

// Plain anchors (not react-router Links) — these jump to sections on the
// homepage, and a full navigation reliably scrolls to a URL hash on load
// from any other page, which client-side routing doesn't do out of the box.
const LINKS = [
  { href: '/#registry', labelKey: 'navConferences' },
  { href: '/#academy', labelKey: 'navPreparation' },
  { href: '/#tools', labelKey: 'navTools' },
];

/**
 * Minimal monochrome navbar. The bar itself is pointer-events-none (clicks
 * fall through to the page); each side re-enables pointer events — same
 * pattern as the reference layout. Auth state comes from `useAuth()`;
 * the Admin link renders for staff only (RLS still enforces server-side).
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { session, profile, isStaff, signOut, openAuth } = useAuth();
  const { language, languages, setLanguage, t } = useLanguage();

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between p-4 md:px-8 md:py-6"
    >
      {/* Left: brand + menu pill + section links */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${t('brandName')} home`}>
          <Emblem size={34} />
          <span className="hidden text-[15px] font-semibold tracking-tight text-black md:inline">
            {t('brandName')}
          </span>
        </Link>

        {/* Mobile: black "Menu" pill toggling the dropdown */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex cursor-pointer items-center gap-2 rounded-full bg-black py-1 pl-1 pr-3.5 md:hidden"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-black">
            {open ? <X size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}
          </span>
          <span className="text-[11px] font-medium text-white">Menu</span>
        </button>

        {/* Desktop: section links inside a light pill */}
        <nav className="hidden items-center gap-1 rounded-full bg-[#F4F4F6] px-2 py-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-[12px] font-medium text-black/60 transition-colors hover:bg-white hover:text-black"
            >
              {t(link.labelKey)}
            </a>
          ))}
        </nav>
      </div>

      {/* Right: language, staff/mentor, auth */}
      <div className="pointer-events-auto flex items-center gap-2">
        <div className="flex items-center rounded-full bg-[#F4F4F6] p-1" aria-label="Language selector">
          {languages.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setLanguage(item)}
              aria-pressed={language === item}
              className={`h-7 cursor-pointer rounded-full px-2.5 text-[11px] font-semibold transition-colors ${
                language === item ? 'bg-black text-white' : 'text-black/50 hover:text-black'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {isStaff && (
          <Link
            to="/admin"
            className="hidden items-center gap-1.5 rounded-full border border-black/12 bg-white px-3.5 py-2 text-[11px] font-medium text-black/70 transition-colors hover:border-black/30 md:inline-flex"
          >
            <ShieldCheck size={13} aria-hidden="true" />
            Admin
          </Link>
        )}

        {session && (
          <Link
            to="/mentor"
            className="hidden items-center gap-1.5 rounded-full border border-black/12 bg-white px-3.5 py-2 text-[11px] font-medium text-black/70 transition-colors hover:border-black/30 md:inline-flex"
          >
            <Sparkles size={13} aria-hidden="true" />
            AI Mentor
          </Link>
        )}

        {session ? (
          <div className="hidden items-center gap-1.5 md:flex">
            <span className="max-w-40 truncate text-[13px] font-medium text-black/70">
              {profile?.full_name || profile?.username || session.user.email}
            </span>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-black/50 transition-colors hover:bg-black/5 hover:text-black"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => openAuth('signin')}
              className="hidden cursor-pointer rounded-full px-3.5 py-2 text-[13px] font-medium text-black/60 transition-colors hover:text-black md:inline"
            >
              {t('signIn')}
            </button>
            <button
              type="button"
              onClick={() => openAuth('signup')}
              className="cursor-pointer rounded-full bg-black px-4 py-2.5 text-[12px] font-medium text-white transition-opacity hover:opacity-80"
            >
              {t('registerDelegation')}
            </button>
          </>
        )}
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="pointer-events-auto absolute inset-x-4 top-16 rounded-2xl border border-black/10 bg-white p-3 shadow-[0_24px_70px_rgba(0,0,0,0.12)] md:hidden"
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3.5 py-3 text-sm font-medium text-black/70 transition-colors hover:bg-[#F4F4F6] hover:text-black"
              >
                {t(link.labelKey)}
              </a>
            ))}
            {isStaff && (
              <Link to="/admin" className="block rounded-xl px-3.5 py-3 text-sm font-medium text-black/70 hover:bg-[#F4F4F6]">
                Admin
              </Link>
            )}
            {session ? (
              <>
                <Link to="/mentor" className="block rounded-xl px-3.5 py-3 text-sm font-medium text-black/70 hover:bg-[#F4F4F6]">
                  AI Mentor
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="mt-1 w-full cursor-pointer rounded-full border border-black/15 px-4 py-3 text-sm font-medium text-black/70"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openAuth('signup');
                }}
                className="mt-1 w-full cursor-pointer rounded-full bg-black px-4 py-3 text-sm font-medium text-white"
              >
                {t('registerDelegation')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
