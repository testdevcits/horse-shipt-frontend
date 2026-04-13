import React, { useState, useRef, useEffect } from "react";
import CustomCalendar from "./CustomCalendar";

const DateInput = ({ value, onChange, error, placeholder }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState(value || "");
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [calendarPosition, setCalendarPosition] = useState("bottom");
  const inputRef = useRef(null);
  const calendarRef = useRef(null);
  const containerRef = useRef(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get all dates before today
  const getPastDates = () => {
    const pastDates = [];
    const today = new Date();

    // Go back 100 years to disable all past dates
    for (let i = 1; i <= 36500; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      pastDates.push(`${year}-${month}-${day}`);
    }

    return pastDates;
  };

  // Initialize unavailable dates on mount
  useEffect(() => {
    setUnavailableDates(getPastDates());
  }, []);

  // Update displayValue whenever value prop changes
  useEffect(() => {
    setDisplayValue(value || "");
  }, [value]);

  // Format date for display (YYYY-MM-DD to readable format)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString + "T00:00:00");
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Determine calendar position based on available space
  useEffect(() => {
    if (!isCalendarOpen || !inputRef.current) return;

    const handlePositionCheck = () => {
      const inputRect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;

      // If less than 400px space below, open above
      if (spaceBelow < 400 && spaceAbove > 300) {
        setCalendarPosition("top");
      } else {
        setCalendarPosition("bottom");
      }
    };

    // Check position after calendar opens
    setTimeout(handlePositionCheck, 0);
  }, [isCalendarOpen]);

  // Handle click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // UPDATED: Handle date selection from calendar - single date only
  const handleDateSelect = (dates) => {
    if (dates && dates[0]) {
      const selectedDate = dates[0];
      setDisplayValue(selectedDate);
      onChange(selectedDate);
      // Calendar stays open so user can select another date if needed
    }
  };

  // UPDATED: Handle input field click - set to today if empty
  const handleInputClick = () => {
    // If no date selected, set to today
    if (!displayValue) {
      const todayDate = getTodayDate();
      setDisplayValue(todayDate);
      onChange(todayDate);
    }
    setIsCalendarOpen((prev) => !prev);
  };

  // Handle manual date clearing
  const handleClearDate = (e) => {
    e.stopPropagation();
    setDisplayValue("");
    onChange("");
    setIsCalendarOpen(true);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={formatDateForDisplay(displayValue)}
          onClick={handleInputClick}
          placeholder={placeholder || "Select date"}
          className={`w-full border-2 rounded-lg px-4 py-2 md:py-3 text-gray-700 cursor-pointer focus:outline-none transition-all text-sm md:text-base ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-300"
              : "border-gray-300 focus:ring-2 focus:ring-[#BF9B53]"
          }`}
        />

        {/* Clear button - shows when date is selected */}
        {displayValue && (
          <button
            onClick={handleClearDate}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg font-bold transition-colors"
            title="Clear date"
          >
            ✕
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-xs md:text-sm mt-1 font-semibold">
          {error}
        </p>
      )}

      {/* Calendar dropdown - Responsive positioning */}
      {isCalendarOpen && (
        <div
          ref={calendarRef}
          className={`absolute z-50 w-full md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 transition-all ${
            calendarPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          style={{
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          <CustomCalendar
            selectedColor="bg-[#BF9B53]"
            unavailableDates={unavailableDates}
            initialSelected={displayValue ? [displayValue] : [getTodayDate()]}
            onSelectDates={handleDateSelect}
          />
        </div>
      )}
    </div>
  );
};

export default DateInput;
