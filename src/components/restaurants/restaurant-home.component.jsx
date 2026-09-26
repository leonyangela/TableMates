"use client";

import RestaurantSection from "@/components/restaurants/restaurant-section.component";
import { useHomepageRestaurants } from "@/hooks/useHomepageRestaurants";

export default function RestaurantHomepage() {
  const {
    trending,
    topRated,
    trendingLoading,
    topRatedLoading,
    trendingError,
    topRatedError,
    refetchTrending,
    refetchTopRated
  } = useHomepageRestaurants({
    trendingLimit: 6,
    topRatedLimit: 6,
  });

  return (
    <div>
      {/* Trending is purely editorial (the `trending` flag) — hidden
          entirely rather than backfilled when nothing is flagged, so it
          never misleadingly shows unrelated restaurants. */}
      {(trendingLoading || trendingError || trending.length > 0) && (
        <RestaurantSection
          title="Trending now"
          restaurants={trending}
          loading={trendingLoading}
          error={trendingError}
          onRetry={refetchTrending}
        />
      )}

      {/* Top Rated is computed from every restaurant's rating/reviewCount —
          always has results (given enough restaurants exist) regardless of
          whether anything is flagged trending. */}
      {(topRatedLoading || topRatedError || topRated.length > 0) && (
        <RestaurantSection
          title="Top rated"
          restaurants={topRated}
          loading={topRatedLoading}
          error={topRatedError}
          onRetry={refetchTopRated}
        />
      )}
    </div>
  );
}
