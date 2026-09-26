"use client";

import { useState } from "react";

import {
  OTHER_FILTER_OPTIONS,
  PRICE_BOUNDS,
} from "@/lib/constants/restaurant.constants";
import { toCategoryList } from "@/lib/utils/restaurant-categories.utils";
import { useRestaurantCategories } from "@/hooks/useRestaurantCategories";
import CategoryDropdown from "./category-dropdown.component";


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

  

  // Sits on the dark search banner — light-on-dark controls.
  return (
    <div className="flex flex-wrap items-center gap-2">
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
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() =>
              onChange({
                ...filters,
                other: toggleArrayValue(otherValues, option.value),
              })
            }
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-primary bg-primary text-white"
                : "border-white/15 bg-white/5 text-accent hover:border-white/30 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}

      {/* Price range */}
      <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 py-1 pl-4 pr-1 text-sm text-white">
        <span className="text-accent/70">$</span>
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
          className="w-12 bg-transparent outline-none placeholder:text-accent/40"
        />
        <span className="text-accent/70">to</span>
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
          className="w-12 bg-transparent outline-none placeholder:text-accent/40"
        />
        <button
          type="button"
          onClick={handleApplyPriceFilter}
          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rosy-copper-950 transition hover:bg-accent"
        >
          Apply
        </button>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="px-2 text-sm font-medium text-accent underline-offset-4 hover:text-white hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
