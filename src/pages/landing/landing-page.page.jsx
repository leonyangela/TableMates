import "./landing-page.styles.css";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";

import WrapperComponent from "../../components/wrapper/wrapper.component";
import BgImageComponent from "../../components/image/bg-image.component";
import BaseBtn from "../../components/button/base-button.component";
import RestaurantGrid from "../../components/card/restaurant-card-compact/restaurant-card-compact.component";
import FeatureCard from "../../components/card/featured-card/featured-card.component";
import StepsGridCard from "../../components/card/steps-grid-card/steps-grid-card.component";

import { useTrendingRestaurants } from "../../features/restaurants/hooks/useTrendingRestaurant";

import HomeImg1 from "../../assets/Images/homepage-1.jpg";
import { goToReserve } from "../../utils/reserveParams.utils";
import { useBookingStore } from "../../store/useBookingStore";
import { useMapStore } from "../../store/useMapStore";

const LandingPage = () => {
  const navigate = useNavigate();

  // Ranked by trending → rating → review count → most recently created.
  // #1 becomes the "Trending Right Now" hero block below; #2–6 fill the
  // RestaurantGrid in the "Browse Italian, Japanese..." section.
  const { restaurants: trendingRestaurants, loading: trendingLoading } =
    useTrendingRestaurants(6);
  const { setSelectedLocation } = useMapStore();

  const heroRestaurant = trendingRestaurants[0];

  const gridItems = useMemo(
    () =>
      trendingRestaurants.slice(1, 6).map((item) => ({
        id: item.id,
        image: item.image,
        tag: item.category,
        name: item.name,
        rating: item.rating,
        reviewCount: item.reviewCount,
        priceRange: item.price_range,
        distance: item.distance,
      })),
    [trendingRestaurants],
  );

  const goToRestaurantPage = () => {
    setSelectedLocation(null);
    navigate("/restaurants");
  }

  return (
    <WrapperComponent>
      <div className="relative h-full w-full">
        <BgImageComponent
          additionalClassName={`justify-center items-center px-30`}
        >
          <div className="w-full text-center z-20 relative text-white">
            <h1 className="text-4xl">Great food, one reservation away.</h1>
            <h1 className="text-4xl">where great meals begin.</h1>

            <p className="text-xl py-4">
              Whatever the occasion, finding the perfect restaurant should be
              simple. Browse restaurants you'll love, see available tables
              instantly, and book with condence in just a few taps.
            </p>

            <BaseBtn
              text={"Find a Restaurant"}
              onClick={() => {
                navigate("/restaurants");
              }}
            >
              Find a Restaurant
            </BaseBtn>
          </div>
        </BgImageComponent>
      </div>

      <FeatureCard
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
            body: "Discover restaurants that match your taste, preferences, and occasions, for dining experiences that feel more meaningful.",
          },
        ]}
      />

      <FeatureCard
        eyebrow="discover restaurants"
        title="Find the perfect place for every craving."
        subtitle="Explore restaurants for every occasion, from neighborhood favorites to trending hotspots. Browse by cuisine, location, or mood and discover places worth coming back to."
      />

      {/* TRENDING HERO — rank #1 from useTrendingRestaurants */}
      <div className="relative flex justify-center items-center gap-2">
        <div
          className={`relative w-1/2 h-96 rounded-2xl bg-cover bg-center overflow-hidden flex flex-col `}
          style={{
            backgroundImage: `url(${heroRestaurant?.image ?? HomeImg1})`,
          }}
        ></div>
        <div className="w-1/2 ">
          <h1>Trending Right Now</h1>

          {trendingLoading ? (
            <p className="text-gray-400">Loading…</p>
          ) : heroRestaurant ? (
            <>
              <p>{heroRestaurant.name}</p>
              <p>{heroRestaurant.category}</p>
              <p>{heroRestaurant.price_range}</p>
              {heroRestaurant.features?.slice(0, 2).map((feature) => (
                <p key={feature}>{feature}</p>
              ))}
              <p>{heroRestaurant.short_description}</p>

              <BaseBtn
                text={"View Restaurant"}
                onClick={() => {
                  goToReserve(navigate, heroRestaurant.id);
                }}
              >
                View Restaurant
              </BaseBtn>
            </>
          ) : (
            // No restaurant currently has `trending: true` in Firestore —
            // see the note below the code for how to seed that flag.
            <p className="text-gray-400">
              No trending restaurants yet — check back soon.
            </p>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold pb-4 pt-10">
          Browse Italian, Japanese, Cafés, Steakhouse, and more
        </h1>

        <div>
          <RestaurantGrid
            restaurants={gridItems}
            onReserve={(r) => goToReserve(navigate, r.id)}
            onBrowseMore={goToRestaurantPage}
          />
        </div>
      </div>

      <div>
        <FeatureCard eyebrow="How it works" />

        <StepsGridCard
          steps={[
            {
              title: "Find a Restaurant",
              description:
                "Browse restaurants by cuisine, location, or occasion to find the perfect place for any meal.",
            },
            {
              title: "Reserve Your Table",
              description:
                "Choose your preferred date and time, then confirm your reservation instantly.",
            },
            {
              title: "Enjoy Your Meal",
              description:
                "Sit back, enjoy your meal, and focus on making memories together.",
            },
          ]}
        />
      </div>

      <div className="relative flex flex-row gap-4 justify-between items-start pt-20">
        <div className="w-1/2">
          <FeatureCard
            eyebrow="What makes us different"
            title="DINE Your way"
            pretitle="Join a table, bring your own group, or simply enjoy great food—however you like to connect."
            subtitle="Whether you're dining solo or with friends, finding the right table should be effortless. Join an open table to meet new people, or book a private table for your own group—all in just a few taps."
          />

          <BaseBtn
            className="mt-4"
            onClick={goToRestaurantPage}
          >
            Find a Restaurant
          </BaseBtn>
        </div>
        <div className="w-1/2">
          <div
            className={`relative w-full h-96 rounded-2xl bg-cover bg-center overflow-hidden flex flex-col `}
            style={{ backgroundImage: `url(${HomeImg1})` }}
          ></div>
        </div>
      </div>

      <div className="relative">
        <FeatureCard
          eyebrow="testimonials"
          title="Loved by food lovers everywhere."
          subtitle="See how diners are discovering great restaurants, meeting new people, and making every reservation effortless."
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
              body: "Discover restaurants that match your taste, preferences, and occasions, for dining experiences that feel more meaningful.",
            },
          ]}
        />
      </div>
    </WrapperComponent>
  );
};

export default LandingPage;
