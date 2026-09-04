import { useEffect } from "react";
import moment from "moment";
import BookingLocationMap from "../../../booking/booking-location-map/booking-location-map.component";
import { useOpenTableStore } from "../../../../store/useOpenTableStore";

// Stable reference so the selector below doesn't return a new array on
// every render when there's no entry yet — a fresh `|| []` each render is
// what triggers Zustand's "getSnapshot should be cached" warning/loop.
const EMPTY_REQUESTS = [];

const ViewTableModal = ({ table, onClose, onEdit }) => {
  const fetchJoinRequestsForTable = useOpenTableStore(
    (state) => state.fetchJoinRequestsForTable,
  );
  const approveJoinRequest = useOpenTableStore(
    (state) => state.approveJoinRequest,
  );
  const rejectJoinRequest = useOpenTableStore(
    (state) => state.rejectJoinRequest,
  );
  const isLoadingRequests = useOpenTableStore(
    (state) => state.isLoadingRequests,
  );
  const requestsError = useOpenTableStore((state) => state.requestsError);
  const pendingRequests = useOpenTableStore(
    (state) =>
      (table?.id && state.joinRequestsByTable[table.id]) || EMPTY_REQUESTS,
  );

  const isApprovalRequired = table?.tableVisibility === "open_approval";

  // Only approval-required tables have anything pending to review.
  useEffect(() => {
    if (table?.id && isApprovalRequired) {
      fetchJoinRequestsForTable(table.id);
    }
  }, [table?.id, isApprovalRequired, fetchJoinRequestsForTable]);

  if (!table) return null;

  const {
    location,
    date,
    time,
    totalSeats,
    seatsAvailable,
    yourSeats,
    type,
    tableDescription,
    email,
    isOpenTable,
    occasion,
    name,
    notes,
    phone,
    otherOccassion,
    seatsJoined,
    joinedUsers = [],
  } = table;

  const displayNameFor = (person) =>
    person.displayName || person.email || "Guest";

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
              <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">
                Your table
              </p>
              <h2 className="text-xl font-semibold">
                {location?.name || "Unknown venue"}
              </h2>
              {location?.address && (
                <p className="text-sm text-gray-500 mt-1">{location.address}</p>
              )}
            </div>  

            <div className="flex items-center gap-4">

            {onEdit && (
              <button
                onClick={() => onEdit(table)}
                className="text-xs font-medium text-gray-500 hover:text-black underline"
              >
                Edit table
              </button>
            )}

            <button
              onClick={onClose}
              className="shrink-0 text-gray-400 hover:text-black text-xl leading-none"
              aria-label="Close"
            >
              ✕
            </button>
            </div>

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
            <div>
              <p className="text-gray-400 text-xs mb-1">Your Seats</p>
              <p className="font-medium">{yourSeats}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Seats Joined</p>
              <p className="font-medium">{seatsJoined || "-"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">type</p>
              <p className="font-medium">{type}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Table Description</p>
              <p className="font-medium">{tableDescription || "-"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Email</p>
              <p className="font-medium">{email || "-"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Is Open Table?</p>
              <p className="font-medium">{isOpenTable ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Occasion</p>
              <p className="font-medium">{occasion || "-"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Other Occasion Description</p>
              <p className="font-medium">{otherOccassion || "None"}</p>
            </div>
          </div>

          {/* Joined diners */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">
              Diners who've joined ({joinedUsers.length})
            </h3>

            {joinedUsers.length === 0 ? (
              <p className="text-sm text-gray-400">No one has joined yet.</p>
            ) : (
              <div className="space-y-2">
                {joinedUsers.map((person, idx) => (
                  <div
                    key={person.uid || idx}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  >
                    <div>
                      <p className="font-medium">{displayNameFor(person)}</p>
                      {person.email && person.displayName && (
                        <p className="text-xs text-gray-400">{person.email}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 capitalize">
                      {person.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending requests (approval-required tables only) */}
          {isApprovalRequired && (
            <div>
              <h3 className="text-sm font-semibold mb-3">
                Pending requests
                {pendingRequests.length > 0 && ` (${pendingRequests.length})`}
              </h3>

              {isLoadingRequests ? (
                <p className="text-sm text-gray-400">Loading requests...</p>
              ) : requestsError ? (
                <p className="text-sm text-red-600">{requestsError}</p>
              ) : pendingRequests.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No pending requests right now.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="px-3 py-3 rounded-lg border border-gray-200 text-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {req.guestDisplayName || req.guestEmail || "Guest"}
                          </p>
                          {req.message && (
                            <p className="text-gray-500 mt-1">{req.message}</p>
                          )}
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => rejectJoinRequest(req.id, table.id)}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium hover:bg-gray-50 transition"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => approveJoinRequest(req.id, table.id)}
                            disabled={seatsAvailable <= 0}
                            className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-medium hover:opacity-90 transition disabled:opacity-50"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {seatsAvailable <= 0 && pendingRequests.length > 0 && (
                <p className="text-xs text-orange-600 mt-2">
                  This table is full — free up a seat before approving more
                  requests.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTableModal;
