import React from "react";

const Select = ({ label, options = [], value, onChange, className = "" }) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && (
        <label className="mb-1 text-gray-700 font-montserrat">{label}</label>
      )}

      <select
        value={value}
        onChange={onChange}
        className="
          px-4 py-2 
          border border-gray-300 
          rounded-md 
          focus:outline-none 
          focus:ring-1 
          focus:ring-system-primary 
          font-montserrat 
          transition-colors
          bg-white
        "
      >
        {options.map((opt, index) => (
          <option
            key={index}
            value={opt.value}
            className="checked:bg-system-primary checked:text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
