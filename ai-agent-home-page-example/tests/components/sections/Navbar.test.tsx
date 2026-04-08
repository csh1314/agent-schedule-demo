import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "@/components/sections/Navbar";

describe("Navbar", () => {
  // REF: PRD F02 - AC01: 导航栏固定显示在顶部
  describe("fixed positioning", () => {
    it("should have fixed positioning at the top", () => {
      const { container } = render(<Navbar />);
      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
      expect(nav?.className).toMatch(/fixed/);
      expect(nav?.className).toMatch(/top-0/);
    });
  });

  // REF: PRD F02 - AC01: 左侧显示 "AgentHub" Logo 文字
  describe("logo", () => {
    it('should display "AgentHub" logo text', () => {
      render(<Navbar />);
      expect(screen.getByText("AgentHub")).toBeInTheDocument();
    });
  });

  // REF: PRD F02 - AC01: 中间显示导航链接：功能特性、工作流程、技术亮点
  describe("navigation links", () => {
    it('should display navigation link "功能特性" (desktop and mobile)', () => {
      render(<Navbar />);
      const links = screen.getAllByText("功能特性");
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it('should display navigation link "工作流程" (desktop and mobile)', () => {
      render(<Navbar />);
      const links = screen.getAllByText("工作流程");
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it('should display navigation link "技术亮点" (desktop and mobile)', () => {
      render(<Navbar />);
      const links = screen.getAllByText("技术亮点");
      expect(links.length).toBeGreaterThanOrEqual(1);
    });
  });

  // REF: PRD F02 - AC01: 右侧显示"立即注册"按钮
  describe("CTA button", () => {
    it('should display "立即注册" CTA button', () => {
      render(<Navbar />);
      // There may be multiple (desktop + mobile), at least one should exist
      const buttons = screen.getAllByText("立即注册");
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  // REF: PRD F02 - AC02: 用户向下滚动页面超过 50px，导航栏背景变为半透明深色并带有 backdrop-blur
  describe("scroll behavior", () => {
    beforeEach(() => {
      Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
    });

    it("should start with transparent background when not scrolled", () => {
      const { container } = render(<Navbar />);
      const nav = container.querySelector("nav");
      expect(nav?.className).toMatch(/bg-transparent/);
    });

    it("should add backdrop-blur class after scrolling past 50px", () => {
      const { container } = render(<Navbar />);
      const nav = container.querySelector("nav");

      // Simulate scroll past 50px
      Object.defineProperty(window, "scrollY", { value: 60, writable: true, configurable: true });
      fireEvent.scroll(window);

      expect(nav?.className).toMatch(/backdrop-blur/);
    });
  });

  // REF: PRD F02 - AC03: 用户点击"功能特性"导航链接，页面平滑滚动到核心能力展示区
  describe("navigation click behavior", () => {
    it('should scroll to #features when "功能特性" is clicked', () => {
      const featuresEl = document.createElement("div");
      featuresEl.id = "features";
      document.body.appendChild(featuresEl);
      const scrollSpy = vi.spyOn(featuresEl, "scrollIntoView");

      render(<Navbar />);
      const link = screen.getAllByText("功能特性")[0]!;
      fireEvent.click(link);

      expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth" });

      document.body.removeChild(featuresEl);
      scrollSpy.mockRestore();
    });

    // REF: PRD F02 - AC04: 用户点击"工作流程"导航链接
    it('should scroll to #workflow when "工作流程" is clicked', () => {
      const workflowEl = document.createElement("div");
      workflowEl.id = "workflow";
      document.body.appendChild(workflowEl);
      const scrollSpy = vi.spyOn(workflowEl, "scrollIntoView");

      render(<Navbar />);
      const link = screen.getAllByText("工作流程")[0]!;
      fireEvent.click(link);

      expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth" });

      document.body.removeChild(workflowEl);
      scrollSpy.mockRestore();
    });

    // REF: PRD F02 - AC05: 用户点击"技术亮点"导航链接
    it('should scroll to #tech-highlights when "技术亮点" is clicked', () => {
      const techEl = document.createElement("div");
      techEl.id = "tech-highlights";
      document.body.appendChild(techEl);
      const scrollSpy = vi.spyOn(techEl, "scrollIntoView");

      render(<Navbar />);
      const link = screen.getAllByText("技术亮点")[0]!;
      fireEvent.click(link);

      expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth" });

      document.body.removeChild(techEl);
      scrollSpy.mockRestore();
    });
  });

  // REF: PRD F10 - AC01: 视口宽度 < 768px 时导航链接隐藏，显示汉堡菜单按钮
  describe("mobile hamburger menu", () => {
    it("should render a hamburger menu button with aria-label", () => {
      render(<Navbar />);
      const hamburger = screen.getByLabelText(/打开菜单|关闭菜单/);
      expect(hamburger).toBeInTheDocument();
    });

    // REF: PRD F10 - AC02: 用户点击汉堡菜单按钮，展开移动端导航菜单
    it("should toggle mobile menu open when hamburger is clicked", () => {
      const { container } = render(<Navbar />);
      const hamburger = screen.getByLabelText("打开菜单");

      fireEvent.click(hamburger);

      // After clicking, aria-expanded should be true
      expect(hamburger).toHaveAttribute("aria-expanded", "true");
    });

    // REF: PRD F10 - AC03: 用户点击某个导航链接，菜单收起
    it("should close mobile menu when a navigation link is clicked", () => {
      render(<Navbar />);
      const hamburger = screen.getByLabelText("打开菜单");

      // Open menu
      fireEvent.click(hamburger);
      expect(hamburger).toHaveAttribute("aria-expanded", "true");

      // Click a nav link in mobile menu (there are duplicate links for desktop/mobile)
      const links = screen.getAllByText("功能特性");
      // Click the last one (mobile menu)
      fireEvent.click(links[links.length - 1]!);

      // Menu should close -- aria-expanded becomes false
      expect(
        screen.getByLabelText(/打开菜单|关闭菜单/)
      ).toHaveAttribute("aria-expanded", "false");
    });
  });

  // Cleanup scroll listener
  describe("cleanup", () => {
    it("should add and remove scroll event listener", () => {
      const addSpy = vi.spyOn(window, "addEventListener");
      const removeSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = render(<Navbar />);

      expect(addSpy).toHaveBeenCalledWith("scroll", expect.any(Function));

      unmount();

      expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));

      addSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });
});
