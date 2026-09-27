import { describe, expect, it } from "vitest";

import {
  DEFAULT_FILTERS,
  filtersFromSearchParams,
  filtersToSearchParams,
} from "@/lib/utils/restaurant-filters.utils";

describe("restaurant filters in the URL", () => {
  it("reads the defaults from an empty query", () => {
    expect(filtersFromSearchParams(new URLSearchParams())).toEqual(DEFAULT_FILTERS);
  });

  it("round-trips every filter", () => {
    const filters = {
      search: "sushi bar",
      category: "Japanese",
      priceMin: 20,
      priceMax: 60,
      other: ["trending", "top"],
    };
    const params = filtersToSearchParams(filters);

    expect(params.toString()).toBe("q=sushi+bar&category=Japanese&min=20&max=60&other=trending%2Ctop");
    expect(filtersFromSearchParams(params)).toEqual(filters);
  });

  it("drops invalid or unknown values", () => {
    const filters = filtersFromSearchParams(new URLSearchParams("min=abc&max=-5&other=trending,spicy,trending"));
    expect(filters).toMatchObject({ priceMin: null, priceMax: null, other: ["trending"] });
  });

  it("keeps unrelated params and removes cleared filters", () => {
    const params = filtersToSearchParams(DEFAULT_FILTERS, "restaurant=abc&q=old&min=10");
    expect(params.toString()).toBe("restaurant=abc");
  });

  it("keeps a zero price", () => {
    expect(filtersToSearchParams({ ...DEFAULT_FILTERS, priceMin: 0 }).get("min")).toBe("0");
  });
});
