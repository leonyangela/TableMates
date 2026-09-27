import { describe, expect, it } from "vitest";

import {
  buildSearchKeywords,
  getPrimarySearchToken,
  getSearchTokens,
  matchesSearch,
} from "@/lib/utils/restaurant-search.utils";

const restaurant = { name: "Café Riverbar & Kitchen", category: "Modern Australian" };

describe("restaurant search", () => {
  it("indexes every prefix of every name and category word, without accents", () => {
    const keywords = buildSearchKeywords(restaurant);
    expect(keywords).toEqual(expect.arrayContaining(["c", "caf", "cafe", "riv", "kitchen", "aus"]));
    expect(keywords).not.toContain("café");
  });

  it("normalises a search string into tokens", () => {
    expect(getSearchTokens("  Sushi   BAR ")).toEqual(["sushi", "bar"]);
  });

  it("queries Firestore by the longest token", () => {
    expect(getPrimarySearchToken(["bar", "sushi"])).toBe("sushi");
  });

  it("matches only when every token starts some word", () => {
    expect(matchesSearch(restaurant, ["river", "kit"])).toBe(true);
    expect(matchesSearch(restaurant, ["river", "sushi"])).toBe(false);
    expect(matchesSearch(restaurant, ["verbar"])).toBe(false);
  });
});
