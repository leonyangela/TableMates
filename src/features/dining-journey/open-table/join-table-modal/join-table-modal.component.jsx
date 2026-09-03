import { useState } from "react";
import moment from "moment";
import BookingLocationMap from "../../../booking/booking-location-map/booking-location-map.component";
import { useOpenTableStore } from "../../../../store/useOpenTableStore";

const JoinTableModal = ({ table, onClose }) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const joinPublicTable = useOpenTableStore((state) => state.joinPublicTable);
  const requestApprovalTable = useOpenTableStore(
    (state) => state.requestApprovalTable,
  );
  const joinError = useOpenTableStore((state) => state.joinError);

  if (!table) return null;

  const {
    location,
    date,
    time,
    totalSeats,
    seatsAvailable,
    tableVisibility,
    userId,
  } = table;
  const isApprovalRequired = tableVisibility === "open_approval";

  const handleJoin = async () => {
    setIsSubmitting(true);

    let success = false;

    if (isApprovalRequired) {
      success = await requestApprovalTable(table.id, message);
    } else {
      success = await joinPublicTable(table.id);
    }

    if (success) {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2000);
    }

    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Map */}
        <div className="h-56 md:h-72">
          <BookingLocationMap
            lng={location?.lng}
            lat={location?.lat}
            label={location?.name}
          />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
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

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-1">Date</p>
              <p className="font-medium">
                {moment(date).format("ddd, Do MMM YYYY")}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Time</p>
              <p className="font-medium">{time}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Total Seats</p>
              <p className="font-medium">{totalSeats}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Available Seats</p>
              <p className="font-medium">{seatsAvailable}</p>
            </div>
          </div>

          {/* Approval type info */}
          {isApprovalRequired && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-900">
                <strong>Host Approval Required:</strong> Your request will be
                sent to the host for approval. They'll review your message and
                confirm if you can join.
              </p>
            </div>
          )}

          {/* Message input (approval only) */}
          {isApprovalRequired && !submitted && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Message to Host (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the host a bit about yourself..."
                className="w-full h-24 p-3 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:border-black"
              />
            </div>
          )}

          {/* Success state */}
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="text-lg font-semibold">
                {isApprovalRequired ? "Request Sent!" : "Joined Successfully!"}
              </h3>
              <p className="text-gray-500 mt-2 text-sm">
                {isApprovalRequired
                  ? "The host will review your request. Check back for their response."
                  : "You've joined the table. Have a great meal!"}
              </p>
            </div>
          ) : (
            <>
              {/* Error message */}
              {joinError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {joinError}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoin}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Processing..."
                    : isApprovalRequired
                      ? "Request to Join"
                      : "Join Now"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinTableModal;
