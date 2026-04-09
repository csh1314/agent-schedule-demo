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
              'data-motion-layout': layout ? 'true' : undefined,
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
      initial?: boolean;
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

import AnimatedTodoApp from '../src/components/AnimatedTodoApp';

// Seed data matching the original mock todos
const seedTodos = [
  { id: '1', text: '买牛奶', completed: false, createdAt: Date.now() - 3000 },
  { id: '2', text: '写周报', completed: true, createdAt: Date.now() - 2000 },
  { id: '3', text: '读书', completed: false, createdAt: Date.now() - 1000 },
];

describe('F5: 列表重排动画', () => {
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

  // REF: PRD 3.2 F5 - 验收标准 1: 切换筛选时已完成项淡出收缩，未完成项平滑滑动
  describe('筛选切换触发重排', () => {
    it('should filter to show only active todos when "未完成" is clicked', async () => {
      const user = userEvent.setup();
      render(<AnimatedTodoApp />);

      // Initially all 3 items visible
      expect(screen.getByText('买牛奶')).toBeInTheDocument();
      expect(screen.getByText('写周报')).toBeInTheDocument();
      expect(screen.getByText('读书')).toBeInTheDocument();

      // Click "未完成" filter
      await user.click(screen.getByText('未完成'));

      // Only active items should remain
      expect(screen.getByText('买牛奶')).toBeInTheDocument();
      expect(screen.getByText('读书')).toBeInTheDocument();
      expect(screen.queryByText('写周报')).not.toBeInTheDocument();
    });

    it('should filter to show only completed todos when "已完成" is clicked', async () => {
      const user = userEvent.setup();
      render(<AnimatedTodoApp />);

      await user.click(screen.getByText('已完成'));

      expect(screen.getByText('写周报')).toBeInTheDocument();
      expect(screen.queryByText('买牛奶')).not.toBeInTheDocument();
      expect(screen.queryByText('读书')).not.toBeInTheDocument();
    });
  });

  // REF: PRD 3.2 F5 - 验收标准 2: layout animation 平滑移动
  describe('layout animation 标记', () => {
    it('should apply layout prop to all todo items for smooth reflow', () => {
      render(<AnimatedTodoApp />);
      const layoutItems = document.querySelectorAll('[data-motion-layout="true"]');
      // Each of the 3 mock todos should have layout animation
      expect(layoutItems.length).toBeGreaterThanOrEqual(3);
    });
  });

  // REF: PRD 3.2 F5 - AnimatePresence mode
  describe('AnimatePresence 配置', () => {
    it('should use AnimatePresence with popLayout mode for list', () => {
      render(<AnimatedTodoApp />);
      const presenceWrappers = screen.getAllByTestId('animate-presence');
      const popLayoutWrapper = presenceWrappers.find(
        (el) => el.getAttribute('data-presence-mode') === 'popLayout'
      );
      expect(popLayoutWrapper).toBeTruthy();
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

    it('should not apply layout prop when reduced motion is preferred', () => {
      render(<AnimatedTodoApp />);
      const layoutItems = document.querySelectorAll('[data-motion-layout="true"]');
      expect(layoutItems.length).toBe(0);
    });
  });
});
