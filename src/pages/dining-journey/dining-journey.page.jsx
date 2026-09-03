import { useEffect, useMemo, useState } from "react";
import moment from "moment";

import WrapperComponent from "../../components/wrapper/wrapper.component";
import FeatureCard from "../../components/card/featured-card/featured-card.component";
import BookingDetailsModal from "../../features/booking/booking-details-map/booking-details-map.component";

import { useBookingStore } from "../../store/useBookingStore";
import { useAuthStore } from "../../store/useAuthStore";

const DiningJourneyPage = () => {
  const bookings = useBookingStore((state) => state.bookings);
  const fetchUserBookings = useBookingStore((state) => state.fetchUserBookings);
  const isLoading = useBookingStore((state) => state.isLoading);
  const fetchError = useBookingStore((state) => state.fetchError);

  const { user, authReady } = useAuthStore();

  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ type: "all", sort: "newest" });
  const [selectedBooking, setSelectedBooking] = useState(null); // drives the details modal

  useEffect(() => {
    if (authReady && user) {
      fetchUserBookings();
    }
  }, [authReady, user, fetchUserBookings]);

  /*
   * Status is derived locally from the booking's date/time — it's a pure
   * function of data already in the store, so it never needs to hit
   * Firestore. (fetchBookingById is a *store action* for looking up one
   * booking by id; it's not a status calculator, and must never be called
   * from inside a render loop.)
   */
  const getBookingStatus = (booking) => {
    if (booking.status === "cancelled" || booking.status === "canceled") {
      return "cancelled";
    }

    const bookingDate = new Date(`${booking.date} ${booking.time}`);
    return bookingDate > new Date() ? "upcoming" : "completed";
  };

  const formatBookingType = (type) => {
    if (!type) return "Dining";

    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (activeStatus !== "all") {
      result = result.filter((booking) => getBookingStatus(booking) === activeStatus);
    }

    if (filters.type !== "all") {
      result = result.filter((booking) => booking.type === filters.type);
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((booking) => {
        const restaurant = booking.location?.name || "";
        const address = booking.location?.address || "";
        const type = booking.type || "";

        return (
          restaurant.toLowerCase().includes(query) ||
          address.toLowerCase().includes(query) ||
          type.toLowerCase().includes(query)
        );
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);

      return filters.sort === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [bookings, activeStatus, filters, search]);

  const statusTabs = [
    { id: "all", label: "All" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const bookingTypes = [...new Set(bookings.map((booking) => booking.type).filter(Boolean))];

  const clearFilters = () => {
    setFilters({ type: "all", sort: "newest" });
    setSearch("");
    setActiveStatus("all");
  };

  return (
    <WrapperComponent>
      <div className="mx-auto px-6">
        <FeatureCard
          eyebrow="Your dining journey"
          title="Every reservation tells a story."
          subtitle="Whether you're planning your next meal or looking back on memorable moments, all your dining experiences are organized in one place"
        />

        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants or locations"
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-300 bg-white outline-none focus:border-black transition"
            />
          </div>

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`h-12 px-5 rounded-xl border flex items-center justify-center gap-2 transition ${
              showFilters ? "bg-black text-white border-black" : "bg-white border-gray-300 hover:border-black"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16" />
              <path d="M7 12h10" />
              <path d="M10 18h4" />
            </svg>
            Filters
          </button>
        </div>

        {/* FILTER PANEL */}
        {showFilters && (
          <div className="border border-gray-200 rounded-2xl p-5 mb-6 bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Booking type</label>

                <select
                  value={filters.type}
                  onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white"
                >
                  <option value="all">All types</option>
                  {bookingTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatBookingType(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sort by</label>

                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button onClick={clearFilters} className="text-sm font-medium underline underline-offset-4">
                Clear filters
              </button>
            </div>
          </div>
        )}

        {/* STATUS TABS */}
        <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id)}
              className={`pb-4 whitespace-nowrap text-sm font-medium border-b-2 transition ${
                activeStatus === tab.id ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!authReady && (
          <div className="py-20 text-center">
            <p className="text-gray-500">Loading your dining journey...</p>
          </div>
        )}

        {authReady && isLoading && !fetchError && (
          <div className="py-20 text-center">
            <p className="text-gray-500">Loading your bookings...</p>
          </div>
        )}

        {authReady && fetchError && (
          <div className="py-16 text-center border border-gray-200 rounded-2xl">
            <div className="text-3xl mb-3">!</div>
            <h2 className="font-semibold text-lg">Something went wrong</h2>
            <p className="text-gray-500 mt-1">{fetchError}</p>
            <button onClick={fetchUserBookings} className="mt-5 px-5 py-2.5 rounded-lg bg-black text-white text-sm">
              Try again
            </button>
          </div>
        )}

        {authReady && !isLoading && !fetchError && (
          <>
            {filteredBookings.length > 0 ? (
              <div className="space-y-5">
                {filteredBookings.map((booking, index) => {
                  const status = getBookingStatus(booking);
                  const { location } = booking; // single source of truth

                  return (
                    <article
                      key={booking.id || index}
                      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-64 h-52 md:h-auto shrink-0 bg-gray-100">
                          {location?.image ? (
                            <img src={location.image} alt={location?.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                          )}
                        </div>

                        <div className="flex-1 p-5 md:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                {status === "upcoming"
                                  ? "Your upcoming dining"
                                  : status === "completed"
                                    ? "Dining experience"
                                    : "Cancelled booking"}
                              </p>
                              <h2 className="text-xl md:text-2xl font-semibold">{location?.name || "Unknown venue"}</h2>
                              {location?.address && <p className="text-sm text-gray-500 mt-1">{location.address}</p>}
                            </div>

                            <span
                              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                                status === "upcoming"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : status === "completed"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-600"
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 text-sm">
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Date</p>
                              <p className="font-medium">{moment(booking.date).format("ddd, Do MMM YYYY")}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Time</p>
                              <p className="font-medium">{booking.time}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Guests</p>
                              <p className="font-medium">
                                {booking.totalSeats || 0} {booking.totalSeats === 1 ? "guest" : "guests"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Type</p>
                              <p className="font-medium">{formatBookingType(booking.type)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                            <div className="text-sm text-gray-500">
                              {booking.isJoined ? <span>Joined another diner's table</span> : <span>Your reservation</span>}
                            </div>

                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="px-4 py-2.5 rounded-lg border border-black text-sm font-medium hover:bg-black hover:text-white transition"
                            >
                              View details
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 border border-gray-200 rounded-2xl">
                <div className="text-4xl mb-4">🍽️</div>
                <h2 className="text-xl font-semibold">
                  {search
                    ? "No dining experiences found"
                    : activeStatus === "upcoming"
                      ? "No upcoming dining plans"
                      : activeStatus === "completed"
                        ? "No completed experiences"
                        : activeStatus === "cancelled"
                          ? "No cancelled bookings"
                          : "Your dining journey starts here"}
                </h2>

                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  {search
                    ? "Try changing your search or filters."
                    : activeStatus === "upcoming"
                      ? "Your upcoming reservations and joined tables will appear here."
                      : activeStatus === "completed"
                        ? "Restaurants you've visited will appear here."
                        : activeStatus === "cancelled"
                          ? "Cancelled bookings will appear here."
                          : "Book a restaurant and start building your dining journey."}
                </p>

                {(search || activeStatus !== "all" || filters.type !== "all") && (
                  <button onClick={clearFilters} className="mt-5 px-5 py-2.5 rounded-lg bg-black text-white text-sm font-medium">
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
    </WrapperComponent>
  );
};

export default DiningJourneyPage;