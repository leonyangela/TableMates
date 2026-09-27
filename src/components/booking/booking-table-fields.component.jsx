import { useId } from "react";
import { Lock } from "lucide-react";

import { FIELD } from "@/components/ui/styles";
import {
  OCCASION_OPTIONS,
  TABLE_VISIBILITY_OPTIONS,
} from "@/lib/constants/booking.constants";
import { canChangeVisibility } from "@/lib/utils/table-seats.utils";

/** Party size, occasion, who can join, and the open-table details. */
export default function BookingTableFields({
  form,
  seats,
  isEditing,
  originalVisibility,
  onChange,
  onTotalSeatsChange,
  onYourSeatsChange,
  onVisibilityChange,
}) {
  const id = useId();
  const isLockedPublic = isEditing && originalVisibility === "open_public";
  const seatsLocked = isEditing && seats.seatsJoined > 0;

  return (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-8">
        <div>
          <label htmlFor={`${id}-total`} className={FIELD.label}>
            Total seats needed
          </label>
          <input
            id={`${id}-total`}
            type="number"
            min={seats.minTotalSeats}
            max={20}
            required
            aria-describedby={seatsLocked ? `${id}-total-hint` : undefined}
            value={form.totalSeats}
            onChange={onTotalSeatsChange}
            className={`${FIELD.input} [color-scheme:dark]`}
          />
          {seatsLocked && (
            <p id={`${id}-total-hint`} className={FIELD.hint}>
              Can&apos;t go below {seats.minTotalSeats}. Other diners already
              hold seats at this table.
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${id}-occasion`} className={FIELD.label}>
            Occasion
          </label>
          <select
            id={`${id}-occasion`}
            required
            value={form.occasion}
            onChange={onChange("occasion")}
            className={`${FIELD.input} [color-scheme:dark]`}
          >
            <option value="" disabled>
              Select an occasion
            </option>
            {OCCASION_OPTIONS.map((occasion) => (
              <option key={occasion} value={occasion}>
                {occasion}
              </option>
            ))}
          </select>
        </div>
      </div>

      {form.occasion.toLowerCase() === "other" && (
        <div>
          <label htmlFor={`${id}-other`} className={FIELD.label}>
            Your occasion
          </label>
          <input
            id={`${id}-other`}
            type="text"
            required
            value={form.otherOccasion}
            onChange={onChange("otherOccasion")}
            placeholder="e.g. Board game night"
            className={FIELD.input}
          />
        </div>
      )}

      <fieldset>
        <legend className={FIELD.label}>Who can join your table?</legend>
        {TABLE_VISIBILITY_OPTIONS.map((option) => {
          const isActive = form.tableVisibility === option.key;
          // Editing can only open a table up, never close it again.
          const isAllowed = !isEditing || canChangeVisibility(originalVisibility, option.key);

          return (
            <label
              key={option.key}
              className={`flex items-start gap-4 border-t py-4 transition ${
                isActive ? "border-coffee-bean-400" : "border-paper/15"
              } ${isAllowed ? "cursor-pointer hover:border-paper/50" : "cursor-not-allowed opacity-40"}`}
            >
              <input
                type="radio"
                name={`${id}-visibility`}
                value={option.key}
                checked={isActive}
                disabled={!isAllowed}
                onChange={onVisibilityChange(option.key)}
                className="mt-1.5 accent-coffee-bean-400"
              />
              <span>
                <span className="block font-display text-lg tracking-[-0.02em]">{option.label}</span>
                <span className="block text-xs text-paper/60">{option.description}</span>
              </span>
            </label>
          );
        })}
        {isEditing && (
          <p className={`${FIELD.hint} flex items-center gap-2`}>
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {isLockedPublic
              ? "Public tables cannot be changed back to private."
              : "Once your table is open, it can't be made private again."}
          </p>
        )}
      </fieldset>

      {seats.isOpenTable && (
        <>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            <div>
              <label htmlFor={`${id}-yours`} className={FIELD.label}>
                Your seats (for your own party)
              </label>
              <input
                id={`${id}-yours`}
                type="number"
                min={1}
                max={seats.totalSeats || 1}
                required
                value={form.yourSeats}
                onChange={onYourSeatsChange}
                className={`${FIELD.input} [color-scheme:dark]`}
              />
            </div>
            <div>
              <p id={`${id}-open-label`} className={FIELD.label}>
                Seats open to others
              </p>
              <output
                aria-labelledby={`${id}-open-label`}
                aria-live="polite"
                className="block w-full border-b border-paper/25 py-3 text-sm font-semibold"
              >
                {seats.seatsAvailable}
              </output>
            </div>
          </div>

          <div>
            <label htmlFor={`${id}-description`} className={FIELD.label}>
              About your table
            </label>
            <textarea
              id={`${id}-description`}
              rows={2}
              required
              aria-describedby={`${id}-description-hint`}
              value={form.tableDescription}
              onChange={onChange("tableDescription")}
              placeholder="e.g. Casual birthday dinner, open to fellow foodies!"
              className={`${FIELD.input} h-auto resize-none py-3`}
            />
            <p id={`${id}-description-hint`} className={FIELD.hint}>
              Other diners see this on Community Dining before they join.
            </p>
          </div>
        </>
      )}
    </>
  );
}
