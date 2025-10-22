import React from "react";

const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  size = "md", // sm, md, lg
  color = "#BF9B53", // active color
  offColor = "#E5E7EB", // bg when off
  rounded = true,
  className = "",
}) => {
  // size mapping
  const sizeMap = {
    sm: { width: 36, height: 20, knob: 16 },
    md: { width: 44, height: 24, knob: 20 },
    lg: { width: 60, height: 28, knob: 24 },
  };
  const { width, height, knob } = sizeMap[size] || sizeMap.md;

  return (
    <label
      className={`relative inline-flex items-center cursor-pointer ${className} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      style={{ width: width, height: height }}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={`block w-full h-full transition-colors duration-300 ${
          rounded ? "rounded-full" : "rounded-md"
        }`}
        style={{ backgroundColor: checked ? color : offColor }}
      ></span>
      <span
        className={`absolute top-1/2 left-1 transform -translate-y-1/2 bg-white shadow-md transition-transform duration-300`}
        style={{
          width: knob,
          height: knob,
          borderRadius: rounded ? "50%" : "6px",
          transform: checked
            ? `translateX(${width - knob}px) translateY(-50%)`
            : `translateX(0) translateY(-50%)`,
        }}
      ></span>
    </label>
  );
};

export default Switch;
