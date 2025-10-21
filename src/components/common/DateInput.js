import React, { useState, useRef, useEffect } from "react";
import CustomCalendar from "../../components/common/CustomCalendar";

const DateInput = ({ value, onChange, error }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const inputRef = useRef(null);
  const calendarRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        readOnly
        value={value}
        onClick={() => setIsCalendarOpen((prev) => !prev)}
        placeholder="Select pickup date(s)"
        className="w-full text-gray-500 border border-gray-300 rounded px-3 py-2 cursor-pointer"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {isCalendarOpen && (
        <div
          ref={calendarRef}
          className="absolute z-50 mt-1 w-full"
          style={{ top: "100%", left: 0 }}
        >
          <CustomCalendar
            selectedColor="bg-system-primary"
            unavailableDates={[]} // add unavailable dates here
            initialSelected={value ? value.split(",") : []}
            onSelectDates={(dates) => {
              onChange(dates.join(","));
              setIsCalendarOpen(false); // close after selection
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DateInput;
