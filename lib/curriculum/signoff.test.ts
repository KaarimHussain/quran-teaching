import { describe, expect, it } from "vitest";
import { canSignOff } from "./signoff";

describe("canSignOff", () => {
  it("canSignOff allows shared course", () => {
    expect(canSignOff({ teacherCourseIds: ["c1", "c2"], studentCourseIds: ["c2"], moduleCourseId: "c2" })).toBe(true);
  });

  it("canSignOff rejects foreign course", () => {
    expect(canSignOff({ teacherCourseIds: ["c1"], studentCourseIds: ["c2"], moduleCourseId: "c2" })).toBe(false);
  });

  it("canSignOff rejects unenrolled student", () => {
    expect(canSignOff({ teacherCourseIds: ["c2"], studentCourseIds: ["c1"], moduleCourseId: "c2" })).toBe(false);
  });
});
