import { motion } from 'framer-motion';

/**
 * Scroll-triggered reveal: fades + rises the moment the block enters the
 * viewport (once). Replaces the old `ambient-rise` CSS class, which animated
 * on page load — invisible for anything below the fold. Respects
 * prefers-reduced-motion via the app-level <MotionConfig reducedMotion="user">.
 */
export default function Reveal({ children, delay = 0, y = 26, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
