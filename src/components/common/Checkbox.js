import React from "react";

const Checkbox = ({ label, checked, onChange, className = "" }) => {
  return (
    <label className={`flex items-center space-x-2 mb-4 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
};

export default Checkbox;
