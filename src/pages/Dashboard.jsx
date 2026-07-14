import { useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import GreenWorld from '../components/GreenWorld';
import AdPopupModal from '../components/ads/AdPopupModal';
import ScrollProgress from '../components/motion/ScrollProgress';
import BackToTop from '../components/motion/BackToTop';
import { useConferences } from '../hooks/useConferences';
import { PREP_MATERIALS } from '../data/prepMaterials';
import { ACTIVE_CAMPAIGN } from '../data/adCampaign';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { conferences } = useConferences();

  useEffect(() => {
    supabase?.from('analytics_logs').insert({ event_type: 'site_visit' }).then(() => {});
  }, []);

  const stats = useMemo(() => {
    const dated = conferences.filter((conference) => conference.status !== 'planned');
    const planned = conferences.filter((conference) => conference.status === 'planned');

    return {
      open: dated.filter((conference) => conference.status === 'open').length,
      upcoming: dated.filter((conference) => conference.status === 'upcoming').length,
      planned: planned.length,
      guides: PREP_MATERIALS.length,
    };
  }, [conferences]);

  const logAdEvent = (eventType) => {
    if (supabase) {
      supabase.from('analytics_logs').insert({ event_type: eventType, ad_campaign_id: null }).then(() => {});
    } else {
      // eslint-disable-next-line no-console
      console.info(`[analytics_logs] ${eventType}`, { ad_campaign_id: ACTIVE_CAMPAIGN.id });
    }
  };

  return (
    <div className="min-h-dvh overflow-hidden bg-white text-black">
      <ScrollProgress />
      <AdPopupModal campaign={ACTIVE_CAMPAIGN} onEvent={logAdEvent} />
      <Navbar />
      <Hero stats={stats} />
      <GreenWorld conferences={conferences} stats={stats} />
      <BackToTop />
    </div>
  );
}
