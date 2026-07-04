import { Send } from 'lucide-react';
import Emblem from './Emblem';
import { useLanguage } from '../lib/i18n';

/** Formal footer: brand, tagline, community link, and a thin Uzbekistan-flag accent rule. */
export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      {/* Thin tricolor rule referencing the Uzbekistan flag */}
      <div className="h-1 w-full bg-un-500" aria-hidden="true">
        <div className="h-full w-full bg-gradient-to-r from-un-500 via-white/40 to-green-600/70" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Emblem size={32} />
          <div>
            <p className="text-sm font-bold text-un-900">{t('brandName')}</p>
            <p className="text-xs text-un-500">{t('brandTagline')}</p>
          </div>
        </div>

        <a
          href="https://t.me"
          target="_blank"
          rel="noreferrer"
          className="plaque plaque-hover inline-flex min-h-11 items-center gap-2 rounded-sm px-4 py-2 text-sm font-semibold text-un-700"
        >
          <Send size={15} className="text-un-600" aria-hidden="true" />
          {t('telegramCommunity')}
        </a>

        <p className="text-xs text-un-500">© 2026 MUNIVERSE. {t('footerText')}</p>
      </div>
    </footer>
  );
}
