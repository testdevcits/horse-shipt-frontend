import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  fullWidth = false,
  rounded = false,
  disabled = false,
  className = "",
  bgColor,
  borderColor,
  textColor,
  hoverBgColor,
  hoverTextColor,
  icon,
  ...rest
}) => {
  const baseStyles =
    "px-4 py-2 text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]";

  const width = fullWidth ? "w-full" : "";
  const borderRadius = rounded ? "rounded-full" : "rounded-sm";
  const focus = "focus:outline-none focus:ring-2 focus:ring-[#BF9B53]";

  const variantStyles = {
    primary: "bg-[#BF9B53] hover:bg-[#a6813f] text-white border-none",
    secondary:
      "bg-[#F3F4F6] hover:bg-[#BF9B53] text-gray-700 border-2 border-[#BF9B53]",
    google: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100",
    custom: "",
  };

  const customStyles =
    variant === "custom"
      ? {
          backgroundColor: bgColor || "transparent",
          border: borderColor ? `1px solid ${borderColor}` : "none",
          color: textColor || "#000",
        }
      : {};

  const handleMouseEnter = (e) => {
    if (variant === "custom" && hoverBgColor) {
      e.currentTarget.style.backgroundColor = hoverBgColor;
    }
    if (variant === "custom" && hoverTextColor) {
      e.currentTarget.style.color = hoverTextColor;
    }
  };

  const handleMouseLeave = (e) => {
    if (variant === "custom") {
      e.currentTarget.style.backgroundColor = bgColor || "transparent";
      e.currentTarget.style.color = textColor || "#000";
    }
  };

  const finalStyles = `${baseStyles} ${width} ${borderRadius} ${focus} ${
    disabled
      ? "bg-gray-300 cursor-not-allowed text-gray-500 border-none"
      : variantStyles[variant]
  } ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={finalStyles}
      style={customStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
