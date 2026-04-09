import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CelebrationEffectProps {
  /** Whether to trigger the celebration effect */
  trigger: boolean;
  /** Additional className for the container */
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
}

const PARTICLE_COLORS = [
  'bg-yellow-400',
  'bg-pink-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-purple-400',
  'bg-orange-400',
];

const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 80,
    y: (Math.random() - 0.5) * 80 - 20,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    size: Math.random() * 6 + 4,
    rotation: Math.random() * 360,
  }));
};

const CelebrationEffect: React.FC<CelebrationEffectProps> = ({
  trigger,
  className = '',
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showParticles, setShowParticles] = useState(false);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (trigger && !prefersReducedMotion) {
      const newParticles = generateParticles(8);
      setParticles(newParticles);
      setShowParticles(true);

      const timer = setTimeout(() => {
        setShowParticles(false);
        setParticles([]);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [trigger, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-visible ${className}`}>
      <AnimatePresence>
        {showParticles &&
          particles.map((particle) => (
            <motion.div
              key={particle.id}
              className={`absolute left-1/2 top-1/2 rounded-full ${particle.color}`}
              style={{
                width: particle.size,
                height: particle.size,
              }}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: [0, 1.2, 0.8],
                opacity: [1, 1, 0],
                rotate: particle.rotation,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
              }}
            />
          ))}
      </AnimatePresence>
    </div>
  );
};

export default CelebrationEffect;
