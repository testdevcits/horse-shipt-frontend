import React, { useState } from "react";
import dayjs from "dayjs";
import classNames from "classnames";
import { MdKeyboardArrowLeft, MdChevronRight } from "react-icons/md";

const CustomCalendar = ({
  selectedColor = "bg-system-primary",
  unavailableDates = [],
  onSelectDates = () => {},
  initialSelected = [],
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
    if (unavailableDates.includes(formatted)) return;

    let updated;
    if (selectedDates.includes(formatted)) {
      updated = selectedDates.filter((d) => d !== formatted);
    } else {
      updated = [...selectedDates, formatted];
    }
    setSelectedDates(updated);
    onSelectDates(updated);
  };

  return (
    <div
      className=" border border-[#EAEAEA] p-2 bg-system-background shadow-sm flex flex-col"
      style={{ opacity: 1, gap: "16px" }}
    >
      {/* Header with Month and Arrows */}
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
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} className="font-semibold">
            {d}
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-1 mt-1">
        {/* Empty slots for first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = currentMonth.date(i + 1);
          const formatted = date.format("YYYY-MM-DD");
          const isSelected = selectedDates.includes(formatted);
          const isUnavailable = unavailableDates.includes(formatted);

          return (
            <button
              key={formatted}
              onClick={() => handleDateClick(date)}
              className={classNames(
                "w-[33.7px] h-[35px] flex items-center justify-center text-sm transition-all duration-200 ",
                {
                  [selectedColor]: isSelected,
                  "bg-danger text-white cursor-not-allowed":
                    isUnavailable && !isSelected,
                  "hover:bg-system-primary/20": !isSelected && !isUnavailable,
                  "bg-system-background  border-gray-200":
                    !isSelected && !isUnavailable,
                  "text-white": isSelected,
                }
              )}
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
