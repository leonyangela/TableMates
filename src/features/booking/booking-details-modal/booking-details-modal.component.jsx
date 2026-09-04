import { useEffect, useState } from "react";
import moment from "moment";
import BookingLocationMap from "../booking-location-map/booking-location-map.component";
import { useAuthStore } from "../../../store/useAuthStore";
import { useOpenTableStore } from "../../../store/useOpenTableStore";
import { isBookingPast } from "../../../utils/checkPastBooking";

const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-400 text-xs mb-1">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

// Stable reference — see the ViewTableModal fix earlier. A fresh `|| []`
// on every render breaks Zustand's getSnapshot caching.
const EMPTY_REQUESTS = [];

/**
 * Single modal for viewing a booking, used from both:
 *  - DiningJourneyPage (always the current user's own booking, so
 *    `isOwner` is always true there)
 *  - CommunityDiningPage (browsing open tables hosted by anyone)
 *
 * The doc shape is identical in both cases (they're the same Firestore
 * collection) — what differs is which sections are relevant to show,
 * decided purely from `booking.isOpenTable` / `tableVisibility` and
 * whether the viewer owns it.
 *
 * Props:
 *  - booking: the booking/table doc, or null
 *  - onClose: () => void
 *  - onEdit: optional (booking) => void — shown as an owner action on
 *    open tables. Omit to hide editing (e.g. if this modal is ever
 *    reused somewhere edit shouldn't be offered).
 */
const BookingDetailsModal = ({ booking, onClose, onEdit }) => {
  const { user } = useAuthStore();

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestedSeats, setRequestedSeats] = useState(1);

  const joinPublicTable = useOpenTableStore((state) => state.joinPublicTable);
  const requestApprovalTable = useOpenTableStore(
    (state) => state.requestApprovalTable,
  );
  const joinError = useOpenTableStore((state) => state.joinError);

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
      (booking?.id && state.joinRequestsByTable[booking.id]) || EMPTY_REQUESTS,
  );

  const isOwner = Boolean(user) && booking?.userId === user.uid;
  const isOpenTable = Boolean(booking?.isOpenTable);
  const isApprovalRequired = booking?.tableVisibility === "open_approval";
  const alreadyJoined =
    Boolean(user) && (booking?.joinedUserIds || []).includes(user.uid);
  const isPast = isBookingPast(booking);

  // Reset the join form's local state whenever a different booking opens,
  // so leftover text/success state from a previous modal view doesn't leak in.
  useEffect(() => {
    setMessage("");
    setIsSubmitting(false);
    setSubmitted(false);
    setRequestedSeats(1);
  }, [booking?.id]);

  // Host viewing their own approval-required table: load who's pending.
  useEffect(() => {
    if (booking?.id && isOwner && isApprovalRequired) {
      fetchJoinRequestsForTable(booking.id);
    }
  }, [booking?.id, isOwner, isApprovalRequired, fetchJoinRequestsForTable]);

  if (!booking) return null;

  const {
    location,
    date,
    time,
    totalSeats,
    type,
    tableDescription,
    email,
    occasion,
    name,
    notes,
    phone,
    otherOccassion,
    seatsAvailable,
    seatsJoined,
    yourSeats,
    joinedUsers = [],
  } = booking;

  const displayNameFor = (person) =>
    person.displayName || person.email || "Guest";

  const handleJoin = async () => {
    setIsSubmitting(true);

    const success = isApprovalRequired
      ? await requestApprovalTable(booking.id, message, requestedSeats)
      : await joinPublicTable(booking.id, requestedSeats);

    if (success) {
      setSubmitted(true);
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
              <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">
                {isOwner && isOpenTable
                  ? "Your table"
                  : isOpenTable
                    ? "Open table"
                    : "Booking"}
              </p>
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

            {/* Host-only / booking-owner fields — a non-owner browsing an
                open table doesn't need the host's contact card or the raw
                seat-accounting breakdown. */}
            {isOwner && (
              <>
                <Detail label="Name" value={name} />
                <Detail label="Phone" value={phone} />
                <Detail label="Email" value={email} />
              </>
            )}

            <Detail label="Occasion" value={occasion} />
            {occasion?.toLowerCase() === "other" && (
              <Detail
                label="Other Occasion Description"
                value={otherOccassion || "None"}
              />
            )}

            {isOpenTable && (
              <>
                <Detail
                  label="Table Description"
                  value={tableDescription || "-"}
                />
                <Detail label="Total Seats" value={totalSeats} />
                <Detail label="Your Seats" value={yourSeats} />
                <Detail label="Seats Joined" value={seatsJoined || 0} />
                <Detail label="Seats Available" value={seatsAvailable} />
              </>
            )}

            {isOwner && <Detail label="Notes" value={notes || "-"} />}

            {booking.dateBooked && (
              <Detail
                label="Date Booked"
                value={moment(booking.dateBooked).format(
                  "ddd, Do MMM YYYY @ h:mm A",
                )}
              />
            )}
          </div>

          {/* OWNER VIEW: roster + pending requests + edit action */}
          {isOwner && isOpenTable && (
            <>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold mb-3">
                  Diners who've joined ({joinedUsers.length})
                </h3>

                {joinedUsers.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No one has joined yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {joinedUsers.map((person, idx) => (
                      <div
                        key={person.uid || idx}
                        className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      >
                        <div>
                          <div>
                            <p className="font-medium">
                              {displayNameFor(person)}
                            </p>
                            {person.email && person.displayName && (
                              <p className="text-xs text-gray-400">
                                {person.email}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {person.seats || 1} seat
                            {(person.seats || 1) === 1 ? "" : "s"} ·{" "}
                            {person.status}
                          </span>
                        </div>
                        {/* <span className="text-xs text-gray-400 capitalize">
                          {person.status}
                        </span> */}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isApprovalRequired && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3">
                    Pending requests
                    {pendingRequests.length > 0 &&
                      ` (${pendingRequests.length})`}
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
                                {req.guestDisplayName ||
                                  req.guestEmail ||
                                  "Guest"}
                                {" · "}
                                {req.seatsRequested || 1} seat
                                {(req.seatsRequested || 1) === 1 ? "" : "s"}
                              </p>
                              {req.message && (
                                <p className="text-gray-500 mt-1">
                                  {req.message}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() =>
                                  rejectJoinRequest(req.id, booking.id)
                                }
                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium hover:bg-gray-50 transition"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() =>
                                  approveJoinRequest(req.id, booking.id)
                                }
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

              {onEdit && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  {isPast ? (
                    <p className="text-sm text-gray-400">
                      This table's date has passed and can no longer be edited.
                    </p>
                  ) : (
                    <button
                      onClick={() => onEdit(booking)}
                      className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
                    >
                      Edit table
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* NON-OWNER VIEW: join / request to join */}
          {!isOwner && isOpenTable && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              {isPast ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  This table's date has passed and can no longer be joined.
                </p>
              ) : alreadyJoined ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">✓</div>
                  <h3 className="text-lg font-semibold">You're in!</h3>
                  <p className="text-gray-500 mt-2 text-sm">
                    You've already joined this table. See you there!
                  </p>
                </div>
              ) : isApprovalRequired ? (
                <>
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-900">
                      <strong>Host Approval Required:</strong> Your request will
                      be sent to the host for approval. They'll review your
                      message and confirm if you can join.
                    </p>
                  </div>

                  {submitted ? (
                    <div className="text-center py-6">
                      <div className="text-4xl mb-3">✓</div>
                      <h3 className="text-lg font-semibold">Request Sent!</h3>
                      <p className="text-gray-500 mt-2 text-sm">
                        The host will review your request. Check back for their
                        response.
                      </p>
                      <button
                        onClick={onClose}
                        className="mt-6 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          Seats needed
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={Math.max(seatsAvailable, 1)}
                          value={requestedSeats}
                          onChange={(e) =>
                            setRequestedSeats(
                              Math.max(
                                1,
                                Math.min(
                                  Number(e.target.value) || 1,
                                  seatsAvailable,
                                ),
                              ),
                            )
                          }
                          className="w-24 border rounded-lg px-3 py-2 text-sm outline-none"
                          disabled={
                            isSubmitting ||
                            seatsAvailable <= 0 ||
                            requestedSeats > seatsAvailable
                          }
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {seatsAvailable} seat{seatsAvailable === 1 ? "" : "s"}{" "}
                          available
                        </p>
                      </div>
                      <div className="mb-4">
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

                      {joinError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                          {joinError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={onClose}
                          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleJoin}
                          disabled={isSubmitting || seatsAvailable <= 0}
                          className="flex-1 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                        >
                          {isSubmitting
                            ? "Processing..."
                            : seatsAvailable <= 0
                              ? "Table Full"
                              : "Request to Join"}
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {submitted ? (
                    <div className="text-center py-6">
                      <div className="text-4xl mb-3">✓</div>
                      <h3 className="text-lg font-semibold">
                        Joined Successfully!
                      </h3>
                      <p className="text-gray-500 mt-2 text-sm">
                        You've joined the table. Have a great meal!
                      </p>
                      <button
                        onClick={onClose}
                        className="mt-6 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <>
                      {joinError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                          {joinError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={onClose}
                          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleJoin}
                          disabled={isSubmitting || seatsAvailable <= 0}
                          className="flex-1 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                        >
                          {isSubmitting
                            ? "Processing..."
                            : seatsAvailable <= 0
                              ? "Table Full"
                              : "Join Now"}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
