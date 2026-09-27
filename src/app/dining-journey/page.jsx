"use client";

import { useEffect } from "react";

import WrapperComponent from "@/components/wrapper/wrapper.component";
import PageHeader from "@/components/ui/page-header.component";
import FilterTabs from "@/components/ui/filter-tabs.component";
import ErrorToast from "@/components/ui/error-toast.component";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states.component";
import { EDITORIAL_IMAGES } from "@/lib/constants/editorial-images";
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
import Button from "@/components/button/button.component";

function DiningJourneyCardSkeleton() {
  return (
    <div className="grid grid-cols-[5rem_1fr] gap-6 border-t border-paper/10 py-8">
      <Skeleton className="h-16 w-16" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

const JOURNEY_SKELETONS = Array.from({ length: 4 }, (_, index) => index);

export default function DiningJourneyPage() {
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

  const header = (
    <PageHeader
      meta={["Dining journey", "Hosted and joined"]}
      title="Your table"
      muted="plan."
      intro="Every table you've hosted or joined, from the ones coming up to the ones you're still talking about."
      image={EDITORIAL_IMAGES.lamps}
    />
  );

  if (!authLoading && !user) {
    return (
      <WrapperComponent>
        {header}
        <div className="px-5 pb-16 md:px-10">
          <EmptyState
            label="Members only"
            title="Log in to see your dining journey."
            text="Tables you've hosted or joined show up here once you're logged in."
            action={<Button arrow href="/login?redirect=/dining-journey">Log in</Button>}
          />
        </div>
      </WrapperComponent>
    );
  }

  return (
    <WrapperComponent>
      {header}

      <div className="px-5 pb-20 md:px-10">
        <FilterTabs
          label="Filter by status"
          tabs={tabs}
          value={statusFilter}
          onChange={setStatusFilter}
          className="border-t border-paper/10 pt-6"
        />

        <div className="mt-10">
          {error ? (
            <ErrorState
              title="Couldn't load your dining journey."
              text={error.message}
              onRetry={refetch}
            />
          ) : loading || authLoading ? (
            JOURNEY_SKELETONS.map((index) => (
              <DiningJourneyCardSkeleton key={index} />
            ))
          ) : entries.length === 0 ? (
            <EmptyState
              title={
                statusFilter
                  ? `No tables ${DINING_STATUS_META[statusFilter].label.toLowerCase()}.`
                  : "No tables yet."
              }
              text={
                statusFilter
                  ? "Switch tabs to see the rest of your dining journey."
                  : "Host an open table or join one to start your dining journey."
              }
              action={
                !statusFilter && <Button arrow href="/restaurants">Find a table</Button>
              }
            />
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
      </div>

      <ErrorToast message={editorError} onDismiss={clearEditorError} />

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
