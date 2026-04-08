import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GlowButton } from "@/components/ui/GlowButton";

describe("GlowButton", () => {
  // REF: PRD F01 - CTA buttons with different variants
  describe("rendering", () => {
    it("should render button with children text", () => {
      render(<GlowButton>Click me</GlowButton>);
      expect(screen.getByRole("button", { name: /Click me/ })).toBeInTheDocument();
    });
  });

  // REF: PRD F01 - AC01: 主 CTA 按钮（填充样式）
  describe("primary variant", () => {
    it("should apply gradient background for primary variant", () => {
      render(<GlowButton variant="primary">Primary</GlowButton>);
      const button = screen.getByRole("button");
      expect(button.className).toMatch(/bg-gradient-to-r/);
    });

    it("should be the default variant", () => {
      render(<GlowButton>Default</GlowButton>);
      const button = screen.getByRole("button");
      expect(button.className).toMatch(/bg-gradient-to-r/);
    });
  });

  // REF: PRD F01 - AC01: 次 CTA 按钮（描边样式）
  describe("outline variant", () => {
    it("should apply border styling for outline variant", () => {
      render(<GlowButton variant="outline">Outline</GlowButton>);
      const button = screen.getByRole("button");
      expect(button.className).toMatch(/border/);
    });

    it("should not have gradient background for outline variant", () => {
      render(<GlowButton variant="outline">Outline</GlowButton>);
      const button = screen.getByRole("button");
      // Outline should have bg-transparent
      expect(button.className).toMatch(/bg-transparent/);
    });
  });

  // REF: PRD F01 - AC02: hover visual feedback
  describe("hover effects", () => {
    it("should have hover scale effect classes", () => {
      render(<GlowButton variant="primary">Hover me</GlowButton>);
      const button = screen.getByRole("button");
      expect(button.className).toMatch(/hover:scale/);
    });

    it("should have hover shadow/glow effect classes", () => {
      render(<GlowButton variant="primary">Glow</GlowButton>);
      const button = screen.getByRole("button");
      expect(button.className).toMatch(/hover:shadow/);
    });
  });

  // Size variants
  describe("size variants", () => {
    it("should apply default size styles", () => {
      render(<GlowButton size="default">Default</GlowButton>);
      const button = screen.getByRole("button");
      expect(button.className).toMatch(/px-6/);
    });

    it("should apply large size styles", () => {
      render(<GlowButton size="lg">Large</GlowButton>);
      const button = screen.getByRole("button");
      expect(button.className).toMatch(/px-8/);
    });
  });

  // Click handler
  describe("click handling", () => {
    it("should call onClick handler when clicked", () => {
      const handleClick = vi.fn();
      render(<GlowButton onClick={handleClick}>Click</GlowButton>);
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // Custom className
  describe("custom className", () => {
    it("should accept and merge custom className", () => {
      render(<GlowButton className="w-full">Full width</GlowButton>);
      const button = screen.getByRole("button");
      expect(button.className).toMatch(/w-full/);
    });
  });
});
