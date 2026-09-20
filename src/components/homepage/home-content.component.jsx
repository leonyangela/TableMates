"use client";

import { useAuth } from "@/hooks/useAuth";

import Testimonials from "../testimonials/testimonials.component";
import Header from "../header/header.component";
import StepCard from "../cards/step-card.component";
import RestaurantHomepage from "../restaurants/restaurant-home.component";
import FeatureCard from "../cards/feature-card.component";

import { FEATURES, STEPS } from "@/lib/constants/homepage.constants";

import { ChevronRightIcon, Utensils } from "lucide-react";
import Button from "../button/button.component";
import { useRouter } from "next/navigation";

const HowItWorks = () => {
  return (
    <div className="relative pb-10">
      <div className="flex flex-row gap-4 justify-between items-center pb-4">
        <Header
          eyebrow="How it works"
          title="Find a table. Meet new people. Enjoy great food."
          description="Find your next restaurant, choose your table, and enjoy the experience."
        />
      </div>

      <div className="w-full flex flex-row gap-0.5">
        {STEPS.map((step, id) => (
          <div key={id} className="flex flex-row items-center justify-center">
            <StepCard {...step} />
            {id < STEPS.length - 1 && <ChevronRightIcon />}
          </div>
        ))}
      </div>
    </div>
  );
};

const DiscoverRestaurants = () => {
  return (
    <div>
      <Header
        eyebrow={"Discover Restaurants"}
        title={"Find the perfect place for every craving."}
        description={
          "Explore restaurants for every occasion, from neighborhood favorites to trending hotspots. Browse by cuisine, location, or mood and discover places worth coming back to."
        }
      />

      <article>
        <RestaurantHomepage />
      </article>
    </div>
  );
};

const WhyChooseUs = () => {
  return (
    <article className="mt-10 flex flex-row gap-4 bg-gray-200 rounded-md p-8">
      <div className="w-2/6 flex flex-col justify-between">
        <div>
          <Header eyebrow={"Why choose us?"} />
          <h1 className="text-3xl font-bold ">More than just a table.</h1>
        </div>
        <p className="pt-10">
          We make it easy to find, book and enjoy the best restaurants, with
          features designed for food lovers.
        </p>
      </div>

      {FEATURES.map((feature) => (
        <FeatureCard key={feature.title} Icon={feature.icon} {...feature} />
      ))}
    </article>
  );
};

const Testimoni = () => {
  return (
    <div className="pt-20">
      <Testimonials />
    </div>
  );
};

const DiningJourney = () => {
  const router = useRouter();

  return (
    <section className="mt-10">
      <Header
        eyebrow="Your journey"
        title="Your dining journey starts here."
        description="Keep track of the places you discover, tables you join, and meals you enjoy."
      />

      <div className="mt-4 rounded-xl border border-primary bg-white py-20">
        <div className="flex flex-col items-center text-center">
          {/* Empty state */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F1EB]">
            <Utensils className="h-6 w-6 text-grey-olive-700" />
          </div>

          <h3 className="mt-4 text-lg font-bold text-black">
            Your dining journey is waiting
          </h3>

          <p className="mt-2 max-w-md text-sm text-grey-olive-700">
            You haven&apos;t made any dining plans yet. Discover a restaurant,
            book a table, or join an open table to get started.
          </p>

          <Button
            variant="primary"
            className="mt-4"
            onClick={() => router.push("/restaurants")}
          >
            Discover restaurants
          </Button>
        </div>
      </div>
    </section>
  );
};

const HomeContent = () => {
  const { user } = useAuth();

  return (
    <>
      <HowItWorks />
      <DiscoverRestaurants />

      {!user ? (
        <>
          <WhyChooseUs />
          <Testimoni />
        </>
      ) : (
        <DiningJourney />
      )}
    </>
  );
};

export default HomeContent;
