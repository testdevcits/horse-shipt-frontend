
import React from "react";

const CustomRadio = ({ label, name, value, selectedValue, onChange }) => {
  const checked = value === selectedValue;

  return (
    <label className="flex items-center gap-3 cursor-pointer relative">
      {/* Hidden native radio */}
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />

      {/* Custom radio */}
      <span
        className={`
          w-5 h-5 flex-shrink-0 rounded-full border border-gray-400 flex items-center justify-center
          transition-colors duration-200 ease-in-out
          ${checked ? "bg-white" : "border-system-primary"}
        `}
      >
        {checked && (
          <span className="w-2.5 h-2.5 rounded-full bg-system-primary" />
        )}
      </span>

      {/* Label text */}
      <span className="text-dark font-montserrat text-sm sm:text-base">
        {label}
      </span>
    </label>
  );
};

export default CustomRadio;
