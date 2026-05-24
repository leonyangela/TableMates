import React from "react";

const FeaturedCard = ({ number, title, additionalClass, text, icon }) => {
  return (
    <div
      className={`border-2 border-solid border-primary rounded-lg relative p-4 ${number != 0 && `mb-4`} ${additionalClass} `}
    >
      <h1 className="why-us-title">{number < 10 ? `0${number}` : number}</h1>
      <h1 className="why-us-subtitle">{title}</h1>
      {icon}
      <h1 className="why-us-text">{text}</h1>
    </div>
  );
};

export default FeaturedCard;
