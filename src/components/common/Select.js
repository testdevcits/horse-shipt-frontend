import React, { useState, useRef, useEffect } from "react";

const Select = ({ label, options = [], value, onChange, className = "" }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(
    options.find((opt) => opt.value === value) || null
  );
  const [search, setSearch] = useState("");
  const ref = useRef();

  // Update selected when value changes
  useEffect(() => {
    setSelected(options.find((opt) => opt.value === value) || null);
  }, [value, options]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selection
  const handleSelect = (opt) => {
    setSelected(opt);
    onChange && onChange({ target: { value: opt.value } });
    setOpen(false);
    setSearch("");
  };

  // Filter options based on search
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative flex flex-col ${className}`} ref={ref}>
      {label && (
        <label className="mb-1 text-gray-700 font-montserrat">{label}</label>
      )}

      {/* Selected / trigger (no arrow) */}
      <div
        className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer bg-white flex justify-between items-center"
        onClick={() => setOpen(!open)}
      >
        <span>{selected ? selected.label : "Select..."}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto border border-gray-300 rounded-md bg-white z-50 vehicle-scroll"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Search input at top */}
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none"
          />

          <ul>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    selected?.value === opt.value
                      ? "bg-[#BF9B53] text-white"
                      : "hover:bg-[#BF9B53] hover:text-white"
                  }`}
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Select;
