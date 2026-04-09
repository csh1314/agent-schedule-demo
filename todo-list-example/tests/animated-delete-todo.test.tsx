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
              'data-motion-exit': exit ? JSON.stringify(exit) : undefined,
              'data-motion-layout': layout ? 'true' : undefined,
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

import AnimatedTodoApp from '../src/components/AnimatedTodoApp';

// Seed data matching the original mock todos
const seedTodos = [
  { id: '1', text: '买牛奶', completed: false, createdAt: Date.now() - 3000 },
  { id: '2', text: '写周报', completed: true, createdAt: Date.now() - 2000 },
  { id: '3', text: '读书', completed: false, createdAt: Date.now() - 1000 },
];

describe('F3: 删除 Todo 动画', () => {
  beforeEach(() => {
    // Pre-populate localStorage so useTodos returns seed data
    const store: Record<string, string> = { todos: JSON.stringify(seedTodos) };
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
      },
    });
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

  // REF: PRD 3.2 F3 - 验收标准 1: 向右滑出 + 透明度降为 0 + 高度收缩
  describe('删除退场动画配置', () => {
    it('should configure exit animation with x offset and opacity fade', () => {
      render(<AnimatedTodoApp />);
      // Find a todo item with exit animation config
      const itemWithExit = document.querySelector('[data-motion-exit]');
      expect(itemWithExit).toBeTruthy();
      if (itemWithExit) {
        const exit = JSON.parse(itemWithExit.getAttribute('data-motion-exit')!);
        expect(exit.opacity).toBe(0);
        expect(exit.x).toBe(60);
      }
    });

    it('should configure exit animation with height collapse to 0', () => {
      render(<AnimatedTodoApp />);
      const itemWithExit = document.querySelector('[data-motion-exit]');
      expect(itemWithExit).toBeTruthy();
      if (itemWithExit) {
        const exit = JSON.parse(itemWithExit.getAttribute('data-motion-exit')!);
        expect(exit.height).toBe(0);
      }
    });
  });

  // REF: PRD 3.2 F3 - 验收标准 2: DOM 节点被移除
  describe('删除后 DOM 移除', () => {
    it('should remove the todo item from DOM after deletion', async () => {
      const user = userEvent.setup();
      render(<AnimatedTodoApp />);

      expect(screen.getByText('买牛奶')).toBeInTheDocument();

      // Find and click the delete button for '买牛奶'
      const deleteButtons = screen.getAllByRole('button', { name: /删除/i });
      await user.click(deleteButtons[0]);

      // Item should be removed (in mock, AnimatePresence doesn't delay removal)
      expect(screen.queryByText('买牛奶')).not.toBeInTheDocument();
    });

    it('should keep remaining items after one is deleted', async () => {
      const user = userEvent.setup();
      render(<AnimatedTodoApp />);

      const deleteButtons = screen.getAllByRole('button', { name: /删除/i });
      await user.click(deleteButtons[0]); // Delete first item

      // Other items should remain
      expect(screen.getByText('写周报')).toBeInTheDocument();
      expect(screen.getByText('读书')).toBeInTheDocument();
    });
  });

  // REF: PRD 3.2 F3 - layout animation 让其余项平滑上移
  describe('列表布局动画', () => {
    it('should mark todo items with layout prop for smooth reflow', () => {
      render(<AnimatedTodoApp />);
      const layoutItems = document.querySelectorAll('[data-motion-layout="true"]');
      expect(layoutItems.length).toBeGreaterThan(0);
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

    it('should use simplified exit animation (opacity only) when reduced motion is preferred', () => {
      render(<AnimatedTodoApp />);
      const itemWithExit = document.querySelector('[data-motion-exit]');
      if (itemWithExit) {
        const exit = JSON.parse(itemWithExit.getAttribute('data-motion-exit')!);
        expect(exit.opacity).toBe(0);
        // Should not have x offset in reduced motion
        expect(exit.x).toBeUndefined();
      }
    });
  });
});
