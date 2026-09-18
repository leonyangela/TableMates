import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "regular",
  type = "button",
  onClick,
  disabled = false,
  className = "",
  Icon,
  iconSize,
  iconPosition = "left",
  ...props
}) => {
  const variants = {
    primary: "rounded-md bg-primary text-white hover:bg-rosy-copper-600",
    secondary: "rounded-md bg-secondary text-white hover:bg-grey-olive-600",
    ghost: "rounded-md bg-transparent text-black hover:bg-gray-100",
    "try-again":
      "rounded-md bg-white text-black/60 border border-gray-300 hover:bg-grey-olive-100",
    "navigation-controls":
      "bg-transparent text-black hover:bg-gray-100 rounded-full",
  };

  const sizes = {
    sm: { button: "px-2 py-1 text-sm", icon: "h-3.5 w-3.5" },
    regular: { button: "px-4 py-1.5 text-base", icon: "h-4 w-4" },
    rounded: { button: "px-1 py-1", icon: "h-5 w-5" },
  };

  const currentSize = sizes[size] ?? sizes.regular;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={` ${currentSize.button} transition-all duration-400 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className} `}
      {...props}
    >
      {Icon && iconPosition === "left" && (
        <Icon className={iconSize ?? currentSize.icon} fontSize={iconSize} />
      )}
      {children}
      {Icon && iconPosition === "right" && (
        <Icon className={iconSize ?? currentSize.icon} fontSize={iconSize} />
      )}
    </button>
  );
};
export default Button;
