import React, { useState, useEffect } from "react";

const HORSE_COLORS = [
  "Bay",
  "Dark Bay",
  "Blood Bay",
  "Black",
  "Faded Black",
  "Chestnut",
  "Liver Chestnut",
  "Light Chestnut",
  "Sorrel",
  "Grey",
  "Dapple Grey",
  "Flea-bitten Grey",
  "White",
  "Palomino",
  "Golden Palomino",
  "Buckskin",
  "Dun",
  "Red Dun",
  "Grullo",
  "Roan",
  "Red Roan",
  "Blue Roan",
  "Strawberry Roan",
  "Pinto",
  "Tobiano",
  "Overo",
  "Tovero",
  "Appaloosa",
  "Leopard Appaloosa",
  "Snowflake Appaloosa",
  "Blanket Appaloosa",
  "Cremello",
  "Perlino",
  "Smoky Black",
  "Champagne",
  "Gold Champagne",
  "Amber Champagne",
  "Silver Dapple",
  "Brindle",
  "Sabino",
  "Splash White",
  "Rabicano",
  "Other",
];
const ColorPicker = ({ value = "", onChange, label = "Colour", error }) => {
  const [color, setColor] = useState("");
  const [customColor, setCustomColor] = useState("");

  useEffect(() => {
    if (HORSE_COLORS.includes(value)) {
      setColor(value);
      setCustomColor("");
    } else if (value) {
      setColor("Other");
      setCustomColor(value);
    } else {
      setColor("");
      setCustomColor("");
    }
  }, [value]);

  const handleSelectChange = (e) => {
    const selected = e.target.value;
    setColor(selected);

    if (selected !== "Other") {
      setCustomColor("");
      onChange?.(selected);
    } else {
      onChange?.(""); // wait for custom input
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

      {/* Dropdown */}
      <select
        value={color}
        onChange={handleSelectChange}
        className="w-full h-11 px-3 rounded-md border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#BF9B53]"
      >
        <option value="">Select colour</option>
        {HORSE_COLORS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Custom Input */}
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
