import React from "react";

const InputField = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-gray-700 font-medium text-sm">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-system-primary focus:border-system-primary transition"
      />
    </div>
  );
};

export default InputField;
