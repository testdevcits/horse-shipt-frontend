// src/components/common/CustomDatePicker.js
import React, { useState } from "react";
import dayjs from "dayjs";

const CustomDatePicker = ({ unavailableDates = [], onSelectDate }) => {
  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState(null);

  // Generate next 30 days
  const days = Array.from({ length: 30 }, (_, i) => today.add(i, "day"));

  const handleSelect = (date) => {
    if (unavailableDates.includes(date.format("YYYY-MM-DD"))) return;
    setSelectedDate(date);
    onSelectDate && onSelectDate(date.format("YYYY-MM-DD"));
  };

  return (
    <div
      className="flex flex-wrap gap-4 p-4"
      style={{
        width: "252px",
        height: "266px",
        gap: "16px",
        background: "#fff",
        borderRadius: "6px",
        padding: "16px",
      }}
    >
      {days.map((day) => {
        const isUnavailable = unavailableDates.includes(
          day.format("YYYY-MM-DD")
        );
        const isSelected = selectedDate && selectedDate.isSame(day, "day");

        return (
          <div
            key={day.format("YYYY-MM-DD")}
            onClick={() => handleSelect(day)}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: "36px",
              height: "37px",
              borderRadius: "6px",
              textAlign: "center",
              lineHeight: "37px",
              background: isUnavailable
                ? "#DC2626" // red for unavailable
                : isSelected
                ? "#BF9B53" // green for selected
                : "#F3F4F6", // default
              color: isUnavailable ? "#fff" : "#000",
              userSelect: "none",
              fontWeight: "600",
            }}
          >
            {day.format("D")}
          </div>
        );
      })}
    </div>
  );
};

export default CustomDatePicker;
