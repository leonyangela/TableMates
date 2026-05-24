import FloatingImgFallback from "../../../assets/Images/floating-img-fallback.jpg";
import RestaurantIcon from "@mui/icons-material/Restaurant";
const FloatingCardImg = () => {
  return (
    <div className="relative pr-10 overflow-hidden flex items-center justify-center rounded-lg">
      <div className="h-160 w-auto">
        <img src={FloatingImgFallback} className="rounded-2xl h-full w-auto" />
      </div>

      <div className="absolute bg-primary w-40 h-auto rounded-lg p-4 right-14 top-20">
        <RestaurantIcon className="text-white " />
        <h1 className="pt-8 text-sm text-center text-white">
          Trending Right Now
        </h1>
      </div>
    </div>
  );
};

export default FloatingCardImg;
