"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import WrapperComponent from "@/components/wrapper/wrapper.component";
import Button from "@/components/button/button.component";
import DiningJourneyCard from "@/components/dining-journey/dining-journey-card.component";
import BookingFormModal from "@/components/booking/booking-form-modal.component";

// ASSUMPTION: useAuth returns { user, loading }, matching the shape you'd
// need for an initial-auth-check flash guard. If it only returns { user },
// drop the authLoading references below and gate on `user === undefined`
// vs `null` instead, however your hook signals "still checking."
import { useAuth } from "@/hooks/useAuth";
import { useDiningJourney } from "@/hooks/useDiningJourney";
import { useBookingStore } from "@/store/booking/booking.store";
import {
  DINING_STATUS_META,
  DINING_STATUS_ORDER,
} from "@/lib/constants/dining-journey.constants";

function DiningJourneyCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-[#E5E1DB] bg-white p-4">
      <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-[#F0EDE7]" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-2/3 animate-pulse rounded bg-[#F0EDE7]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#F0EDE7]" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-[#F0EDE7]" />
      </div>
    </div>
  );
}

const JOURNEY_SKELETONS = Array.from({ length: 4 }, (_, index) => index);

export default function DiningJourneyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const {
    entries,
    totalCount,
    counts,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    refetch,
    pendingActionId,
    actionErrors,
    respondToRequest,
    removeGuest,
    changeSeats,
    updateRequest,
    cancelRequest,
    leaveTable,
    cancelTable,
    feedbackIds,
    submitFeedback,
  } = useDiningJourney(user?.uid);

  // "Manage" reuses the booking popup in edit mode.
  const bookingRestaurant = useBookingStore((state) => state.bookingRestaurant);
  const editingBooking = useBookingStore((state) => state.editingBooking);
  const editorError = useBookingStore((state) => state.editorError);
  const openTableEditor = useBookingStore((state) => state.openTableEditor);
  const closeBooking = useBookingStore((state) => state.closeBooking);
  const clearEditorError = useBookingStore((state) => state.clearEditorError);
  const handleManage = (bookingId) =>
    openTableEditor(bookingId, { onSaved: refetch });

  // The booking store is shared with the restaurants page — don't leave
  // this table's editor open for it to pick up after navigating away.
  useEffect(() => () => closeBooking(), [closeBooking]);

  const tabs = [
    { value: null, label: "All", count: totalCount },
    ...DINING_STATUS_ORDER.map((status) => ({
      value: status,
      label: DINING_STATUS_META[status].label,
      count: counts[status] ?? 0,
    })),
  ];

  if (!authLoading && !user) {
    return (
      <WrapperComponent paddingX="sm" className="pt-4">
        <div className="rounded-xl border border-[#E5E1DB] bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-[#1F1D1B]">
            Log in to see your dining journey
          </h1>
          <p className="mt-2 text-sm text-[#6B6660]">
            Tables you&apos;ve hosted or joined will show up here once
            you&apos;re logged in.
          </p>
          <Button onClick={() => router.push("/login?redirect=/dining-journey")} className="mt-4">
            Log in
          </Button>
        </div>
      </WrapperComponent>
    );
  }

  return (
    <WrapperComponent paddingX="sm" className="pt-4 pb-12">
      <h1 className="text-2xl font-semibold text-[#1F1D1B]">Dining journey</h1>
      <p className="mt-1 text-sm text-[#6B6660]">
        Every table you&apos;ve hosted or joined, in one place.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary bg-grey-olive-300 text-primary"
                  : "border-grey-olive-200 text-black hover:border-info"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {error ? (
          <div className="rounded-xl border border-[#E5E1DB] bg-white p-4">
            <p className="text-sm font-medium text-[#1F1D1B]">
              Couldn&apos;t load your dining journey
            </p>
            <p className="mt-1 text-sm text-[#6B6660]">
              {error.message ?? "Something went wrong."}
            </p>
            <button
              type="button"
              onClick={refetch}
              className="mt-3 rounded-full border border-[#1F1D1B] px-3 py-1.5 text-sm font-medium text-[#1F1D1B] transition-colors hover:bg-[#1F1D1B] hover:text-white"
            >
              Try again
            </button>
          </div>
        ) : loading || authLoading ? (
          JOURNEY_SKELETONS.map((index) => (
            <DiningJourneyCardSkeleton key={index} />
          ))
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-[#E5E1DB] bg-white p-8 text-center">
            <h2 className="font-semibold text-[#1F1D1B]">
              {statusFilter
                ? `No tables ${DINING_STATUS_META[statusFilter].label.toLowerCase()}`
                : "No tables yet"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6B6660]">
              {statusFilter
                ? "Switch tabs to see the rest of your dining journey."
                : "Host an open table or join one to start your dining journey."}
            </p>
            {!statusFilter && (
              <Button
                onClick={() => router.push("/restaurants")}
                className="mt-4"
              >
                Find a table
              </Button>
            )}
          </div>
        ) : (
          entries.map((entry) => (
            <DiningJourneyCard
              key={entry.id}
              entry={entry}
              currentUserId={user?.uid}
              pendingActionId={pendingActionId}
              actionErrors={actionErrors}
              onRespond={respondToRequest}
              onRemoveGuest={removeGuest}
              onManage={handleManage}
              onChangeSeats={changeSeats}
              onUpdateRequest={updateRequest}
              onLeaveTable={leaveTable}
              onCancelRequest={cancelRequest}
              onCancelTable={cancelTable}
              feedbackIds={feedbackIds}
              onSubmitFeedback={submitFeedback}
            />
          ))
        )}
      </div>

      {editorError && (
        <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-start justify-between gap-3 rounded-xl border border-[#E5E1DB] bg-white p-4 shadow-lg">
          <p className="text-sm text-red-600">{editorError}</p>
          <button
            type="button"
            onClick={clearEditorError}
            className="text-sm font-medium text-[#514C47] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {bookingRestaurant && editingBooking && (
        <BookingFormModal
          key={editingBooking.id}
          restaurant={bookingRestaurant}
          initialValues={editingBooking}
          isEditing
          onClose={closeBooking}
        />
      )}
    </WrapperComponent>
  );
}
