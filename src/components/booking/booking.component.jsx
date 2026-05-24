import React from "react";
import { useBookingStore } from "../../store/useBookingStore";
import { useMapStore } from "../../store/useMapStore";
import moment from "moment";
import MapComponent from "../map/map.component";
import FormComponent from "../reserve-form/reserve-form.component";
import RestaurantCard from "../card/restaurant-card/restaurant-card.component";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import FmdBadIcon from "@mui/icons-material/FmdBad";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const BookingComponent = () => {
  const latestBooking = useBookingStore(
    (state) =>
      state.bookings[state.bookings.length - 1] || state.currentBooking,
  );

  const selectedLocation = useMapStore((state) => state.selectedLocation);

  const bookingPreview = useBookingStore((state) => state.bookingPreview);
  const setBookingPreview = useBookingStore((state) => state.setBookingPreview);

  const setCurrentBooking = useBookingStore((state) => state.setCurrentBooking);
  const addBooking = useBookingStore((state) => state.addBooking);

  const setSelectedLocation = useMapStore((state) => state.setSelectedLocation);

  const { locations } = useMapStore();

  const { date, time, type, guests } = latestBooking || {};

  const closePreviewOnClick = () => {
    setBookingPreview(false);
    setCurrentBooking({});
    setSelectedLocation({});
  };

  const confirmBookingOnClick = () => {
    addBooking();
  };

  const locationCardOnClick = (item) => {
    setSelectedLocation({ ...item });
  };

  const backBtnOnClick = () => {
    setSelectedLocation({});
  };

  return (
    <>
      <div className="relative pb-20 pt-20 px-20 border-4 border-b-0 border-primary rounded-t-4xl">
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

        <h1 className="text-center text-2xl pb-10">
          Reserve Your Perfect Table – <br />
          Effortless Booking, Unforgettable Experience
        </h1>

        <div
          className={`grid grid-cols-1 lg:grid-cols-2 ${
            !selectedLocation?.name ? "gap-4" : ""
          }`}
        >
          <div className="h-150 overflow-auto ">
            <div
              className={`flex items-center hover:cursor-pointer pb-2 ${Object.keys(selectedLocation).length > 0 ? "" : "hidden"}`}
              onClick={backBtnOnClick}
            >
              <ArrowBackIosIcon fontSize="small" />
              Back
            </div>
            {selectedLocation?.name && (
              <h1 className="text-center text-2xl pt-10">
                Place:{" "}
                <span className="font-bold">{selectedLocation.name}</span>
              </h1>
            )}
            {/* : (
              <h1 className="text-center text-2xl pt-10">
                Please select a venue
              </h1>
            ) */}

            {!selectedLocation?.name ? (
              locations.map((item, id) => {
                return (
                  <div
                    key={id}
                    className={`${id != 0 && "mt-4"} flex items-start justify-center border rounded-lg overflow-hidden group hover:border-primary`}
                    onClick={() => locationCardOnClick(item)}
                  >
                    {/* <div className="w-2/3 p-4">{item.name}</div>
                    <div className="w-1/3">
                      <img src={`${item.image}`}></img>
                    </div> */}
                    <RestaurantCard item={item} additionalClassName={`group-hover:border-primary`} />
                  </div>
                );
              })
            ) : (
              <div className={`p-4`}>
                {selectedLocation?.name && <FormComponent />}
              </div>
            )}
          </div>
          <div className="w-full h-150 rounded-2xl overflow-hidden">
            <MapComponent />
          </div>
        </div>
      </div>

      {/* Pop Ups */}
      {bookingPreview && (
        <div
          className={`h-screen w-screen bg-black/50 top-0 left-0 fixed z-20 flex items-center justify-center`}
        >
          <div className="relative w-[40%] h-fit bg-white rounded-lg p-6 pt-4">
            {bookingPreview == "confirmation" ? (
              <div className="text-center">
                <FmdBadIcon className="mt-4" sx={{ fontSize: 64 }} />
                <h1 className="text-lg">Review Your Reservation</h1>
                <h1>
                  You’re just one step away from your dining experience. Please
                  take a moment to review your booking details before confirming
                  your reservation.
                </h1>
              </div>
            ) : (
              <div className="text-center">
                <CheckCircleIcon className="mt-4" sx={{ fontSize: 64 }} />
                <h1 className="text-lg"> Reservation Confirmed</h1>
                <h1>
                  Your table has been successfully reserved. We look forward to
                  welcoming you and making your dining experience memorable.
                </h1>
              </div>
            )}

            <h1 className="pt-4">Your booking details:</h1>
            <div className="">
              <h1 className="text-lg">
                Place:{" "}
                <span className="font-bold">{selectedLocation.name}</span>
              </h1>
              <h1>
                Date:{" "}
                <span className="font-bold">
                  {moment(date).format("Do MMMM YYYY")}
                </span>
              </h1>
              <h1>
                Time: <span className="font-bold">{time}</span>
              </h1>
              <h1>
                Dining Options:{" "}
                <span className="font-bold">
                  {type
                    ?.split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </span>
              </h1>
              <h1>
                Number of People: <span className="font-bold">{guests}</span>
              </h1>
            </div>
            {bookingPreview == "confirmation" ? (
              <div className="flex justify-end items-center gap-2">
                <h1
                  className="float-right hover:cursor-pointer"
                  onClick={() => setBookingPreview(false)}
                >
                  edit booking
                </h1>
                <h1
                  className="float-right hover:cursor-pointer"
                  onClick={confirmBookingOnClick}
                >
                  confirm booking
                </h1>
              </div>
            ) : (
              <h1
                className="float-right hover:cursor-pointer"
                onClick={closePreviewOnClick}
              >
                book another
              </h1>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BookingComponent;
