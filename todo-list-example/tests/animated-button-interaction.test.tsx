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
              'data-motion-while-hover': whileHover
                ? JSON.stringify(whileHover)
                : undefined,
              'data-motion-while-tap': whileTap
                ? JSON.stringify(whileTap)
                : undefined,
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

import AnimatedTodoInput from '../src/components/AnimatedTodoInput';

describe('F7: 添加按钮微交互', () => {
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

  // REF: PRD 3.2 F7 - 验收标准 1: hover 放大至 scale(1.05)
  describe('Hover 放大效果', () => {
    it('should configure whileHover with scale 1.05 on add button', () => {
      render(<AnimatedTodoInput onAdd={vi.fn()} />);
      const addButton = screen.getByRole('button', { name: /添加/i });
      const hoverAttr = addButton.getAttribute('data-motion-while-hover');
      expect(hoverAttr).toBeTruthy();
      if (hoverAttr) {
        const hover = JSON.parse(hoverAttr);
        expect(hover.scale).toBe(1.05);
      }
    });

    it('should configure hover shadow enhancement on add button', () => {
      render(<AnimatedTodoInput onAdd={vi.fn()} />);
      const addButton = screen.getByRole('button', { name: /添加/i });
      const hoverAttr = addButton.getAttribute('data-motion-while-hover');
      expect(hoverAttr).toBeTruthy();
      if (hoverAttr) {
        const hover = JSON.parse(hoverAttr);
        expect(hover.boxShadow).toBeDefined();
      }
    });
  });

  // REF: PRD 3.2 F7 - 验收标准 2: 点击缩小至 scale(0.95)
  describe('点击弹性缩放', () => {
    it('should configure whileTap with scale 0.95 on add button', () => {
      render(<AnimatedTodoInput onAdd={vi.fn()} />);
      const addButton = screen.getByRole('button', { name: /添加/i });
      const tapAttr = addButton.getAttribute('data-motion-while-tap');
      expect(tapAttr).toBeTruthy();
      if (tapAttr) {
        const tap = JSON.parse(tapAttr);
        expect(tap.scale).toBe(0.95);
      }
    });
  });

  // REF: PRD 3.2 F7 - 按钮基础渲染
  describe('按钮正确渲染', () => {
    it('should render the add button with correct text', () => {
      render(<AnimatedTodoInput onAdd={vi.fn()} />);
      expect(screen.getByRole('button', { name: /添加/i })).toBeInTheDocument();
    });

    it('should render with correct styling classes', () => {
      render(<AnimatedTodoInput onAdd={vi.fn()} />);
      const button = screen.getByRole('button', { name: /添加/i });
      expect(button.className).toContain('bg-blue-500');
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

    it('should configure empty whileHover when reduced motion is preferred', () => {
      render(<AnimatedTodoInput onAdd={vi.fn()} />);
      const addButton = screen.getByRole('button', { name: /添加/i });
      const hoverAttr = addButton.getAttribute('data-motion-while-hover');
      if (hoverAttr) {
        const hover = JSON.parse(hoverAttr);
        expect(hover).toEqual({});
      }
    });

    it('should configure empty whileTap when reduced motion is preferred', () => {
      render(<AnimatedTodoInput onAdd={vi.fn()} />);
      const addButton = screen.getByRole('button', { name: /添加/i });
      const tapAttr = addButton.getAttribute('data-motion-while-tap');
      if (tapAttr) {
        const tap = JSON.parse(tapAttr);
        expect(tap).toEqual({});
      }
    });
  });
});
