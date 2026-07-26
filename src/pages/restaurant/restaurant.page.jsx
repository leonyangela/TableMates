import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMapStore } from "../../store/useMapStore";

import WrapperComponent from "../../components/wrapper/wrapper.component";

import CloseIcon from "@mui/icons-material/Close";
import { filterAndSortRestaurants } from "../../utils/filterRestaurant.utils";

const RestaurantPage = () => {
  const { locations } = useMapStore();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isTagOpen, setIsTagOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTagOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // All tags
  const allTags = useMemo(() => {
    return [...new Set(locations.flatMap((item) => item.tags))].sort();
  }, [locations]);

  // Price parser
  const getPriceLevel = (priceRange) => priceRange.split("-")[0].trim().length;

  // Toggle tag
  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Remove tag chip
  const removeTag = (tag) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  // Active filter check
  const isFilterActive =
    search.length > 0 || sortBy.length > 0 || selectedTags.length > 0;

  // Filter + sort logic
  const filteredRestaurants = useMemo(
    () =>
      filterAndSortRestaurants({
        restaurants: locations,
        search,
        selectedTags,
        sortBy,
      }),
    [locations, search, selectedTags, sortBy],
  );

  return (
    <WrapperComponent>
      {/* HEADER */}
      <div className="py-10 text-center">
        <h1 className="text-4xl font-bold">Our Restaurants</h1>
        <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
          Keep exploring. Discover trending spots, hidden gems, and local
          favourites.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border rounded-2xl shadow-sm p-4 mb-8 z-20">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search restaurants or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2 outline-none"
          />

          {/* Clear Sort only */}
          {/* {sortBy && (
            <button
              onClick={() => setSortBy("")}
              className="bg-gray-200 text-black px-3 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
            >
              Clear sort ✕
            </button>
          )} */}

          {/* TAG DROPDOWN */}
          <div className="relative w-full lg:w-64" ref={dropdownRef}>
            <button
              onClick={() => setIsTagOpen(!isTagOpen)}
              className="w-full border rounded-lg px-4 py-2 flex justify-between items-center"
            >
              <span className="text-sm">
                {selectedTags.length > 0
                  ? `${selectedTags.length} tags selected`
                  : "Filter by tags"}
              </span>
              <span>▾</span>
            </button>

            {isTagOpen && (
              <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-auto z-50">
                {allTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                    />
                    <span className="text-sm">{tag}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* SORT */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm"
          >
            <option value="" hidden>
              Sort by price
            </option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>

          {/* ACTION BUTTONS */}
          <div className="flex gap-2">
            {/* Clear Sort only */}
            {sortBy && (
              <button
                onClick={() => setSortBy("")}
                className="bg-gray-200 text-black px-3 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Clear sort ✕
              </button>
            )}

            {/* Clear All */}
            {isFilterActive && (
              <button
                onClick={() => {
                  setSearch("");
                  setSortBy("");
                  setSelectedTags([]);
                }}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* SELECTED TAG CHIPS */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 bg-black text-white text-xs px-3 py-1 rounded-full"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:cursor-pointer hover:text-primary"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* RESULT COUNT */}
      <div className="mb-6 text-gray-500">
        {filteredRestaurants.length} restaurant
        {filteredRestaurants.length !== 1 ? "s" : ""} found
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredRestaurants.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
          >
            {/* IMAGE */}
            <div className="relative h-52">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />

              <span className="absolute top-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                {item.category}
              </span>

              <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
                {item.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="bg-white text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-5">
              <h2 className="font-bold text-xl">{item.name}</h2>

              <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                {item.short_description}
              </p>

              {/* FEATURES */}
              <div className="flex flex-wrap gap-2 mt-4">
                {item.features.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* FOOTER */}
              <div className="mt-5 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {item.price_range}
                </span>

                <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </WrapperComponent>
  );
};

export default RestaurantPage;
