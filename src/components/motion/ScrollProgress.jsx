import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin gold reading-progress bar pinned above everything (including the
 * fixed navbar). Spring-smoothed so it glides rather than jumps.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-black"
      aria-hidden="true"
    />
  );
}
