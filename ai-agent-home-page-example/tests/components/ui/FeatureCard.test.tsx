import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureCard } from "@/components/ui/FeatureCard";

describe("FeatureCard", () => {
  const defaultProps = {
    icon: "🤖",
    title: "Test Feature",
    description: "This is a test description",
  };

  // REF: PRD F03 - AC01: 每张卡片包含图标、标题和描述文字
  describe("card content", () => {
    it("should render the icon", () => {
      render(<FeatureCard {...defaultProps} />);
      expect(screen.getByText("🤖")).toBeInTheDocument();
    });

    it("should render the title", () => {
      render(<FeatureCard {...defaultProps} />);
      expect(screen.getByText("Test Feature")).toBeInTheDocument();
    });

    it("should render the description", () => {
      render(<FeatureCard {...defaultProps} />);
      expect(screen.getByText("This is a test description")).toBeInTheDocument();
    });

    it("should render title as h3 heading", () => {
      render(<FeatureCard {...defaultProps} />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Test Feature");
    });
  });

  // REF: PRD F03 - AC03: hover effects (translateY + border glow)
  describe("hover effects", () => {
    it("should have hover:-translate-y class for upward movement", () => {
      const { container } = render(<FeatureCard {...defaultProps} />);
      const card = container.firstElementChild;
      expect(card?.className).toMatch(/hover:-translate-y/);
    });

    it("should have hover border glow class", () => {
      const { container } = render(<FeatureCard {...defaultProps} />);
      const card = container.firstElementChild;
      expect(card?.className).toMatch(/hover:border-purple/);
    });

    it("should have hover shadow glow effect", () => {
      const { container } = render(<FeatureCard {...defaultProps} />);
      const card = container.firstElementChild;
      expect(card?.className).toMatch(/hover:shadow/);
    });
  });

  // Card styling
  describe("card styling", () => {
    it("should have semi-transparent dark background", () => {
      const { container } = render(<FeatureCard {...defaultProps} />);
      const card = container.firstElementChild;
      expect(card?.className).toMatch(/bg-slate-800/);
    });

    it("should have border styling", () => {
      const { container } = render(<FeatureCard {...defaultProps} />);
      const card = container.firstElementChild;
      expect(card?.className).toMatch(/border/);
    });

    it("should accept custom className", () => {
      const { container } = render(
        <FeatureCard {...defaultProps} className="custom-class" />
      );
      const card = container.firstElementChild;
      expect(card?.className).toMatch(/custom-class/);
    });
  });
});
