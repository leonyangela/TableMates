"use client";

const PRICE_OPTIONS = ["$", "$$", "$$$", "$$$$", "$$$$$"];

const CUISINE_OPTIONS = [
  "Asian",
  "Italian",
  "Japanese",
  "Steakhouse",
  "Cafe",
];

const OTHER_OPTIONS = [
  { value: "openNow", label: "Open now" },
  { value: "trending", label: "Trending" },
];

export default function RestaurantFilters({ filters, onChange, onClear }) {
  const updateFilter = (key, value) => {
    onChange({
      ...filters,
      [key]: filters[key] === value ? null : value,
    });
  };

  const hasActiveFilters = Boolean(
    filters.price || filters.cuisine || filters.other
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Price */}
      <div className="flex gap-1">
        {PRICE_OPTIONS.map((price) => (
          <button
            key={price}
            type="button"
            onClick={() => updateFilter("price", price)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              filters.price === price
                ? "border-[#1F1D1B] bg-[#1F1D1B] text-white"
                : "border-[#E5E1DB] text-[#1F1D1B] hover:border-[#1F1D1B]/40"
            }`}
          >
            {price}
          </button>
        ))}
      </div>

      {/* Cuisine */}
      <select
        value={filters.cuisine ?? ""}
        onChange={(event) =>
          onChange({
            ...filters,
            cuisine: event.target.value || null,
          })
        }
        className="rounded-full border border-[#E5E1DB] bg-white px-3 py-1.5 text-sm text-[#1F1D1B] focus:border-[#1F1D1B]/40 focus:outline-none"
      >
        <option value="">All cuisines</option>

        {CUISINE_OPTIONS.map((cuisine) => (
          <option key={cuisine} value={cuisine}>
            {cuisine}
          </option>
        ))}
      </select>

      {/* Other */}
      <div className="flex gap-1">
        {OTHER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateFilter("other", option.value)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              filters.other === option.value
                ? "border-[#1F1D1B] bg-[#1F1D1B] text-white"
                : "border-[#E5E1DB] text-[#1F1D1B] hover:border-[#1F1D1B]/40"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-[#C1502E] hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}