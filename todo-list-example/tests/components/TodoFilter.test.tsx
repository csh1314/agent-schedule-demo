import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TodoFilter from '../../src/components/TodoFilter';
import type { FilterStatus } from '../../src/types/todo';

describe('TodoFilter', () => {
  // AC-004-1: 默认显示全部 — 渲染三个筛选按钮
  it('should render three filter buttons', () => {
    const onFilterChange = vi.fn();
    render(<TodoFilter current="all" onFilterChange={onFilterChange} />);

    expect(screen.getByRole('button', { name: /全部/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /未完成/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /已完成/i })).toBeInTheDocument();
  });

  // AC-004-2: 筛选未完成 — 点击"未完成"按钮
  it('should call onFilterChange with "active" when active button is clicked', async () => {
    const onFilterChange = vi.fn();
    render(<TodoFilter current="all" onFilterChange={onFilterChange} />);

    await userEvent.click(screen.getByRole('button', { name: /未完成/i }));

    expect(onFilterChange).toHaveBeenCalledWith('active');
  });

  // AC-004-3: 筛选已完成 — 点击"已完成"按钮
  it('should call onFilterChange with "completed" when completed button is clicked', async () => {
    const onFilterChange = vi.fn();
    render(<TodoFilter current="all" onFilterChange={onFilterChange} />);

    await userEvent.click(screen.getByRole('button', { name: /已完成/i }));

    expect(onFilterChange).toHaveBeenCalledWith('completed');
  });

  // AC-004-4: 切换回全部 — 点击"全部"按钮
  it('should call onFilterChange with "all" when all button is clicked', async () => {
    const onFilterChange = vi.fn();
    render(<TodoFilter current="active" onFilterChange={onFilterChange} />);

    await userEvent.click(screen.getByRole('button', { name: /全部/i }));

    expect(onFilterChange).toHaveBeenCalledWith('all');
  });

  // 当前激活的筛选按钮有视觉高亮 — 使用 aria-pressed
  it('should mark the current filter button as aria-pressed', () => {
    const onFilterChange = vi.fn();
    render(<TodoFilter current="active" onFilterChange={onFilterChange} />);

    expect(screen.getByRole('button', { name: /全部/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /未完成/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /已完成/i })).toHaveAttribute('aria-pressed', 'false');
  });

  // aria-pressed 在 "completed" 筛选时正确
  it('should set aria-pressed correctly for completed filter', () => {
    const onFilterChange = vi.fn();
    render(<TodoFilter current="completed" onFilterChange={onFilterChange} />);

    expect(screen.getByRole('button', { name: /全部/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /未完成/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /已完成/i })).toHaveAttribute('aria-pressed', 'true');
  });
});
