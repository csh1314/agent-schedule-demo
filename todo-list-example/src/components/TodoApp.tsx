import React, { useState } from 'react';
import type { Todo, FilterType } from './types';
import TodoInput from './TodoInput';
import TodoList from './TodoList';
import TodoFilter from './TodoFilter';
import TodoCounter from './TodoCounter';

// Mock 数据，供原型展示使用，后续由 frontend-expert 替换为真实逻辑
const mockTodos: Todo[] = [
  { id: '1', text: '买牛奶', completed: false, createdAt: Date.now() - 3000 },
  { id: '2', text: '写周报', completed: true, createdAt: Date.now() - 2000 },
  { id: '3', text: '读书', completed: false, createdAt: Date.now() - 1000 },
];

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(mockTodos);
  const [filter, setFilter] = useState<FilterType>('all');

  // 占位事件处理函数，后续由 frontend-expert 填入真实逻辑（含 localStorage 持久化）
  const handleAdd = (text: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  const handleToggle = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((todo) => !todo.completed).length;

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Todo List</h1>
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <TodoInput onAdd={handleAdd} />
          <hr className="border-gray-200" />
          <TodoList
            todos={filteredTodos}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
          <hr className="border-gray-200" />
          <div className="flex items-center justify-between">
            <TodoCounter activeCount={activeCount} />
            <TodoFilter current={filter} onFilterChange={handleFilterChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoApp;
