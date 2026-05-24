import React from "react";

const SubmitBtn = ({ text, onClick, className }) => {
  return (
    <div
      className={`border rounded-lg border-info hover:border-primary text-info hover:text-primary hover:cursor-pointer transition-all duration-300 ease-in px-4 py-1 w-fit ${className}`}
      onClick={onClick}
    >
      {text}
    </div>
  );
};

export default SubmitBtn;
