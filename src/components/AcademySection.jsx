import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Crown, Gavel, GraduationCap } from 'lucide-react';
import { ACADEMY_TRACKS } from '../data/conferences';

const TRACK_ICONS = {
  'starter-pack': BookOpen,
  'rules-of-procedure': Gavel,
  'chairs-handbook': Crown,
};

/** Knowledge Hub teaser (pillar 2) — three learning tracks by experience level. */
export default function AcademySection() {
  return (
    <section id="academy" className="scroll-mt-28">
      <div className="mb-5">
        <h2 className="flex items-center gap-2.5 font-serif text-xl font-semibold text-un-900 sm:text-2xl">
          <GraduationCap size={22} className="text-un-600" aria-hidden="true" />
          The Academy
        </h2>
        <p className="mt-1.5 max-w-xl text-sm text-un-600">
          Guides, rules of procedure and playbooks — structured by experience level, from your
          first placard to running the dais.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {ACADEMY_TRACKS.map((track, i) => {
          const Icon = TRACK_ICONS[track.id] ?? BookOpen;
          return (
            <motion.a
              key={track.id}
              href="#academy"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
              className="plaque plaque-hover group flex flex-col gap-3 rounded-md p-5"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-sm bg-un-50 text-un-700">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <ArrowUpRight
                  size={17}
                  className="text-un-400 transition-all group-hover:translate-x-0.5 group-hover:text-un-800"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-un-900">{track.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-un-600">{track.blurb}</p>
              </div>
              <div className="mt-auto flex items-center gap-2 pt-1 text-xs font-medium">
                <span className="rounded-sm border border-gold-400/40 bg-gold-50 px-2 py-0.5 text-gold-700">
                  {track.level}
                </span>
                <span className="text-un-500">{track.guides} guides</span>
              </div>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}
