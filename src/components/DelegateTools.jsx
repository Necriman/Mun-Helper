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
          <h2 className="mt-2 text-2xl font-bold text-un-900">Services around the public registry</h2>
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
            whileHover={{ y: -4 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: index * 0.04, duration: 0.24, ease: 'easeOut' }}
            className="plaque plaque-hover group relative flex min-h-56 flex-col overflow-hidden rounded-sm p-5"
          >
            <span className="absolute inset-x-0 top-0 h-1 bg-un-400" aria-hidden="true" />
            <span className="grid h-11 w-11 place-items-center rounded-sm bg-un-50 text-un-700">
              <Icon size={20} aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-un-900">{title}</h3>
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
