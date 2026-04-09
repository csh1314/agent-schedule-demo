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

import AnimatedFilter from '../src/components/AnimatedFilter';

describe('F9: 筛选滑动指示条', () => {
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

  // REF: PRD 3.2 F9 - 验收标准 1: 底部指示条平滑滑动
  describe('滑动指示条渲染', () => {
    it('should render three filter buttons (全部, 未完成, 已完成)', () => {
      render(<AnimatedFilter current="all" onFilterChange={vi.fn()} />);
      expect(screen.getByText('全部')).toBeInTheDocument();
      expect(screen.getByText('未完成')).toBeInTheDocument();
      expect(screen.getByText('已完成')).toBeInTheDocument();
    });

    it('should render sliding indicator element (bg-blue-500 bar)', () => {
      render(<AnimatedFilter current="all" onFilterChange={vi.fn()} />);
      const indicator = document.querySelector('.bg-blue-500.rounded-full');
      expect(indicator).toBeInTheDocument();
    });

    it('should configure indicator with animate for left and width', () => {
      render(<AnimatedFilter current="all" onFilterChange={vi.fn()} />);
      const indicator = document.querySelector('[data-motion-animate]');
      expect(indicator).toBeTruthy();
      if (indicator) {
        const animate = JSON.parse(indicator.getAttribute('data-motion-animate')!);
        expect(animate).toHaveProperty('left');
        expect(animate).toHaveProperty('width');
      }
    });
  });

  // REF: PRD 3.2 F9 - 验收标准 1: 用户点击筛选切换
  describe('筛选切换交互', () => {
    it('should call onFilterChange with "active" when 未完成 is clicked', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(<AnimatedFilter current="all" onFilterChange={onFilterChange} />);

      await user.click(screen.getByText('未完成'));
      expect(onFilterChange).toHaveBeenCalledWith('active');
    });

    it('should call onFilterChange with "completed" when 已完成 is clicked', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(<AnimatedFilter current="all" onFilterChange={onFilterChange} />);

      await user.click(screen.getByText('已完成'));
      expect(onFilterChange).toHaveBeenCalledWith('completed');
    });

    it('should highlight active filter button with blue text', () => {
      render(<AnimatedFilter current="active" onFilterChange={vi.fn()} />);
      const activeButton = screen.getByText('未完成');
      expect(activeButton.className).toContain('text-blue-600');
    });
  });

  // REF: PRD 3.2 F9 - 验收标准 2: 指示条宽度与激活按钮宽度一致
  describe('指示条位置对齐', () => {
    it('should have aria-pressed attribute on the active filter', () => {
      render(<AnimatedFilter current="all" onFilterChange={vi.fn()} />);
      const allButton = screen.getByText('全部');
      expect(allButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should not have aria-pressed on inactive filters', () => {
      render(<AnimatedFilter current="all" onFilterChange={vi.fn()} />);
      const activeButton = screen.getByText('未完成');
      expect(activeButton).toHaveAttribute('aria-pressed', 'false');
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

    it('should not render sliding indicator when reduced motion is preferred', () => {
      render(<AnimatedFilter current="all" onFilterChange={vi.fn()} />);
      const indicator = document.querySelector('.bg-blue-500.rounded-full');
      expect(indicator).not.toBeInTheDocument();
    });

    it('should still render all filter buttons when reduced motion is preferred', () => {
      render(<AnimatedFilter current="all" onFilterChange={vi.fn()} />);
      expect(screen.getByText('全部')).toBeInTheDocument();
      expect(screen.getByText('未完成')).toBeInTheDocument();
      expect(screen.getByText('已完成')).toBeInTheDocument();
    });
  });
});
