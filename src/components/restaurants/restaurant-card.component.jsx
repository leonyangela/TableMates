export default function RestaurantCard({
  restaurant,
  active = false,
  onMouseEnter,
  onClick,
}) {
  return (
    <article
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-4 transition ${
        active
          ? "border-black"
          : "border-gray-200"
      }`}
    >
      <h2 className="font-semibold">
        {restaurant.name}
      </h2>

      <p className="text-sm text-gray-500">
        {restaurant.cuisine}
      </p>

      <p className="mt-1 text-sm">
        {restaurant.priceRange}
      </p>
    </article>
  );
}