"use client"
import { useState } from "react";

import { seedRestaurants } from "@/lib/utils/seeding-btn.utils";

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

      setMessage("Failed to add restaurants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSeedRestaurants}
      disabled={loading}
      className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Adding restaurants..." : "Seed restaurants"}
    </button>
  );
};

export default SeedRestaurantsButton;
