"use client";

import { Utensils, Coffee, Wine, Soup } from "lucide-react";
import PropertyTypeToggle from "@/components/restaurants/property-type-toggle.component";
import RangeSlider from "@/components/restaurants/range-slider.component";
import AmenityCheckbox from "@/components/restaurants/amenity-checkbox.component";
import Button from "@/components/button/button.component";

const CUISINE_TYPES = [
  { value: "restaurant", label: "Restaurant", icon: Utensils },
  { value: "cafe", label: "Cafe", icon: Coffee },
  { value: "bar", label: "Bar", icon: Wine },
  { value: "street-food", label: "Street Food", icon: Soup },
];

export default function FilterSidebar({ filters, onUpdateFilter, onApply, onReset }) {
  return (
    <div className="w-full md:w-80 bg-white rounded-2xl p-6 h-fit space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3">Place Type</h3>
        <PropertyTypeToggle
          options={CUISINE_TYPES}
          value={filters.propertyType}
          onChange={(v) => onUpdateFilter("propertyType", v)}
        />
      </div>

      <RangeSlider
        label="Price per person"
        min={10}
        max={100}
        value={filters.priceRange[1]}
        onChange={(v) => onUpdateFilter("priceRange", [filters.priceRange[0], v])}
        formatValue={(v) => `Up to $${v}`}
      />

      <RangeSlider
        label="Party size"
        min={1}
        max={10}
        value={filters.seats}
        onChange={(v) => onUpdateFilter("seats", v)}
        formatValue={(v) => `${v} ${v === 1 ? "seat" : "seats"}`}
      />

      <div>
        <h3 className="font-semibold text-sm mb-2">Amenities</h3>
        <AmenityCheckbox
          label="Furnished / Indoor seating"
          checked={filters.furnishedOnly}
          onChange={(v) => onUpdateFilter("furnishedOnly", v)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 text-sm font-medium text-gray-500 hover:text-black transition"
        >
          Reset
        </button>
        <Button onClick={onApply} className="flex-1">
          Apply
        </Button>
      </div>
    </div>
  );
}