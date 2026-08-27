import "./landing-page.styles.css";
import { useNavigate } from "react-router";
import { useMapStore } from "../../store/useMapStore";
import { useBookingStore } from "../../store/useBookingStore";

import HomeImg1 from "../../assets/Images/homepage-1.jpg";

import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DinnerDiningIcon from "@mui/icons-material/DinnerDining";
import GppGoodIcon from "@mui/icons-material/GppGood";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PushPinIcon from "@mui/icons-material/PushPin";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EventIcon from "@mui/icons-material/Event";

import WrapperComponent from "../../components/wrapper/wrapper.component";
import FormComponent from "../../components/reserve-form/reserve-form.component";
import MapComponent from "../../components/map/map.component";
import FloatingCardImg from "../../components/card/floating-card-image/floating-card-image.component";
import SubmitBtn from "../../components/button/submit-btn.component";
import FeaturedCard from "../../components/card/featured-card/featured-card.component";
import TestimoniCardComponent from "../../components/card/testimoni-card/testimoni-card.component";
import BgImageComponent from "../../components/image/bg-image.component";
import BaseBtn, {
  ButtonExamples,
} from "../../components/button/base-button.component";
import RestaurantGrid from "../../components/card/restaurant-card-compact/restaurant-card-compact.component";
import FeatureCard from "../../components/card/featured-card/featured-card.component";
import StepsGridCard from "../../components/card/steps-grid-card/steps-grid-card.component";

const LandingPage = () => {
  const navigate = useNavigate();
  const latestBooking = useBookingStore(
    (state) =>
      state.bookings[state.bookings.length - 1] || state.currentBooking,
  );

  const selectedLocation = useMapStore((state) => state.selectedLocation);

  const bookingPreview = useBookingStore((state) => state.bookingPreview);
  const setBookingPreview = useBookingStore((state) => state.setBookingPreview);

  const setCurrentBooking = useBookingStore((state) => state.setCurrentBooking);
  const addBooking = useBookingStore((state) => state.addBooking);

  const { date, time, type, guests } = latestBooking || {};

  const closePreviewOnClick = () => {
    setBookingPreview(false);
    setCurrentBooking({});
  };

  const confirmBookingOnClick = () => {
    addBooking();
  };

  const featuredCardData = [
    {
      id: 1,
      title: "Effortless Booking",
      additionalClass: "",
      text: "Secure your table in seconds with a smooth, intuitive booking experience every time.",
      icon: (
        <AccessTimeIcon className="why-us-card-icon" sx={{ fontSize: 28 }} />
      ),
    },
    {
      id: 2,
      title: "Personalised Dining",
      additionalClass: "",
      text: "From casual catch-ups to special occasions, discover places that fit your moment perfectly.",
      icon: (
        <DinnerDiningIcon className="why-us-card-icon" sx={{ fontSize: 28 }} />
      ),
    },
    {
      id: 3,
      title: "Book with confidence",
      additionalClass: "",
      text: "Count on accurate availability and instant confirmations, so your plans stay simple and stress-free.",
      icon: <GppGoodIcon className="why-us-card-icon" sx={{ fontSize: 28 }} />,
    },
    {
      id: 4,
      title: "Curated Quality",
      additionalClass: "",
      text: "We highlight only the restaurants that deliver — so you spend less time searching and more time enjoying.",
      icon: (
        <AutoAwesomeIcon className="why-us-card-icon" sx={{ fontSize: 28 }} />
      ),
    },
  ];

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
        {/* <div className="landing-page w-full bg-center flex flex-col justify-center items-center">
          <h1 className="z-20 relative text-white text-7xl">
            Skip the Line. Get a Table.
          </h1>
          <p className="z-20 relative text-white text-lg pt-2">
            Whether it’s an intimate dinner, a family celebration, or a
            corporate event, our restaurant sets the stage for unforgettable
            moments.
          </p>
        </div>
        <div className="z-10 w-full h-full absolute top-0 left-0 bg-black opacity-40 rounded-tr-4xl rounded-bl-4xl"></div> */}
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

      <div className="relative flex justify-center items-center gap-2">
        <div
          className={`relative w-1/2 h-96 rounded-2xl bg-cover bg-center overflow-hidden flex flex-col `}
          style={{ backgroundImage: `url(${HomeImg1})` }}
        ></div>
        <div className="w-1/2 ">
          <h1>Trending RIght Now</h1>
          <p>Restorante Bella Vita</p>
          <p>12 Street Avenute, Brisbane, QLD</p>
          <p>Italian</p>
          <p>$$</p>
          <p>Outdoor Dining</p>
          <p>Family Friendly</p>
          <p>
            A cozy Italian restaurant known for handmade pasta, wood-red pizzas,
            and warm hospitality.
          </p>

          <BaseBtn
            text={"View Restaurant"}
            onClick={() => {
              navigate("/restaurants");
            }}
          >
            View Restaurant
          </BaseBtn>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold pb-4 pt-10">
          Browse Italian, Japanese, Cafés, Steakhouse, and more
        </h1>

        <div>
          <RestaurantGrid
            restaurants={[
              {
                id: 1,
                image:
                  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200",
                tag: "Steakhouse",
                name: "Burger House",
                rating: 4.7,
                reviewCount: 312,
                priceRange: "$$$",
                distance: "1.2 mi",
              },
              {
                id: 2,
                image:
                  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200",
                tag: "Bar",
                name: "Burger House",
                rating: 4.5,
                reviewCount: 189,
                priceRange: "$$",
                distance: "0.6 mi",
              },
            ]}
            onReserve={(r) => alert(`Reserve ${r.name}`)}
            onBrowseMore={() => navigate("/restaurants")}
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

        {/* <div className="grid grid-cols-3 gap-4">
          <div className="">
            <h1 className="font-bold text-4xl">01</h1>
            <h1 className="font-bold text-3xl py-2">Find a Restaurant</h1>
            <p>
              Browse restaurants by cuisine, location, or occasion to find the
              perfect place for any meal.
            </p>
          </div>
          <div className="">
            <h1 className="font-bold text-4xl">02</h1>
            <h1 className="font-bold text-3xl py-2">Reserve Your Table</h1>
            <p>
              Choose your preferred date and time, then confirm your reservation
              instantly.
            </p>
          </div>
          <div className="">
            <h1 className="font-bold text-4xl">03</h1>
            <h1 className="font-bold text-3xl py-2">Enjoy Your Meal</h1>
            <p>
              Sit back, enjoy your meal, and focus on making memories together.
            </p>
          </div>
        </div> */}
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
            onClick={() => {
              navigate("/restaurants");
            }}
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
