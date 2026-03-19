import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TodoInput from '../../src/components/TodoInput';

describe('TodoInput', () => {
  // AC-001-1: 基本添加 — 按 Enter 键提交
  it('should call onAdd with input text when Enter is pressed', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '买牛奶{Enter}');

    expect(onAdd).toHaveBeenCalledWith('买牛奶');
  });

  // AC-001-1: 提交后输入框被清空
  it('should clear the input field after submission', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '买牛奶{Enter}');

    expect(input).toHaveValue('');
  });

  // AC-001-2: 点击按钮添加
  it('should call onAdd when the add button is clicked', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /添加/i });

    await userEvent.type(input, '写周报');
    await userEvent.click(button);

    expect(onAdd).toHaveBeenCalledWith('写周报');
    expect(input).toHaveValue('');
  });

  // AC-001-3: 空内容拦截 — 空字符串不提交
  it('should not call onAdd when input is empty', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const button = screen.getByRole('button', { name: /添加/i });
    await userEvent.click(button);

    expect(onAdd).not.toHaveBeenCalled();
  });

  // AC-001-3: 空内容拦截 — 仅空格不提交
  it('should not call onAdd when input contains only whitespace', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '   {Enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  // AC-001-4: 前后空格清除
  it('should trim whitespace from input before calling onAdd', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '  读书  {Enter}');

    expect(onAdd).toHaveBeenCalledWith('读书');
  });

  // NFR-002: 可访问性 — 输入框有 aria-label
  it('should have an accessible label on the input', () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-label');
  });

  // NFR-002: 可访问性 — 添加按钮有 aria-label
  it('should have an accessible label on the add button', () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    expect(screen.getByRole('button', { name: /添加/i })).toBeInTheDocument();
  });

  // --- 边界用例 ---

  // 特殊字符输入
  it('should handle special characters in input', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '& < > "quotes"{Enter}');

    expect(onAdd).toHaveBeenCalledWith('& < > "quotes"');
  });

  // 连续多次提交
  it('should allow multiple consecutive submissions', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '第一个{Enter}');
    await userEvent.type(input, '第二个{Enter}');
    await userEvent.type(input, '第三个{Enter}');

    expect(onAdd).toHaveBeenCalledTimes(3);
    expect(onAdd).toHaveBeenNthCalledWith(1, '第一个');
    expect(onAdd).toHaveBeenNthCalledWith(2, '第二个');
    expect(onAdd).toHaveBeenNthCalledWith(3, '第三个');
  });

  // 有 placeholder 提示文字
  it('should render with a placeholder text', () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder');
  });

  // 按非 Enter 键不提交
  it('should not submit on non-Enter keys', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, '测试');

    expect(onAdd).not.toHaveBeenCalled();
    expect(input).toHaveValue('测试');
  });
});
