"use client"
import { useState } from "react";

import {
  backfillRestaurantSearchKeywords,
  seedRestaurants,
} from "@/lib/utils/seeding-btn.utils";
import Button from "@/components/button/button.component";

const SeedRestaurantsButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeedRestaurants = async () => {
    try {
      setLoading(true);
      setMessage("");

      const result = await seedRestaurants();

      setMessage(`${result.count} restaurants added successfully.`);
    } catch (error) {
      console.error("Failed to seed restaurants:", error);

      setMessage(`Failed to add restaurants: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button variant="outline" size="sm" onClick={handleSeedRestaurants} disabled={loading}>
        {loading ? "Adding restaurants..." : "Seed restaurants"}
      </Button>
      {message && <p className="text-sm text-paper/65">{message}</p>}
    </div>
  );
};

export default SeedRestaurantsButton;

/**
 * Admin action: adds `searchKeywords` to restaurants that were seeded
 * before search existed, and rebuilds the category filter's list
 * (meta/restaurantCategories) from the data. Mount it somewhere temporarily (like
 * SeedRestaurantsButton), click once, then remove it again.
 */
export const BackfillSearchKeywordsButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleBackfill = async () => {
    try {
      setLoading(true);
      setMessage("");

      const result = await backfillRestaurantSearchKeywords();

      setMessage(
        `Search keywords and categories updated for ${result.count} restaurants.`,
      );
    } catch (error) {
      console.error("Failed to backfill search keywords:", error);

      setMessage(`Failed to update: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button variant="outline" size="sm" onClick={handleBackfill} disabled={loading}>
        {loading
          ? "Updating search keywords & categories..."
          : "Backfill search keywords & categories"}
      </Button>
      {message && <p className="text-sm text-paper/65">{message}</p>}
    </div>
  );
};
