import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, GraduationCap, Medal, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';

/** Mock standings so the section is meaningful before Supabase is configured
 *  (and before anyone has earned XP on a fresh live database). */
const MOCK_LEADERS = [
  { id: 'm1', display_name: 'Aziz Karimov', level: 'advanced', xp: 640 },
  { id: 'm2', display_name: 'Madina Yusupova', level: 'chair', xp: 580 },
  { id: 'm3', display_name: 'Javlon Rashidov', level: 'advanced', xp: 470 },
  { id: 'm4', display_name: 'Nilufar Xolova', level: 'intermediate', xp: 350 },
  { id: 'm5', display_name: 'Sardor Tashkentov', level: 'intermediate', xp: 290 },
  { id: 'm6', display_name: 'Dilshod Umarov', level: 'rookie', xp: 180 },
  { id: 'm7', display_name: 'Kamila Islamova', level: 'rookie', xp: 120 },
];

const RANK_STYLE = [
  { icon: Crown, badge: 'bg-gold-50 text-gold-600 border-gold-400/50' },
  { icon: Medal, badge: 'bg-slate-100 text-slate-500 border-slate-300' },
  { icon: Medal, badge: 'bg-[#f5ebe4] text-[#8C4A2F] border-[#8C4A2F]/30' },
];

const LEVEL_BADGE = {
  organizer: 'border-gold-400/50 bg-gold-50 text-gold-700',
  chair: 'border-gold-400/50 bg-gold-50 text-gold-700',
  advanced: 'border-un-500/30 bg-un-50 text-un-700',
  intermediate: 'border-un-500/20 bg-un-50/60 text-un-600',
  rookie: 'border-slate-300 bg-slate-50 text-slate-600',
};

/**
 * Top delegates by XP. XP comes from writing reviews (+20, via a DB trigger)
 * and the delegate level test (+10 per correct answer, once a day) — see
 * supabase/leaderboard_and_test.sql. Reads the public `leaderboard` view;
 * mock standings in mock mode or while the live table is still empty.
 */
export default function Leaderboard() {
  const [leaders, setLeaders] = useState(MOCK_LEADERS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from('leaderboard')
      .select('id, display_name, level, xp')
      .limit(10)
      .then(({ data, error }) => {
        if (!cancelled && !error && data?.length) {
          setLeaders(data);
          setIsLive(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="leaderboard" className="scroll-mt-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2.5 text-xl font-bold text-un-900 sm:text-2xl">
            <Trophy size={21} className="text-gold-600" aria-hidden="true" />
            Top delegates
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-un-600">
            Earn XP by reviewing conferences you attended and passing the delegate level test.
            {!isLive && ' Showing sample standings until the season kicks off.'}
          </p>
        </div>
        <Link
          to="/test"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-un-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-un-900"
        >
          <GraduationCap size={16} aria-hidden="true" />
          Take the level test
        </Link>
      </div>

      <div className="plaque overflow-hidden rounded-md">
        <ol>
          {leaders.map((leader, i) => {
            const rank = RANK_STYLE[i];
            const RankIcon = rank?.icon;
            return (
              <motion.li
                key={leader.id}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.35, ease: 'easeOut' }}
                className="flex items-center gap-3.5 border-b border-un-800/5 px-4 py-3 last:border-0 sm:px-5"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-bold tabular-nums ${
                    rank ? rank.badge : 'border-transparent bg-un-50/60 text-un-500'
                  }`}
                >
                  {RankIcon ? <RankIcon size={16} aria-hidden="true" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-un-900">{leader.display_name}</p>
                </div>
                <span
                  className={`hidden rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide sm:inline ${
                    LEVEL_BADGE[leader.level] ?? LEVEL_BADGE.rookie
                  }`}
                >
                  {leader.level}
                </span>
                <span className="w-20 text-right text-sm font-bold tabular-nums text-un-800">
                  {Number(leader.xp).toLocaleString()} XP
                </span>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
