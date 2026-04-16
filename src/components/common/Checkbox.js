import React from "react";

/**
 * Common Checkbox Component
 * Props:
 * - checked: boolean → current checkbox state
 * - onChange: function → called when toggled
 * - label: string (optional)
 * - disabled: boolean (optional)
 */
const Checkbox = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}) => {
  return (
    <label
      className={`flex items-center gap-2 cursor-pointer ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <div
        className={`w-[20px] h-[20px] rounded-[5px] border border-[#BF9B53] flex items-center justify-center
          ${checked ? "bg-[#997C42]" : "bg-transparent"} 
          transition-all duration-200 cursor-pointer
          ${className}
        `}
        onClick={() => !disabled && onChange({ target: { checked: !checked } })}
      >
        {checked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-[14px] h-[14px] text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>

      {label && (
        <span className="text-[14px] sm:text-[15px] text-gray-700 font-[Montserrat]">
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
