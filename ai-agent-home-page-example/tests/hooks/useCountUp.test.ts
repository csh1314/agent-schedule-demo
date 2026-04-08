import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountUp } from "@/hooks/useCountUp";

describe("useCountUp", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // REF: PRD F05 - AC04: 数字指标从 0 开始播放计数动画至目标值
  describe("count animation", () => {
    it("should start from 0", () => {
      const { result } = renderHook(() =>
        useCountUp({ target: 100, duration: 2000, enabled: true })
      );

      // Initial value should be 0 (before any animation frame fires)
      expect(result.current).toBe(0);
    });

    it("should reach the target value after the animation duration", async () => {
      const { result } = renderHook(() =>
        useCountUp({ target: 100, duration: 100, enabled: true })
      );

      // Advance timers to allow rAF callbacks to execute
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      // After duration, count should equal target
      expect(result.current).toBe(100);
    });

    it("should animate to target value 50", async () => {
      const { result } = renderHook(() =>
        useCountUp({ target: 50, duration: 100, enabled: true })
      );

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current).toBe(50);
    });
  });

  // REF: PRD F05 - AC04: enabled controls when animation starts
  describe("enabled control", () => {
    it("should not animate when enabled is false", () => {
      const { result } = renderHook(() =>
        useCountUp({ target: 100, duration: 2000, enabled: false })
      );

      expect(result.current).toBe(0);
    });

    it("should start animating when enabled changes from false to true", async () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useCountUp({ target: 100, duration: 100, enabled }),
        { initialProps: { enabled: false } }
      );

      expect(result.current).toBe(0);

      rerender({ enabled: true });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current).toBe(100);
    });

    it("should reset to 0 when enabled becomes false", () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useCountUp({ target: 100, duration: 2000, enabled }),
        { initialProps: { enabled: true } }
      );

      rerender({ enabled: false });

      expect(result.current).toBe(0);
    });
  });

  // Edge case: decimal targets (e.g. 99.9%)
  describe("edge cases", () => {
    it("should handle target value of 0", async () => {
      const { result } = renderHook(() =>
        useCountUp({ target: 0, duration: 100, enabled: true })
      );

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current).toBe(0);
    });

    it("should use default duration when not specified", () => {
      const { result } = renderHook(() =>
        useCountUp({ target: 100, enabled: true })
      );

      // Should not throw and should start at 0
      expect(result.current).toBe(0);
    });
  });

  // Cleanup
  describe("cleanup", () => {
    it("should cancel animation frame on unmount", () => {
      const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");

      const { unmount } = renderHook(() =>
        useCountUp({ target: 100, duration: 2000, enabled: true })
      );

      unmount();

      expect(cancelSpy).toHaveBeenCalled();
      cancelSpy.mockRestore();
    });
  });
});
