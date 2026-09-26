"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import WrapperComponent from "@/components/wrapper/wrapper.component";
import Button from "@/components/button/button.component";
import OpenTableCard from "@/components/community-dining/open-table-card.component";
import HostTableCard from "@/components/community-dining/host-table-card.component";
import BookingFormModal from "@/components/booking/booking-form-modal.component";

import { useAuth } from "@/hooks/useAuth";
import { useCommunityDining } from "@/hooks/useCommunityDining";
import { useBookingStore } from "@/store/booking/booking.store";

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[#E5E1DB] bg-white p-4">
      <div className="flex gap-4">
        <div className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-[#F0EDE7]" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 w-2/3 animate-pulse rounded bg-[#F0EDE7]" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-[#F0EDE7]" />
        </div>
      </div>
    </div>
  );
}

const SKELETONS = Array.from({ length: 3 }, (_, index) => index);

export default function CommunityDiningPage() {
  const router = useRouter();
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

  if (!authLoading && !user) {
    return (
      <WrapperComponent paddingX="sm" className="pt-4">
        <div className="rounded-xl border border-[#E5E1DB] bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-[#1F1D1B]">
            Log in to see community dining
          </h1>
          <p className="mt-2 text-sm text-[#6B6660]">
            Open tables hosted by other diners will show up here once
            you&apos;re logged in.
          </p>
          <Button onClick={() => router.push("/login?redirect=/community-dining")} className="mt-4">
            Log in
          </Button>
        </div>
      </WrapperComponent>
    );
  }

  const showSkeletons = (loading || authLoading) && !error;

  return (
    <WrapperComponent paddingX="sm" className="pt-4 pb-12">
      <h1 className="text-2xl font-semibold text-[#1F1D1B]">
        Community dining
      </h1>
      <p className="mt-1 text-sm text-[#6B6660]">
        Open tables other diners are hosting — join instantly, or request a
        seat.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-[#E5E1DB] bg-white p-4">
          <p className="text-sm font-medium text-[#1F1D1B]">
            Couldn&apos;t load community dining
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
      )}

      {showSkeletons ? (
        <div className="mt-5 space-y-3">
          {SKELETONS.map((index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : (
        !error && (
          <>
            {hostedTables.length > 0 && (
              <section className="mt-6">
                <h2 className="text-sm font-semibold text-[#1F1D1B]">
                  Your open tables
                </h2>
                <div className="mt-3 space-y-3">
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
              </section>
            )}

            <section className="mt-6">
              <h2 className="text-sm font-semibold text-[#1F1D1B]">
                Browse open tables
              </h2>

              {browsableTables.length === 0 ? (
                <div className="mt-3 rounded-xl border border-[#E5E1DB] bg-white p-8 text-center">
                  <h3 className="font-semibold text-[#1F1D1B]">
                    No open tables right now
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#6B6660]">
                    Check back soon, or host your own from a restaurant page.
                  </p>
                  <Button
                    onClick={() => router.push("/restaurants")}
                    className="mt-4"
                  >
                    Find a restaurant
                  </Button>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
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
            </section>
          </>
        )
      )}

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
