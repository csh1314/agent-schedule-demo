import React from 'react';
import type { Todo } from './types';
import TodoItem from './TodoItem';

export interface TodoListProps {
  /** 要显示的待办事项列表（已经过筛选） */
  todos: Todo[];
  /** 切换完成状态的回调 */
  onToggle: (id: string) => void;
  /** 删除事项的回调 */
  onDelete: (id: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onToggle, onDelete }) => {
  if (todos.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400 text-sm">
        暂无匹配的待办事项
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100" role="list" aria-label="待办事项列表">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TodoList;
