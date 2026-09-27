import Button from "@/components/button/button.component";
import { formatTimeLabel } from "@/lib/utils/formatters.utils";
import { formatShortDate } from "@/lib/utils/dining-journey.utils";

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** What happened, where to find it, and what other diners can now do. */
export default function BookingSuccess({
  restaurantName,
  isEditing,
  dates,
  time,
  seats,
  visibility,
  onDone,
}) {
  const isSeries = dates.length > 1;
  const title = isEditing
    ? "Table updated."
    : isSeries
      ? `${dates.length} tables booked at ${restaurantName}.`
      : `Table booked at ${restaurantName}.`;

  return (
    <div role="status">
      <h3 className="font-display text-3xl font-semibold leading-tight tracking-[-0.035em]">{title}</h3>

      {!isEditing && (
        <p className="mt-4 text-sm leading-6 text-paper/65">
          {plural(seats.totalSeats, "seat")} on {dates.map(formatShortDate).join(", ")}
          {time && ` at ${formatTimeLabel(time)}`}.
        </p>
      )}

      {seats.isOpenTable && (
        <p className="mt-3 text-sm leading-6 text-paper/65">
          You&apos;re keeping {plural(seats.yourSeats, "seat")}, with {plural(seats.seatsAvailable, "seat")} open. Other
          diners can find {isSeries ? "these tables" : "it"} on Community Dining and{" "}
          {visibility === "open_public" ? "join straight away" : "ask to join. You choose who sits down"}.
        </p>
      )}

      <p className="mt-3 text-sm leading-6 text-paper/65">
        {isEditing ? "Your changes are saved." : "You can edit or cancel it from your Dining Journey."}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-6">
        <Button onClick={onDone}>Done</Button>
        {!isEditing && (
          <Button href="/dining-journey" variant="link" arrow>
            Go to Dining Journey
          </Button>
        )}
      </div>
    </div>
  );
}
