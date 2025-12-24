import React from "react";

const StatusBadge = ({
  text = "Status",
  bgColor = "bg-success-100",
  borderColor = "border-success-600",
  dotColor = "bg-success-400",
  textColor = "text-success-700",
  paddingX = "px-3",
  paddingY = "py-1",
  className = "",
  showDot = true,
}) => {
  return (
    <div
      className={`flex items-center gap-2 ${paddingX} ${paddingY} rounded-full ${bgColor} border ${borderColor} ${className}`}
    >
      {/* DOT (conditional) */}
      {showDot && <span className={`w-2 h-2 rounded-full ${dotColor}`} />}

      <span className={`text-xs font-medium ${textColor}`}>{text}</span>
    </div>
  );
};

export default StatusBadge;
