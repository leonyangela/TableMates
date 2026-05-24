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

import WrapperComponent from "../../components/wrapper/wrapper.component";
import FormComponent from "../../components/reserve-form/reserve-form.component";
import MapComponent from "../../components/map/map.component";
import FloatingCardImg from "../../components/card/floating-card-image/floating-card-image.component";
import RestaurantCard from "../../components/card/restaurant-card/restaurant-card.component";
import BookingComponent from "../../components/booking/booking.component";
import SubmitBtn from "../../components/button/submit-btn.component";
import FeaturedCard from "../../components/card/featured-card/featured-card.component";

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
        <div className="landing-page w-full bg-center flex flex-col justify-center items-center">
          <h1 className="z-20 relative text-white text-7xl">
            Skip the Line. Get a Table.
          </h1>
          <p className="z-20 relative text-white text-lg pt-2">
            Whether it’s an intimate dinner, a family celebration, or a
            corporate event, our restaurant sets the stage for unforgettable
            moments.
          </p>
        </div>
        <div className="z-10 w-full h-full absolute top-0 left-0 bg-black opacity-40 rounded-tr-4xl rounded-bl-4xl"></div>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 my-10">
        <FloatingCardImg />

        <div>
          <h1 className="text-secondary text-sm">
            Find the perfect place for every craving.
          </h1>
          <h2 className="text-3xl">Taste What Everyone Loves</h2>
          <p className="text-xl pb-4">
            From local favorites to trending hotspots, discover unforgettable
            dining experiences.
          </p>

          <div className="flex gap-0 pb-2">
            <PushPinIcon className="-rotate-12" />
            <p>Location: </p>
          </div>

          <ul className="flex gap-2 flex-wrap">
            <li className="border-2 border-accent rounded-full w-fit px-4">
              Must-try restaurants
            </li>
            <li className="border-2 border-accent rounded-full w-fit px-4">
              Local favorites & hidden gems
            </li>
            <li className="border-2 border-accent rounded-full w-fit px-4">
              Diverse cuisines to explore
            </li>
            <li className="border-2 border-accent rounded-full w-fit px-4">
              Experiences worth sharing
            </li>
          </ul>

          <p className="text-base pt-4">
            We keep our picks constantly updated so you’re always seeing what’s
            actually worth checking out right now. From viral spots to
            underrated hidden gems, everything is chosen based on taste, vibe,
            and consistency. If a place is just hype without substance, it
            doesn’t make the list — we focus on restaurants that genuinely
            deliver every time. Think of it as your shortcut to food spots worth
            your time, money, and next post.
          </p>

          <p className="text-base pt-4 pb-2">
            The list stays fresh and evolving, so you’re never stuck with
            outdated recommendations. Whether it’s trending places or
            under-the-radar favourites, every spot is filtered for quality,
            experience, and consistency. If it doesn’t actually hit, it doesn’t
            get featured — simple as that. It’s your go-to guide for finding
            food that’s worth showing up for.
          </p>

          <SubmitBtn
            text={"Check it out"}
            className={
              "rounded-full! text-sm font-bold border-accent! text-accent! hover:border-primary! hover:text-primary!"
            }
          />

          <div className="flex gap-2 pt-4 pb-4">
            <div className="w-1/3 rounded-lg overflow-hidden">
              <img src={HomeImg1} alt="" />
            </div>
            <div className="w-1/3 rounded-lg overflow-hidden">
              <img src={HomeImg1} alt="" />
            </div>
            <div className="w-1/3 rounded-lg overflow-hidden">
              <img src={HomeImg1} alt="" />
            </div>
          </div>
        </div>
      </div>

      {/* Quotes */}
      <div className="relative bg-accent w-full h-80 p-10 rounded-md">
        <FormatQuoteIcon
          className="absolute text-white opacity-40 left-0 top-0"
          sx={{ fontSize: 128 }}
        />
        <h1 className="text-white text-3xl">
          Plans change, and dining shouldn’t be stressful. Whether you’re
          booking in advance or last minute, you can adjust or cancel your
          reservation with ease.
        </h1>
        <div className="w-40 bg-white h-1 mt-4"></div>
        {/* <h1 className="text-2xl text-white text-center">
            Occasion-Based Choices
            <AutoAwesomeIcon className="absolute top-10 ml-1" />
          </h1>

          <div>
            <h1 className="text-base text-white pb-2 pt-4">Date Night:</h1>

            <div className="grid grid-cols-5 gap-4 overflow-hidden">
              {restData.map((item, id) => {
                return <RestaurantCard item={item} key={id} />;
              })}
            </div>
          </div>
          <div>
            <h1 className="text-base text-white pb-2 pt-4">Birthday Night:</h1>

            <div className="grid grid-cols-5 gap-4 overflow-hidden">
              {restData.map((item, id) => {
                return <RestaurantCard item={item} key={id} />;
              })}
            </div>
          </div> */}
      </div>

      {/* Why us */}
      <div className="flex flex-row gap-4 m-10 justify-center items-stretch">
        <div
          className="w-1/3 h-auto bg-center bg-cover rounded-2xl rounded-tl-none"
          style={{ backgroundImage: `url(${HomeImg1})` }}
        ></div>
        <div className="w-2/3  ">
          <h1 className="text-3xl text-center pb-4">Why Choose Us?</h1>

          <div className="flex flex-row gap-4">
            <div className="w-1/2 relative flex flex-col justify-between">
              {featuredCardData.map(
                ({ id, title, additionalClass, text, icon }) => (
                  <FeaturedCard
                    key={id}
                    number={id}
                    title={title}
                    additionalClass={additionalClass}
                    text={text}
                    icon={icon}
                  />
                ),
              )}
            </div>
            <div className="w-1/2 relative">
              <p className="">
                Great moments start with the right place. We cut through the
                noise to bring you restaurants that are actually worth your time
                — not just trending for a week, but consistently good. Every
                spot is selected for quality, experience, and reliability, so
                you can book with confidence instead of guesswork.
              </p>
              <div className="rounded-lg border-2 border-info p-2 mt-4 mb-4">
                <h1 className="text-xl">Our Mission</h1>
                {/* <div className="w-full h-0.5 bg-white"/> */}
                <h1 className="">
                  Our mission is to make every dining experience easier to
                  access by helping people quickly find and book great
                  restaurants without friction or unnecessary steps. We focus on
                  making the process more reliable through real-time
                  availability and instant confirmation, so users can trust that
                  their reservation is secured. Ultimately, we aim to make
                  dining more enjoyable by removing stress from planning—from
                  the moment of discovery to the final reservation.
                </h1>
              </div>
              <div className="rounded-lg border-2 border-info p-2">
                <h1 className="text-black text-xl">Our Vision</h1>
                {/* <div className="w-full h-0.5 bg-white"/> */}
                <h1 className="text-black ">
                  Our vision is to create a world where booking a restaurant is
                  completely seamless, instant, and stress-free for everyone. We
                  aim to become the most trusted platform that connects people
                  to great dining experiences anytime, anywhere.
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review */}
      <div className="border-2 border-secondary h-46 rounded-2xl mb-10 p-4">
        <div className="h-full flex flex-row gap-20 justify-start items-start">
          <h1 className="text-5xl text-info self-start">Reviews</h1>

          <div className="">
            <h1 className="text-black">
              Not just hype — people actually love these spots
            </h1>
            <p className="text-black ">
              Real reviews, real bookings, and zero paid fluff. If it’s on here,
              it’s because people keep going back.
            </p>

            <div className="flex gap-6 items-center">
              <span className="text-black">
                <StarIcon className="text-accent" />
                <StarIcon className="text-accent" />
                <StarIcon className="text-accent" />
                <StarIcon className="text-accent" />
                <StarHalfIcon className="text-accent" />
              </span>

              <span className="text-black">
                1k+ tables booked over last month
              </span>
              <span className="text-black">50+ seating available</span>
            </div>

            <h1 className="text-black pt-10">
              Location:{" "}
              <span className="text-black italic">Riverbar & Kitchen</span>
            </h1>
          </div>
        </div>
      </div>

      {/* <h1 className="text-2xl text-center">How It Works</h1>
        <div className="relative grid grid-cols-1 xl:grid-cols-3 p-4 py-4 text-center">
          <div>
            <h1 className="how-to-title">01</h1>
            <h1 className="how-to-subtitle">Choose Your Date & Time</h1>
            <h1 className="how-to-text">
              Choose a time that fits perfectly into your schedule.
            </h1>
          </div>
          <div>
            <h1 className="how-to-title">02</h1>
            <h1 className="how-to-subtitle">Customize Your Experience</h1>
            <h1 className="how-to-text">
              From casual dining to private events, tailor it your way.
            </h1>
          </div>
          <div>
            <h1 className="how-to-title">03</h1>
            <h1 className="how-to-subtitle">Book & Enjoy</h1>
            <h1 className="how-to-text">
              Get instant confirmation and look forward to a great experience.
            </h1>
          </div>
        </div> */}

      <div
        className="relative w-full h-dvh bg-cover bg-no-repeat flex justify-center items-center rounded-t-xl overflow-hidden"
        style={{ backgroundImage: `url(${HomeImg1})` }}
      >
        <div className="absolute w-full h-full bg-black/50"></div>
        <div className="z-20">
          <h1 className="text-4xl text-white text-center pb-4">
            Ready to book your table?
          </h1>
          {/* <h1 className="text-center pt-4 pb-6 text-white text-2xl">
            Find available restaurants and reserve instantly—no calls, no
            waiting.
          </h1> */}
          <SubmitBtn
            text={"Find a Table"}
            className={`mx-auto border-white text-white hover:border-primary! hover:text-primary!`}
            onClick={() => {
              navigate("/discover");
            }}
          />
        </div>
      </div>
      {/* Booking Component */}
      {/* <BookingComponent /> */}
    </WrapperComponent>
  );
};

export default LandingPage;
