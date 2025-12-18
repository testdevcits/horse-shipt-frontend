import React from "react";

const StatusBadge = ({
  text = "Status", // Default text
  bgColor = "bg-success-100", // Background color
  borderColor = "border-success-600", // Border color
  dotColor = "bg-success-400", // Dot color
  textColor = "text-success-700", // Text color
  paddingX = "px-3", // Horizontal padding
  paddingY = "py-1", // Vertical padding
  className = "", // Additional classes
}) => {
  return (
    <div
      className={`flex items-center gap-2 ${paddingX} ${paddingY} rounded-full ${bgColor} border ${borderColor} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span className={`text-xs font-medium ${textColor}`}>{text}</span>
    </div>
  );
};

export default StatusBadge;
