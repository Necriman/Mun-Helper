import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, ShieldCheck, X } from 'lucide-react';
import Emblem from './Emblem';

const LINKS = [
  { href: '#registry', label: 'Registry' },
  { href: '#academy', label: 'Academy' },
  { href: '#planned', label: 'Planned' },
];

/**
 * Fixed top bar: white, formal, thin gold rule at the foot — a letterhead,
 * not a glass panel. `onOpenAdmin` is a demo-only entry point into the
 * Unified Admin & Analytics Panel — in production this link would only
 * render for `role in ('moderator','admin')` and the route itself would be
 * gated server-side via the `is_staff()` RLS helper.
 */
export default function Navbar({ onOpenAdmin }) {
  const [open, setOpen] = useState(false);

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
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide text-un-500 transition-colors hover:bg-un-50 hover:text-un-800"
            title="Staff only — demo entry point"
          >
            <ShieldCheck size={14} aria-hidden="true" />
            Admin
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-un-700 transition-colors hover:bg-un-50 hover:text-un-900"
          >
            Sign in
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md bg-un-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-un-900"
          >
            Register delegation
          </button>
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
              <button
                type="button"
                className="mt-2 w-full cursor-pointer rounded-md bg-un-800 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Register delegation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
