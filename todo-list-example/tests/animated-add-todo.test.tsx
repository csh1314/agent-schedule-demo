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

import AnimatedTodoItem from '../src/components/AnimatedTodoItem';
import AnimatedTodoList from '../src/components/AnimatedTodoList';
import type { Todo } from '../src/types/todo';

const createTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'new-todo-1',
  text: '新的待办事项',
  completed: false,
  createdAt: Date.now(),
  ...overrides,
});

describe('F2: 添加 Todo 动画', () => {
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

  // REF: PRD 3.2 F2 - 验收标准 1: 新项从初始状态(opacity:0, height:0, y:-20px)过渡到最终状态
  describe('新 Todo 入场动画状态', () => {
    it('should render new todo item with text content', () => {
      const todo = createTodo();
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);
      expect(screen.getByText('新的待办事项')).toBeInTheDocument();
    });

    it('should apply initial hidden state (opacity: 0, height: 0, y: -20) to todo item', () => {
      const todo = createTodo();
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);

      const motionElement = document.querySelector('[data-motion-initial]');
      expect(motionElement).toBeTruthy();
      if (motionElement) {
        const initial = JSON.parse(motionElement.getAttribute('data-motion-initial')!);
        expect(initial.opacity).toBe(0);
        expect(initial.y).toBe(-20);
        expect(initial.height).toBe(0);
      }
    });

    it('should animate to visible state (opacity: 1, height: auto, y: 0)', () => {
      const todo = createTodo();
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);

      const motionElement = document.querySelector('[data-motion-animate]');
      expect(motionElement).toBeTruthy();
      if (motionElement) {
        const animate = JSON.parse(motionElement.getAttribute('data-motion-animate')!);
        expect(animate.opacity).toBe(1);
        expect(animate.y).toBe(0);
        expect(animate.height).toBe('auto');
      }
    });
  });

  // REF: PRD 3.2 F2 - 验收标准 2: 快速连续添加多个 Todo 独立播放
  describe('连续添加多个 Todo', () => {
    it('should render each todo independently with unique keys', () => {
      const todos = [
        createTodo({ id: '1', text: '第一个' }),
        createTodo({ id: '2', text: '第二个' }),
        createTodo({ id: '3', text: '第三个' }),
      ];
      render(
        <AnimatedTodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />
      );

      expect(screen.getByText('第一个')).toBeInTheDocument();
      expect(screen.getByText('第二个')).toBeInTheDocument();
      expect(screen.getByText('第三个')).toBeInTheDocument();
    });

    it('should apply animation initial state to each item individually', () => {
      const todos = [
        createTodo({ id: '1', text: '第一个' }),
        createTodo({ id: '2', text: '第二个' }),
      ];
      render(
        <AnimatedTodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />
      );

      const motionElements = document.querySelectorAll('[data-motion-initial]');
      expect(motionElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  // REF: PRD 3.2 F2 - AnimatePresence 包裹结构
  describe('AnimatePresence 包裹', () => {
    it('should wrap todo list items in AnimatePresence for enter/exit animations', () => {
      const todos = [createTodo()];
      render(
        <AnimatedTodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />
      );
      const presenceWrapper = screen.getAllByTestId('animate-presence');
      expect(presenceWrapper.length).toBeGreaterThan(0);
    });
  });

  // REF: PRD 3.2 F2 - exit 动画配置
  describe('退场动画配置', () => {
    it('should configure exit animation on each todo item', () => {
      const todo = createTodo();
      render(<AnimatedTodoItem todo={todo} onToggle={vi.fn()} onDelete={vi.fn()} />);

      const motionElement = document.querySelector('[data-motion-exit]');
      expect(motionElement).toBeTruthy();
    });
  });

  // 边界: 空列表
  describe('边界情况', () => {
    it('should show empty state when no todos', () => {
      render(
        <AnimatedTodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />
      );
      expect(screen.getByText('暂无匹配的待办事项')).toBeInTheDocument();
    });
  });
});
