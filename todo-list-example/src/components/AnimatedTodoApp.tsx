import React from 'react';
import { motion } from 'framer-motion';
import { useTodos } from '../hooks/useTodos';
import AnimatedTodoInput from './AnimatedTodoInput';
import AnimatedTodoList from './AnimatedTodoList';
import AnimatedFilter from './AnimatedFilter';
import AnimatedCounter from './AnimatedCounter';
import type { FilterType } from './types';

export interface AnimatedTodoAppProps {
  /** Additional className for the outermost container */
  className?: string;
}

const AnimatedTodoApp: React.FC<AnimatedTodoAppProps> = ({
  className = '',
}) => {
  const {
    filteredTodos,
    filter,
    activeCount,
    addTodo,
    toggleTodo,
    deleteTodo,
    setFilter,
  } = useTodos();

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Stagger children for page entrance animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const childVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
      }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring' as const,
            stiffness: 260,
            damping: 20,
          },
        },
      };

  return (
    <div
      className={`min-h-screen flex items-start justify-center pt-16 px-4 relative overflow-hidden ${className}`}
    >
      {/* Animated gradient background — pure CSS, no JS overhead */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-gradient-flow bg-[length:200%_200%]" />

      <motion.div
        className="w-full max-w-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title entrance animation */}
        <motion.h1
          className="text-3xl font-bold text-center text-gray-800 mb-6"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
        >
          Todo List
        </motion.h1>

        {/* Card entrance animation */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 space-y-4"
          variants={childVariants}
        >
          <motion.div variants={childVariants}>
            <AnimatedTodoInput onAdd={addTodo} />
          </motion.div>

          <hr className="border-gray-200" />

          <motion.div variants={childVariants}>
            <AnimatedTodoList
              todos={filteredTodos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          </motion.div>

          <hr className="border-gray-200" />

          <motion.div
            className="flex items-center justify-between"
            variants={childVariants}
          >
            <AnimatedCounter activeCount={activeCount} />
            <AnimatedFilter
              current={filter as FilterType}
              onFilterChange={(f) => setFilter(f)}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnimatedTodoApp;
