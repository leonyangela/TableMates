import React from "react";
import BaseBtn from "../../button/base-button.component";

/* ------------------------------------------------------------------ */
/* ItemCard                                                     */
/* Prop-driven (not children) because the field set is fixed and      */
/* predictable across every restaurant — image, tag, name, price,     */
/* rating, distance, CTA. This is the same shape every card needs,    */
/* so props keep the data structured and consistent, the way the      */
/* real-estate cards in your screenshot are consistent card-to-card.  */
/* ------------------------------------------------------------------ */

export default function ItemCard({
  image,
  imageAlt = "",
  tag, // e.g. "Steakhouse", "Bar"
  name, // e.g. "Burger House"
  rating, // e.g. 4.8
  reviewCount, // e.g. 214
  priceRange, // e.g. "$$ - $$$"
  distance, // e.g. "0.8 mi"
  ctaLabel = "Reserve Now",
  onReserve,
  href,
}) {
  const CTA = href && !onReserve ? "a" : "button";

  return (
    <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden group">
      {/* Background image */}
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Tag pill, top-left */}
      {tag && (
        <span className="absolute top-4 left-4 bg-white text-black text-sm font-medium px-4 py-1.5 rounded-full shadow">
          {tag}
        </span>
      )}

      {/* Rating, top-right */}
      {rating && (
        <span className="absolute top-4 right-4 bg-white/90 text-black text-sm font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          ★ {rating}
          {reviewCount && (
            <span className="text-gray-500 font-normal">({reviewCount})</span>
          )}
        </span>
      )}

      {/* Bottom info panel */}
      <div className="absolute bottom-0 left-0 right-0  text-white p-4 rounded-2xl">
        <div className="absolute inset-0 z-0 h-full bg-linear-to-t from-black to-transparent"></div>

        <div className="relative z-10">
          <h3 className="text-xl font-semibold">{name}</h3>
          {(priceRange || distance) && (
            <p className="text-sm text-white/85 mt-1">
              {priceRange}
              {priceRange && distance && <span className="mx-1.5">·</span>}
              {distance}
            </p>
          )}
        </div>

        {ctaLabel && (
          <BaseBtn onClick={onReserve} className="relative z-10 w-full mt-4">
            {ctaLabel}
          </BaseBtn>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Usage — matching the screenshot's two restaurant cards             */
/* ------------------------------------------------------------------ */

export function ItemCardExample() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <ItemCard
        name="Burger House"
        image="https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1200"
        tag="Steakhouse"
        rating={4.7}
        reviewCount={312}
        priceRange="$$$"
        distance="1.2 mi"
        tag="Bar"
        onReserve={() => alert(`Reserve ${name}`)}
      />
    </div>
  );
}
