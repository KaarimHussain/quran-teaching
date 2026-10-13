import { describe, expect, it } from "vitest";
import { computeModuleAccess, type AccessModule } from "./access";

const mod = (id: string, levelNumber: number | null, moduleOrder: number, isGated = true): AccessModule => ({
  id,
  levelNumber,
  moduleOrder,
  isGated,
});

const states = (modules: AccessModule[], signed: string[]) => {
  const map = computeModuleAccess(modules, new Set(signed));
  return modules.map((m) => map.get(m.id));
};

describe("computeModuleAccess", () => {
  const path = [mod("m1", 1, 0), mod("m2", 1, 1), mod("m3", 1, 2)];

  it("first module unlocked, rest locked when nothing signed off", () => {
    expect(states(path, [])).toEqual(["unlocked", "locked", "locked"]);
  });

  it("signing off module 1 unlocks module 2 only", () => {
    expect(states(path, ["m1"])).toEqual(["completed", "unlocked", "locked"]);
  });

  it("ungated module never blocks next", () => {
    expect(states([mod("a", 1, 0, false), mod("b", 1, 1)], [])).toEqual(["unlocked", "unlocked"]);
  });

  it("ordering crosses levels regardless of input order", () => {
    const modules = [mod("l2a", 2, 0), mod("l1b", 1, 1), mod("l1a", 1, 0)];
    expect(states(modules, ["l1a"])).toEqual(["locked", "unlocked", "completed"]);
    expect(states(modules, ["l1a", "l1b"])).toEqual(["unlocked", "completed", "completed"]);
  });

  it("revoked earlier signoff relocks later modules", () => {
    expect(states(path, ["m3"])).toEqual(["unlocked", "locked", "completed"]);
  });

  it("legacy modules are always unlocked", () => {
    expect(states([mod("legacy", null, 0), ...path], [])).toEqual(["unlocked", "unlocked", "locked", "locked"]);
    expect(states([mod("legacy", null, 0)], ["legacy"])).toEqual(["completed"]);
  });

  it("empty path returns empty map", () => {
    expect(computeModuleAccess([], new Set()).size).toBe(0);
  });
});
