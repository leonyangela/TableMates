import React from "react";

const RestaurantCard = ({ item, additionalClassName }) => {
  return (
    // <div
    //   className="rounded-md h-50 w-full overflow-hidden bg-cover bg-center relative flex justify-center items-center group"
    //   style={{ backgroundImage: `url(${item.image})` }}
    // >
    //   <div className="group-hover:opacity-80 group-hover:cursor-pointer bg-black opacity-50 absolute top-0 left-0 w-full h-full transition-all duration-200 ease-in "></div>

    //   <div className="z-20">
    //     <h1 className="text-white z-20 text-2xl group-hover:cursor-pointer">
    //       {item.name}
    //     </h1>
    //     <h1 className="text-white text-bold z-20">{item.price_range}</h1>
    //     <h1 className="text-white text-bold z-20">{item.short_description}</h1>
    //   </div>
    // </div>

    <div
      className={`h-40 group hover:cursor-pointer hover:border-primary flex ${additionalClassName}`}
    >
      <div className="w-2/3 p-4">
        <h1 className=" text-2xl group-hover:cursor-pointer">{item.name}</h1>
        <h1 className="text-bold ">{item.price_range}</h1>
        <h1 className="text-bold ">{item.short_description}</h1>
      </div>
      <div className="w-1/3">
        <img src={`${item.image}`} className="h-full w-full object-cover"></img>
      </div>
    </div>
  );
};

export default RestaurantCard;
