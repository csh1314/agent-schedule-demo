import React from 'react';

export interface TodoCounterProps {
  /** 未完成的待办事项数量 */
  activeCount: number;
}

const TodoCounter: React.FC<TodoCounterProps> = ({ activeCount }) => {
  return (
    <div className="text-sm text-gray-500" aria-live="polite">
      <span className="font-semibold text-gray-700">{activeCount}</span> 项待完成
    </div>
  );
};

export default TodoCounter;
