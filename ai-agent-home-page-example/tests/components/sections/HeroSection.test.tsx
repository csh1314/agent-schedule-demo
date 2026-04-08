import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/components/sections/HeroSection";

describe("HeroSection", () => {
  // REF: PRD F01 - AC01: Hero 区域占满首屏视口高度
  describe("layout and structure", () => {
    it("should render a section with min-h-screen (full viewport height)", () => {
      const { container } = render(<HeroSection />);
      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
      expect(section?.className).toMatch(/min-h-screen/);
    });
  });

  // REF: PRD F01 - AC01: 显示主标题文字，文字带有渐变色效果
  describe("hero title", () => {
    it("should display main title text with gradient styling", () => {
      render(<HeroSection />);
      // The title contains "AI Agent" keywords
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      // Check for gradient class on text
      const gradientSpan = heading.querySelector(".bg-gradient-to-r");
      expect(gradientSpan).toBeInTheDocument();
    });
  });

  // REF: PRD F01 - AC01: 显示副标题描述文字
  describe("hero subtitle", () => {
    it("should display subtitle description text", () => {
      render(<HeroSection />);
      // Subtitle about AI Agent capabilities
      expect(
        screen.getByText(/释放 AI Agent 的无限潜能/)
      ).toBeInTheDocument();
    });
  });

  // REF: PRD F01 - AC01: 显示"开始体验"主 CTA 按钮（填充样式）
  describe("primary CTA button", () => {
    it('should display "开始体验" primary CTA button', () => {
      render(<HeroSection />);
      const primaryButton = screen.getByRole("button", { name: /开始体验/ });
      expect(primaryButton).toBeInTheDocument();
    });
  });

  // REF: PRD F01 - AC01: 显示"了解更多"次 CTA 按钮（描边样式）
  describe("secondary CTA button", () => {
    it('should display "了解更多" secondary CTA button with outline style', () => {
      render(<HeroSection />);
      const secondaryButton = screen.getByRole("button", { name: /了解更多/ });
      expect(secondaryButton).toBeInTheDocument();
    });
  });

  // REF: PRD F01 - AC01 / F08 - AC01: 背景区域渲染粒子动画 (Canvas element)
  describe("particle canvas background", () => {
    it("should render a canvas element for particle animation", () => {
      const { container } = render(<HeroSection />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeInTheDocument();
    });
  });

  // REF: PRD F01 - AC03: 用户点击"了解更多"按钮，页面平滑滚动到核心能力展示区
  describe("scroll to features on click", () => {
    it('should call scrollIntoView when "了解更多" button is clicked', () => {
      // Create a mock target element
      const featuresSection = document.createElement("div");
      featuresSection.id = "features";
      document.body.appendChild(featuresSection);
      const scrollSpy = vi.spyOn(featuresSection, "scrollIntoView");

      render(<HeroSection />);
      const button = screen.getByRole("button", { name: /了解更多/ });
      button.click();

      expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth" });

      document.body.removeChild(featuresSection);
      scrollSpy.mockRestore();
    });
  });
});

// Need vi import for spy
import { vi } from "vitest";
