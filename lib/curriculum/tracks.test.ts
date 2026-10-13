import { describe, expect, it } from "vitest";
import { TRACK_COURSES } from "./data";
import { CURRICULUM_TOTALS, TRACKS, levelRange, partitionCourses, trackFor } from "./tracks";

describe("tracks", () => {
  it("TRACKS names equal TRACK_COURSES in order", () => {
    expect(TRACKS.map((t) => t.name)).toEqual([...TRACK_COURSES]);
  });

  it("slugs are unique", () => {
    expect(new Set(TRACKS.map((t) => t.slug)).size).toBe(7);
  });

  it("trackFor returns undefined for unknown names", () => {
    expect(trackFor("Qaida for Babies")).toBeUndefined();
    expect(trackFor("Tajweed")?.slug).toBe("tajweed");
  });

  it("levelRange Quran Reading", () => {
    expect(levelRange("Quran Reading")).toEqual({ first: 1, last: 3, levels: 3, modules: 12 });
  });

  it("levelRange Islamic Studies", () => {
    expect(levelRange("Islamic Studies")).toEqual({ first: 11, last: 18, levels: 8, modules: 32 });
  });

  it("CURRICULUM_TOTALS", () => {
    expect(CURRICULUM_TOTALS).toEqual({ tracks: 7, levels: 22, modules: 87 });
  });
});

describe("partitionCourses", () => {
  const c = (name: string, levels = 0) => ({ name, levels: Array.from({ length: levels }) });

  it("orders tracks by curriculum order and keeps every non-track course", () => {
    const { tracks, others } = partitionCourses([
      c("Tajweed", 2),
      c("Qaida for Babies"),
      c("Quran Reading", 3),
      c("Tajweed Rules", 2),
    ]);
    expect(tracks.map((t) => t.course.name)).toEqual(["Quran Reading", "Tajweed"]);
    expect(tracks[0].track.slug).toBe("quran-reading");
    expect(others.map((o) => o.name)).toEqual(["Qaida for Babies", "Tajweed Rules"]);
  });
});
