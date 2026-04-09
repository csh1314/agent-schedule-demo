import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Todo } from './types';
import CelebrationEffect from './CelebrationEffect';

export interface AnimatedTodoItemProps {
  /** The todo item data */
  todo: Todo;
  /** Callback to toggle completion status */
  onToggle: (id: string) => void;
  /** Callback to delete the todo */
  onDelete: (id: string) => void;
  /** Additional className for the container */
  className?: string;
}

const AnimatedTodoItem: React.FC<AnimatedTodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  className = '',
}) => {
  const [celebrationKey, setCelebrationKey] = useState(0);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleToggle = useCallback(() => {
    if (!todo.completed) {
      setCelebrationKey((k) => k + 1);
    }
    onToggle(todo.id);
  }, [todo.completed, todo.id, onToggle]);

  // Animated checkbox with SVG stroke animation
  const AnimatedCheckbox = (
    <div className="relative flex-shrink-0">
      <button
        role="checkbox"
        aria-checked={todo.completed}
        onClick={handleToggle}
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
        style={{
          borderColor: todo.completed ? '#3b82f6' : '#d1d5db',
          backgroundColor: todo.completed ? '#3b82f6' : 'transparent',
        }}
        aria-label={`标记 "${todo.text}" 为${todo.completed ? '未完成' : '已完成'}`}
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 12 12"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M2 6L5 9L10 3"
            initial={false}
            animate={{
              pathLength: todo.completed ? 1 : 0,
              opacity: todo.completed ? 1 : 0,
            }}
            transition={{
              pathLength: {
                duration: prefersReducedMotion ? 0 : 0.3,
                ease: 'easeInOut',
              },
              opacity: { duration: 0.1 },
            }}
          />
        </svg>
      </button>
      <CelebrationEffect trigger={celebrationKey > 0} key={celebrationKey} />
    </div>
  );

  return (
    <motion.div
      layout={!prefersReducedMotion}
      className={`flex items-center gap-3 py-2 px-1 group ${className}`}
      initial={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, height: 0, y: -20 }
      }
      animate={
        prefersReducedMotion
          ? { opacity: 1 }
          : { opacity: 1, height: 'auto', y: 0 }
      }
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, x: 60, height: 0 }
      }
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 24,
        opacity: { duration: 0.2 },
      }}
    >
      {AnimatedCheckbox}

      <motion.span
        className="flex-1 text-sm relative"
        animate={{
          color: todo.completed ? '#9ca3af' : '#374151',
        }}
        transition={{ duration: 0.3 }}
      >
        {todo.text}
        {/* Animated strikethrough line */}
        <motion.span
          className="absolute left-0 top-1/2 h-px bg-gray-400 pointer-events-none"
          initial={false}
          animate={{
            width: todo.completed ? '100%' : '0%',
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.3,
            ease: 'easeInOut',
          }}
        />
      </motion.span>

      <motion.button
        className="text-gray-300 hover:text-red-500 text-lg leading-none transition-colors opacity-0 group-hover:opacity-100"
        onClick={() => onDelete(todo.id)}
        aria-label={`删除 "${todo.text}"`}
        whileHover={prefersReducedMotion ? {} : { scale: 1.2 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
      >
        &times;
      </motion.button>
    </motion.div>
  );
};

export default AnimatedTodoItem;
