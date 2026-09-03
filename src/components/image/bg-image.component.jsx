import React from "react";
import BgImage from "../../assets/Images/homepage.jpg";

const BgImageComponent = ({ imageURL, additionalClassName, children }) => {
  return (
    <div
      className={`relative w-full h-[90vh] rounded-r-4xl bg-cover bg-center overflow-hidden flex flex-col ${additionalClassName}`}
      style={{ backgroundImage: `url(${imageURL || BgImage})` }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      {children}
    </div>
  );
};

export default BgImageComponent;
