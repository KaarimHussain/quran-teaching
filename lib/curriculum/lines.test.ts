import { describe, expect, it } from "vitest";
import { parseLines, toLines } from "./lines";

describe("parseLines", () => {
  it("splits on newlines, trims and drops empties", () => {
    expect(parseLines("a\n\n b \r\nc")).toEqual(["a", "b", "c"]);
  });
});

describe("toLines", () => {
  it("joins a string array with newlines", () => {
    expect(toLines(["a", "b"])).toBe("a\nb");
  });

  it("returns empty string for non-arrays", () => {
    expect(toLines(null)).toBe("");
    expect(toLines({ a: 1 })).toBe("");
  });

  it("drops non-string entries", () => {
    expect(toLines(["a", 3, "b"])).toBe("a\nb");
  });
});
