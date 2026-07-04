import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FilterBar from '../components/FilterBar';
import ConferenceGrid from '../components/ConferenceGrid';
import PlannedSection from '../components/PlannedSection';
import AcademySection from '../components/AcademySection';
import DelegateTools from '../components/DelegateTools';
import InstitutionalBriefing from '../components/InstitutionalBriefing';
import ReadinessPanel from '../components/ReadinessPanel';
import EmptyState from '../components/EmptyState';
import Footer from '../components/Footer';
import AdPopupModal from '../components/ads/AdPopupModal';
import Reveal from '../components/motion/Reveal';
import ScrollProgress from '../components/motion/ScrollProgress';
import BackToTop from '../components/motion/BackToTop';
import { useConferences } from '../hooks/useConferences';
import { PREP_MATERIALS } from '../data/prepMaterials';
import { ACTIVE_CAMPAIGN } from '../data/adCampaign';
import { supabase } from '../lib/supabase';

/** The public-facing delegate dashboard — Pillars 1 & 2 of the ecosystem. */
export default function Dashboard() {
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
        guides: PREP_MATERIALS.length,
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
      <ScrollProgress />
      <AdPopupModal campaign={ACTIVE_CAMPAIGN} onEvent={logAdEvent} />

      <Navbar />
      <Hero stats={stats} />

      <main className="mx-auto -mt-10 max-w-7xl space-y-16 px-4 pb-12 sm:px-6 lg:px-8">
        {/* ── Pillar 1: the conference registry ── */}
        {/* Reveal = scroll-triggered; the old `ambient-rise` CSS animated on
            page load, so below-the-fold sections finished invisibly. */}
        <section id="registry" className="scroll-mt-28 space-y-6">
          <Reveal>
            <FilterBar
              query={query}
              onQueryChange={setQuery}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              counts={counts}
            />
          </Reveal>

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
        <Reveal>
          <InstitutionalBriefing stats={stats} />
        </Reveal>

        <Reveal>
          <ReadinessPanel />
        </Reveal>

        <Reveal>
          <DelegateTools />
        </Reveal>
        <Reveal>
          <AcademySection />
        </Reveal>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
