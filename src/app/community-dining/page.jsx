"use client";

import { useEffect } from "react";

import WrapperComponent from "@/components/wrapper/wrapper.component";
import PageHeader from "@/components/ui/page-header.component";
import Section from "@/components/ui/section.component";
import ErrorToast from "@/components/ui/error-toast.component";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states.component";
import { EDITORIAL_IMAGES } from "@/lib/constants/editorial-images";
import OpenTableCard from "@/components/community-dining/open-table-card.component";
import HostTableCard from "@/components/community-dining/host-table-card.component";
import BookingFormModal from "@/components/booking/booking-form-modal.component";

import { useAuth } from "@/hooks/useAuth";
import { useCommunityDining } from "@/hooks/useCommunityDining";
import { useBookingStore } from "@/store/booking/booking.store";
import Button from "@/components/button/button.component";

function CardSkeleton() {
  return (
    <div className="flex gap-6 border-t border-paper/10 py-6">
      <Skeleton className="h-28 w-24 shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

const SKELETONS = Array.from({ length: 3 }, (_, index) => index);

export default function CommunityDiningPage() {
  const { user, loading: authLoading } = useAuth();

  const {
    hostedTables,
    browsableTables,
    loading,
    error,
    refetch,
    pendingActionId,
    actionErrors,
    joinPublicTable,
    requestToJoin,
    updateRequest,
    cancelRequest,
    respondToRequest,
    removeGuest,
  } = useCommunityDining(user?.uid);

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

  const header = (
    <PageHeader
      meta={["Community dining", "Open tables"]}
      title="Open tables,"
      muted="shared tonight."
      intro="Tables other diners are hosting. Join the public ones instantly, or ask the host for a seat."
      image={EDITORIAL_IMAGES.longTable}
    />
  );

  if (!authLoading && !user) {
    return (
      <WrapperComponent>
        {header}
        <div className="px-5 pb-16 md:px-10">
          <EmptyState
            label="Members only"
            title="Log in to see the open tables near you."
            text="Tables hosted by other diners show up here once you're logged in."
            action={
              <Button arrow href="/login?redirect=/community-dining">Log in</Button>
            }
          />
        </div>
      </WrapperComponent>
    );
  }

  const showSkeletons = (loading || authLoading) && !error;

  return (
    <WrapperComponent>
      {header}

      <div className="space-y-16 px-5 pb-20 md:px-10">
        {error && (
          <ErrorState
            title="Couldn't load community dining."
            text={error.message}
            onRetry={refetch}
          />
        )}

        {showSkeletons ? (
          <Section label="Open tables">
            {SKELETONS.map((index) => (
              <CardSkeleton key={index} />
            ))}
          </Section>
        ) : (
          !error && (
            <>
              {hostedTables.length > 0 && (
                <Section
                  label="Your open tables"
                  count={hostedTables.length}
                  note="Tables you're hosting. Accept requests and manage your guests."
                >
                  <div className="space-y-4">
                    {hostedTables.map((table) => (
                      <HostTableCard
                        key={table.id}
                        table={table}
                        pendingActionId={pendingActionId}
                        actionErrors={actionErrors}
                        onRespond={respondToRequest}
                        onRemoveGuest={removeGuest}
                        onManage={handleManage}
                      />
                    ))}
                  </div>
                </Section>
              )}

              <Section
                label="Browse open tables"
                count={browsableTables.length}
                note="Seats other diners have opened up."
              >
                {browsableTables.length === 0 ? (
                  <EmptyState
                    className="!border-t-0 !pt-0"
                    title="No open tables right now."
                    text="Check back soon, or host your own from a restaurant page."
                    action={<Button arrow href="/restaurants">Find a restaurant</Button>}
                  />
                ) : (
                  <div>
                    {browsableTables.map((table) => (
                      <OpenTableCard
                        key={table.id}
                        table={table}
                        isPending={pendingActionId === table.id}
                        error={actionErrors[table.id]}
                        onJoinPublic={joinPublicTable}
                        onRequestToJoin={requestToJoin}
                        onUpdateRequest={updateRequest}
                        onCancelRequest={cancelRequest}
                      />
                    ))}
                  </div>
                )}
              </Section>
            </>
          )
        )}
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
