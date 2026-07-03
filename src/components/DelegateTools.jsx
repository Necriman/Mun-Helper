import { BellRing, Bot, ClipboardCheck, MessageCircle, Send, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const TOOLS = [
  {
    icon: Bot,
    title: 'Telegram bot mirror',
    body: 'Open the same registry in Telegram, tap a MUN, then jump to registration or reviews.',
    action: 'Open bot',
    href: 'https://t.me',
  },
  {
    icon: BellRing,
    title: 'Deadline watch',
    body: 'Save upcoming conferences and track which registrations are already open.',
    action: 'View open MUNs',
    href: '#registry',
  },
  {
    icon: MessageCircle,
    title: 'Review board',
    body: 'Read delegate feedback before applying, then leave your own review after the event.',
    action: 'Browse reviews',
    href: '#registry',
  },
  {
    icon: ClipboardCheck,
    title: 'Organizer intake',
    body: 'Submit a new MUN from the bot or website and let moderators approve it for the public list.',
    action: 'Submit via bot',
    href: 'https://t.me',
  },
];

export default function DelegateTools() {
  return (
    <section id="tools" className="scroll-mt-28">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-un-600">
            <ShieldCheck size={15} aria-hidden="true" />
            Delegate operations desk
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-un-900">Everything around the MUN list</h2>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-un-600">
          Built for quick decisions: check dates, inspect organizers, compare channels, read reviews and move to
          registration without hunting across chats.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TOOLS.map(({ icon: Icon, title, body, action, href }, index) => (
          <motion.a
            key={title}
            href={href}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -7, scale: 1.01 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 24 }}
            className="plaque plaque-hover group relative flex min-h-56 flex-col overflow-hidden rounded-xl p-5"
          >
            <span className="absolute right-4 top-4 h-16 w-16 rounded-full bg-un-100/40 blur-2xl transition-opacity group-hover:opacity-100" aria-hidden="true" />
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-un-50 text-un-700 shadow-inner">
              <Icon size={20} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-serif text-lg font-semibold text-un-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-un-600">{body}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-un-700">
              {action}
              <Send size={14} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
