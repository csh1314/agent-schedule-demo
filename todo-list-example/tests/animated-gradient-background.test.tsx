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
            return React.createElement(prop, { ...rest, ref });
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

describe('F12: 渐变流光背景', () => {
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

  // REF: PRD 3.2 F12 - 验收标准 1: 背景呈现缓慢流动的渐变色
  describe('渐变背景渲染', () => {
    it('should render gradient background element', () => {
      render(<AnimatedTodoApp />);
      const gradientBg = document.querySelector('.bg-gradient-to-br');
      expect(gradientBg).toBeInTheDocument();
    });

    it('should apply gradient-flow CSS animation class', () => {
      render(<AnimatedTodoApp />);
      const gradientBg = document.querySelector('.animate-gradient-flow');
      expect(gradientBg).toBeInTheDocument();
    });

    it('should have extended background size for animation effect', () => {
      render(<AnimatedTodoApp />);
      const gradientBg = document.querySelector('.bg-\\[length\\:200\\%_200\\%\\]');
      expect(gradientBg).toBeInTheDocument();
    });
  });

  // REF: PRD 3.2 F12 - 验收标准 2: 使用 CSS animation 实现，不造成性能开销
  describe('CSS 实现（非 JS 动画）', () => {
    it('should use CSS class-based animation (not framer-motion)', () => {
      render(<AnimatedTodoApp />);
      // The gradient background uses CSS animation, not a motion.div
      const gradientBg = document.querySelector('.animate-gradient-flow');
      expect(gradientBg).toBeTruthy();
      // It should be a regular div, not a motion element (no motion data attributes)
      expect(gradientBg?.getAttribute('data-motion-animate')).toBeFalsy();
    });

    it('should position background with fixed positioning behind content', () => {
      render(<AnimatedTodoApp />);
      const gradientBg = document.querySelector('.fixed.inset-0.-z-10');
      expect(gradientBg).toBeInTheDocument();
    });
  });

  // REF: PRD 3.2 F12 - 渐变色组成
  describe('渐变色配置', () => {
    it('should include blue, purple and pink gradient stops', () => {
      render(<AnimatedTodoApp />);
      const gradientBg = document.querySelector('.bg-gradient-to-br');
      expect(gradientBg?.className).toContain('from-blue-50');
      expect(gradientBg?.className).toContain('via-purple-50');
      expect(gradientBg?.className).toContain('to-pink-50');
    });
  });

  // REF: PRD 4 - prefers-reduced-motion: CSS 方案通过 motion-safe 控制
  describe('prefers-reduced-motion 降级', () => {
    it('should still render the gradient background (CSS handles reduced motion via motion-safe)', () => {
      // Note: CSS-level motion-safe/motion-reduce is handled by the browser,
      // not testable in jsdom. We verify the class exists so the browser can apply it.
      render(<AnimatedTodoApp />);
      const gradientBg = document.querySelector('.animate-gradient-flow');
      expect(gradientBg).toBeInTheDocument();
    });
  });
});
