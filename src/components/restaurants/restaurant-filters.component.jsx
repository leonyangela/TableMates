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
  {
    value: "openNow",
    label: "Open Now",
  },
  {
    value: "trending",
    label: "Trending",
  },
];

export default function RestaurantFilters({
  filters,
  onChange,
  onClear,
}) {
  const updateFilter = (key, value) => {
    onChange({
      ...filters,
      [key]: filters[key] === value ? null : value,
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Price */}
      <div className="flex gap-1">
        {PRICE_OPTIONS.map((price) => (
          <button
            key={price}
            type="button"
            onClick={() => updateFilter("price", price)}
            className={`rounded-full border px-3 py-1 text-sm ${
              filters.price === price
                ? "bg-black text-white"
                : "bg-white text-black"
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
        className="rounded-full border px-3 py-1"
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
            onClick={() =>
              updateFilter("other", option.value)
            }
            className={`rounded-full border px-3 py-1 text-sm ${
              filters.other === option.value
                ? "bg-black text-white"
                : "bg-white text-black"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onClear}
        className="px-3 py-1 text-sm underline"
      >
        Clear
      </button>
    </div>
  );
}