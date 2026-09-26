"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AuthInput({
  label,
  name,
  type = "text",
  Icon,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}
        <input
          id={name}
          name={name}
          type={inputType}
          className={`h-11 w-full rounded-lg border border-gray-300 bg-white text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            Icon ? "pl-10" : "pl-3"
          } ${isPassword ? "pr-10" : "pr-3"}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
