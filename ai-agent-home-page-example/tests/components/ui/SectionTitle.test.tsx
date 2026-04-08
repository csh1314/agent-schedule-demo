import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionTitle } from "@/components/ui/SectionTitle";

describe("SectionTitle", () => {
  // REF: PRD F03/F04/F05 - Section titles with gradient effect
  describe("title rendering", () => {
    it("should render the title text as h2 heading", () => {
      render(<SectionTitle title="Test Title" />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Test Title");
    });

    it("should apply gradient text styling to the title", () => {
      render(<SectionTitle title="Test Title" />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading.className).toMatch(/bg-gradient-to-r/);
      expect(heading.className).toMatch(/bg-clip-text/);
      expect(heading.className).toMatch(/text-transparent/);
    });
  });

  // Subtitle
  describe("subtitle rendering", () => {
    it("should render subtitle when provided", () => {
      render(<SectionTitle title="Title" subtitle="Subtitle text" />);
      expect(screen.getByText("Subtitle text")).toBeInTheDocument();
    });

    it("should not render subtitle paragraph when not provided", () => {
      const { container } = render(<SectionTitle title="Title" />);
      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs.length).toBe(0);
    });
  });

  // Custom className
  describe("custom className", () => {
    it("should accept and apply custom className", () => {
      const { container } = render(
        <SectionTitle title="Title" className="custom-class" />
      );
      const wrapper = container.firstElementChild;
      expect(wrapper?.className).toMatch(/custom-class/);
    });
  });
});
