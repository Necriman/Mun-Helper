import { useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import ConferenceGrid from './components/ConferenceGrid';
import PlannedSection from './components/PlannedSection';
import AcademySection from './components/AcademySection';
import EmptyState from './components/EmptyState';
import Footer from './components/Footer';
import AdPopupModal from './components/ads/AdPopupModal';
import AdminLayout from './components/admin/AdminLayout';
import MentorChat from './components/mentor/MentorChat';
import AuthModal from './components/auth/AuthModal';
import { AuthProvider } from './lib/auth-context';
import { supabase } from './lib/supabase';
import { useConferences } from './hooks/useConferences';
import { ACADEMY_TRACKS } from './data/conferences';
import { ACTIVE_CAMPAIGN } from './data/adCampaign';

/** The public-facing delegate dashboard — Pillars 1 & 2 of the ecosystem. */
function Dashboard({ onOpenAdmin, onOpenMentor, onOpenAuth }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data instantly; live Supabase rows + realtime once .env is configured.
  const { conferences } = useConferences();

  // One `site_visit` beacon per mount — feeds the Admin Panel's analytics.
  useEffect(() => {
    supabase?.from('analytics_logs').insert({ event_type: 'site_visit' }).then(() => {});
  }, []);

  const normalized = query.trim().toLowerCase();
  const matchesQuery = (c) =>
    !normalized ||
    c.name.toLowerCase().includes(normalized) ||
    (c.short ?? '').toLowerCase().includes(normalized);

  // Split once; both grids and the hero stats derive from these.
  const { datedVisible, plannedVisible, counts, stats } = useMemo(() => {
    const dated = conferences.filter((c) => c.status !== 'planned');
    const planned = conferences.filter((c) => c.status === 'planned');

    return {
      datedVisible: dated.filter(
        (c) => matchesQuery(c) && (statusFilter === 'all' || statusFilter === c.status),
      ),
      plannedVisible: planned.filter(
        (c) => matchesQuery(c) && (statusFilter === 'all' || statusFilter === 'planned'),
      ),
      counts: {
        all: conferences.length,
        open: dated.filter((c) => c.status === 'open').length,
        upcoming: dated.filter((c) => c.status === 'upcoming').length,
        planned: planned.length,
      },
      stats: {
        open: dated.filter((c) => c.status === 'open').length,
        upcoming: dated.filter((c) => c.status === 'upcoming').length,
        planned: planned.length,
        guides: ACADEMY_TRACKS.reduce((sum, t) => sum + t.guides, 0),
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conferences, normalized, statusFilter]);

  const nothingVisible = datedVisible.length === 0 && plannedVisible.length === 0;

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
  };

  // Format A analytics beacon — real insert into analytics_logs when
  // Supabase is configured, console-logged otherwise (mock mode).
  const logAdEvent = (eventType) => {
    if (supabase) {
      supabase.from('analytics_logs').insert({ event_type: eventType, ad_campaign_id: null }).then(() => {});
    } else {
      // eslint-disable-next-line no-console
      console.info(`[analytics_logs] ${eventType}`, { ad_campaign_id: ACTIVE_CAMPAIGN.id });
    }
  };

  return (
    <div className="min-h-dvh">
      <AdPopupModal campaign={ACTIVE_CAMPAIGN} onEvent={logAdEvent} />

      <Navbar onOpenAdmin={onOpenAdmin} onOpenMentor={onOpenMentor} onOpenAuth={onOpenAuth} />
      <Hero stats={stats} />

      <main className="mx-auto max-w-7xl space-y-16 px-4 pb-10 sm:px-6 lg:px-8">
        {/* ── Pillar 1: the conference registry ── */}
        <section id="registry" className="scroll-mt-28 space-y-6">
          <FilterBar
            query={query}
            onQueryChange={setQuery}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            counts={counts}
          />

          {nothingVisible ? (
            <EmptyState query={query} onReset={resetFilters} />
          ) : (
            <div className="space-y-14">
              {datedVisible.length > 0 && <ConferenceGrid conferences={datedVisible} />}
              <PlannedSection conferences={plannedVisible} />
            </div>
          )}
        </section>

        {/* ── Pillar 2: the knowledge hub ── */}
        <AcademySection />
      </main>

      <Footer />
    </div>
  );
}

function Shell() {
  // No router in this showcase — a simple view switch stands in for what
  // would be real routes (e.g. /admin, /mentor) in production.
  const [view, setView] = useState('dashboard');
  const [authModal, setAuthModal] = useState(null); // null | 'signin' | 'signup'

  return (
    <>
      {view === 'admin' && <AdminLayout onBackToSite={() => setView('dashboard')} />}
      {view === 'mentor' && <MentorChat onBack={() => setView('dashboard')} />}
      {view === 'dashboard' && (
        <Dashboard
          onOpenAdmin={() => setView('admin')}
          onOpenMentor={() => setView('mentor')}
          onOpenAuth={setAuthModal}
        />
      )}

      <AuthModal open={!!authModal} mode={authModal ?? 'signin'} onClose={() => setAuthModal(null)} />
    </>
  );
}

export default function App() {
  return (
    // reducedMotion="user" — every Framer animation respects prefers-reduced-motion.
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </MotionConfig>
  );
}
