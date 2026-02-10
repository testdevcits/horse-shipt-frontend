// /pages/customer/NewShipment/steps/Step2Delivery.jsx
import React from "react";
import DateInput from "../../../components/common/DateInput";
import Select from "../../../components/common/Select";

const Step2Delivery = ({
  deliveryLocation,
  setDeliveryLocation,
  deliveryTimeOption,
  setDeliveryTimeOption,
  deliveryDate,
  setDeliveryDate,
  errors,
  clearError, // safe method to clear specific error
}) => {
  const deliveryTimeOptions = [
    { value: "on", label: "On" },
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
    { value: "between", label: "Between" },
  ];

  // Handlers that also clear errors dynamically
  const handleLocationChange = (value) => {
    setDeliveryLocation(value);
    clearError && clearError("deliveryLocation");
  };

  const handleTimeOptionChange = (value) => {
    setDeliveryTimeOption(value);
    clearError && clearError("deliveryTimeOption");
  };

  const handleDateChange = (value) => {
    setDeliveryDate(value);
    clearError && clearError("deliveryDate");
  };

  return (
    <div className="flex flex-col w-full gap-4 bg-gray-50 p-4 rounded-lg space-y-4">
      {/* Delivery Location */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-500">
          Delivery Location
        </label>
        <input
          type="text"
          value={deliveryLocation}
          onChange={(e) => handleLocationChange(e.target.value)}
          placeholder="Address"
          className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-system-primary"
        />
        {errors.deliveryLocation && (
          <p className="text-red-500 text-sm mt-1">{errors.deliveryLocation}</p>
        )}
      </div>

      {/* Delivery Time Option */}
      <div>
        <Select
          label="When should your horse(s) be delivered?"
          value={deliveryTimeOption}
          onChange={(e) => handleTimeOptionChange(e.target.value)}
          options={deliveryTimeOptions}
          className="w-full"
        />
        {errors.deliveryTimeOption && (
          <p className="text-red-500 text-sm mt-1">
            {errors.deliveryTimeOption}
          </p>
        )}
      </div>

      {/* Delivery Date */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-500">
          Delivery Date
        </label>
        <DateInput
          value={deliveryDate}
          onChange={handleDateChange}
          error={errors.deliveryDate}
        />
      </div>
    </div>
  );
};

export default Step2Delivery;
