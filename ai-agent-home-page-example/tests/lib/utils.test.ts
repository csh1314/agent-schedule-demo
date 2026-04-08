import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  // Unit test: cn merges Tailwind classes correctly
  describe("basic class merging", () => {
    it("should merge multiple class strings", () => {
      const result = cn("flex", "items-center");
      expect(result).toBe("flex items-center");
    });

    it("should handle a single class string", () => {
      const result = cn("flex");
      expect(result).toBe("flex");
    });

    it("should return empty string for no arguments", () => {
      const result = cn();
      expect(result).toBe("");
    });
  });

  // Tailwind conflict resolution via tailwind-merge
  describe("Tailwind class conflict resolution", () => {
    it("should resolve conflicting Tailwind classes (last wins)", () => {
      const result = cn("p-4", "p-8");
      expect(result).toBe("p-8");
    });

    it("should resolve conflicting text color classes", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });

    it("should keep non-conflicting classes intact", () => {
      const result = cn("flex", "p-4", "text-white");
      expect(result).toContain("flex");
      expect(result).toContain("p-4");
      expect(result).toContain("text-white");
    });
  });

  // Conditional class support (clsx integration)
  describe("conditional classes", () => {
    it("should handle conditional objects", () => {
      const result = cn("flex", { "bg-red-500": true, "bg-blue-500": false });
      expect(result).toContain("flex");
      expect(result).toContain("bg-red-500");
      expect(result).not.toContain("bg-blue-500");
    });

    it("should handle undefined and null values", () => {
      const result = cn("flex", undefined, null, "p-4");
      expect(result).toBe("flex p-4");
    });

    it("should handle false and empty string values", () => {
      const result = cn("flex", false, "", "p-4");
      expect(result).toBe("flex p-4");
    });
  });
});
