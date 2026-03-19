import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TodoCounter from '../../src/components/TodoCounter';

describe('TodoCounter', () => {
  // AC-005-1: 初始状态显示 — 0 项待完成
  it('should display "0 项待完成" when activeCount is 0', () => {
    render(<TodoCounter activeCount={0} />);

    expect(screen.getByText(/0/)).toBeInTheDocument();
    expect(screen.getByText(/项待完成/)).toBeInTheDocument();
  });

  // AC-005-2: 添加后计数更新 — 1 项待完成
  it('should display "1 项待完成" when activeCount is 1', () => {
    render(<TodoCounter activeCount={1} />);

    expect(screen.getByText(/1/)).toBeInTheDocument();
    expect(screen.getByText(/项待完成/)).toBeInTheDocument();
  });

  // AC-005-3: 完成后计数更新 — 动态数量显示
  it('should display correct count for any number', () => {
    render(<TodoCounter activeCount={3} />);

    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/项待完成/)).toBeInTheDocument();
  });

  // AC-005-4 / AC-005-5: 计数更新 — 较大数量
  it('should display large count correctly', () => {
    render(<TodoCounter activeCount={99} />);

    expect(screen.getByText(/99/)).toBeInTheDocument();
    expect(screen.getByText(/项待完成/)).toBeInTheDocument();
  });

  // NFR-002: 可访问性 — aria-live 用于实时计数播报
  it('should have aria-live attribute for accessibility', () => {
    const { container } = render(<TodoCounter activeCount={5} />);

    const liveRegion = container.querySelector('[aria-live]');
    expect(liveRegion).not.toBeNull();
  });
});
