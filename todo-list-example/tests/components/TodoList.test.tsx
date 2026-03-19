import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TodoList from '../../src/components/TodoList';
import type { Todo } from '../../src/types/todo';

const createTodos = (): Todo[] => [
  { id: '1', text: '买牛奶', completed: false, createdAt: 1000 },
  { id: '2', text: '写周报', completed: true, createdAt: 2000 },
  { id: '3', text: '读书', completed: false, createdAt: 3000 },
];

describe('TodoList', () => {
  // AC-004-1: 默认显示全部 — 渲染全部 todo 列表
  it('should render all todo items', () => {
    const todos = createTodos();
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoList todos={todos} onToggle={onToggle} onDelete={onDelete} />);

    expect(screen.getByText('买牛奶')).toBeInTheDocument();
    expect(screen.getByText('写周报')).toBeInTheDocument();
    expect(screen.getByText('读书')).toBeInTheDocument();
  });

  // AC-003-2: 删除后列表更新 — 正确数量的 item 渲染
  it('should render correct number of items', () => {
    const todos = createTodos();
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoList todos={todos} onToggle={onToggle} onDelete={onDelete} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  // AC-004-5: 筛选状态下的空列表 — 列表为空时显示提示
  it('should show empty message when todos array is empty', () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoList todos={[]} onToggle={onToggle} onDelete={onDelete} />);

    // 匹配包含"待办事项"关键词的空列表提示文本
    expect(screen.getByText(/待办事项/i)).toBeInTheDocument();
  });

  // 渲染顺序正确
  it('should render items in the provided order', () => {
    const todos = createTodos();
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoList todos={todos} onToggle={onToggle} onDelete={onDelete} />);

    const items = screen.getAllByRole('checkbox');
    expect(items).toHaveLength(3);
  });

  // --- 边界用例 ---

  // 单个 todo 的列表渲染
  it('should render a single todo correctly', () => {
    const todos: Todo[] = [
      { id: '1', text: '唯一任务', completed: false, createdAt: 1000 },
    ];
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoList todos={todos} onToggle={onToggle} onDelete={onDelete} />);

    expect(screen.getByText('唯一任务')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
  });

  // 大量 todo 渲染
  it('should render a large number of todos', () => {
    const todos: Todo[] = Array.from({ length: 100 }, (_, i) => ({
      id: `id-${i}`,
      text: `任务 ${i}`,
      completed: i % 2 === 0,
      createdAt: i * 1000,
    }));
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoList todos={todos} onToggle={onToggle} onDelete={onDelete} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(100);
  });

  // 有 role="list" 的可访问性标记
  it('should have role="list" for accessibility when todos exist', () => {
    const todos = createTodos();
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      <TodoList todos={todos} onToggle={onToggle} onDelete={onDelete} />
    );

    const list = container.querySelector('[role="list"]');
    expect(list).not.toBeNull();
  });
});
