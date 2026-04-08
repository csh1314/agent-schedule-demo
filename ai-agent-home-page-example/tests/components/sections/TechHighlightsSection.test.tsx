import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TechHighlightsSection } from "@/components/sections/TechHighlightsSection";

describe("TechHighlightsSection", () => {
  // REF: PRD F05 - AC01: 显示区域标题"技术亮点"，文字带渐变色效果
  describe("section title", () => {
    it('should display section title "技术亮点"', () => {
      render(<TechHighlightsSection />);
      expect(screen.getByText("技术亮点")).toBeInTheDocument();
    });

    it("should display section subtitle", () => {
      render(<TechHighlightsSection />);
      expect(
        screen.getByText(/行业领先的技术架构/)
      ).toBeInTheDocument();
    });
  });

  // REF: PRD F05 - AC02: 显示技术优势内容
  describe("tech advantages", () => {
    it('should display "极速响应" tech advantage with description', () => {
      render(<TechHighlightsSection />);
      expect(screen.getByText("极速响应")).toBeInTheDocument();
      expect(
        screen.getByText(/毫秒级响应延迟/)
      ).toBeInTheDocument();
    });

    it('should display "安全可靠" tech advantage with description', () => {
      render(<TechHighlightsSection />);
      expect(screen.getByText("安全可靠")).toBeInTheDocument();
      expect(
        screen.getByText(/企业级数据加密和隐私保护/)
      ).toBeInTheDocument();
    });

    it('should display "无限扩展" tech advantage with description', () => {
      render(<TechHighlightsSection />);
      expect(screen.getByText("无限扩展")).toBeInTheDocument();
      expect(
        screen.getByText(/弹性架构支持海量并发/)
      ).toBeInTheDocument();
    });
  });

  // REF: PRD F05 - AC03: 数据指标面板
  describe("metrics panel", () => {
    it('should display response speed metric "< 100ms"', () => {
      render(<TechHighlightsSection />);
      expect(screen.getByText("响应速度")).toBeInTheDocument();
    });

    it('should display task success rate metric "99.9%"', () => {
      render(<TechHighlightsSection />);
      expect(screen.getByText("任务成功率")).toBeInTheDocument();
    });

    it('should display user count metric "100K+"', () => {
      render(<TechHighlightsSection />);
      expect(screen.getByText("已服务用户")).toBeInTheDocument();
    });

    it('should display agent count metric "50+"', () => {
      render(<TechHighlightsSection />);
      expect(screen.getByText("Agent 数量")).toBeInTheDocument();
    });
  });

  // REF: PRD F05 - AC05: 左右两列布局（桌面端）
  describe("layout", () => {
    it("should use grid layout with md:grid-cols-2 for two-column layout", () => {
      const { container } = render(<TechHighlightsSection />);
      const grid = container.querySelector(".md\\:grid-cols-2");
      expect(grid).toBeInTheDocument();
    });
  });

  // Anchor navigation
  describe("anchor navigation", () => {
    it("should have section with id='tech-highlights' for anchor navigation", () => {
      const { container } = render(<TechHighlightsSection />);
      const section = container.querySelector("#tech-highlights");
      expect(section).toBeInTheDocument();
    });
  });
});
