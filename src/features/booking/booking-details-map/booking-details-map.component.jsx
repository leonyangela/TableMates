import moment from "moment";
import BookingLocationMap from "../booking-location-map/booking-location-map.component";

const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-400 text-xs mb-1">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

const BookingDetailsModal = ({ booking, onClose }) => {
  if (!booking) return null;

  const {
    location,
    date,
    time,
    totalSeats,
    type,
    tableDescription,
    email,
    isOpenTable,
    occasion,
    name,
    notes,
    phone,
    otherOccassionDescription,
    seatsAvailable,
    seatsJoined,
  } = booking;

  console.log(booking);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-56 md:h-72">
          <BookingLocationMap
            lng={location?.lng}
            lat={location?.lat}
            label={location?.name}
          />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {location?.name || "Unknown venue"}
              </h2>
              {location?.address && (
                <p className="text-sm text-gray-500 mt-1">{location.address}</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="shrink-0 text-gray-400 hover:text-black text-xl leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <Detail
              label="Date"
              value={moment(date).format("ddd, Do MMM YYYY")}
            />
            <Detail label="Time" value={time} />
            <Detail
              label="Guests"
              value={`${totalSeats || 0} ${totalSeats === 1 ? "guest" : "guests"}`}
            />
            <Detail label="Type" value={type} />
            <Detail label="Name" value={name} />
            <Detail label="Occasion" value={occasion} />
            <Detail label="Phone" value={phone} />
            <Detail label="email" value={email} />
            <Detail label="Is Open Table?" value={isOpenTable ? "Yes" : "No"} />
            <Detail label="Table Description" value={tableDescription} />
            <Detail label="Total Seats" value={totalSeats} />
            <Detail label="Total Seats Available" value={seatsAvailable} />
            <Detail label="Total Seats Joined" value={seatsJoined} />
            <Detail label="Notes" value={notes || "None"} />
            <Detail
              label="Other Occasion Description"
              value={otherOccassionDescription || "None"}
            />
            <Detail
              label="Date Booked"
              value={moment(booking.dateBooked).format("ddd, Do MMM YYYY")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
