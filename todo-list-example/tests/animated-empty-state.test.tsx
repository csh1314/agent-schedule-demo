import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const React = await import('react');
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');

  const createMotionProxy = () =>
    new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          return React.forwardRef((props: Record<string, unknown>, ref) => {
            const {
              initial,
              animate,
              exit,
              variants,
              transition,
              whileHover,
              whileTap,
              layout,
              onAnimationComplete,
              ...rest
            } = props;
            return React.createElement(prop, {
              ...rest,
              ref,
              'data-motion-initial': initial ? JSON.stringify(initial) : undefined,
              'data-motion-animate': animate ? JSON.stringify(animate) : undefined,
              'data-motion-exit': exit ? JSON.stringify(exit) : undefined,
            });
          });
        },
      }
    );

  return {
    ...actual,
    motion: createMotionProxy(),
    AnimatePresence: ({
      children,
      mode,
    }: {
      children: React.ReactNode;
      mode?: string;
    }) =>
      React.createElement(
        'div',
        {
          'data-testid': 'animate-presence',
          'data-presence-mode': mode,
        },
        children
      ),
  };
});

import AnimatedTodoList from '../src/components/AnimatedTodoList';

describe('F11: 空状态呼吸动画', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  // REF: PRD 3.2 F11 - 验收标准 1: 空状态文字以淡入方式出现，持续呼吸脉动
  describe('空状态渲染', () => {
    it('should render empty state message when todos list is empty', () => {
      render(<AnimatedTodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);
      expect(screen.getByText('暂无匹配的待办事项')).toBeInTheDocument();
    });

    it('should apply initial opacity 0 for fade-in entrance', () => {
      render(<AnimatedTodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const emptyState = screen.getByText('暂无匹配的待办事项');
      const initialAttr = emptyState.getAttribute('data-motion-initial');
      expect(initialAttr).toBeTruthy();
      if (initialAttr) {
        const initial = JSON.parse(initialAttr);
        expect(initial.opacity).toBe(0);
      }
    });

    it('should configure breathing animation (opacity cycling 0.5-1) for empty state', () => {
      render(<AnimatedTodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const emptyState = screen.getByText('暂无匹配的待办事项');
      const animateAttr = emptyState.getAttribute('data-motion-animate');
      expect(animateAttr).toBeTruthy();
      if (animateAttr) {
        const animate = JSON.parse(animateAttr);
        // Should have pulsing opacity array [0.5, 1, 0.5]
        expect(animate.opacity).toEqual([0.5, 1, 0.5]);
      }
    });
  });

  // REF: PRD 3.2 F11 - 验收标准 2: 列表从空变为有内容时淡出
  describe('空状态退出动画', () => {
    it('should configure exit animation with opacity 0', () => {
      render(<AnimatedTodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const emptyState = screen.getByText('暂无匹配的待办事项');
      const exitAttr = emptyState.getAttribute('data-motion-exit');
      expect(exitAttr).toBeTruthy();
      if (exitAttr) {
        const exit = JSON.parse(exitAttr);
        expect(exit.opacity).toBe(0);
      }
    });

    it('should wrap empty state in AnimatePresence with "wait" mode', () => {
      render(<AnimatedTodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const presenceWrapper = screen.getByTestId('animate-presence');
      expect(presenceWrapper.getAttribute('data-presence-mode')).toBe('wait');
    });
  });

  // REF: PRD 3.2 F11 - 非空列表不显示空状态
  describe('非空列表', () => {
    it('should not render empty state message when todos exist', () => {
      const todos = [
        { id: '1', text: '买牛奶', completed: false, createdAt: Date.now() },
      ];
      render(<AnimatedTodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />);
      expect(screen.queryByText('暂无匹配的待办事项')).not.toBeInTheDocument();
    });
  });

  // REF: PRD 4 - prefers-reduced-motion
  describe('prefers-reduced-motion 降级', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    });

    it('should show static opacity 1 (no breathing) when reduced motion is preferred', () => {
      render(<AnimatedTodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const emptyState = screen.getByText('暂无匹配的待办事项');
      const animateAttr = emptyState.getAttribute('data-motion-animate');
      if (animateAttr) {
        const animate = JSON.parse(animateAttr);
        expect(animate.opacity).toBe(1);
      }
    });

    it('should still render empty state text when reduced motion is preferred', () => {
      render(<AnimatedTodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);
      expect(screen.getByText('暂无匹配的待办事项')).toBeInTheDocument();
    });
  });
});
