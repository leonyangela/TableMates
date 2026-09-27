"use client";

import { useState } from "react";

import {
  OTHER_FILTER_OPTIONS,
  PRICE_BOUNDS,
} from "@/lib/constants/restaurant.constants";
import { toCategoryList } from "@/lib/utils/restaurant-categories.utils";
import { useRestaurantCategories } from "@/hooks/useRestaurantCategories";
import CategoryDropdown from "./category-dropdown.component";
import { META } from "@/components/ui/styles";
import Button from "@/components/button/button.component";


/** Adds/removes one value from an array-valued filter field. */
function toggleArrayValue(array = [], value) {
  return array.includes(value)
    ? array.filter((item) => item !== value)
    : [...array, value];
}

/**
 * Normalizes the user's price input before applying the filter.
 *
 * Rules:
 * - Empty input becomes null.
 * - Minimum cannot be below PRICE_BOUNDS.min.
 * - Maximum cannot exceed PRICE_BOUNDS.max.
 * - Maximum cannot be lower than minimum.
 */
function normalizePriceRange(minValue, maxValue) {
  let min = minValue === "" ? null : Number(minValue);
  let max = maxValue === "" ? null : Number(maxValue);

  if (min !== null) {
    min = Math.max(min, PRICE_BOUNDS.min);
  }

  if (max !== null) {
    max = Math.min(max, PRICE_BOUNDS.max);
  }

  if (min !== null && max !== null && min > max) {
    max = min;
  }

  return { min, max };
}

/**
 * The category dropdown's options: every category in the data (from
 * useRestaurantCategories), plus any on the loaded restaurants or the
 * current selection — so a brand-new category shows up immediately even
 * before the categories list has been refreshed.
 */
function getCategoryOptions(dataCategories, restaurants, selectedCategory) {
  return toCategoryList([
    ...dataCategories,
    ...restaurants.map((restaurant) => restaurant.category),
    selectedCategory,
  ]);
}

export default function RestaurantFilters({
  filters,
  onChange,
  onClear,
  restaurants = [],
}) {
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const otherValues = filters.other ?? [];
  const { categories: dataCategories, loading: categoriesLoading } =
    useRestaurantCategories();
  const categoryOptions = getCategoryOptions(
    dataCategories,
    restaurants,
    filters.category,
  );

  const hasActiveFilters =
    filters.priceMin != null ||
    filters.priceMax != null ||
    Boolean(filters.category) ||
    otherValues.length > 0;

  const handleApplyPriceFilter = () => {
    const { min, max } = normalizePriceRange(priceMin, priceMax);

    // Keep the inputs synchronized with the normalized values.
    setPriceMin(min === null ? "" : String(min));
    setPriceMax(max === null ? "" : String(max));

    onChange({
      ...filters,
      priceMin: min,
      priceMax: max,
    });
  };

  const handlePriceBlur = () => {
    const { min, max } = normalizePriceRange(priceMin, priceMax);

    setPriceMin(min === null ? "" : String(min));
    setPriceMax(max === null ? "" : String(max));
  };

  const handleClear = () => {
    setPriceMin("");
    setPriceMax("");
    onClear();
  };

  

  // A single line of small mono controls under the search.
  return (
    <div className={`${META} flex flex-wrap items-center gap-x-7 gap-y-4 text-paper/65`}>
      <CategoryDropdown
        tone="dark"
        value={filters.category ?? null}
        options={categoryOptions}
        loading={categoriesLoading}
        onChange={(category) =>
          onChange({
            ...filters,
            category,
          })
        }
      />

      {OTHER_FILTER_OPTIONS.map((option) => {
        const isActive = otherValues.includes(option.value);

        return (
          <Button
            key={option.value}
            variant="check"
            active={isActive}
            aria-pressed={isActive}
            onClick={() =>
              onChange({
                ...filters,
                other: toggleArrayValue(otherValues, option.value),
              })
            }
          >
            {option.label}
          </Button>
        );
      })}

      {/* Price range */}
      <div className="flex items-center gap-2">
        <span>Price $</span>
        <input
          type="number"
          inputMode="numeric"
          aria-label="Minimum price"
          placeholder={String(PRICE_BOUNDS.min)}
          min={PRICE_BOUNDS.min}
          max={priceMax || PRICE_BOUNDS.max}
          value={priceMin}
          onChange={(event) => setPriceMin(event.target.value)}
          onBlur={handlePriceBlur}
          className="w-12 border-b border-paper/25 bg-transparent pb-1 text-paper outline-none placeholder:text-paper/35 focus:border-coffee-bean-400"
        />
        <span>to</span>
        <input
          type="number"
          inputMode="numeric"
          aria-label="Maximum price"
          placeholder={String(PRICE_BOUNDS.max)}
          min={priceMin || PRICE_BOUNDS.min}
          max={PRICE_BOUNDS.max}
          value={priceMax}
          onChange={(event) => setPriceMax(event.target.value)}
          onBlur={handlePriceBlur}
          className="w-12 border-b border-paper/25 bg-transparent pb-1 text-paper outline-none placeholder:text-paper/35 focus:border-coffee-bean-400"
        />
        <Button variant="link" onClick={handleApplyPriceFilter} className="ml-1">
          Apply
        </Button>
      </div>

      {hasActiveFilters && (
        <Button variant="text-accent" onClick={handleClear}>
          Clear all
        </Button>
      )}
    </div>
  );
}
