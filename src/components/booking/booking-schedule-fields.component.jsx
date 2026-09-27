import { useId } from "react";

import { FIELD } from "@/components/ui/styles";
import { formatTimeLabel } from "@/lib/utils/formatters.utils";
import { formatShortDate } from "@/lib/utils/dining-journey.utils";
import {
  REPEAT_OCCURRENCES,
  REPEAT_OPTIONS,
} from "@/lib/constants/social.constants";

/** Date, time and (when creating) the repeat schedule. */
export default function BookingScheduleFields({
  form,
  isEditing,
  minDate,
  availableTimes,
  recurringDates,
  onChange,
  onDateChange,
}) {
  const id = useId();
  const isRepeating = !isEditing && form.repeat && form.repeat !== "none";

  return (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-8">
        <div>
          <label htmlFor={`${id}-date`} className={FIELD.label}>
            Date
          </label>
          <input
            id={`${id}-date`}
            type="date"
            min={isEditing ? undefined : minDate}
            required
            disabled={isEditing}
            aria-describedby={isEditing ? `${id}-locked` : undefined}
            value={form.date}
            onChange={onDateChange}
            className={`${FIELD.input} [color-scheme:dark] disabled:text-paper/40`}
          />
        </div>
        <div>
          <label htmlFor={`${id}-time`} className={FIELD.label}>
            Time
          </label>
          <select
            id={`${id}-time`}
            required
            value={form.time}
            onChange={onChange("time")}
            disabled={isEditing || !form.date || availableTimes.length === 0}
            aria-describedby={isEditing ? `${id}-locked` : undefined}
            className={`${FIELD.input} [color-scheme:dark] disabled:text-paper/40`}
          >
            {/* Edit mode keeps the booked time, which may no longer be an
                offered slot, so show it as-is. */}
            {isEditing && form.time && !availableTimes.includes(form.time) && (
              <option value={form.time}>{formatTimeLabel(form.time)}</option>
            )}
            <option value="" disabled>
              {!form.date
                ? "Pick a date first"
                : availableTimes.length === 0
                  ? "No times left on this day"
                  : "Select a time"}
            </option>
            {availableTimes.map((time) => (
              <option key={time} value={time}>
                {formatTimeLabel(time)}
              </option>
            ))}
          </select>
        </div>
        {isEditing && (
          <p id={`${id}-locked`} className={`col-span-2 -mt-4 ${FIELD.hint}`}>
            Date and time can&apos;t be changed once the table is booked:
            guests joined for this slot.
          </p>
        )}
      </div>

      {!isEditing && (
        <div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            <div>
              <label htmlFor={`${id}-repeat`} className={FIELD.label}>
                Repeat
              </label>
              <select
                id={`${id}-repeat`}
                value={form.repeat}
                onChange={onChange("repeat")}
                className={`${FIELD.input} [color-scheme:dark]`}
              >
                {REPEAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {isRepeating && (
              <div>
                <label htmlFor={`${id}-count`} className={FIELD.label}>
                  Number of tables
                </label>
                <input
                  id={`${id}-count`}
                  type="number"
                  min={REPEAT_OCCURRENCES.min}
                  max={REPEAT_OCCURRENCES.max}
                  required
                  value={form.repeatCount}
                  onChange={onChange("repeatCount")}
                  className={`${FIELD.input} [color-scheme:dark]`}
                />
              </div>
            )}
          </div>
          {isRepeating && (
            <p className={FIELD.hint} aria-live="polite">
              {recurringDates.length > 0
                ? `Creates ${recurringDates.length} separate tables at the same time: ${recurringDates
                    .map(formatShortDate)
                    .join(", ")}. You can edit or cancel each one on its own.`
                : "Pick a date to see the schedule."}
            </p>
          )}
        </div>
      )}
    </>
  );
}
