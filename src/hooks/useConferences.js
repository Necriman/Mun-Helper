import { useEffect, useState } from 'react';
import { CONFERENCES, colorFor } from '../data/conferences';
import { supabase } from '../lib/supabase';

/**
 * Map a `conferences` row (see supabase/schema.sql) to the shape the
 * components consume. Only APPROVED rows ever reach the UI — pending/
 * rejected submissions live exclusively in the Admin Panel's moderation
 * queue (fetched separately, staff-only, via the `is_staff()` RLS policy).
 */
function rowToConference(row) {
  return {
    id: row.slug,
    name: row.title,
    short: row.short_name ?? row.title.slice(0, 3).toUpperCase(),
    status: row.registration_status, // 'open' | 'upcoming' | 'planned' | ...
    startDate: row.date_start,
    endDate: row.date_end,
    city: row.city,
    registrationUrl: row.registration_link,
    logoUrl: row.logo_url,
    color: colorFor(row.slug),
  };
}

/**
 * Conference feed. Starts on mock data instantly (no loading spinner), then —
 * if Supabase is configured — swaps to live rows and subscribes to Postgres
 * changes, so the registry updates the moment a moderator approves a MUN or
 * flips its registration status.
 */
export function useConferences() {
  const [conferences, setConferences] = useState(CONFERENCES);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!supabase) return undefined; // mock mode

    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from('conferences')
        .select('*')
        .eq('status', 'approved') // moderation gate — never show pending/rejected rows publicly
        .in('registration_status', ['open', 'upcoming', 'planned'])
        .order('date_start', { ascending: true, nullsFirst: false });
      if (!cancelled && !error && data?.length) {
        setConferences(data.map(rowToConference));
        setIsLive(true);
      }
    };

    load();

    // Realtime: any insert/update/delete re-syncs the whole board (23+ rows —
    // a refetch is simpler and safer than patching state per-event).
    const channel = supabase
      .channel('conferences-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conferences' }, load)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { conferences, isLive };
}
