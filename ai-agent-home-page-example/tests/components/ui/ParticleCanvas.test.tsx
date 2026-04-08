import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ParticleCanvas } from "@/components/ui/ParticleCanvas";

describe("ParticleCanvas", () => {
  // REF: PRD F08 - AC01: 背景中存在一个 Canvas 元素
  describe("canvas rendering", () => {
    it("should render a canvas element", () => {
      const { container } = render(<ParticleCanvas />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeInTheDocument();
    });

    it("should have absolute positioning and full size", () => {
      const { container } = render(<ParticleCanvas />);
      const canvas = container.querySelector("canvas");
      expect(canvas?.className).toMatch(/absolute/);
      expect(canvas?.className).toMatch(/inset-0/);
      expect(canvas?.className).toMatch(/w-full/);
      expect(canvas?.className).toMatch(/h-full/);
    });

    it("should have pointer-events-none to not block interactions", () => {
      const { container } = render(<ParticleCanvas />);
      const canvas = container.querySelector("canvas");
      expect(canvas?.className).toMatch(/pointer-events-none/);
    });
  });

  // REF: PRD F08 - custom className support
  describe("className prop", () => {
    it("should accept and apply custom className", () => {
      const { container } = render(<ParticleCanvas className="opacity-50" />);
      const canvas = container.querySelector("canvas");
      expect(canvas?.className).toMatch(/opacity-50/);
    });
  });

  // REF: PRD F08 - AC03: Canvas 尺寸自动适应新的窗口尺寸
  describe("resize handling", () => {
    it("should add resize event listener on mount", () => {
      const addSpy = vi.spyOn(window, "addEventListener");
      render(<ParticleCanvas />);
      expect(addSpy).toHaveBeenCalledWith("resize", expect.any(Function));
      addSpy.mockRestore();
    });

    it("should remove resize event listener on unmount", () => {
      const removeSpy = vi.spyOn(window, "removeEventListener");
      const { unmount } = render(<ParticleCanvas />);
      unmount();
      expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
      removeSpy.mockRestore();
    });
  });

  // Animation lifecycle
  describe("animation lifecycle", () => {
    it("should start animation with requestAnimationFrame on mount", () => {
      const rafSpy = vi.spyOn(window, "requestAnimationFrame");
      render(<ParticleCanvas />);
      expect(rafSpy).toHaveBeenCalled();
      rafSpy.mockRestore();
    });

    it("should cancel animation frame on unmount", () => {
      const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");
      const { unmount } = render(<ParticleCanvas />);
      unmount();
      expect(cancelSpy).toHaveBeenCalled();
      cancelSpy.mockRestore();
    });
  });

  // Edge case: custom particle count and connection distance
  describe("custom props", () => {
    it("should accept custom particleCount prop without crashing", () => {
      const { container } = render(<ParticleCanvas particleCount={10} />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeInTheDocument();
    });

    it("should accept custom connectionDistance prop without crashing", () => {
      const { container } = render(<ParticleCanvas connectionDistance={50} />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeInTheDocument();
    });
  });
});
