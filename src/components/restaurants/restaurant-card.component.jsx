export default function RestaurantCard({
  restaurant,
  hovered = false,
  selected = false,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  return (
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-4 transition-colors ${
        selected
          ? "border-[#C1502E] bg-[#C1502E]/5"
          : hovered
          ? "border-[#1F1D1B]/50"
          : "border-[#E5E1DB]"
      }`}
    >
      <h2 className="font-semibold text-[#1F1D1B]">{restaurant.name}</h2>

      <p className="mt-0.5 text-sm text-[#6B6660]">{restaurant.cuisine}</p>

      <p className="mt-1 text-sm text-[#1F1D1B]">{restaurant.priceRange}</p>
    </article>
  );
}