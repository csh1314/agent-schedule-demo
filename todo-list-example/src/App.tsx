import React from 'react';
import { useTodos } from './hooks/useTodos';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import TodoFilter from './components/TodoFilter';
import TodoCounter from './components/TodoCounter';

const App: React.FC = () => {
  const {
    filteredTodos,
    filter,
    activeCount,
    addTodo,
    toggleTodo,
    deleteTodo,
    setFilter,
  } = useTodos();

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Todo List</h1>
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <TodoInput onAdd={addTodo} />
          <hr className="border-gray-200" />
          <TodoList
            todos={filteredTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
          <hr className="border-gray-200" />
          <div className="flex items-center justify-between">
            <TodoCounter activeCount={activeCount} />
            <TodoFilter current={filter} onFilterChange={setFilter} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
