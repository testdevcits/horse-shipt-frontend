import React from "react";

const InputField = ({
  label,
  name,
  type = "text",
  placeholder = "",
  value,
  onChange,
  onBlur,
  error = "",
  touched = false,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-gray-700 font-medium text-sm">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full rounded-sm px-2.5 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 transition ${
          touched && error
            ? "border border-red-400 focus:ring-red-100 focus:border-red-500"
            : "border border-gray-300 focus:ring-system-primary focus:border-system-primary"
        }`}
      />
      {touched && error && (
        <p className="text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

export default InputField;
