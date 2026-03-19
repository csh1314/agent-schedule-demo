import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TodoItem from '../../src/components/TodoItem';
import type { Todo } from '../../src/types/todo';

const createTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'test-id-1',
  text: '买牛奶',
  completed: false,
  createdAt: Date.now(),
  ...overrides,
});

describe('TodoItem', () => {
  // AC-002-1: 标记为完成 — 点击复选框触发 onToggle
  it('should call onToggle with todo id when checkbox is clicked', async () => {
    const todo = createTodo();
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);

    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith('test-id-1');
  });

  // AC-002-1: 已完成事项应有视觉区分（删除线样式 class）
  it('should apply completed style class to completed todo text', () => {
    const todo = createTodo({ completed: true });
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);

    const text = screen.getByText('买牛奶');
    // 已完成的 todo 文本应包含 line-through 删除线样式（Tailwind CSS class）
    expect(text.className).toMatch(/line-through/);
  });

  // AC-002-1: 未完成事项不应有删除线 class
  it('should not apply line-through style class to uncompleted todo text', () => {
    const todo = createTodo({ completed: false });
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);

    const text = screen.getByText('买牛奶');
    expect(text.className).not.toMatch(/line-through/);
  });

  // AC-002-2: 已完成的复选框应为 checked
  it('should render checkbox as checked when todo is completed', () => {
    const todo = createTodo({ completed: true });
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  // AC-002-2: 未完成的复选框应为 unchecked
  it('should render checkbox as unchecked when todo is not completed', () => {
    const todo = createTodo({ completed: false });
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  // AC-003-1: 删除单条事项 — 点击删除按钮触发 onDelete
  it('should call onDelete with todo id when delete button is clicked', async () => {
    const todo = createTodo();
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /删除/i });
    await userEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('test-id-1');
  });

  // 显示待办事项文本
  it('should display the todo text', () => {
    const todo = createTodo({ text: '写周报' });
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);

    expect(screen.getByText('写周报')).toBeInTheDocument();
  });

  // NFR-002: 可访问性 — 复选框有 aria-label
  it('should have accessible label on checkbox', () => {
    const todo = createTodo({ text: '买牛奶' });
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label');
    expect(checkbox.getAttribute('aria-label')).toContain('买牛奶');
  });

  // NFR-002: 可访问性 — 删除按钮有 aria-label
  it('should have accessible label on delete button', () => {
    const todo = createTodo({ text: '买牛奶' });
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /删除/i });
    expect(deleteButton).toHaveAttribute('aria-label');
    expect(deleteButton.getAttribute('aria-label')).toContain('买牛奶');
  });

  // --- 边界用例 ---

  // 特殊字符文本正确渲染
  it('should render todo with special characters correctly', () => {
    const todo = createTodo({ text: '<script>alert("xss")</script>' });
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);

    expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
  });

  // 超长文本正确渲染
  it('should render todo with very long text', () => {
    const longText = '这是一段很长的文本'.repeat(100);
    const todo = createTodo({ text: longText });
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);

    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  // 点击删除不会触发 toggle
  it('should not call onToggle when delete button is clicked', async () => {
    const todo = createTodo();
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /删除/i });
    await userEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
  });

  // 中文和 Unicode 字符
  it('should render todo with Unicode characters correctly', () => {
    const todo = createTodo({ text: '日本語テスト 한국어 emoji' });
    const onToggle = vi.fn();
    const onDelete = vi.fn();

    render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);

    expect(screen.getByText('日本語テスト 한국어 emoji')).toBeInTheDocument();
  });
});
