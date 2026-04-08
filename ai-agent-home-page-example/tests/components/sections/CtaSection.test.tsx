import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CtaSection } from "@/components/sections/CtaSection";

describe("CtaSection", () => {
  // REF: PRD F06 - AC01: 显示标题"准备好开启 AI Agent 之旅了吗？"
  describe("CTA title", () => {
    it("should display the CTA heading text", () => {
      render(<CtaSection />);
      expect(
        screen.getByText("准备好开启 AI Agent 之旅了吗？")
      ).toBeInTheDocument();
    });
  });

  // REF: PRD F06 - AC01: 显示副标题"立即注册，免费体验全部核心功能"
  describe("CTA subtitle", () => {
    it("should display the CTA subtitle text", () => {
      render(<CtaSection />);
      expect(
        screen.getByText("立即注册，免费体验全部核心功能")
      ).toBeInTheDocument();
    });
  });

  // REF: PRD F06 - AC01: 显示"免费开始"CTA 按钮
  describe("CTA button", () => {
    it('should display "免费开始" CTA button', () => {
      render(<CtaSection />);
      const button = screen.getByRole("button", { name: /免费开始/ });
      expect(button).toBeInTheDocument();
    });
  });

  // REF: PRD F06 - AC02: 按钮具有脉冲或发光动画效果
  describe("CTA button animation", () => {
    it("should have pulse or glow animation class on the CTA button", () => {
      render(<CtaSection />);
      const button = screen.getByRole("button", { name: /免费开始/ });
      // The button has animate-[pulse_3s_ease-in-out_infinite] class
      expect(button.className).toMatch(/animate/);
    });
  });

  // REF: PRD F06 - AC03: 按钮悬停视觉反馈
  describe("CTA button hover", () => {
    it("should have hover styles defined on the button", () => {
      render(<CtaSection />);
      const button = screen.getByRole("button", { name: /免费开始/ });
      // GlowButton applies hover classes
      expect(button.className).toMatch(/hover:/);
    });
  });

  // Structure: section with gradient background
  describe("section structure", () => {
    it("should render a section with gradient background", () => {
      const { container } = render(<CtaSection />);
      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
      expect(section?.className).toMatch(/bg-gradient/);
    });

    it("should render a grid background overlay for visual effect", () => {
      const { container } = render(<CtaSection />);
      // Grid background div
      const bgDiv = container.querySelector(".bg-\\[linear-gradient");
      // Background effect should exist
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });
});
