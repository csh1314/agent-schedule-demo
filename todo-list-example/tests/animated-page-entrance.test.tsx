import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock framer-motion to expose motion props as data attributes for testing
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
              'data-testid': rest['data-testid'] || undefined,
              'data-motion-initial': initial ? JSON.stringify(initial) : undefined,
              'data-motion-animate': animate ? JSON.stringify(animate) : undefined,
              'data-motion-variants': variants ? JSON.stringify(variants) : undefined,
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

// Global matchMedia mock needed by all animated components
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

describe('F1: 页面入场动画', () => {
  // REF: PRD 3.2 F1 - 验收标准 1
  describe('标题入场动画', () => {
    it('should render the title with entrance animation', () => {
      render(<AnimatedTodoApp />);
      const title = screen.getByText('Todo List');
      expect(title).toBeInTheDocument();
    });

    it('should apply initial hidden state (opacity: 0, y offset) to title', () => {
      render(<AnimatedTodoApp />);
      const title = screen.getByText('Todo List');
      const initialAttr = title.getAttribute('data-motion-initial');
      expect(initialAttr).toBeTruthy();
      const initial = JSON.parse(initialAttr!);
      expect(initial.opacity).toBe(0);
    });

    it('should animate title to visible state (opacity: 1, y: 0)', () => {
      render(<AnimatedTodoApp />);
      const title = screen.getByText('Todo List');
      const animateAttr = title.getAttribute('data-motion-animate');
      expect(animateAttr).toBeTruthy();
      const animate = JSON.parse(animateAttr!);
      expect(animate.opacity).toBe(1);
      expect(animate.y).toBe(0);
    });
  });

  // REF: PRD 3.2 F1 - 验收标准 1: 卡片容器随后淡入
  describe('卡片容器入场动画', () => {
    it('should render the card container with stagger children variants', () => {
      render(<AnimatedTodoApp />);
      // Card container should exist with backdrop-blur styling
      const card = document.querySelector('.bg-white\\/80');
      expect(card).toBeInTheDocument();
    });

    it('should use stagger children animation for container', () => {
      render(<AnimatedTodoApp />);
      // The outer motion.div wrapping everything should have container variants
      const container = document.querySelector('[data-motion-variants]');
      expect(container).toBeInTheDocument();
      if (container) {
        const variants = JSON.parse(container.getAttribute('data-motion-variants')!);
        expect(variants).toHaveProperty('hidden');
        expect(variants).toHaveProperty('visible');
      }
    });
  });

  // REF: PRD 3.2 F1 - 验收标准 2: 动画不阻塞用户操作
  describe('动画不阻塞交互', () => {
    it('should render all interactive elements immediately (not blocked by animation)', () => {
      render(<AnimatedTodoApp />);
      // Input should be available even during animation
      expect(screen.getByPlaceholderText('添加新的待办事项...')).toBeInTheDocument();
      // Add button should be available
      expect(screen.getByRole('button', { name: /添加/i })).toBeInTheDocument();
    });
  });

  // REF: PRD 4 - 可访问性: prefers-reduced-motion 降级
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

    it('should still render all content when reduced motion is preferred', () => {
      render(<AnimatedTodoApp />);
      expect(screen.getByText('Todo List')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('添加新的待办事项...')).toBeInTheDocument();
    });
  });
});
