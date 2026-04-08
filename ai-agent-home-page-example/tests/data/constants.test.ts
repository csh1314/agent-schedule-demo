import { describe, it, expect } from "vitest";
import {
  NAV_LINKS,
  FEATURES,
  WORKFLOW_STEPS,
  TECH_ADVANTAGES,
  METRICS,
  FOOTER_GROUPS,
  PARTICLE_CONFIG,
} from "@/data/constants";

describe("Static Data Constants", () => {
  // REF: PRD F02 - Navigation links
  describe("NAV_LINKS", () => {
    it("should contain exactly 3 navigation links", () => {
      expect(NAV_LINKS).toHaveLength(3);
    });

    it("should include links for all sections: features, workflow, tech-highlights", () => {
      const labels = NAV_LINKS.map((l) => l.label);
      expect(labels).toContain("功能特性");
      expect(labels).toContain("工作流程");
      expect(labels).toContain("技术亮点");
    });

    it("should have valid anchor hrefs starting with #", () => {
      NAV_LINKS.forEach((link) => {
        expect(link.href).toMatch(/^#/);
      });
    });
  });

  // REF: PRD F03 - Feature cards
  describe("FEATURES", () => {
    it("should contain exactly 4 features", () => {
      expect(FEATURES).toHaveLength(4);
    });

    it("should have correct feature titles matching PRD", () => {
      const titles = FEATURES.map((f) => f.title);
      expect(titles).toEqual(["智能对话", "任务自动化", "多 Agent 协作", "知识检索"]);
    });

    it("should have non-empty icon and description for each feature", () => {
      FEATURES.forEach((feature) => {
        expect(feature.icon).toBeTruthy();
        expect(feature.description.length).toBeGreaterThan(0);
      });
    });
  });

  // REF: PRD F04 - Workflow steps
  describe("WORKFLOW_STEPS", () => {
    it("should contain exactly 3 steps", () => {
      expect(WORKFLOW_STEPS).toHaveLength(3);
    });

    it("should have sequential step numbers 1, 2, 3", () => {
      expect(WORKFLOW_STEPS.map((s) => s.step)).toEqual([1, 2, 3]);
    });

    it("should have correct step titles matching PRD", () => {
      const titles = WORKFLOW_STEPS.map((s) => s.title);
      expect(titles).toEqual(["描述需求", "Agent 规划", "自动执行"]);
    });

    it("should have non-empty description for each step", () => {
      WORKFLOW_STEPS.forEach((step) => {
        expect(step.description.length).toBeGreaterThan(0);
      });
    });
  });

  // REF: PRD F05 - Tech advantages
  describe("TECH_ADVANTAGES", () => {
    it("should contain exactly 3 tech advantages", () => {
      expect(TECH_ADVANTAGES).toHaveLength(3);
    });

    it("should have correct titles matching PRD", () => {
      const titles = TECH_ADVANTAGES.map((a) => a.title);
      expect(titles).toEqual(["极速响应", "安全可靠", "无限扩展"]);
    });
  });

  // REF: PRD F05 - Metrics panel
  describe("METRICS", () => {
    it("should contain exactly 4 metrics", () => {
      expect(METRICS).toHaveLength(4);
    });

    it("should include response speed metric with prefix '<'", () => {
      const speed = METRICS.find((m) => m.label === "响应速度");
      expect(speed).toBeDefined();
      expect(speed?.value).toBe(100);
      expect(speed?.suffix).toBe("ms");
      expect(speed?.prefix).toBe("<");
    });

    it("should include task success rate metric 99.9%", () => {
      const rate = METRICS.find((m) => m.label === "任务成功率");
      expect(rate).toBeDefined();
      expect(rate?.value).toBe(99.9);
      expect(rate?.suffix).toBe("%");
    });

    it("should include user count metric 100K+", () => {
      const users = METRICS.find((m) => m.label === "已服务用户");
      expect(users).toBeDefined();
      expect(users?.value).toBe(100);
      expect(users?.suffix).toBe("K+");
    });

    it("should include agent count metric 50+", () => {
      const agents = METRICS.find((m) => m.label === "Agent 数量");
      expect(agents).toBeDefined();
      expect(agents?.value).toBe(50);
      expect(agents?.suffix).toBe("+");
    });
  });

  // REF: PRD F07 - Footer groups
  describe("FOOTER_GROUPS", () => {
    it("should contain exactly 3 footer groups", () => {
      expect(FOOTER_GROUPS).toHaveLength(3);
    });

    it("should have group titles: 产品, 资源, 公司", () => {
      const titles = FOOTER_GROUPS.map((g) => g.title);
      expect(titles).toEqual(["产品", "资源", "公司"]);
    });

    it("should have 3 links per group", () => {
      FOOTER_GROUPS.forEach((group) => {
        expect(group.links).toHaveLength(3);
      });
    });

    it("should have valid link structure with label and href", () => {
      FOOTER_GROUPS.forEach((group) => {
        group.links.forEach((link) => {
          expect(link.label).toBeTruthy();
          expect(link.href).toBeDefined();
        });
      });
    });
  });

  // REF: PRD F08 - Particle config
  describe("PARTICLE_CONFIG", () => {
    it("should have reasonable particle count (50-80 as per PRD)", () => {
      expect(PARTICLE_CONFIG.count).toBeGreaterThanOrEqual(50);
      expect(PARTICLE_CONFIG.count).toBeLessThanOrEqual(80);
    });

    it("should have a valid CSS color string", () => {
      expect(PARTICLE_CONFIG.color).toMatch(/rgba?\(/);
    });

    it("should have positive maxRadius and maxSpeed", () => {
      expect(PARTICLE_CONFIG.maxRadius).toBeGreaterThan(0);
      expect(PARTICLE_CONFIG.maxSpeed).toBeGreaterThan(0);
    });

    it("should have positive linkDistance", () => {
      expect(PARTICLE_CONFIG.linkDistance).toBeGreaterThan(0);
    });
  });
});
