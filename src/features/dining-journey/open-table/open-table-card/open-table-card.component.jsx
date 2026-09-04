import moment from "moment";
import BaseBtn from "../../../../components/button/base-button.component";

const OpenTableCard = ({ table, isOwner, onJoinClick, onEditClick }) => {
  const { location, date, time, totalSeats, seatsAvailable, tableVisibility } =
    table;

  const isApprovalRequired = tableVisibility === "open_approval";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="w-full md:w-56 h-48 md:h-auto shrink-0 bg-gray-100">
          {location?.image ? (
            <img
              src={location.image}
              alt={location?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-gray-500">Community Table</p>
              {isOwner && (
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  Hosted by you
                </span>
              )}
            </div>
            <h3 className="text-xl md:text-2xl font-semibold">
              {location?.name || "Unknown venue"}
            </h3>
            {location?.address && (
              <p className="text-sm text-gray-500 mt-1">{location.address}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-1">Date</p>
              <p className="font-medium">
                {moment(date).format("ddd, Do MMM")}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Time</p>
              <p className="font-medium">{time}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Seats Available</p>
              <p className="font-medium">
                {seatsAvailable} of {totalSeats}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Join Type</p>
              <p className="font-medium">
                {isApprovalRequired ? "Needs Approval" : "Join Freely"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {isOwner ? (
              <BaseBtn
                size="sm"
                onClick={() => onEditClick(table)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
              >
                View
              </BaseBtn>
            ) : (
              <BaseBtn
                size="sm"
                onClick={() => onJoinClick(table)}
                className="px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition"
              >
                View
              </BaseBtn>
            )}

            {!isOwner && seatsAvailable <= 2 && (
              <span className="text-xs text-orange-600 font-medium">
                Only {seatsAvailable} seat{seatsAvailable === 1 ? "" : "s"} left
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenTableCard;
