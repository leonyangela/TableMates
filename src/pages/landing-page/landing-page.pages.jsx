import "./landing-page.styles.css";
import WrapperComponent from "../../components/Wrapper/wrapper.component";
import ReserveComponent from "../../components/Reserve/reserve.component";
import MapComponent from "../../components/Map/map.component";
import { useMapStore } from "../../store/useMapStore";
import { useBookingStore } from "../../store/useBookingStore";
import moment from "moment";

const LandingPage = () => {
  const selectedLocation = useMapStore((state) => state.selectedLocation);
  const latestBooking = useBookingStore(
    (state) => state.bookings[state.bookings.length - 1],
  );
  const bookingPreview = useBookingStore((state) => state.bookingPreview);
  const setBookingPreview = useBookingStore((state) => state.setBookingPreview);

  const { date, time, type, guests } = latestBooking || {};

  const closePreviewOnClick = () => {
    setBookingPreview(false);
  };

  return (
    <WrapperComponent>
      <div className="relative h-full w-full">
        <div className="landing-page h-full w-full bg-center flex flex-col justify-center items-center">
          <h1 className="z-20 relative text-white text-7xl">
            Skip the Line. Get a Table.
          </h1>
          <p className="z-20 relative text-white text-lg pt-2">
            Whether it’s an intimate dinner, a family celebration, or a
            corporate event, our restaurant sets the stage for unforgettable
            moments.
          </p>
        </div>
        <div className="z-10 w-full h-full absolute top-0 left-0 bg-black opacity-40 rounded-tr-4xl rounded-bl-4xl"></div>

        <div className="relative grid grid-cols-1 xl:grid-cols-3 p-4 py-6 text-center">
          <div>
            <h1 className="how-to-title">01</h1>
            <h1 className="how-to-subtitle">Choose Your Date & Time</h1>
            <h1 className="how-to-text">
              Select the perfect slot for your visit.
            </h1>
          </div>
          <div>
            <h1 className="how-to-title">02</h1>
            <h1 className="how-to-subtitle">Pick Your Experience</h1>
            <h1 className="how-to-text">
              Casual dining, private room, or special event setup.
            </h1>
          </div>
          <div>
            <h1 className="how-to-title">03</h1>
            <h1 className="how-to-subtitle">Confirm & Relax</h1>
            <h1 className="how-to-text">
              Receive instant confirmation and get ready to indulge.
            </h1>
          </div>
        </div>

        <div className="relative py-20 px-20 border border-rose-600 rounded-t-4xl grid grid-cols-1 xl:grid-cols-2">
          <div>
            <h1 className="text-center text-2xl">
              Reserve Your Perfect Table – <br />
              Effortless Booking, Unforgettable Experience
            </h1>

            <h1 className="text-center text-2xl pt-10">
              Place: <span className="font-bold">{selectedLocation.name}</span>
            </h1>

            <div className="p-4">
              <ReserveComponent />
            </div>
          </div>
          <div className="w-full h-full rounded-2xl overflow-hidden">
            <MapComponent />
          </div>
        </div>
      </div>
      {bookingPreview && (
        <div
          className={`h-screen w-screen bg-black/50 top-0 left-0 fixed z-20 flex items-center justify-center`}
        >
          <div className="relative w-fit h-fit bg-white rounded-lg p-6 pt-4">
            <h1>Your booking was successful!</h1>
            <h1>
              We’re excited to have you. Your reservation is confirmed and we
              look forward to serving you!
            </h1>
            <h1 className="pt-4">Here are your booking details:</h1>
            <div className="">
              <h1>Date: {moment(date).format("Do MMMM YYYY")}</h1>
              <h1>Time: {time}</h1>
              <h1>Place: {selectedLocation.name} </h1>
              <h1>
                Dining Options:{" "}
                {type.charAt(0).toUpperCase() + type.slice(1) + " Dining"}{" "}
              </h1>
              <h1>Number of People: {guests}</h1>
            </div>

            <h1
              className="float-right hover:cursor-pointer"
              onClick={closePreviewOnClick}
            >
              book another
            </h1>
          </div>
        </div>
      )}
    </WrapperComponent>
  );
};

export default LandingPage;
