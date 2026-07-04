import { ArrowUpRight, FileText, Newspaper, ShieldCheck } from 'lucide-react';
import { PREP_MATERIALS } from '../data/prepMaterials';

const UPDATES = [
  {
    date: '04 Jul 2026',
    category: 'Registry',
    title: 'Upcoming conferences remain visible without account registration.',
  },
  {
    date: '04 Jul 2026',
    category: 'Telegram bot',
    title: 'Delegates can open a MUN listing and move directly to registration or reviews.',
  },
  {
    date: '16 Jun 2025',
    category: 'Preparation',
    title: 'Beginner materials, research guidance and video explainers are available in one place.',
  },
];

const RESOURCE_ROWS = PREP_MATERIALS.slice(0, 5).map((material) => ({
  title: material.title,
  type: material.type,
  language: material.language,
  level: material.level,
  url: material.url,
}));

export default function InstitutionalBriefing({ stats }) {
  const metrics = [
    { label: 'Open registrations', value: stats.open },
    { label: 'Dates announced', value: stats.upcoming },
    { label: 'Preparation resources', value: `${stats.guides}+` },
  ];

  return (
    <section className="scroll-mt-28 space-y-8" aria-labelledby="briefing-title">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="plaque rounded-sm p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-un-600">
            <ShieldCheck size={15} aria-hidden="true" />
            Our mission
          </p>
          <h2 id="briefing-title" className="mt-3 text-3xl font-bold leading-tight text-un-900">
            A clear public desk for Uzbekistan's MUN community
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-un-700">
            Mun Helper helps delegates compare conferences, verify registration routes, review organizer information and
            prepare before committee through a single accessible platform.
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="border-l-4 border-un-400 bg-un-50 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-un-700">{metric.label}</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-un-900">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="plaque rounded-sm p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-un-600">
            <Newspaper size={15} aria-hidden="true" />
            Latest updates
          </p>
          <div className="mt-4 grid gap-3">
            {UPDATES.map((update) => (
              <article key={`${update.date}-${update.title}`} className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                  <time className="text-slate-500">{update.date}</time>
                  <span className="text-un-600">{update.category}</span>
                </div>
                <h3 className="mt-1 text-base font-bold leading-snug text-un-900">{update.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="plaque overflow-hidden rounded-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-un-600">
              <FileText size={15} aria-hidden="true" />
              Resources and documents
            </p>
            <h2 className="mt-1 text-xl font-bold text-un-900">Core preparation files</h2>
          </div>
          <a href="#academy" className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-slate-300 px-3 py-2 text-sm font-semibold text-un-800 transition-colors hover:border-un-400 hover:bg-un-50">
            View all materials
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-un-700">
              <tr>
                <th className="px-5 py-3 font-bold">Document</th>
                <th className="px-5 py-3 font-bold">Type</th>
                <th className="px-5 py-3 font-bold">Language</th>
                <th className="px-5 py-3 font-bold">Level</th>
                <th className="px-5 py-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {RESOURCE_ROWS.map((row) => (
                <tr key={row.title}>
                  <td className="px-5 py-4 font-semibold text-un-900">{row.title}</td>
                  <td className="px-5 py-4 text-un-700">{row.type}</td>
                  <td className="px-5 py-4 text-un-700">{row.language}</td>
                  <td className="px-5 py-4 text-un-700">{row.level}</td>
                  <td className="px-5 py-4">
                    <a href={row.url} target="_blank" rel="noreferrer" className="font-semibold text-un-700 underline-offset-4 hover:underline">
                      Open
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 md:hidden">
          {RESOURCE_ROWS.map((row) => (
            <a key={row.title} href={row.url} target="_blank" rel="noreferrer" className="rounded-sm border border-slate-200 p-4 transition-colors hover:border-un-300 hover:bg-un-50">
              <p className="text-sm font-bold text-un-900">{row.title}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-un-600">
                {row.type} / {row.language} / {row.level}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
