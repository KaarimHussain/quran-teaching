import { describe, expect, it } from "vitest";
import { CURRICULUM } from "./data";
import { planSeed } from "./seed-plan";

const totalModules = CURRICULUM.reduce((n, l) => n + l.modules.length, 0);

describe("planSeed", () => {
  it("creates everything on empty db", () => {
    const plan = planSeed(CURRICULUM, new Set(), new Set());
    expect(plan.levelsToCreate).toHaveLength(22);
    expect(plan.modulesToCreate).toHaveLength(totalModules);
  });

  it("seed plan skips existing codes", () => {
    const plan = planSeed(CURRICULUM, new Set([1]), new Set(["1.1"]));
    const codes = plan.modulesToCreate.map((m) => m.module.code);
    expect(codes).not.toContain("1.1");
    expect(codes).toContain("1.2");
    expect(plan.levelsToCreate.map((l) => l.number)).not.toContain(1);
    expect(plan.modulesToCreate).toHaveLength(totalModules - 1);
  });

  it("moduleOrder is index within level", () => {
    const plan = planSeed(CURRICULUM, new Set(), new Set());
    const l2 = plan.modulesToCreate.filter((m) => m.levelNumber === 2);
    expect(l2.map((m) => [m.module.code, m.moduleOrder])).toEqual([
      ["2.1", 0],
      ["2.2", 1],
      ["2.3", 2],
      ["2.4", 3],
    ]);
  });
});
