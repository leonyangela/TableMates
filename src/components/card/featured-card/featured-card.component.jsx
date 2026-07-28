import React from "react";
import BaseCard from "../base-card/base-card.component";

/* ------------------------------------------------------------------ */
/* This is a SECTION, not a primitive — it doesn't need a variant   */
/* content as data (props), and composes the existing BaseCard         */
/* primitive rather than reinventing card styling.                     */
/*                                                                      */
/* Reuse this component by passing different eyebrow/title/subtitle/   */
/* features — same layout, any content, any page.                      */
/* ------------------------------------------------------------------ */

export default function FeatureSection({
  eyebrow,
  title,
  subtitle,
  features = [], // [{ title: string, body: string }]
}) {
  return (
    <section className="mx-auto  py-12">
      <p className="text-primary uppercase font-bold text-lg mb-2">{eyebrow}</p>
      <h2 className="uppercase text-3xl font-bold mb-3">{title}</h2>
      <p className="text-black mb-8">{subtitle}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <BaseCard variant="feature" key={f.title}>
            <h3 className="font-bold text- mb-2">{f.title}</h3>
            <p className="text-base text-black">{f.body}</p>
          </BaseCard>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Usage — matches the uploaded screenshot                            */
/* ------------------------------------------------------------------ */

export function FeatureSectionExample() {
  return (
    <FeatureSection
      eyebrow="WHY CHOOSE US?"
      title="DINING MADE SIMPLE"
      subtitle="Finding a great restaurant shouldn't feel like work. We help you discover, compare, and reserve tables effortlessly, so you can focus on the people you're dining with."
      features={[
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
          body: "Discover restaurants that match your taste, preferences, and occasions, making every dining experience more meaningful and enjoyable.",
        },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Same component, totally different page, no code changes needed     */
/* ------------------------------------------------------------------ */

export function FeatureSectionExample2() {
  return (
    <FeatureSection
      eyebrow="GETTING STARTED"
      title="BOOK IN THREE STEPS"
      subtitle="No app-hopping, no phone calls — reserve your table in under a minute."
      // features={[
      //   {
      //     title: "Search",
      //     body: "Browse restaurants near you by cuisine, price, or availability.",
      //   },
      //   {
      //     title: "Pick a table",
      //     body: "See real-time availability and choose the time that works.",
      //   },
      //   {
      //     title: "Confirm",
      //     body: "Get instant confirmation, no back-and-forth required.",
      //   },
      // ]}
    />
  );
}
