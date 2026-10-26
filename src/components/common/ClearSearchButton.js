import React from "react";
import { FiX } from "react-icons/fi";

const ClearSearchButton = ({ value, onClear, className = "" }) => {
  if (!String(value ?? "").length) return null;

  return (
    <button
      type="button"
      onClick={onClear}
      aria-label="Clear search"
      title="Clear search"
      className={`absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 ${className}`}
    >
      <FiX size={16} />
    </button>
  );
};

export default ClearSearchButton;
