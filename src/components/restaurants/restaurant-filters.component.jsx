"use client";

import { useState } from "react";

import {
  CATEGORY_OPTIONS,
  OTHER_FILTER_OPTIONS,
  PRICE_BOUNDS,
} from "@/lib/constants/restaurant.constants";

import Button from "../button/button.component";

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

export default function RestaurantFilters({ filters, onChange, onClear }) {
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const otherValues = filters.other ?? [];

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

  

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 pb-2">
        {/* Category */}
        <select
          value={filters.category ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              category: event.target.value || null,
            })
          }
          className="rounded-full border border-[#E5E1DB] bg-white px-3 py-1.5 text-sm text-[#1F1D1B] focus:border-[#1F1D1B]/40 focus:outline-none"
        >
          <option value="">All categories</option>

          {CATEGORY_OPTIONS.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Other filters */}
        <div className="flex gap-1">
          {OTHER_FILTER_OPTIONS.map((option) => {
            const isActive = otherValues.includes(option.value);

            return (
              <Button
                key={option.value}
                variant="navigation-controls"
                onClick={() =>
                  onChange({
                    ...filters,
                    other: toggleArrayValue(
                      otherValues,
                      option.value,
                    ),
                  })
                }
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "border-primary bg-grey-olive-300 text-primary"
                    : "border-grey-olive-200 text-black hover:border-info"
                }`}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Price range */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-[#E5E1DB] bg-white px-3 py-1.5 text-sm text-[#1F1D1B]">
          <span className="text-[#6B6660]">$</span>

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
            className="w-14 outline-none"
          />

          <span className="text-[#6B6660]">to</span>

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
            className="w-14 outline-none"
          />
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleApplyPriceFilter}
        >
          Apply
        </Button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="cursor-pointer text-sm font-medium text-[#C1502E] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}