import { describe, expect, it } from "vitest";
import { CURRICULUM_MODULE_DEFAULTS, studentVisibleModulesWhere } from "./visibility";

describe("CURRICULUM_MODULE_DEFAULTS", () => {
  it("curriculum modules require enrollment and are gated", () => {
    expect(CURRICULUM_MODULE_DEFAULTS).toEqual({ isFree: false, isGated: true });
  });
});

describe("studentVisibleModulesWhere", () => {
  it("shows free modules or modules of actively enrolled courses", () => {
    expect(studentVisibleModulesWhere("s1")).toEqual({
      OR: [
        { isFree: true },
        { course: { enrollments: { some: { studentUserId: "s1", status: "ACTIVE" } } } },
      ],
    });
  });

  it("can be narrowed to one course", () => {
    expect(studentVisibleModulesWhere("s1", "c1")).toEqual({
      courseId: "c1",
      OR: [
        { isFree: true },
        { course: { enrollments: { some: { studentUserId: "s1", status: "ACTIVE" } } } },
      ],
    });
  });
});
