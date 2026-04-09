import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
              'data-motion-animate': animate ? JSON.stringify(animate) : undefined,
            });
          });
        },
      }
    );

  return {
    ...actual,
    motion: createMotionProxy(),
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'animate-presence' }, children),
  };
});

import AnimatedTodoItem from '../src/components/AnimatedTodoItem';
import type { Todo } from '../src/types/todo';

const createTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'test-id-1',
  text: '买牛奶',
  completed: false,
  createdAt: Date.now(),
  ...overrides,
});

describe('F4: 完成状态切换动画', () => {
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

  // REF: PRD 3.2 F4 - 验收标准 1: 删除线从左到右渐进展开，文字颜色过渡
  describe('完成状态 - 文字颜色动画', () => {
    it('should animate text color to gray-400 (#9ca3af) when completed', () => {
      const todo = createTodo({ completed: true });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);

      // Find span with animate containing color
      const textSpan = screen.getByText('买牛奶');
      const animateAttr = textSpan.getAttribute('data-motion-animate');
      expect(animateAttr).toBeTruthy();
      if (animateAttr) {
        const animate = JSON.parse(animateAttr);
        expect(animate.color).toBe('#9ca3af');
      }
    });

    it('should animate text color to gray-700 (#374151) when not completed', () => {
      const todo = createTodo({ completed: false });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);

      const textSpan = screen.getByText('买牛奶');
      const animateAttr = textSpan.getAttribute('data-motion-animate');
      expect(animateAttr).toBeTruthy();
      if (animateAttr) {
        const animate = JSON.parse(animateAttr);
        expect(animate.color).toBe('#374151');
      }
    });
  });

  // REF: PRD 3.2 F4 - 验收标准 1: 删除线动画
  describe('完成状态 - 删除线动画', () => {
    it('should animate strikethrough width to 100% when completed', () => {
      const todo = createTodo({ completed: true });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);

      // Look for the strikethrough span with animate width
      const strikeElements = document.querySelectorAll('[data-motion-animate]');
      const strikethrough = Array.from(strikeElements).find((el) => {
        try {
          const animate = JSON.parse(el.getAttribute('data-motion-animate')!);
          return animate.width !== undefined;
        } catch {
          return false;
        }
      });

      expect(strikethrough).toBeTruthy();
      if (strikethrough) {
        const animate = JSON.parse(strikethrough.getAttribute('data-motion-animate')!);
        expect(animate.width).toBe('100%');
      }
    });

    it('should animate strikethrough width to 0% when not completed', () => {
      const todo = createTodo({ completed: false });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);

      const strikeElements = document.querySelectorAll('[data-motion-animate]');
      const strikethrough = Array.from(strikeElements).find((el) => {
        try {
          const animate = JSON.parse(el.getAttribute('data-motion-animate')!);
          return animate.width !== undefined;
        } catch {
          return false;
        }
      });

      expect(strikethrough).toBeTruthy();
      if (strikethrough) {
        const animate = JSON.parse(strikethrough.getAttribute('data-motion-animate')!);
        expect(animate.width).toBe('0%');
      }
    });
  });

  // REF: PRD 3.2 F4 - 验收标准 2: 取消勾选时删除线从右到左收回
  describe('取消完成状态', () => {
    it('should call onToggle when checkbox is clicked to uncomplete', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const todo = createTodo({ completed: true });
      render(<AnimatedTodoItem todo={todo} onToggle={onToggle} onDelete={vi.fn()} />);

      const checkbox = screen.getByRole('checkbox', { name: /标记.*未完成/i });
      await user.click(checkbox);

      expect(onToggle).toHaveBeenCalledWith('test-id-1');
    });
  });

  // REF: PRD 4 - prefers-reduced-motion 降级
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

    it('should still render todo text when reduced motion is preferred', () => {
      const todo = createTodo({ completed: true });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);
      expect(screen.getByText('买牛奶')).toBeInTheDocument();
    });
  });
});
