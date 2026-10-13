import { describe, expect, it } from "vitest";
import { CURRICULUM, STAGES, TRACK_COURSES } from "./data";

const IJAZAH_DISCLAIMER =
  "An Ijazah should only be represented as an actual Ijazah where it is granted by an appropriately qualified scholar/teacher according to the relevant tradition; completing an app course alone should not automatically be described as Ijazah.";

const allModules = CURRICULUM.flatMap((l) => l.modules.map((m) => ({ level: l.number, ...m })));

describe("CURRICULUM data", () => {
  it("has 22 levels numbered 1..22", () => {
    expect(CURRICULUM.map((l) => l.number)).toEqual(Array.from({ length: 22 }, (_, i) => i + 1));
  });

  it('every module code matches "<level>.<n>" and is unique', () => {
    for (const m of allModules) {
      const [level, n] = m.code.split(".");
      expect(Number(level)).toBe(m.level);
      expect(n).toMatch(/^[1-9]$/);
    }
    expect(new Set(allModules.map((m) => m.code)).size).toBe(allModules.length);
  });

  it("every module has a title and at least one subject", () => {
    for (const m of allModules) {
      expect(m.title.trim()).not.toBe("");
      expect(m.subjects.length + m.assessment.length).toBeGreaterThan(0);
    }
  });

  it('module 7.1 is titled "Early Ajza"', () => {
    expect(allModules.find((m) => m.code === "7.1")?.title).toBe("Early Ajza");
  });

  it("module 15.4 is Digital Muslim Ethics", () => {
    expect(allModules.find((m) => m.code === "15.4")?.title).toBe("Digital Muslim Ethics");
  });

  it("level 19 minAge is 16", () => {
    expect(CURRICULUM[18].minAge).toBe(16);
  });

  it("level 22 purpose contains the Ijazah disclaimer", () => {
    expect(CURRICULUM[21].purpose).toContain(IJAZAH_DISCLAIMER);
  });

  it("level 12 and level 16 have methodology notes", () => {
    expect(CURRICULUM[11].methodologyNote).toBeTruthy();
    expect(CURRICULUM[15].methodologyNote).toBeTruthy();
  });

  it("every courseName is one of the 7 track names", () => {
    expect(TRACK_COURSES).toEqual([
      "Quran Reading",
      "Tajweed",
      "Hifz-ul-Quran",
      "Quran Understanding",
      "Islamic Studies",
      "Advanced Quranic Studies",
      "Quran Teacher Preparation",
    ]);
    for (const l of CURRICULUM) expect(TRACK_COURSES).toContain(l.courseName);
  });

  it('no module title or level title other than level 22 contains "Ijazah"', () => {
    for (const m of allModules) expect(m.title).not.toMatch(/ijazah/i);
    for (const l of CURRICULUM.slice(0, 21)) expect(l.title).not.toMatch(/ijazah/i);
  });

  it("exports the four stages", () => {
    expect(STAGES).toEqual(["Foundation", "Practice", "Understanding", "Mastery"]);
  });
});
