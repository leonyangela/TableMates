import {
  computeSeatState,
  isOpenVisibility,
  validateTableSettings,
} from "@/lib/utils/table-seats.utils";

// Fields an edit can change, and how to compare them: numbers as numbers,
// everything else as strings, so "4" vs 4 or undefined vs "" don't count
// as edits.
const EDITABLE_FIELDS = {
  date: "string",
  time: "string",
  totalSeats: "number",
  yourSeats: "number",
  tableVisibility: "string",
  tableDescription: "string",
  occasion: "string",
  otherOccasion: "string",
  name: "string",
  phone: "string",
  email: "string",
  notes: "string",
};

/** Only the fields in `next` that differ from the saved booking. */
export function getChangedFields(saved, next) {
  return Object.entries(EDITABLE_FIELDS).reduce((changes, [field, kind]) => {
    const before =
      kind === "number" ? Number(saved?.[field]) || 0 : (saved?.[field] ?? "");
    const after =
      kind === "number" ? Number(next[field]) || 0 : (next[field] ?? "");

    if (before !== after) {
      changes[field] = after;
    }
    return changes;
  }, {});
}

/**
 * Seat numbers the booking form shows and submits.
 *
 * Creating: every seat is the host's on a private table; on an open table
 * the host keeps `yourSeats` and the rest are open to others.
 *
 * Editing: seats are derived from the table's actual guests with the same
 * calculation updateTableSettings runs in its transaction, so the form
 * can't offer fewer seats than people already seated, and visibility can
 * only open up.
 */
export function getBookingSeats(form, { isEditing = false, saved = null } = {}) {
  const isOpenTable = isOpenVisibility(form.tableVisibility);
  const totalSeats = Number(form.totalSeats) || 0;
  const yourSeats = isOpenTable
    ? Math.min(Number(form.yourSeats) || 0, totalSeats)
    : totalSeats;

  if (!isEditing) {
    return {
      isOpenTable,
      totalSeats,
      yourSeats,
      seatsAvailable: isOpenTable ? Math.max(totalSeats - yourSeats, 0) : 0,
      minTotalSeats: 1,
      seatsJoined: 0,
      validationError: null,
    };
  }

  const changes = {
    tableVisibility: form.tableVisibility,
    totalSeats,
    yourSeats: Math.max(1, yourSeats),
  };
  const seatState = computeSeatState({ ...saved, ...changes });

  return {
    isOpenTable,
    totalSeats,
    yourSeats,
    seatsAvailable: seatState.seatsAvailable,
    minTotalSeats: seatState.minTotalSeats,
    seatsJoined: seatState.seatsJoined,
    validationError: validateTableSettings(saved, changes),
  };
}
