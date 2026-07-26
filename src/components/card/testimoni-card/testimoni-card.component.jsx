import { useState } from "react";

import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const TestimoniCardComponent = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Mitchell",
      title: "A seamless dining experience from start to finish",
      review:
        "A seamless dining experience from start to finish. Finding a great restaurant used to mean checking multiple websites, reading reviews, and calling ahead to see if tables were available. With this platform, everything is in one place. I was able to discover a new restaurant, book a table instantly, and receive confirmation within seconds. It made planning our dinner incredibly easy, and the experience at the restaurant was exactly what we expected.",
    },
    {
      id: 2,
      name: "James Carter",
      title: "Booking dinner has never been easier",
      review:
        "Booking dinner has never been easier. The interface is clean, fast, and incredibly simple to use, making it easy to browse restaurants and compare options without feeling overwhelmed. We found a fantastic local spot, reserved our table in less than a minute, and received instant confirmation. The entire process felt effortless, and when we arrived, everything was exactly as promised. It saved us time and made the evening stress-free from beginning to end.",
    },
    {
      id: 3,
      name: "Emily Wong",
      title: "Perfect for spontaneous nights out",
      review:
        "Perfect for spontaneous nights out. I love being able to browse restaurants and secure a table without making phone calls or waiting for callbacks. Whether it's a last-minute dinner with friends or a casual date night, the booking process is quick and reliable. I've discovered several amazing places through the platform, and every reservation has gone smoothly. It's become my first choice whenever I'm looking to plan an enjoyable meal with minimal effort.",
    },
    {
      id: 4,
      name: "Michael Johnson",
      title: "A game-changer for dining reservations",
      review:
        "A game-changer for dining reservations. This platform has completely transformed how I plan my meals out. The user interface is intuitive, and the booking process is incredibly smooth. The real-time availability updates and instant confirmations give me peace of mind, knowing my reservation is secure. It's a must-try for anyone who loves to dine out!",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevReview = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const current = testimonials[currentIndex];

  return (
    <>
      <div className="w-1/2 pl-4">
        <h1 className="text-3xl">What Our Customers Are Saying.</h1>
        <h1 className="text-xl pt-1 text-gray-400">
          Real Experiences, Real Reservations. Trusted by Food Lovers.
        </h1>

        <div className="flex gap-3 mt-8">
          <button
            onClick={prevReview}
            className="rounded-full hover:bg-gray-100 hover:cursor-pointer"
          >
            <KeyboardArrowLeftIcon />
          </button>

          <button
            onClick={nextReview}
            className="rounded-full hover:bg-gray-100 hover:cursor-pointer"
          >
            <KeyboardArrowRightIcon />
          </button>
        </div>
      </div>
      <div className="w-1/2 relative">
        <FormatQuoteIcon
          className="text-info opacity-100 z-20"
          sx={{ fontSize: 48 }}
        />
        <h1 className="pt-10 pb-4">{current.review}</h1>
        <h1 className="text-black italic pt-10">— {current.name}</h1>
      </div>
    </>
  );
};

export default TestimoniCardComponent;
