import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AnimatedCounterProps {
  /** Number of active (incomplete) todo items */
  activeCount: number;
  /** Additional className for the container */
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  activeCount,
  className = '',
}) => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const prevCountRef = useRef(activeCount);
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    if (activeCount !== prevCountRef.current) {
      setDirection(activeCount < prevCountRef.current ? 'up' : 'down');
      prevCountRef.current = activeCount;
    }
  }, [activeCount]);

  if (prefersReducedMotion) {
    return (
      <div className={`text-sm text-gray-500 ${className}`} aria-live="polite">
        <span className="font-semibold text-gray-700">{activeCount}</span> 项待完成
      </div>
    );
  }

  const yEnter = direction === 'up' ? 16 : -16;
  const yExit = direction === 'up' ? -16 : 16;

  return (
    <div className={`text-sm text-gray-500 ${className}`} aria-live="polite">
      <span className="relative inline-flex overflow-hidden h-5 w-6 align-middle justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={activeCount}
            className="font-semibold text-gray-700"
            initial={{ y: yEnter, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: yExit, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              duration: 0.3,
            }}
          >
            {activeCount}
          </motion.span>
        </AnimatePresence>
      </span>{' '}
      项待完成
    </div>
  );
};

export default AnimatedCounter;
