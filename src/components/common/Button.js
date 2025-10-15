import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary", // primary, secondary, google, custom
  fullWidth = false,
  rounded = false,
  disabled = false,
  className = "",
}) => {
  const baseStyles =
    "px-4 py-1.5 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const width = fullWidth ? "w-full" : "";
  const borderRadius = rounded ? "rounded-full" : "rounded-md";
  const focus = "focus:outline-none focus:ring-2 focus:ring-[#BF9B53]";

  const variantStyles = {
    primary: "bg-[#BF9B53] hover:bg-[#a6813f] text-white",
    secondary: "bg-gray-300 hover:bg-gray-400 text-gray-700",
    google: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100",
    custom: "",
  };

  const finalStyles = `${baseStyles} ${width} ${borderRadius} ${focus} ${
    disabled
      ? "bg-gray-300 cursor-not-allowed text-gray-500"
      : variantStyles[variant]
  } ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={finalStyles}
    >
      {children}
    </button>
  );
};

export default Button;
