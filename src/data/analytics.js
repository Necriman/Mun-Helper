/**
 * Mock aggregates for the Admin Panel's analytics widgets. In production
 * these come from `analytics_logs` (see supabase/schema.sql) and the
 * `ad_campaign_ctr` view, e.g.:
 *
 *   select count(*) from analytics_logs
 *   where event_type = 'site_visit' and occurred_at > now() - interval '1 day';
 *
 *   select ctr_percent from ad_campaign_ctr where id = :campaignId;
 */
import { BellRing, Eye, MessageSquareText, MousePointerClick, Send, Users } from 'lucide-react';

export const ANALYTICS_WIDGETS = [
  { id: 'dau', label: 'Daily Active Users', value: '1,420', delta: '+8.2%', icon: Users, trend: 'up' },
  { id: 'reviews', label: 'Reviews Written Today', value: '48', delta: '+12', icon: MessageSquareText, trend: 'up' },
  { id: 'ctr', label: 'Ad Banner CTR', value: '5.4%', delta: '+0.6pp', icon: MousePointerClick, trend: 'up' },
  { id: 'bot-starts', label: 'Bot Starts Today', value: '312', delta: '+5.1%', icon: Send, trend: 'up' },
  { id: 'impressions', label: 'Ad Impressions Today', value: '8,904', delta: '-2.1%', icon: Eye, trend: 'down' },
  { id: 'pending', label: 'Pending Approvals', value: '3', delta: 'needs review', icon: BellRing, trend: 'flat' },
];
