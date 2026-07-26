import React, { useEffect, useState } from "react";
import moment from "moment";

import WrapperComponent from "../../components/wrapper/wrapper.component";

import { useBookingStore } from "../../store/useBookingStore";
import { useAuthStore } from "../../store/useAuthStore";

const DiningJourneyPage = () => {
  const bookings = useBookingStore((state) => state.bookings);
  const fetchUserBookings = useBookingStore((state) => state.fetchUserBookings);
  const isLoading = useBookingStore((state) => state.isLoading);
  const fetchError = useBookingStore((state) => state.fetchError);

  const { user, authReady } = useAuthStore();

  useEffect(() => {
    if (authReady && user) {
      fetchUserBookings();
    }
  }, [authReady, user, fetchUserBookings]);

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  return (
    <WrapperComponent>
      <div className="max-w-5xl mx-auto py-12 px-6">
        <h1 className="font-google-sans text-4xl font-bold mb-2">
          Your Dining Journey
        </h1>

        <p className="text-gray-500 mb-8">
          Explore your past experiences and upcoming reservations.
        </p>

        {/* Auth is not ready but loading data... */}
        {!authReady && (
          <div className="text-center py-16">
            <p className="text-gray-500">Loading your bookings...</p>
          </div>
        )}

        {/* Auth ready and loading data... */}
        {authReady && isLoading && !fetchError && (
          <div className="text-center py-16">
            <p className="text-gray-500">Loading your bookings...</p>
          </div>
        )}

        {/* Auth ready and fetch error... */}
        {authReady && fetchError && (
          <div className="text-center py-16 border rounded-2xl">
            <p className="text-red-500">{fetchError}</p>
          </div>
        )}

        {/* Auth ready and no errors */}
        {authReady && !isLoading && !fetchError && (
          <div className="space-y-6">
            {sortedBookings.map((booking, index) => {
              const isUpcoming =
                new Date(`${booking.date} ${booking.time}`) > new Date();

              return (
                <div
                  key={booking.id || index}
                  className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        {booking.location?.name ||
                          booking.restaurantName ||
                          "Unknown Venue"}
                      </h2>

                      <p className="text-gray-500 mt-1">
                        {moment(booking.date).format("Do MMM YYYY")} •{" "}
                        {booking.time}
                      </p>

                      <p className="text-sm mt-2">
                        {booking.guests} guests •{" "}
                        {booking.type
                          ?.split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        isUpcoming
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isUpcoming ? "Upcoming" : "Completed"}
                    </span>
                  </div>
                </div>
              );
            })}

            {sortedBookings.length === 0 && (
              <div className="text-center py-16 border rounded-2xl">
                <h2 className="text-2xl font-semibold">
                  No dining experiences yet
                </h2>
                <p className="text-gray-500 mt-2">
                  Your reservations will appear here once you make a booking.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </WrapperComponent>
  );
};

export default DiningJourneyPage;
