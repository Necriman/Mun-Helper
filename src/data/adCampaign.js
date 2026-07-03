/**
 * Mock `ad_campaigns` row (see supabase/schema.sql). In production this is
 * fetched with:
 *   select * from ad_campaigns
 *   where status = 'active' and platform in ('site', 'both')
 *   order by created_at desc limit 1
 */
export const ACTIVE_CAMPAIGN = {
  id: 'aegis-2026-launch',
  title: 'AEGIS MUN 2026',
  tagline: 'Registration is officially open — secure your delegation\'s seat.',
  imageUrl: null, // swap in a real banner URL; layout works without one
  destinationUrl: '#register',
  platform: 'both',
  countdownSeconds: 5,
};
