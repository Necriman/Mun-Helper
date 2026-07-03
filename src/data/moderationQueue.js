/**
 * Mock `conferences` rows where status = 'pending_review' — these are the
 * bot-submitted proposals awaiting a moderator's Approve/Reject decision.
 * See the seed data at the bottom of supabase/schema.sql for the matching
 * real rows (RVSU MUN, INHA MUN, WIUT MUN).
 */
export const PENDING_APPLICATIONS = [
  {
    id: 'rvsu-mun',
    title: 'RVSU MUN',
    submittedBy: '@aziz_delegate',
    submittedVia: 'Telegram bot',
    submittedAt: '2 hours ago',
    proposedDate: 'Late September 2026',
    committees: 3,
  },
  {
    id: 'inha-mun',
    title: 'INHA MUN',
    submittedBy: '@madina_chair',
    submittedVia: 'Telegram bot',
    submittedAt: '6 hours ago',
    proposedDate: 'October 2026 (TBC)',
    committees: 5,
  },
  {
    id: 'wiut-mun',
    title: 'WIUT MUN',
    submittedBy: '@javlon_org',
    submittedVia: 'Telegram bot',
    submittedAt: '1 day ago',
    proposedDate: 'Date not yet set',
    committees: 4,
  },
];
