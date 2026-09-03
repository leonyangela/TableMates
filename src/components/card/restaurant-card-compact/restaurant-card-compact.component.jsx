import BaseBtn from "../../button/base-button.component";
import ItemCard from "../item-card/item-card.component";

export default function RestaurantGrid({
  restaurants = [],
  onReserve,
  onBrowseMore,
  browseMoreLabel = "Browse more restaurants",
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
}) {
  return (
    <div>
      <div className={`grid ${columns} gap-6`}>
        {restaurants.map((r) => (
          <ItemCard
            key={r.id ?? r.name}
            {...r}
            onReserve={() => onReserve?.(r)}
          />
        ))}
      </div>

      {onBrowseMore && (
        <div
          onClick={onBrowseMore}
          className="text-center w-fit mx-auto px-4 py-2 rounded-lg mt-8 flex items-center justify-center text-primary font-bold text-lg cursor-pointer"
        >
          {browseMoreLabel} <span className="pl-1">→</span>
        </div>
      )}
    </div>
  );
}
