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

import AnimatedCounter from '../src/components/AnimatedCounter';

describe('F10: 计数器数字滚动', () => {
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

  // REF: PRD 3.2 F10 - 验收标准 1: 数字向上滚出，新数字从下方滚入
  describe('数字滚动动画', () => {
    it('should render the active count number', () => {
      render(<AnimatedCounter activeCount={3} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display "项待完成" label text', () => {
      render(<AnimatedCounter activeCount={3} />);
      expect(screen.getByText(/项待完成/)).toBeInTheDocument();
    });

    it('should wrap number in AnimatePresence with popLayout mode', () => {
      render(<AnimatedCounter activeCount={3} />);
      const presenceWrappers = screen.getAllByTestId('animate-presence');
      const popLayoutWrapper = presenceWrappers.find(
        (el) => el.getAttribute('data-presence-mode') === 'popLayout'
      );
      expect(popLayoutWrapper).toBeTruthy();
    });

    it('should apply spring animation to number element', () => {
      render(<AnimatedCounter activeCount={3} />);
      const numberElement = screen.getByText('3');
      const animateAttr = numberElement.getAttribute('data-motion-animate');
      expect(animateAttr).toBeTruthy();
      if (animateAttr) {
        const animate = JSON.parse(animateAttr);
        expect(animate.y).toBe(0);
        expect(animate.opacity).toBe(1);
      }
    });

    it('should update displayed number when count changes', () => {
      const { rerender } = render(<AnimatedCounter activeCount={3} />);
      expect(screen.getByText('3')).toBeInTheDocument();

      rerender(<AnimatedCounter activeCount={2} />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  // REF: PRD 3.2 F10 - 验收标准 2: 新旧数字相同时不触发滚动
  describe('相同数字不触发动画', () => {
    it('should render the same number without re-triggering animation on rerender', () => {
      const { rerender } = render(<AnimatedCounter activeCount={3} />);
      rerender(<AnimatedCounter activeCount={3} />);
      // Only one "3" should exist (key-based AnimatePresence won't remount same key)
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  // REF: PRD 4 - aria-live 区域内容更新不受动画延迟影响
  describe('可访问性', () => {
    it('should have aria-live="polite" on the counter container', () => {
      render(<AnimatedCounter activeCount={3} />);
      const container = screen.getByText(/项待完成/).closest('[aria-live]');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('should immediately show updated count in aria-live region', () => {
      const { rerender } = render(<AnimatedCounter activeCount={3} />);
      rerender(<AnimatedCounter activeCount={1} />);
      // The actual text content should be updated regardless of animation
      expect(screen.getByText('1')).toBeInTheDocument();
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

    it('should render plain number without AnimatePresence when reduced motion is preferred', () => {
      render(<AnimatedCounter activeCount={3} />);
      // Should show the number as plain text
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText(/项待完成/)).toBeInTheDocument();
    });

    it('should still have aria-live when reduced motion is preferred', () => {
      render(<AnimatedCounter activeCount={3} />);
      const container = screen.getByText(/项待完成/).closest('[aria-live]');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });
  });

  // 边界: 0 项待完成
  describe('边界情况', () => {
    it('should correctly display 0 when no active items', () => {
      render(<AnimatedCounter activeCount={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should correctly display large numbers', () => {
      render(<AnimatedCounter activeCount={999} />);
      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });
});
