import React, { useEffect, useState } from "react";
import { useBookingStore } from "../../store/useBookingStore";
import { useMapStore } from "../../store/useMapStore";
import TimeCard from "../card/time-card/time-card.component";

const FormComponent = () => {
  const reserveInit = {
    date: "",
    time: "",
    type: "",
    guests: "",
    location: "",
  };
  const [reserve, setReserve] = useState(reserveInit);

  const setBookingPreview = useBookingStore((state) => state.setBookingPreview);
  const selectedLocation = useMapStore((state) => state.selectedLocation);

  const currentBooking = useBookingStore((state) => state.currentBooking);
  const setCurrentBooking = useBookingStore((state) => state.setCurrentBooking);

  const { date, time, type, guests } = reserve;

  const isFutureDate = date && new Date(date) > new Date();

  const isFormValid =
    isFutureDate && time && type && guests > 0 && selectedLocation?.name;

  const handleSubmit = () => {
    setCurrentBooking({
      ...reserve,
      location: [selectedLocation.lng, selectedLocation.lat],
    });

    setBookingPreview("confirmation");
  };

  useEffect(() => {
    if (Object.keys(currentBooking || {}).length === 0) {
      setReserve(reserveInit);
    }
  }, [currentBooking]);

  return (
    <div className="relative flex flex-col gap-4 justify-center items-center">
      <div className="relative flex justify-start items-center gap-4 w-3/4">
        <h1 className="w-52">Select Date:</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setReserve({ ...reserve, date: e.target.value })}
          min={new Date().toISOString().split("T")[0]}
          className="datetimeinput border rounded-sm p-2"
        />
      </div>

      <div className="relative flex justify-start items-center gap-4 w-3/4">
        <h1 className="w-52">Select Time:</h1>

        <div className="grid grid-cols-3 gap-2 text-center justify-center items-center">
          {selectedLocation?.time_opening.map((slot, id) => {
            return (
              <TimeCard
                key={id}
                id={id}
                text={slot}
                additionalClassName={`${reserve.time == slot ? "border-accent" : "border-secondary "}`}
                onClick={() => {
                  setReserve({ ...reserve, time: slot });
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="relative flex justify-start items-center gap-4 w-3/4">
        <h1 className="w-52">Select your dining option:</h1>
        <select
          name="type"
          id="type"
          className="border rounded-sm p-2"
          value={type}
          onChange={(e) => setReserve({ ...reserve, type: e.target.value })}
          required
        >
          {!type && (
            <option value="" disabled>
              Select your dining type
            </option>
          )}
          <option value="indoor_dining">Indoor Dining</option>
          <option value="outdoor_dining">Outdoor Dining</option>
          <option value="bar_seating">Bar Seating</option>
          <option value="private_dining">Private Dining</option>
          <option value="event">Special Event</option>
        </select>
      </div>

      <div className="relative flex justify-start items-center gap-4 w-3/4">
        <h1 className="w-52">Number of guests:</h1>
        <input
          type="number"
          name="guests"
          id="guests"
          className="border rounded-sm p-2"
          placeholder="1"
          min={1}
          max={10}
          value={guests}
          onChange={(e) =>
            setReserve({ ...reserve, guests: Number(e.target.value) })
          }
          required
        />
      </div>

      <button
        className={` w-3/4 text-center mx-auto rounded-lg py-1.5 px-2 mt-8 text-base transition-all duration-200 ease-in-out ${
          isFormValid
            ? "bg-primary text-white hover:bg-info cursor-pointer"
            : "bg-secondary/60 text-white hover:bg-secondary cursor-not-allowed"
        }`}
        disabled={!isFormValid}
        onClick={handleSubmit}
      >
        Book your table now
      </button>
    </div>
  );
};

export default FormComponent;
