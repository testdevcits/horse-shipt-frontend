import React, { useState } from "react";
import dayjs from "dayjs";
import classNames from "classnames";
import { MdKeyboardArrowLeft, MdChevronRight } from "react-icons/md";

const CustomCalendar = ({
  selectedColor = "bg-system-primary",
  unavailableDates = [],
  onSelectDates = () => {},
  initialSelected = [],
  minDate = null, // earliest selectable date
}) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDates, setSelectedDates] = useState(initialSelected);

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const firstDay = startOfMonth.day();

  const handlePrevMonth = () =>
    setCurrentMonth(currentMonth.subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  const handleDateClick = (date) => {
    const formatted = date.format("YYYY-MM-DD");

    // Block unavailable dates
    if (unavailableDates.includes(formatted)) return;

    if (minDate && formatted < minDate) return;

    let updated;
    if (selectedDates.includes(formatted)) {
      updated = [];
    } else {
      updated = [formatted];
    }
    setSelectedDates(updated);
    onSelectDates(updated);
  };

  return (
    <div
      className="border border-[#EAEAEA] p-2 bg-system-background shadow-sm flex flex-col"
      style={{ opacity: 1, gap: "16px" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2 px-2">
        <button
          onClick={handlePrevMonth}
          className="text-gray-500 hover:text-system-primary"
        >
          <MdKeyboardArrowLeft size={24} />
        </button>
        <h2 className="text-systemText font-semibold">
          {currentMonth.format("MMMM YYYY")}
        </h2>
        <button
          onClick={handleNextMonth}
          className="text-gray-500 hover:text-system-primary"
        >
          <MdChevronRight size={24} />
        </button>
      </div>
      <div className="border-b border-gray-300 mt-1" />

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-systemText">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="font-semibold">
            {d}
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-1 mt-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = currentMonth.date(i + 1);
          const formatted = date.format("YYYY-MM-DD");
          const isSelected = selectedDates.includes(formatted);

          const isUnavailable =
            unavailableDates.includes(formatted) ||
            (minDate ? formatted < minDate : false);

          return (
            <button
              key={formatted}
              onClick={() => handleDateClick(date)}
              className={classNames(
                "w-[33.7px] h-[35px] flex items-center justify-center text-sm transition-all duration-200 rounded",
                {
                  [selectedColor]: isSelected,
                  "bg-red-200 text-red-700 cursor-not-allowed":
                    isUnavailable && !isSelected,
                  "hover:bg-system-primary/20 cursor-pointer":
                    !isSelected && !isUnavailable,
                  "bg-system-background border border-gray-200":
                    !isSelected && !isUnavailable,
                  "text-white cursor-pointer": isSelected,
                }
              )}
              disabled={isUnavailable}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendar;
