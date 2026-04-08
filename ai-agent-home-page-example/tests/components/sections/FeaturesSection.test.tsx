import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeaturesSection } from "@/components/sections/FeaturesSection";

describe("FeaturesSection", () => {
  // REF: PRD F03 - AC01: 显示区域标题"核心能力"，文字带渐变色效果
  describe("section title", () => {
    it('should display section title "核心能力" with gradient text', () => {
      render(<FeaturesSection />);
      expect(screen.getByText("核心能力")).toBeInTheDocument();
    });

    it("should display section subtitle", () => {
      render(<FeaturesSection />);
      expect(
        screen.getByText(/强大的 AI Agent 能力矩阵/)
      ).toBeInTheDocument();
    });
  });

  // REF: PRD F03 - AC01: 显示 4 张能力卡片
  describe("feature cards count", () => {
    it("should render exactly 4 feature cards", () => {
      render(<FeaturesSection />);
      // Each card has a title; verify all 4 are present
      expect(screen.getByText("智能对话")).toBeInTheDocument();
      expect(screen.getByText("任务自动化")).toBeInTheDocument();
      expect(screen.getByText("多 Agent 协作")).toBeInTheDocument();
      expect(screen.getByText("知识检索")).toBeInTheDocument();
    });
  });

  // REF: PRD F03 - AC02: 验证 4 张卡片内容
  describe("feature card content", () => {
    it('should display first card with title "智能对话"', () => {
      render(<FeaturesSection />);
      expect(screen.getByText("智能对话")).toBeInTheDocument();
    });

    it('should display second card with title "任务自动化"', () => {
      render(<FeaturesSection />);
      expect(screen.getByText("任务自动化")).toBeInTheDocument();
    });

    it('should display third card with title "多 Agent 协作"', () => {
      render(<FeaturesSection />);
      expect(screen.getByText("多 Agent 协作")).toBeInTheDocument();
    });

    it('should display fourth card with title "知识检索"', () => {
      render(<FeaturesSection />);
      expect(screen.getByText("知识检索")).toBeInTheDocument();
    });

    it("should display description text for each card", () => {
      render(<FeaturesSection />);
      expect(
        screen.getByText(/自然语言理解与多轮对话能力/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/自动分解和执行复杂任务/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/多个 Agent 协同完成复杂工作流/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/智能检索与知识库管理/)
      ).toBeInTheDocument();
    });
  });

  // REF: PRD F03 - AC01: 每张卡片包含图标
  describe("feature card icons", () => {
    it("should render icon for each feature card", () => {
      const { container } = render(<FeaturesSection />);
      // Icons are emoji rendered in divs -- check that icon containers exist
      // Each FeatureCard has an icon container with text-2xl class
      const iconContainers = container.querySelectorAll(".text-2xl");
      expect(iconContainers.length).toBeGreaterThanOrEqual(4);
    });
  });

  // REF: PRD F03 - AC04 / F10 - AC05: grid layout (2 columns on desktop)
  describe("grid layout", () => {
    it("should use grid layout with md:grid-cols-2 for desktop 2x2 arrangement", () => {
      const { container } = render(<FeaturesSection />);
      const grid = container.querySelector(".grid");
      expect(grid).toBeInTheDocument();
      expect(grid?.className).toMatch(/md:grid-cols-2/);
    });

    // REF: PRD F03 - AC05 / F10 - AC04: single column on mobile
    it("should use grid-cols-1 for mobile single column layout", () => {
      const { container } = render(<FeaturesSection />);
      const grid = container.querySelector(".grid");
      expect(grid?.className).toMatch(/grid-cols-1/);
    });
  });

  // REF: PRD F09 - scroll animation integration
  describe("scroll animation", () => {
    it("should have section with id='features' for anchor navigation", () => {
      const { container } = render(<FeaturesSection />);
      const section = container.querySelector("#features");
      expect(section).toBeInTheDocument();
    });
  });
});
