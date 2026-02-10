// /pages/customer/NewShipment/steps/Step1Pickup.jsx
import React from "react";
import DateInput from "../../../components/common/DateInput";
import Select from "../../../components/common/Select";

const Step1Pickup = ({
  pickupLocation,
  setPickupLocation,
  pickupTimeOption,
  setPickupTimeOption,
  pickupDate,
  setPickupDate,
  errors, // read-only
  clearError, // function from parent
}) => {
  const pickupTimeOptions = [
    { value: "on", label: "On" },
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
    { value: "between", label: "Between" },
  ];

  return (
    <div className="flex flex-col w-full gap-4 bg-gray-50 p-4 rounded-lg">
      {/* Pickup Location */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-500">
          Pickup Location
        </label>
        <input
          type="text"
          value={pickupLocation}
          onChange={(e) => {
            setPickupLocation(e.target.value);
            clearError("pickupLocation");
          }}
          placeholder="Address"
          className={`w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 ${
            errors.pickupLocation
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-system-primary"
          }`}
        />
        {errors.pickupLocation && (
          <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>
        )}
      </div>

      {/* Pickup Time Option */}
      <div>
        <Select
          label="When can your horse(s) be picked up?"
          value={pickupTimeOption}
          onChange={(e) => {
            setPickupTimeOption(e.target.value);
            clearError("pickupTimeOption");
          }}
          options={pickupTimeOptions}
          className="w-full"
        />
        {errors.pickupTimeOption && (
          <p className="text-red-500 text-sm mt-1">{errors.pickupTimeOption}</p>
        )}
      </div>

      {/* Pickup Date */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-500">
          Pickup Date
        </label>
        <DateInput
          value={pickupDate}
          onChange={(val) => {
            setPickupDate(val);
            clearError("pickupDate");
          }}
          error={errors.pickupDate}
        />
      </div>
    </div>
  );
};

export default Step1Pickup;
