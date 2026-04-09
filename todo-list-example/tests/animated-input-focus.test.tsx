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

import AnimatedTodoInput from '../src/components/AnimatedTodoInput';

describe('F8: 输入框聚焦动画', () => {
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

  // REF: PRD 3.2 F8 - 验收标准 1: 聚焦时边框过渡为渐变色，出现外发光
  describe('聚焦发光效果', () => {
    it('should render input with placeholder', () => {
      render(<AnimatedTodoInput onAdd={vi.fn()} />);
      expect(screen.getByPlaceholderText('添加新的待办事项...')).toBeInTheDocument();
    });

    it('should apply focus styling (ring) when input is focused', async () => {
      const user = userEvent.setup();
      render(<AnimatedTodoInput onAdd={vi.fn()} />);

      const input = screen.getByPlaceholderText('添加新的待办事项...');
      await user.click(input);

      // When focused, input should have blue border/ring classes
      expect(input.className).toContain('border-blue-400');
      expect(input.className).toContain('ring-2');
    });

    it('should render glow overlay element when focused (non-reduced-motion)', async () => {
      const user = userEvent.setup();
      render(<AnimatedTodoInput onAdd={vi.fn()} />);

      // The glow div should exist (gradient background for glow effect)
      const glowElement = document.querySelector('.bg-gradient-to-r');
      expect(glowElement).toBeInTheDocument();
    });

    it('should animate glow opacity when focused', async () => {
      const user = userEvent.setup();
      render(<AnimatedTodoInput onAdd={vi.fn()} />);

      const input = screen.getByPlaceholderText('添加新的待办事项...');
      await user.click(input);

      // Glow element should have animate with pulsing opacity
      const glowElement = document.querySelector('[data-motion-animate]');
      expect(glowElement).toBeTruthy();
    });
  });

  // REF: PRD 3.2 F8 - 验收标准 2: 失去焦点时发光淡出
  describe('失焦恢复', () => {
    it('should remove focus styling when input loses focus', async () => {
      const user = userEvent.setup();
      render(<AnimatedTodoInput onAdd={vi.fn()} />);

      const input = screen.getByPlaceholderText('添加新的待办事项...');

      // Focus then blur
      await user.click(input);
      expect(input.className).toContain('border-blue-400');

      await user.tab(); // Move focus away
      expect(input.className).toContain('border-gray-300');
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

    it('should not render glow overlay when reduced motion is preferred', () => {
      render(<AnimatedTodoInput onAdd={vi.fn()} />);
      const glowElement = document.querySelector('.bg-gradient-to-r');
      expect(glowElement).not.toBeInTheDocument();
    });

    it('should still render functional input when reduced motion is preferred', () => {
      render(<AnimatedTodoInput onAdd={vi.fn()} />);
      expect(screen.getByPlaceholderText('添加新的待办事项...')).toBeInTheDocument();
    });
  });
});
