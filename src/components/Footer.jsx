import { Send } from 'lucide-react';
import Emblem from './Emblem';

/** Formal footer: brand, tagline, community link, and a thin Uzbekistan-flag accent rule. */
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-un-800/10">
      {/* Thin tricolor rule referencing the Uzbekistan flag */}
      <div className="h-1 w-full bg-un-500" aria-hidden="true">
        <div className="h-full w-full bg-gradient-to-r from-un-500 via-white/40 to-green-600/70" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Emblem size={32} />
          <div>
            <p className="font-serif text-sm font-semibold text-un-900">Mun Helper</p>
            <p className="text-xs text-un-500">The registry for Uzbekistan&apos;s MUN community.</p>
          </div>
        </div>

        <a
          href="https://t.me"
          target="_blank"
          rel="noreferrer"
          className="plaque plaque-hover inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-un-700"
        >
          <Send size={15} className="text-un-600" aria-hidden="true" />
          Join the Telegram community
        </a>

        <p className="text-xs text-un-500">© 2026 Mun Helper. Built by delegates, for delegates.</p>
      </div>
    </footer>
  );
}
