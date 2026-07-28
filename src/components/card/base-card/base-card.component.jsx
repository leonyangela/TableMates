import React from "react";

/* ------------------------------------------------------------------ */
/* not scattered conditionals. Content is children, because card      */
/* content structure varies more than a button's ever does.          */
/* ------------------------------------------------------------------ */

const BASE_CLASSES = "rounded-lg p-6 py-4 text-left";

const VARIANTS = {
  feature: "bg-rosy-copper-100 border-l-4 border-rosy-copper-600",
  testimonial: "bg-white border border-rosy-copper-600 rounded-xl",
};

const BaseCard = React.forwardRef(function BaseCard(
  { variant = "feature", className = "", children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        BASE_CLASSES,
        VARIANTS[variant] ?? VARIANTS.feature,
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
});

export default BaseCard;

/* ------------------------------------------------------------------ */
/* Usage examples — matching the two card types in the screenshot     */
/* ------------------------------------------------------------------ */

export function FeatureCardExample() {
  return (
    <BaseCard variant="feature">
      <h3 className="font-bold text-lg mb-2">Discover Places You'll Love</h3>
      <p className="text-sm text-gray-700">
        Explore a smarter way to find restaurants, discover new dining spots,
        and choose the perfect place for every occasion.
      </p>
    </BaseCard>
  );
}

export function TestimonialCardExample() {
  return (
    <BaseCard variant="testimonial" className="mt-4">
      <div className="text-yellow-500 mb-2">★★★★★</div>
      <p className="text-sm italic mb-4">
        "I found an amazing Italian restaurant I'd never heard of, and booking
        took less than a minute. The whole experience was seamless."
      </p>
      <p className="font-semibold text-sm">Sarah L.</p>
      <p className="text-xs text-gray-500">Food Enthusiast</p>
    </BaseCard>
  );
}

/* Grid usage, e.g. the 4-across feature row in your screenshot */
export function FeatureRow() {
  const features = [
    {
      title: "Discover Places You'll Love",
      body: "Explore a smarter way to find restaurants, discover new dining spots, and choose the perfect place for every occasion.",
    },
    {
      title: "Dine Together Easily",
      body: "Plan dining together effortlessly by inviting friends, sharing reservations, and keeping everyone connected in one place.",
    },
    {
      title: "Seamless Experience",
      body: "Enjoy a smoother way to discover, book, and manage your reservations, with everything you need in one simple experience.",
    },
    {
      title: "Personalized Dining",
      body: "Discover restaurants that match your taste, preferences, and occasions, for dining experiences that feel more meaningful.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((f) => (
        <BaseCard variant="feature" key={f.title}>
          <h3 className="font-bold text-lg mb-2">{f.title}</h3>
          <p className="text-sm text-gray-700">{f.body}</p>
        </BaseCard>
      ))}
    </div>
  );
}
