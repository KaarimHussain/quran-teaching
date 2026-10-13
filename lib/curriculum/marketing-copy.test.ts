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
