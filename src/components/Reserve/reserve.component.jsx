import React, { useState } from "react";
import { useBookingStore } from "../../store/useBookingStore";
import { useMapStore } from "../../store/useMapStore";

function ReserveComponent() {
  const reserveInit = {
    date: "",
    time: "",
    type: "",
    guests: "",
  };

  const [reserve, setReserve] = useState(reserveInit);
  const addBooking = useBookingStore((state) => state.addBooking);
  const setBookingPreview = useBookingStore((state) => state.setBookingPreview);
  const selectedLocation = useMapStore((state) => state.selectedLocation);

  const { date, time, type, guests } = reserve;

  const isFormValid = date && time && type && guests && selectedLocation;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!date || !time || !type || !guests) {
      console.log("Please fill all fields");
      return;
    }

    // Add booking to Zustand store
    addBooking(reserve);

    console.log("Booking saved:", reserve);
    setBookingPreview(true);

    // Optional: reset form
    setReserve(reserveInit);
  };

  return (
    <div className="relative flex flex-col gap-4 justify-center items-center">
      <div className="relative flex justify-start items-center gap-4 w-3/4">
        {/* {!date && <span className="placeholder absolute left-2 top-2">DD/MM/YYYY</span>} */}
        <h1 className="w-52">Select Date:</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setReserve({ ...reserve, date: e.target.value })}
          className="datetimeinput border rounded-sm p-2"
        />
      </div>

      <div className="relative flex justify-start items-center gap-4 w-3/4">
        {/* {!time && <span className="placeholder absolute left-2 top-2">HH:MM</span>} */}
        <h1 className="w-52">Select Time:</h1>
        <input
          type="time"
          value={time}
          onChange={(e) => setReserve({ ...reserve, time: e.target.value })}
          className="datetimeinput border rounded-sm p-2"
          required
        />
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
          <option value="casual">Casual Dining</option>
          <option value="private">Private Dining</option>
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
        className={` w-3/4 text-center mx-auto rounded-lg py-1.5 px-2 mt-8 text-base hover:cursor-pointer hover:bg-rose-300 hover:text-white transition-all duration-200 ease-in-out ${
          isFormValid
            ? "bg-rose-600 text-white hover:bg-rose-300 cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        disabled={!isFormValid}
        onClick={handleSubmit}
      >
        Book your table now
      </button>
    </div>
  );
}

export default ReserveComponent;
