import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkflowStepCard } from "@/components/ui/WorkflowStepCard";

describe("WorkflowStepCard", () => {
  const defaultProps = {
    step: 1,
    title: "Step Title",
    description: "Step description text",
  };

  // REF: PRD F04 - AC02: 步骤编号、标题、描述
  describe("step content", () => {
    it("should render the step number", () => {
      render(<WorkflowStepCard {...defaultProps} />);
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("should render the step title", () => {
      render(<WorkflowStepCard {...defaultProps} />);
      expect(screen.getByText("Step Title")).toBeInTheDocument();
    });

    it("should render the step description", () => {
      render(<WorkflowStepCard {...defaultProps} />);
      expect(screen.getByText("Step description text")).toBeInTheDocument();
    });

    it("should render title as h3 heading", () => {
      render(<WorkflowStepCard {...defaultProps} />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Step Title");
    });
  });

  // REF: PRD F04 - step number circle with gradient
  describe("step number circle", () => {
    it("should render step number in a gradient circle", () => {
      render(<WorkflowStepCard {...defaultProps} />);
      // The step number is inside a rounded-full gradient circle
      const stepNumber = screen.getByText("1");
      expect(stepNumber).toBeInTheDocument();
      // Verify it's inside a circle element with gradient background
      const circle = stepNumber.closest(".rounded-full");
      expect(circle).toBeInTheDocument();
      expect(circle?.className).toMatch(/bg-gradient/);
    });
  });

  // REF: PRD F04 - AC03: connector lines between steps
  describe("connector line", () => {
    it("should render connector line when isLast is false (default)", () => {
      const { container } = render(<WorkflowStepCard {...defaultProps} />);
      // Connector is a hidden md:block element
      const connector = container.querySelector(".md\\:block");
      expect(connector).toBeInTheDocument();
    });

    it("should not render connector line when isLast is true", () => {
      const { container } = render(
        <WorkflowStepCard {...defaultProps} isLast={true} />
      );
      // When isLast, no connector div should be rendered
      const connectors = container.querySelectorAll(".md\\:block.h-px");
      expect(connectors.length).toBe(0);
    });
  });

  // Custom className
  describe("custom className", () => {
    it("should accept and apply custom className", () => {
      const { container } = render(
        <WorkflowStepCard {...defaultProps} className="my-custom" />
      );
      const wrapper = container.firstElementChild;
      expect(wrapper?.className).toMatch(/my-custom/);
    });
  });
});
