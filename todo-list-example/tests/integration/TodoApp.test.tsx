import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('TodoApp Integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // AC-001-1 + AC-005-2: 添加待办事项后列表和计数同步更新
  it('should add a todo and update the counter', async () => {
    render(<App />);

    const input = screen.getByRole('textbox');
    const addButton = screen.getByRole('button', { name: /添加/i });

    await userEvent.type(input, '买牛奶');
    await userEvent.click(addButton);

    expect(screen.getByText('买牛奶')).toBeInTheDocument();
    expect(screen.getByText(/1/)).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  // AC-001-1 + AC-001-2: 按 Enter 和点击按钮都能添加
  it('should add todos via both Enter and button click', async () => {
    render(<App />);

    const input = screen.getByRole('textbox');

    await userEvent.type(input, '买牛奶{Enter}');
    await userEvent.type(input, '写周报');
    await userEvent.click(screen.getByRole('button', { name: /添加/i }));

    expect(screen.getByText('买牛奶')).toBeInTheDocument();
    expect(screen.getByText('写周报')).toBeInTheDocument();
  });

  // AC-002-1 + AC-005-3: 标记完成后计数减少
  it('should toggle todo and update counter', async () => {
    render(<App />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '买牛奶{Enter}');
    await userEvent.type(input, '写周报{Enter}');

    // Toggle first todo
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);

    // activeCount should decrease by 1
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });

  // AC-003-1 + AC-005-4: 删除后列表和计数更新
  it('should delete a todo and update the counter', async () => {
    render(<App />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '买牛奶{Enter}');
    await userEvent.type(input, '写周报{Enter}');

    // Delete first todo
    const deleteButtons = screen.getAllByRole('button', { name: /删除/i });
    await userEvent.click(deleteButtons[0]);

    expect(screen.queryByText('买牛奶')).not.toBeInTheDocument();
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });

  // AC-004-2 + AC-004-3 + AC-004-4: 筛选完整流程
  it('should filter todos by status', async () => {
    render(<App />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '买牛奶{Enter}');
    await userEvent.type(input, '写周报{Enter}');
    await userEvent.type(input, '读书{Enter}');

    // Toggle "写周报" to completed
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);

    // Filter: active only
    await userEvent.click(screen.getByRole('button', { name: /未完成/i }));
    expect(screen.getByText('买牛奶')).toBeInTheDocument();
    expect(screen.queryByText('写周报')).not.toBeInTheDocument();
    expect(screen.getByText('读书')).toBeInTheDocument();

    // Filter: completed only
    await userEvent.click(screen.getByRole('button', { name: /已完成/i }));
    expect(screen.queryByText('买牛奶')).not.toBeInTheDocument();
    expect(screen.getByText('写周报')).toBeInTheDocument();
    expect(screen.queryByText('读书')).not.toBeInTheDocument();

    // Filter: all
    await userEvent.click(screen.getByRole('button', { name: /全部/i }));
    expect(screen.getByText('买牛奶')).toBeInTheDocument();
    expect(screen.getByText('写周报')).toBeInTheDocument();
    expect(screen.getByText('读书')).toBeInTheDocument();
  });

  // AC-001-3: 空内容不添加
  it('should not add empty todos', async () => {
    render(<App />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '   {Enter}');

    expect(screen.getByText(/0/)).toBeInTheDocument();
    expect(screen.getByText(/项待完成/)).toBeInTheDocument();
  });

  // AC-006-1: localStorage 持久化 — 添加后 localStorage 被写入
  it('should persist todos to localStorage', async () => {
    render(<App />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '买牛奶{Enter}');

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'todos',
      expect.stringContaining('买牛奶')
    );
  });

  // AC-005-5: 删除已完成事项不影响 activeCount
  it('should not change active count when deleting a completed todo', async () => {
    render(<App />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '买牛奶{Enter}');
    await userEvent.type(input, '写周报{Enter}');

    // Complete first todo
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]);

    // Delete the completed todo
    const deleteButtons = screen.getAllByRole('button', { name: /删除/i });
    await userEvent.click(deleteButtons[0]);

    // activeCount should still be 1
    expect(screen.getByText(/1/)).toBeInTheDocument();
    expect(screen.getByText(/项待完成/)).toBeInTheDocument();
  });

  // AC-004-5: 筛选状态下的空列表提示
  it('should show empty message when no todos match filter', async () => {
    render(<App />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '买牛奶{Enter}');

    // Filter to completed — no items completed yet
    await userEvent.click(screen.getByRole('button', { name: /已完成/i }));

    expect(screen.getByText(/待办事项/)).toBeInTheDocument();
  });

  // --- 边界用例：完整用户操作流程 ---

  // 添加多个 → 标记部分完成 → 筛选 → 删除 → 验证计数
  it('should handle a full user workflow: add, complete, filter, delete, verify count', async () => {
    render(<App />);

    const input = screen.getByRole('textbox');

    // Step 1: 添加 5 个待办事项
    await userEvent.type(input, '任务一{Enter}');
    await userEvent.type(input, '任务二{Enter}');
    await userEvent.type(input, '任务三{Enter}');
    await userEvent.type(input, '任务四{Enter}');
    await userEvent.type(input, '任务五{Enter}');

    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/项待完成/)).toBeInTheDocument();

    // Step 2: 标记任务二和任务四为完成
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]); // 任务二
    await userEvent.click(checkboxes[3]); // 任务四

    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/项待完成/)).toBeInTheDocument();

    // Step 3: 筛选已完成
    await userEvent.click(screen.getByRole('button', { name: /已完成/i }));
    expect(screen.getByText('任务二')).toBeInTheDocument();
    expect(screen.getByText('任务四')).toBeInTheDocument();
    expect(screen.queryByText('任务一')).not.toBeInTheDocument();
    expect(screen.queryByText('任务三')).not.toBeInTheDocument();
    expect(screen.queryByText('任务五')).not.toBeInTheDocument();

    // Step 4: 切换到全部视图，删除已完成的任务二
    await userEvent.click(screen.getByRole('button', { name: /全部/i }));
    const deleteButtons = screen.getAllByRole('button', { name: /删除/i });
    await userEvent.click(deleteButtons[1]); // 删除任务二

    expect(screen.queryByText('任务二')).not.toBeInTheDocument();
    // activeCount still 3 (deleting a completed todo)
    expect(screen.getByText(/3/)).toBeInTheDocument();

    // Step 5: 删除未完成的任务一
    const deleteButtonsAfter = screen.getAllByRole('button', { name: /删除/i });
    await userEvent.click(deleteButtonsAfter[0]); // 删除任务一

    expect(screen.queryByText('任务一')).not.toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument(); // activeCount now 2
  });

  // 特殊字符输入端到端
  it('should handle special characters in full flow', async () => {
    render(<App />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '& < > "测试"{Enter}');

    expect(screen.getByText('& < > "测试"')).toBeInTheDocument();

    // 标记完成
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    // 筛选已完成
    await userEvent.click(screen.getByRole('button', { name: /已完成/i }));
    expect(screen.getByText('& < > "测试"')).toBeInTheDocument();

    // 删除
    const deleteButton = screen.getByRole('button', { name: /删除/i });
    await userEvent.click(deleteButton);
    expect(screen.queryByText('& < > "测试"')).not.toBeInTheDocument();
  });

  // localStorage 持久化验证 — toggle 后持久化
  it('should persist toggle state to localStorage', async () => {
    render(<App />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '持久化测试{Enter}');

    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    // 验证 localStorage 中包含 completed: true
    const lastSetItemCall = localStorageMock.setItem.mock.calls.filter(
      (call: string[]) => call[0] === 'todos'
    ).pop();
    expect(lastSetItemCall).toBeDefined();
    const storedTodos = JSON.parse(lastSetItemCall![1]);
    expect(storedTodos[0].completed).toBe(true);
  });

  // localStorage 持久化验证 — 删除后持久化
  it('should persist deletion to localStorage', async () => {
    render(<App />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '将被删除{Enter}');
    await userEvent.type(input, '将保留{Enter}');

    const deleteButtons = screen.getAllByRole('button', { name: /删除/i });
    await userEvent.click(deleteButtons[0]);

    const lastSetItemCall = localStorageMock.setItem.mock.calls.filter(
      (call: string[]) => call[0] === 'todos'
    ).pop();
    expect(lastSetItemCall).toBeDefined();
    const storedTodos = JSON.parse(lastSetItemCall![1]);
    expect(storedTodos).toHaveLength(1);
    expect(storedTodos[0].text).toBe('将保留');
  });

  // 初始空状态显示
  it('should display correct initial empty state', () => {
    render(<App />);

    expect(screen.getByText(/0/)).toBeInTheDocument();
    expect(screen.getByText(/项待完成/)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});
