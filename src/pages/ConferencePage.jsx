import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, CalendarPlus, ExternalLink, Gavel, MapPin, MessageCircle, Send, UserRound, UsersRound } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Stars from '../components/conference/Stars';
import ReviewForm from '../components/conference/ReviewForm';
import ScrollProgress from '../components/motion/ScrollProgress';
import { supabase } from '../lib/supabase';
import { CONFERENCES, STATUS, colorFor } from '../data/conferences';
import { formatDateRange } from '../lib/utils';
import { downloadConferenceIcs } from '../lib/ics';

// A couple of illustrative reviews for mock mode — there's no live `reviews`
// table to read from without Supabase configured.
const MOCK_REVIEWS = [
  {
    id: 'r1',
    rating: 5,
    comment_text: 'Incredible chairs, very well-run committee sessions from start to finish.',
    created_at: '2026-03-01',
    reviewer: 'Aziz K.',
  },
  {
    id: 'r2',
    rating: 4,
    comment_text: 'Great experience overall — loved the crisis committee, catering could improve.',
    created_at: '2026-02-20',
    reviewer: 'Madina Y.',
  },
];

function reviewerName(review) {
  if (review.reviewer) return review.reviewer; // mock shape
  const p = review.user_profiles;
  return p?.full_name || p?.username || (p?.telegram_handle ? `@${p.telegram_handle}` : 'A delegate');
}

export default function ConferencePage() {
  const { slug } = useParams();
  const [conference, setConference] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadReviews = async (conferenceDbId) => {
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, comment_text, created_at, user_profiles(full_name, username, telegram_handle)')
      .eq('conference_id', conferenceDbId)
      .order('created_at', { ascending: false });
    setReviews(data ?? []);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setNotFound(false);

      if (supabase) {
        const { data } = await supabase.from('conferences').select('*').eq('slug', slug).maybeSingle();
        if (cancelled) return;
        if (data) {
          setConference(data);
          await loadReviews(data.id);
        } else {
          setNotFound(true);
        }
      } else {
        const mock = CONFERENCES.find((c) => c.id === slug);
        if (mock) {
          setConference({
            id: mock.id,
            slug: mock.id,
            title: mock.name,
            short_name: mock.short,
            registration_status: mock.status,
            date_start: mock.startDate,
            date_end: mock.endDate,
            city: mock.city,
            registration_link: mock.registrationUrl,
            telegram_url: mock.telegramUrl,
            website_url: mock.websiteUrl,
            description: mock.description,
            venue: mock.venue,
            secretariat: mock.secretariat,
            committees: mock.committees,
            fee: mock.fee,
            capacity: mock.capacity,
            secretary_general_name: null,
            secretary_general_telegram: null,
          });
          setReviews(MOCK_REVIEWS);
        } else {
          setNotFound(true);
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-dvh">
        <Navbar />
        <div className="pt-32 text-center text-sm text-un-500">Loading…</div>
      </div>
    );
  }

  if (notFound || !conference) {
    return (
      <div className="min-h-dvh">
        <Navbar />
        <div className="mx-auto max-w-md pt-40 text-center">
          <p className="font-serif text-xl font-semibold text-un-900">Conference not found</p>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-un-700 underline">
            Back to the registry
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS[conference.registration_status] ?? STATUS.planned;
  const telegramUrl =
    conference.telegram_url ||
    (conference.contact_telegram ? `https://t.me/${conference.contact_telegram.replace(/^@/, '')}` : null);
  const websiteUrl = conference.website_url || conference.registration_link;
  const committees = Array.isArray(conference.committees) ? conference.committees : [];
  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(conference.title)}`;

  return (
    <div className="min-h-dvh">
      <ScrollProgress />
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-un-700 hover:text-un-900">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to the registry
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="plaque mt-5 flex flex-col gap-5 rounded-md p-6 sm:flex-row sm:items-start"
        >
          <span
            className="grid h-16 w-16 shrink-0 place-items-center rounded-sm font-serif text-lg font-bold text-white"
            style={{ backgroundColor: colorFor(conference.slug ?? slug) }}
            aria-hidden="true"
          >
            {conference.short_name || conference.title.slice(0, 3).toUpperCase()}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-2xl font-semibold text-un-900">{conference.title}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${status.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                {status.label}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-un-600">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} aria-hidden="true" />
                {formatDateRange(conference.date_start, conference.date_end)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} aria-hidden="true" />
                {conference.city}
              </span>
              {averageRating && (
                <span className="flex items-center gap-1.5">
                  <Stars value={Number(averageRating)} />
                  {averageRating} ({reviews.length})
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {conference.registration_link && (
                <a
                  href={conference.registration_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-un-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-un-900"
                >
                  Register now
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}
              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-un-800/15 px-4 text-sm font-semibold text-un-700 transition-colors hover:border-un-400"
                >
                  <Send size={14} aria-hidden="true" />
                  Telegram channel
                </a>
              )}
              {websiteUrl && websiteUrl !== conference.registration_link && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-un-800/15 px-4 text-sm font-semibold text-un-700 transition-colors hover:border-un-400"
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  Website
                </a>
              )}
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-un-800/15 px-4 text-sm font-semibold text-un-700 transition-colors hover:border-un-400"
              >
                <Send size={14} aria-hidden="true" />
                Share on Telegram
              </a>
              {conference.date_start && (
                <button
                  type="button"
                  onClick={() =>
                    downloadConferenceIcs({
                      title: conference.title,
                      dateStart: conference.date_start,
                      dateEnd: conference.date_end,
                      city: conference.city,
                      description: conference.description,
                      url: conference.registration_link ?? window.location.href,
                    })
                  }
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-un-800/15 px-4 text-sm font-semibold text-un-700 transition-colors hover:border-un-400"
                >
                  <CalendarPlus size={14} aria-hidden="true" />
                  Add to calendar
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="plaque rounded-md p-5 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-un-500">Brief</p>
            <p className="mt-2 text-sm leading-relaxed text-un-700">
              {conference.description || 'Organizer details will appear here once the MUN team publishes them.'}
            </p>
            {committees.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {committees.map((committee) => (
                  <span key={committee.name ?? committee} className="rounded-sm border border-un-800/10 px-2 py-1 text-xs font-medium text-un-600">
                    {committee.name ?? committee}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="plaque rounded-md p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-un-500">Logistics</p>
            <div className="mt-3 space-y-3 text-sm text-un-700">
              <p className="flex items-start gap-2">
                <Gavel size={15} className="mt-0.5 text-un-600" aria-hidden="true" />
                {conference.secretariat || conference.secretary_general_name || 'Secretariat TBA'}
              </p>
              <p className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 text-un-600" aria-hidden="true" />
                {conference.venue || conference.city || 'Venue TBA'}
              </p>
              <p className="flex items-start gap-2">
                <UsersRound size={15} className="mt-0.5 text-un-600" aria-hidden="true" />
                {conference.capacity || conference.delegate_capacity || 'Capacity TBA'} / {conference.fee || 'Fee TBA'}
              </p>
            </div>
          </div>
        </section>

        {/* Secretary General — only shown once the organizer has set it */}
        {conference.secretary_general_name && (
          <div className="plaque mt-5 flex items-center gap-3 rounded-md p-5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-un-50 text-un-700">
              <UserRound size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-un-500">Secretary-General</p>
              <p className="font-serif text-base font-semibold text-un-900">{conference.secretary_general_name}</p>
            </div>
            {conference.secretary_general_telegram && (
              <a
                href={`https://t.me/${conference.secretary_general_telegram.replace(/^@/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-un-800/15 px-3 py-2 text-sm font-medium text-un-700 transition-colors hover:border-un-400"
              >
                <Send size={14} aria-hidden="true" />@{conference.secretary_general_telegram.replace(/^@/, '')}
              </a>
            )}
          </div>
        )}

        {/* Reviews */}
        <section id="reviews" className="mt-10 scroll-mt-28 space-y-4">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-un-900">
            <MessageCircle size={19} className="text-un-600" aria-hidden="true" />
            Delegate reviews
          </h2>

          <ReviewForm conferenceId={conference.id} onSubmitted={() => loadReviews(conference.id)} />

          {reviews.length === 0 ? (
            <p className="text-sm text-un-500">No reviews yet — be the first delegate to share your experience.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="plaque rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-un-900">{reviewerName(r)}</p>
                    <Stars value={r.rating} size={13} />
                  </div>
                  {r.comment_text && <p className="mt-1.5 text-sm text-un-700">{r.comment_text}</p>}
                  <p className="mt-1.5 text-xs text-un-500">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
