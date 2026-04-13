import React from "react";

const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  size = "md", // sm, md, lg
  color = "#BF9B53", // active color
  offColor = "#E5E7EB", // background when off
  rounded = true,
  className = "",
}) => {
  const sizeMap = {
    sm: { width: 32, height: 18, knob: 10 },
    md: { width: 44, height: 20, knob: 18 },
    lg: { width: 60, height: 26, knob: 24 },
  };

  const { width, height, knob } = sizeMap[size] || sizeMap.md;

  return (
    <label
      className={`relative inline-block ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
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
      {/* Track */}
      <span
        className={`block w-full h-full transition-colors duration-300 ${
          rounded ? "rounded-full" : "rounded-md"
        }`}
        style={{ backgroundColor: checked ? color : offColor }}
      ></span>
      {/* Knob */}
      <span
        className="absolute bg-white shadow-md transition-all duration-300"
        style={{
          width: knob,
          height: knob,
          borderRadius: rounded ? "50%" : "6px",
          top: (height - knob) / 2,
          left: checked ? width - knob : 1,
        }}
      ></span>
    </label>
  );
};

export default Switch;
