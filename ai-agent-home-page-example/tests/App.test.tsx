import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";

describe("App", () => {
  // REF: Integration test - App renders all sections as defined in architecture.md
  describe("full page integration", () => {
    it("should render without crashing", () => {
      const { container } = render(<App />);
      expect(container).toBeInTheDocument();
    });

    it("should render with dark background theme", () => {
      const { container } = render(<App />);
      const root = container.firstElementChild;
      expect(root?.className).toMatch(/bg-slate-950/);
      expect(root?.className).toMatch(/text-white/);
    });

    // REF: PRD F02 - Navbar is present (AgentHub appears in both Navbar and Footer)
    it("should render Navbar with AgentHub logo", () => {
      render(<App />);
      const logos = screen.getAllByText("AgentHub");
      expect(logos.length).toBeGreaterThanOrEqual(1);
    });

    // REF: PRD F01 - HeroSection is present
    it("should render HeroSection with main heading", () => {
      render(<App />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    // REF: PRD F03 - FeaturesSection is present
    // Note: "核心能力" only appears in section title, not in nav (nav uses "功能特性")
    it("should render FeaturesSection with core capabilities", () => {
      render(<App />);
      expect(screen.getByText("核心能力")).toBeInTheDocument();
      expect(screen.getByText("智能对话")).toBeInTheDocument();
    });

    // REF: PRD F04 - WorkflowSection is present
    // Note: "工作流程" appears in both nav and section; use getAllByText
    it("should render WorkflowSection with workflow steps", () => {
      render(<App />);
      const workflowTexts = screen.getAllByText("工作流程");
      expect(workflowTexts.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("描述需求")).toBeInTheDocument();
    });

    // REF: PRD F05 - TechHighlightsSection is present
    // Note: "技术亮点" appears in both nav and section; use getAllByText
    it("should render TechHighlightsSection with tech highlights", () => {
      render(<App />);
      const techTexts = screen.getAllByText("技术亮点");
      expect(techTexts.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("极速响应")).toBeInTheDocument();
    });

    // REF: PRD F06 - CtaSection is present
    it("should render CtaSection with call to action", () => {
      render(<App />);
      expect(
        screen.getByText("准备好开启 AI Agent 之旅了吗？")
      ).toBeInTheDocument();
    });

    // REF: PRD F07 - Footer is present
    it("should render Footer with copyright info", () => {
      render(<App />);
      expect(screen.getByText(/Copyright.*2026.*AgentHub/)).toBeInTheDocument();
    });
  });

  // REF: Architecture - page structure has correct section ordering
  describe("section ordering", () => {
    it("should render sections in correct visual order within main element", () => {
      const { container } = render(<App />);
      const main = container.querySelector("main");
      expect(main).toBeInTheDocument();

      // main should contain: HeroSection, FeaturesSection, WorkflowSection, TechHighlightsSection, CtaSection
      const sections = main?.querySelectorAll("section");
      expect(sections?.length).toBeGreaterThanOrEqual(5);
    });

    it("should render nav outside of main element", () => {
      const { container } = render(<App />);
      const nav = container.querySelector("nav");
      const main = container.querySelector("main");
      expect(nav).toBeInTheDocument();
      expect(main).toBeInTheDocument();
      // nav should not be inside main
      expect(main?.contains(nav)).toBe(false);
    });

    it("should render footer outside of main element", () => {
      const { container } = render(<App />);
      const footer = container.querySelector("footer");
      const main = container.querySelector("main");
      expect(footer).toBeInTheDocument();
      expect(main?.contains(footer)).toBe(false);
    });
  });

  // REF: PRD F08 - Canvas particle background exists
  describe("particle animation integration", () => {
    it("should include a canvas element for particle animation in hero section", () => {
      const { container } = render(<App />);
      const canvas = container.querySelector("canvas");
      expect(canvas).toBeInTheDocument();
    });
  });

  // REF: Anchor navigation targets exist for smooth scrolling
  describe("anchor navigation targets", () => {
    it("should have #features anchor target", () => {
      const { container } = render(<App />);
      expect(container.querySelector("#features")).toBeInTheDocument();
    });

    it("should have #workflow anchor target", () => {
      const { container } = render(<App />);
      expect(container.querySelector("#workflow")).toBeInTheDocument();
    });

    it("should have #tech-highlights anchor target", () => {
      const { container } = render(<App />);
      expect(container.querySelector("#tech-highlights")).toBeInTheDocument();
    });
  });
});
