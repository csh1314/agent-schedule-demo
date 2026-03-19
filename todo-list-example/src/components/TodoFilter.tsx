import React from 'react';
import type { FilterType } from './types';

export interface TodoFilterProps {
  /** 当前选中的筛选类型 */
  current: FilterType;
  /** 筛选类型变更时的回调 */
  onFilterChange: (filter: FilterType) => void;
}

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '未完成' },
  { value: 'completed', label: '已完成' },
];

const TodoFilter: React.FC<TodoFilterProps> = ({ current, onFilterChange }) => {
  return (
    <div className="flex gap-1" role="group" aria-label="筛选待办事项">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            current === option.value
              ? 'bg-blue-500 text-white'
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

export default TodoFilter;
