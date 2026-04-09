import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface AnimatedTodoInputProps {
  /** Callback when submitting a new todo, receives trimmed text */
  onAdd: (text: string) => void;
  /** Additional className for the container */
  className?: string;
}

const AnimatedTodoInput: React.FC<AnimatedTodoInputProps> = ({
  onAdd,
  className = '',
}) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        {/* Glow effect layer */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 blur-sm"
            animate={{
              opacity: isFocused ? [0.4, 0.6, 0.4] : 0,
            }}
            transition={
              isFocused
                ? {
                    opacity: {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }
                : { opacity: { duration: 0.3 } }
            }
          />
        )}
        <input
          className={`relative w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-all duration-300 bg-white ${
            isFocused
              ? 'border-blue-400 ring-2 ring-blue-200'
              : 'border-gray-300'
          }`}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="添加新的待办事项..."
          aria-label="新待办事项"
        />
      </div>
      <motion.button
        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors"
        onClick={handleSubmit}
        aria-label="添加"
        whileHover={
          prefersReducedMotion
            ? {}
            : { scale: 1.05, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }
        }
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        添加
      </motion.button>
    </div>
  );
};

export default AnimatedTodoInput;
