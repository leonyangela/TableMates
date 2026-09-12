import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "regular",
  type = "button",
  onClick,
  disabled = false,
  className = "",
  ...props
}) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-rosy-copper-600",
    secondary: "bg-white text-black border-2 border-gray-300 hover:bg-gray-200",
    ghost: "bg-transparent text-black hover:bg-gray-100",
  };

  const sizes = {
    sm: `px-2 py-1 text-sm`,
    regular: `px-4 py-1.5`,
  };
  

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizes[size]}
        rounded-md
        text-base
        transition-all
        duration-400
        hover:cursor-pointer 
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
