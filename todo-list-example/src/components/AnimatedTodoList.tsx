import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Todo } from './types';
import AnimatedTodoItem from './AnimatedTodoItem';

export interface AnimatedTodoListProps {
  /** The filtered list of todos to display */
  todos: Todo[];
  /** Callback to toggle completion status */
  onToggle: (id: string) => void;
  /** Callback to delete a todo */
  onDelete: (id: string) => void;
  /** Additional className for the container */
  className?: string;
}

const AnimatedTodoList: React.FC<AnimatedTodoListProps> = ({
  todos,
  onToggle,
  onDelete,
  className = '',
}) => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (todos.length === 0) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="empty"
          className={`py-8 text-center text-gray-400 text-sm ${className}`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: prefersReducedMotion ? 1 : [0.5, 1, 0.5],
          }}
          exit={{ opacity: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0.2 }
              : {
                  opacity: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }
          }
        >
          暂无匹配的待办事项
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div
      className={`divide-y divide-gray-100 ${className}`}
      role="list"
      aria-label="待办事项列表"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {todos.map((todo) => (
          <AnimatedTodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedTodoList;
