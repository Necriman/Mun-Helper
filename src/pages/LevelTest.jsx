import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Award, Check, GraduationCap, Loader2, RotateCcw, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollProgress from '../components/motion/ScrollProgress';
import { LEVEL_TEST, LEVEL_RESULT } from '../data/levelTest';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';

/**
 * Delegate level test — /test. One question at a time with smooth
 * transitions; instant right/wrong feedback + explanation; final screen
 * grades into Rookie / Intermediate / Advanced. Signed-in users get the
 * result saved to their profile + XP via the submit_level_test RPC
 * (see supabase/leaderboard_and_test.sql — XP only once per day).
 */
export default function LevelTest() {
  const { session } = useAuth();
  const [phase, setPhase] = useState('intro'); // intro | quiz | result
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null); // option index picked for current question
  const [correctCount, setCorrectCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null); // { level, xp_awarded, total_xp }
  const [saveError, setSaveError] = useState('');

  const question = LEVEL_TEST[index];
  const total = LEVEL_TEST.length;

  const start = () => {
    setPhase('quiz');
    setIndex(0);
    setPicked(null);
    setCorrectCount(0);
    setSaved(null);
    setSaveError('');
  };

  const pick = (optionIndex) => {
    if (picked !== null) return; // one answer per question
    setPicked(optionIndex);
    if (optionIndex === question.correct) setCorrectCount((n) => n + 1);
  };

  const next = async () => {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setPicked(null);
      return;
    }
    setPhase('result');

    // Persist for signed-in users; final score must include the last answer,
    // which correctCount already does (pick() ran before next() is enabled).
    if (session && supabase) {
      setSaving(true);
      const { data, error } = await supabase.rpc('submit_level_test', {
        p_correct: correctCount,
        p_total: total,
      });
      setSaving(false);
      if (error) setSaveError(error.message);
      else setSaved(data?.[0] ?? null);
    }
  };

  const ratio = correctCount / total;
  const levelKey = ratio >= 0.8 ? 'advanced' : ratio >= 0.5 ? 'intermediate' : 'rookie';
  const result = LEVEL_RESULT[levelKey];

  return (
    <div className="min-h-dvh">
      <ScrollProgress />
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-28 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-un-700 hover:text-un-900">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to the registry
        </Link>

        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="plaque mt-6 rounded-md p-8 text-center"
            >
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-un-50 text-un-700">
                <GraduationCap size={26} aria-hidden="true" />
              </span>
              <h1 className="mt-4 text-2xl font-bold text-un-900">Delegate level test</h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-un-600">
                {total} questions on rules of procedure, committee flow and document work.
                Score 80%+ for Advanced, 50%+ for Intermediate.
                {session
                  ? ' Your result is saved to your profile and earns XP for the leaderboard.'
                  : ' Sign in before starting to save the result to your profile and earn XP.'}
              </p>
              <button
                type="button"
                onClick={start}
                className="mt-6 inline-flex h-12 cursor-pointer items-center gap-2 rounded-md bg-un-800 px-8 text-sm font-semibold text-white transition-colors hover:bg-un-900"
              >
                Start the test
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </motion.div>
          )}

          {phase === 'quiz' && (
            <motion.div
              key={`q-${index}`}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mt-6"
            >
              {/* Progress */}
              <div className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-un-500">
                <span>
                  Question {index + 1} / {total}
                </span>
                <span className="tabular-nums">{correctCount} correct</span>
              </div>
              <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-un-50">
                <motion.div
                  animate={{ width: `${((index + (picked !== null ? 1 : 0)) / total) * 100}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-un-500 to-gold-500"
                />
              </div>

              <div className="plaque rounded-md p-6">
                <h2 className="text-lg font-bold leading-snug text-un-900">{question.q}</h2>

                <div className="mt-5 space-y-2.5">
                  {question.options.map((option, optionIndex) => {
                    const isPicked = picked === optionIndex;
                    const isCorrect = optionIndex === question.correct;
                    const showState = picked !== null;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => pick(optionIndex)}
                        disabled={picked !== null}
                        className={`flex w-full items-start gap-3 rounded-md border p-3.5 text-left text-sm transition-colors ${
                          showState && isCorrect
                            ? 'border-un-500 bg-un-50 text-un-900'
                            : showState && isPicked
                              ? 'border-rose-400 bg-rose-50 text-rose-800'
                              : showState
                                ? 'border-un-800/10 text-un-500'
                                : 'cursor-pointer border-un-800/15 text-un-800 hover:border-un-400 hover:bg-un-50/50'
                        }`}
                      >
                        <span
                          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${
                            showState && isCorrect
                              ? 'border-un-500 bg-un-500 text-white'
                              : showState && isPicked
                                ? 'border-rose-400 bg-rose-400 text-white'
                                : 'border-un-800/25 text-un-600'
                          }`}
                        >
                          {showState && isCorrect ? <Check size={12} /> : showState && isPicked ? <X size={12} /> : String.fromCharCode(65 + optionIndex)}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {picked !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 rounded-md bg-un-50/70 p-3.5 text-sm leading-relaxed text-un-700">
                        {question.why}
                      </p>
                      <button
                        type="button"
                        onClick={next}
                        className="mt-4 inline-flex h-11 cursor-pointer items-center gap-2 rounded-md bg-un-800 px-6 text-sm font-semibold text-white transition-colors hover:bg-un-900"
                      >
                        {index + 1 < total ? 'Next question' : 'See my result'}
                        <ArrowRight size={15} aria-hidden="true" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="plaque mt-6 rounded-md p-8 text-center"
            >
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold-50 text-gold-600">
                <Award size={30} aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-un-500">
                {correctCount} / {total} correct
              </p>
              <h1 className="mt-1 text-2xl font-bold text-un-900">{result.title}</h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-un-600">{result.text}</p>

              {saving && (
                <p className="mt-4 flex items-center justify-center gap-2 text-sm text-un-500">
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  Saving to your profile…
                </p>
              )}
              {saved && (
                <p className="mt-4 rounded-md border border-un-500/30 bg-un-50 p-3 text-sm font-medium text-un-800">
                  Saved! {saved.xp_awarded > 0 ? `+${saved.xp_awarded} XP earned — total ${saved.total_xp} XP.` : 'XP already earned today — come back tomorrow for more.'}
                </p>
              )}
              {saveError && <p className="mt-4 text-sm text-rose-600">{saveError}</p>}
              {!session && (
                <p className="mt-4 text-sm text-un-500">Sign in and retake the test to save your level and earn XP.</p>
              )}

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={start}
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-un-800/15 px-5 text-sm font-semibold text-un-700 transition-colors hover:border-un-400"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Retake
                </button>
                <Link
                  to="/#leaderboard"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-un-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-un-900"
                >
                  View the leaderboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
