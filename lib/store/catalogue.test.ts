import { describe, expect, it } from "vitest";
import { STORE_CATALOGUE } from "./catalogue";

describe("STORE_CATALOGUE", () => {
  it("has unique titles", () => {
    const titles = STORE_CATALOGUE.map((i) => i.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("is entirely free, matching the 'every course is free' promise", () => {
    expect(STORE_CATALOGUE.every((i) => i.pricePence === 0)).toBe(true);
  });

  it("every item has a description of at least 60 characters", () => {
    for (const i of STORE_CATALOGUE) expect(i.description.length).toBeGreaterThanOrEqual(60);
  });

  it("covers every store item type", () => {
    expect(new Set(STORE_CATALOGUE.map((i) => i.type))).toEqual(
      new Set(["COURSE", "DOCUMENT", "VIDEO", "AUDIO", "HISTORICAL_STORY"])
    );
  });

  it("contains no invented links", () => {
    expect(JSON.stringify(STORE_CATALOGUE)).not.toMatch(/https?:\/\//);
  });

  it("courses and story series have modules with durations", () => {
    for (const i of STORE_CATALOGUE.filter((x) => x.type === "COURSE" || x.type === "HISTORICAL_STORY")) {
      expect(i.modules.length).toBeGreaterThan(0);
      for (const m of i.modules) expect(m.durationMins).toBeGreaterThan(0);
    }
  });
});
