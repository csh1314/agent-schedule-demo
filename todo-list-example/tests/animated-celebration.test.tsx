import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

import CelebrationEffect from '../src/components/CelebrationEffect';

describe('F6: 完成庆祝特效', () => {
  beforeEach(() => {
    vi.useFakeTimers();
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

  afterEach(() => {
    vi.useRealTimers();
  });

  // REF: PRD 3.2 F6 - 验收标准 1: 勾选完成时触发粒子迸发特效（6-10 个粒子）
  describe('粒子特效触发', () => {
    it('should render particles when trigger is true', () => {
      render(<CelebrationEffect trigger={true} />);
      // Particles should be rendered as colored elements
      const container = document.querySelector('.pointer-events-none');
      expect(container).toBeInTheDocument();
    });

    it('should generate 8 particles on trigger', () => {
      const { container } = render(<CelebrationEffect trigger={true} />);
      // CelebrationEffect generates 8 particles by default
      const particles = container.querySelectorAll('.rounded-full');
      expect(particles.length).toBe(8);
    });

    it('should not render particles when trigger is false', () => {
      const { container } = render(<CelebrationEffect trigger={false} />);
      const particles = container.querySelectorAll('.rounded-full');
      expect(particles.length).toBe(0);
    });
  });

  // REF: PRD 3.2 F6 - 验收标准 3: 特效完成后粒子从 DOM 移除
  describe('粒子自动清理', () => {
    it('should remove particles after animation duration (700ms)', () => {
      const { container } = render(<CelebrationEffect trigger={true} />);

      // Initially particles exist
      expect(container.querySelectorAll('.rounded-full').length).toBe(8);

      // After 700ms timer, particles should be cleaned up
      act(() => {
        vi.advanceTimersByTime(700);
      });

      expect(container.querySelectorAll('.rounded-full').length).toBe(0);
    });
  });

  // REF: PRD 3.2 F6 - 验收标准 2: 取消勾选不触发庆祝特效
  describe('取消勾选不触发', () => {
    it('should not show celebration when trigger remains false', () => {
      const { container, rerender } = render(<CelebrationEffect trigger={false} />);
      rerender(<CelebrationEffect trigger={false} />);
      const particles = container.querySelectorAll('.rounded-full');
      expect(particles.length).toBe(0);
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

    it('should return null (no particles) when reduced motion is preferred', () => {
      const { container } = render(<CelebrationEffect trigger={true} />);
      const particles = container.querySelectorAll('.rounded-full');
      expect(particles.length).toBe(0);
    });
  });

  // REF: PRD 4 - 性能: 粒子特效不得导致内存泄漏
  describe('内存泄漏防护', () => {
    it('should cleanup timer on unmount to prevent memory leak', () => {
      const { unmount } = render(<CelebrationEffect trigger={true} />);
      // Unmount before timer fires — should not cause errors
      unmount();
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      // No error thrown = cleanup works correctly
    });
  });
});
