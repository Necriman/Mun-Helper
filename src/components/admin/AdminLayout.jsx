import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Megaphone, ShieldCheck, Users } from 'lucide-react';
import Emblem from '../Emblem';
import AdminAnalytics from './AdminAnalytics';
import AdminModeration from './AdminModeration';
import AdminUsers from './AdminUsers';
import AdminAdCampaignForm from './AdminAdCampaignForm';

const TABS = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'moderation', label: 'Moderation', icon: ShieldCheck },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'ads', label: 'Ad Campaigns', icon: Megaphone },
];

/**
 * The Unified Admin & Analytics Panel shell: its own top bar (distinct from
 * the public site's Navbar, but same design tokens for brand continuity)
 * plus a secondary tab bar switching between the four sub-views.
 *
 * In production this route would be gated server-side (RLS via `is_staff()`)
 * and client-side (redirect non-staff before this component ever mounts).
 */
export default function AdminLayout({ onBackToSite }) {
  const [tab, setTab] = useState('analytics');

  return (
    <div className="min-h-dvh bg-un-50/40">
      <header className="border-b border-un-800/10 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Emblem size={30} />
            <div className="leading-tight">
              <p className="font-serif text-sm font-semibold text-un-900">Mun Helper — Admin</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-un-500">
                Unified Admin &amp; Analytics Panel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBackToSite}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-un-700 transition-colors hover:bg-un-50 hover:text-un-900"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to site
          </button>
        </div>

        {/* Secondary tab bar */}
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8" role="tablist">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className="relative flex cursor-pointer items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium text-un-600 transition-colors hover:text-un-900"
              >
                <Icon size={15} aria-hidden="true" />
                <span className={active ? 'text-un-900' : ''}>{label}</span>
                {active && (
                  <motion.span
                    layoutId="admin-active-tab"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-x-3 -bottom-px h-0.5 bg-gold-500"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {tab === 'analytics' && <AdminAnalytics />}
        {tab === 'moderation' && <AdminModeration />}
        {tab === 'users' && <AdminUsers />}
        {tab === 'ads' && <AdminAdCampaignForm />}
      </main>
    </div>
  );
}
