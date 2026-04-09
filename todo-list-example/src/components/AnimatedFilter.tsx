import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { FilterType } from './types';

export interface AnimatedFilterProps {
  /** Currently selected filter type */
  current: FilterType;
  /** Callback when filter type changes */
  onFilterChange: (filter: FilterType) => void;
  /** Additional className for the container */
  className?: string;
}

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '未完成' },
  { value: 'completed', label: '已完成' },
];

const AnimatedFilter: React.FC<AnimatedFilterProps> = ({
  current,
  onFilterChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<FilterType, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateIndicator = useCallback(() => {
    const button = buttonRefs.current.get(current);
    const container = containerRef.current;
    if (button && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [current]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  const setButtonRef = useCallback(
    (value: FilterType) => (el: HTMLButtonElement | null) => {
      if (el) {
        buttonRefs.current.set(value, el);
      }
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className={`relative flex gap-1 ${className}`}
      role="group"
      aria-label="筛选待办事项"
    >
      {!prefersReducedMotion && (
        <motion.div
          className="absolute bottom-0 h-0.5 bg-blue-500 rounded-full"
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />
      )}
      {filterOptions.map((option) => (
        <button
          key={option.value}
          ref={setButtonRef(option.value)}
          className={`px-3 py-1 text-xs rounded-md transition-colors relative ${
            current === option.value
              ? 'text-blue-600 font-medium'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          onClick={() => onFilterChange(option.value)}
          aria-pressed={current === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default AnimatedFilter;
