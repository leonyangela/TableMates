import { describe, expect, it } from "vitest";

import { buildHomepageSummary } from "@/lib/utils/homepage-summary.utils";

const restaurants = [
  { id: "a", name: "A", category: "Thai", rating: 4.8, reviewCount: 10, searchKeywords: ["a"], createdAt: new Date() },
  { id: "b", name: "B", category: "Thai", rating: 4.5 },
  { id: "c", name: "C", category: "Italian", rating: 4.1 },
  { id: "d", name: "D", category: "Greek" },
  { id: "e", name: "E" },
];

describe("buildHomepageSummary", () => {
  const summary = buildHomepageSummary(restaurants);

  it("counts restaurants, cuisines and the average of rated ones", () => {
    expect(summary).toMatchObject({ restaurantCount: 5, cuisineCount: 3, averageRating: 4.5 });
  });

  it("features the first four, trimmed to what the page renders", () => {
    expect(summary.featured.map((restaurant) => restaurant.id)).toEqual(["a", "b", "c", "d"]);
    expect(summary.featured[0]).not.toHaveProperty("searchKeywords");
    expect(summary.featured[0]).not.toHaveProperty("createdAt");
  });

  it("groups cuisines by size, keeping each one's best restaurant", () => {
    expect(summary.cuisines[0]).toMatchObject({ name: "Thai", count: 2, top: { id: "a" } });
    expect(summary.cuisines.map((cuisine) => cuisine.name)).toEqual(["Thai", "Greek", "Italian"]);
  });

  it("handles an empty catalogue", () => {
    expect(buildHomepageSummary([])).toMatchObject({ restaurantCount: 0, averageRating: null, featured: [] });
  });

  it("is plain data a Server Component can pass to the client", () => {
    expect(JSON.parse(JSON.stringify(summary))).toEqual(summary);
  });
});
