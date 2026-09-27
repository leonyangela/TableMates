import { useId } from "react";

import { FIELD } from "@/components/ui/styles";

/**
 * The host's contact details for the restaurant, prefilled from their
 * profile. Stored privately (see bookingService), never on the public
 * table.
 */
export default function BookingContactFields({ contact, notes, isEditing, onChange }) {
  const id = useId();

  return (
    <fieldset>
      <legend className={FIELD.label}>Your details for the restaurant</legend>
      <p className="text-xs text-paper/50">
        Only you can see these.
        {!isEditing && " Filled in from your profile; changes apply to this booking only."}
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <label htmlFor={`${id}-name`} className={FIELD.label}>
            Full name
          </label>
          <input
            id={`${id}-name`}
            type="text"
            required
            autoComplete="name"
            value={contact.name}
            onChange={onChange("name")}
            placeholder="Your name"
            className={FIELD.input}
          />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8">
          <div>
            <label htmlFor={`${id}-phone`} className={FIELD.label}>
              Phone
            </label>
            <input
              id={`${id}-phone`}
              type="tel"
              required
              autoComplete="tel"
              value={contact.phone}
              onChange={onChange("phone")}
              placeholder="+61 400 000 000"
              className={FIELD.input}
            />
          </div>
          <div>
            <label htmlFor={`${id}-email`} className={FIELD.label}>
              Email
            </label>
            <input
              id={`${id}-email`}
              type="email"
              required
              autoComplete="email"
              value={contact.email}
              onChange={onChange("email")}
              placeholder="you@example.com"
              className={FIELD.input}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${id}-notes`} className={FIELD.label}>
            Special requests (optional)
          </label>
          <textarea
            id={`${id}-notes`}
            rows={2}
            value={notes}
            onChange={onChange("notes")}
            placeholder="Window seat, allergies, celebration, etc."
            className={`${FIELD.input} h-auto resize-none py-3`}
          />
        </div>
      </div>
    </fieldset>
  );
}
