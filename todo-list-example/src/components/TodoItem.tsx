import React from 'react';
import type { Todo } from './types';

export interface TodoItemProps {
  /** 待办事项数据 */
  todo: Todo;
  /** 切换完成状态的回调 */
  onToggle: (id: string) => void;
  /** 删除事项的回调 */
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <div className="flex items-center gap-3 py-2 px-1 group">
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`标记 "${todo.text}" 为${todo.completed ? '未完成' : '已完成'}`}
      />
      <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
        {todo.text}
      </span>
      <button
        className="text-gray-300 hover:text-red-500 text-lg leading-none transition-colors opacity-0 group-hover:opacity-100"
        onClick={() => onDelete(todo.id)}
        aria-label={`删除 "${todo.text}"`}
      >
        &times;
      </button>
    </div>
  );
};

export default TodoItem;
