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
          // Handle SVG elements (path) specially
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
              'data-motion-initial': initial !== undefined ? JSON.stringify(initial) : undefined,
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

describe('F13: Checkbox 描线动画', () => {
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

  // REF: PRD 3.2 F13 - 验收标准 1: checkmark 以 SVG stroke-dashoffset 动画描绘
  describe('Checkbox SVG 描线动画', () => {
    it('should render an SVG checkmark path element', () => {
      const todo = createTodo({ completed: true });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const svgPath = document.querySelector('path[d="M2 6L5 9L10 3"]');
      expect(svgPath).toBeInTheDocument();
    });

    it('should animate pathLength to 1 when completed', () => {
      const todo = createTodo({ completed: true });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const svgPath = document.querySelector('path');
      const animateAttr = svgPath?.getAttribute('data-motion-animate');
      expect(animateAttr).toBeTruthy();
      if (animateAttr) {
        const animate = JSON.parse(animateAttr);
        expect(animate.pathLength).toBe(1);
        expect(animate.opacity).toBe(1);
      }
    });

    it('should animate pathLength to 0 when not completed', () => {
      const todo = createTodo({ completed: false });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const svgPath = document.querySelector('path');
      const animateAttr = svgPath?.getAttribute('data-motion-animate');
      expect(animateAttr).toBeTruthy();
      if (animateAttr) {
        const animate = JSON.parse(animateAttr);
        expect(animate.pathLength).toBe(0);
        expect(animate.opacity).toBe(0);
      }
    });
  });

  // REF: PRD 3.2 F13 - 验收标准 2: 取消勾选时反向动画擦除
  describe('Checkbox 取消描线', () => {
    it('should call onToggle when checkbox button is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const todo = createTodo({ completed: true });
      render(<AnimatedTodoItem todo={todo} onToggle={onToggle} onDelete={vi.fn()} />);

      const checkboxButton = screen.getByRole('checkbox', { name: /标记/i });
      await user.click(checkboxButton);
      expect(onToggle).toHaveBeenCalledWith('test-id-1');
    });
  });

  // REF: PRD 3.2 F13 - Checkbox 外观
  describe('Checkbox 样式', () => {
    it('should show blue background when completed', () => {
      const todo = createTodo({ completed: true });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const checkboxButton = screen.getByRole('checkbox', { name: /标记/i });
      expect(checkboxButton.style.backgroundColor).toMatch(/rgb\(59,\s*130,\s*246\)|#3b82f6/);
    });

    it('should show transparent background when not completed', () => {
      const todo = createTodo({ completed: false });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const checkboxButton = screen.getByRole('checkbox', { name: /标记/i });
      expect(checkboxButton.style.backgroundColor).toBe('transparent');
    });

    it('should show blue border when completed', () => {
      const todo = createTodo({ completed: true });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const checkboxButton = screen.getByRole('checkbox', { name: /标记/i });
      expect(checkboxButton.style.borderColor).toMatch(/rgb\(59,\s*130,\s*246\)|#3b82f6/);
    });

    it('should show gray border when not completed', () => {
      const todo = createTodo({ completed: false });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const checkboxButton = screen.getByRole('checkbox', { name: /标记/i });
      expect(checkboxButton.style.borderColor).toMatch(/rgb\(209,\s*213,\s*219\)|#d1d5db/);
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

    it('should still render checkbox button when reduced motion is preferred', () => {
      const todo = createTodo({ completed: true });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);
      expect(screen.getByRole('checkbox', { name: /标记/i })).toBeInTheDocument();
    });
  });

  // 可访问性
  describe('可访问性', () => {
    it('should have descriptive aria-label on checkbox button', () => {
      const todo = createTodo({ text: '写报告' });
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const checkboxButton = screen.getByRole('checkbox', { name: /标记.*写报告/i });
      expect(checkboxButton).toBeInTheDocument();
    });

    it('should have focus ring styling for keyboard navigation', () => {
      const todo = createTodo();
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);
      const checkboxButton = screen.getByRole('checkbox', { name: /标记/i });
      expect(checkboxButton.className).toContain('focus:ring-2');
    });
  });
});
