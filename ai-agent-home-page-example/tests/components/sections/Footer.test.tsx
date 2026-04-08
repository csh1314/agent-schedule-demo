import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/sections/Footer";

describe("Footer", () => {
  // REF: PRD F07 - AC01: 显示 "AgentHub" Logo 文字
  describe("logo", () => {
    it('should display "AgentHub" logo text', () => {
      render(<Footer />);
      expect(screen.getByText("AgentHub")).toBeInTheDocument();
    });
  });

  // REF: PRD F07 - AC01: 显示版权信息文字包含 "2026" 和 "AgentHub"
  describe("copyright", () => {
    it('should display copyright text containing "2026" and "AgentHub"', () => {
      render(<Footer />);
      const copyright = screen.getByText(/Copyright.*2026.*AgentHub/);
      expect(copyright).toBeInTheDocument();
    });

    it("should display 'All rights reserved' text", () => {
      render(<Footer />);
      expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
    });
  });

  // REF: PRD F07 - AC01: 显示链接分组
  describe("link groups", () => {
    it('should display "产品" link group with its links', () => {
      render(<Footer />);
      expect(screen.getByText("产品")).toBeInTheDocument();
      expect(screen.getByText("功能介绍")).toBeInTheDocument();
      expect(screen.getByText("定价方案")).toBeInTheDocument();
      expect(screen.getByText("更新日志")).toBeInTheDocument();
    });

    it('should display "资源" link group with its links', () => {
      render(<Footer />);
      expect(screen.getByText("资源")).toBeInTheDocument();
      expect(screen.getByText("开发文档")).toBeInTheDocument();
      expect(screen.getByText("API 参考")).toBeInTheDocument();
      expect(screen.getByText("社区论坛")).toBeInTheDocument();
    });

    it('should display "公司" link group with its links', () => {
      render(<Footer />);
      expect(screen.getByText("公司")).toBeInTheDocument();
      expect(screen.getByText("关于我们")).toBeInTheDocument();
      expect(screen.getByText("加入团队")).toBeInTheDocument();
      expect(screen.getByText("联系我们")).toBeInTheDocument();
    });
  });

  // Structure
  describe("structure", () => {
    it("should render a footer element", () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector("footer");
      expect(footer).toBeInTheDocument();
    });

    it("should render footer links as anchor elements", () => {
      const { container } = render(<Footer />);
      const links = container.querySelectorAll("footer a");
      // Logo + 9 footer links = 10 total anchor elements
      expect(links.length).toBeGreaterThanOrEqual(9);
    });
  });
});
