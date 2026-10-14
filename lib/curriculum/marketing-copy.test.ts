import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import ur from "@/messages/ur.json";
import ar from "@/messages/ar.json";

// Marketing copy must not promise features the app does not ship yet.
const UNSHIPPED = /slow connection|low[- ]bandwidth|bandwidth/i;

describe("marketing copy", () => {
  for (const [lang, messages] of Object.entries({ en, ur, ar })) {
    it(`${lang}: makes no low-bandwidth / slow-connection claims`, () => {
      expect(JSON.stringify(messages.marketing)).not.toMatch(UNSHIPPED);
    });
  }
});

type Tree = { [k: string]: unknown };
const leaves = (node: unknown, path = ""): [string, string][] => {
  if (typeof node === "string") return [[path, node]];
  if (Array.isArray(node)) return node.flatMap((v, i) => leaves(v, `${path}[${i}]`));
  if (node && typeof node === "object")
    return Object.entries(node as Tree).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
  return [];
};
const placeholders = (s: string) => (s.match(/\{\w+/g) ?? []).sort();

describe("marketing translations", () => {
  const enLeaves = new Map(leaves(en.marketing));

  for (const [lang, messages] of Object.entries({ ur, ar })) {
    const local = new Map(leaves(messages.marketing));

    it(`${lang}: has exactly the same keys as English`, () => {
      expect([...local.keys()].sort()).toEqual([...enLeaves.keys()].sort());
    });

    it(`${lang}: is actually translated (≤ 5% of strings identical to English)`, () => {
      const same = [...enLeaves].filter(([k, v]) => local.get(k) === v).map(([k]) => k);
      expect(same.length / enLeaves.size).toBeLessThanOrEqual(0.05);
    });

    it(`${lang}: keeps every ICU placeholder`, () => {
      for (const [k, v] of enLeaves) expect(placeholders(local.get(k) ?? ""), k).toEqual(placeholders(v));
    });

    it(`${lang}: error page is translated`, () => {
      expect(messages.common.errorPage.title).not.toBe(en.common.errorPage.title);
    });
  }
});
