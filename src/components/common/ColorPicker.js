import React, { useState, useEffect } from "react";
import { DEFAULT_HORSE_COLORS } from "../../hooks/useHorseAttributeOptions";

const ColorPicker = ({
  value = "",
  onChange,
  label = "Colour",
  error,
  options = DEFAULT_HORSE_COLORS,
}) => {
  const horseColors = options?.length ? options : DEFAULT_HORSE_COLORS;
  const [color, setColor] = useState("");
  const [customColor, setCustomColor] = useState("");

  useEffect(() => {
    if (horseColors.includes(value)) {
      setColor(value);
      setCustomColor("");
    } else if (value) {
      setColor("Other");
      setCustomColor(value);
    } else {
      setColor("");
      setCustomColor("");
    }
  }, [value, horseColors]);

  const handleSelectChange = (e) => {
    const selected = e.target.value;
    setColor(selected);

    if (selected !== "Other") {
      setCustomColor("");
      onChange?.(selected);
    } else {
      onChange?.("");
    }
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomColor(val);
    onChange?.(val);
  };

  return (
    <div className="flex-1">
      <label className="block font-semibold text-gray-600 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>

      <select
        value={color}
        onChange={handleSelectChange}
        className="w-full h-11 px-3 rounded-md border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]"
      >
        <option value="">Select colour</option>
        {horseColors.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {color === "Other" && (
        <input
          type="text"
          placeholder="Enter custom colour"
          value={customColor}
          onChange={handleCustomChange}
          className="mt-3 w-full h-11 px-3 rounded-md border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]"
        />
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default ColorPicker;
