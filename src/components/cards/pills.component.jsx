import React from "react";

const variants = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  neutral: "bg-grey-olive-100 text-grey-olive-700",
  dark: "bg-grey-olive-900 text-white",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  outline: "border border-grey-olive-200 bg-white text-grey-olive-700",
  "primary-70": "bg-primary/70 text-white",
  "secondary-70": "bg-secondary/70 text-white"
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

const Pill = ({
  children,
  variant = "primary",
  size = "sm",
  icon,
  className = "",
}) => {
  return (
    <span
      className={`w-fit inline-flex shrink-0 items-center gap-1 rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
};

export default Pill;