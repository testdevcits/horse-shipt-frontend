import React, { useState, useRef, useEffect } from "react";
import CustomCalendar from "./CustomCalendar";

const DateInput = ({
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
  minDate = null, 
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState(value || "");
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [calendarPosition, setCalendarPosition] = useState("bottom");
  const inputRef = useRef(null);
  const calendarRef = useRef(null);
  const containerRef = useRef(null);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getPastDates = () => {
    const pastDates = [];
    const today = new Date();
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

  useEffect(() => {
    setUnavailableDates(getPastDates());
  }, []);

  useEffect(() => {
    setDisplayValue(value || "");
  }, [value]);

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

  useEffect(() => {
    if (!isCalendarOpen || !inputRef.current) return;
    const handlePositionCheck = () => {
      const inputRect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;
      if (spaceBelow < 400 && spaceAbove > 300) {
        setCalendarPosition("top");
      } else {
        setCalendarPosition("bottom");
      }
    };
    setTimeout(handlePositionCheck, 0);
  }, [isCalendarOpen]);

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

  const handleDateSelect = (dates) => {
    if (dates && dates[0]) {
      const selectedDate = dates[0];
      setDisplayValue(selectedDate);
      onChange(selectedDate);
      setIsCalendarOpen(false);
    }
  };

  const handleInputClick = () => {
    if (disabled) return;
    if (!displayValue) {
     
      const defaultDate = minDate
        ? (() => {
            const d = new Date(minDate + "T00:00:00");
            d.setDate(d.getDate() + 1);
            return d.toISOString().split("T")[0];
          })()
        : getTodayDate();
      setDisplayValue(defaultDate);
      onChange(defaultDate);
    }
    setIsCalendarOpen((prev) => !prev);
  };

  const handleClearDate = (e) => {
    e.stopPropagation();
    if (disabled) return;
    setDisplayValue("");
    onChange("");
    setIsCalendarOpen(true);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={formatDateForDisplay(displayValue)}
          onClick={handleInputClick}
          placeholder={placeholder || "Select date"}
          disabled={disabled}
          className={`w-full border-2 rounded-lg px-4 py-2 md:py-3 text-gray-700 cursor-pointer focus:outline-none transition-all text-sm md:text-base ${
            disabled
              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              : error
              ? "border-red-500 focus:ring-2 focus:ring-red-300"
              : "border-gray-300 focus:ring-2 focus:ring-[#BF9B53]"
          }`}
        />
        {displayValue && !disabled && (
          <button
            onClick={handleClearDate}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg font-bold transition-colors"
            title="Clear date"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs md:text-sm mt-1 font-semibold">
          {error}
        </p>
      )}

      {disabled && !error && (
        <p className="text-gray-400 text-xs md:text-sm mt-1 font-semibold">
          Please select start date first
        </p>
      )}

      {isCalendarOpen && !disabled && (
        <div
          ref={calendarRef}
          className={`absolute z-50 w-full md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 transition-all ${
            calendarPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          <CustomCalendar
            selectedColor="bg-[#BF9B53]"
            unavailableDates={unavailableDates}
            initialSelected={displayValue ? [displayValue] : []}
            onSelectDates={handleDateSelect}
            minDate={minDate} 
          />
        </div>
      )}
    </div>
  );
};

export default DateInput;
