// /pages/customer/steps/Step1Pickup.jsx
// UPDATED FILE - Responsive Design, Current Date Pre-Selected, Past Dates Disabled

import React, { useRef } from "react";
import { GoogleMap, Autocomplete, Marker } from "@react-google-maps/api";
import DateInput from "../../../components/common/DateInput";
import Select from "../../../components/common/Select";

const containerStyle = {
  width: "100%",
  height: "350px",
};

const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795,
};

const pickupTimeOptions = [
  { value: "on", label: "On" },
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
  { value: "between", label: "Between" },
];

const Step1Pickup = ({
  pickupLocation,
  setPickupLocation,
  pickupCoords,
  setPickupCoords,
  pickupTimeOption,
  setPickupTimeOption,
  pickupStartDate,
  setPickupStartDate,
  pickupEndDate,
  setPickupEndDate,
  errors,
  clearError,
}) => {
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Handle place selected from autocomplete
  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setPickupLocation(place.formatted_address || "");
    setPickupCoords({ lat, lng });
    clearError("pickupLocation");

    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(14);
    }
  };

  // Handle marker drag
  const handleMarkerDragEnd = (e) => {
    setPickupCoords({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  // Handle start date change
  const handleStartDateChange = (val) => {
    setPickupStartDate(val);
    clearError("pickupStartDate");
    if (pickupEndDate) {
      clearError("pickupEndDate");
    }
  };

  // Handle end date change
  const handleEndDateChange = (val) => {
    setPickupEndDate(val);
    clearError("pickupEndDate");
    if (pickupStartDate) {
      clearError("pickupStartDate");
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 bg-white p-4 md:p-6 rounded-lg font-montserrat">
      {/* ===== LOCATION INPUT ===== */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-600">
          Pickup Location <span className="text-red-500">*</span>
        </label>

        <Autocomplete
          onLoad={(auto) => (autocompleteRef.current = auto)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            value={pickupLocation}
            placeholder="Search pickup address"
            className={`w-full border-2 rounded-lg px-4 py-2 md:py-3 text-gray-700 text-sm md:text-base focus:outline-none transition-all ${
              errors?.pickupLocation
                ? "border-red-500 focus:ring-2 focus:ring-red-300"
                : "border-gray-300 focus:ring-2 focus:ring-[#BF9B53]"
            }`}
            onChange={(e) => {
              setPickupLocation(e.target.value);
              setPickupCoords(null);
              clearError("pickupLocation");
            }}
          />
        </Autocomplete>

        {errors?.pickupLocation && (
          <p className="text-red-500 text-xs md:text-sm mt-2 font-semibold">
            {errors.pickupLocation}
          </p>
        )}
      </div>

      {/* ===== GOOGLE MAP ===== */}
      <div className="w-full rounded-lg overflow-hidden border-2 border-gray-200">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={pickupCoords || defaultCenter}
          zoom={pickupCoords ? 14 : 4}
          onLoad={(map) => (mapRef.current = map)}
          options={{
            mapId: process.env.REACT_APP_GOOGLE_MAP_ID || "",
            disableDefaultUI: false,
          }}
        >
          {pickupCoords && (
            <Marker
              position={pickupCoords}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              title="Pickup Location"
            />
          )}
        </GoogleMap>
      </div>

      {/* ===== PICKUP TIME ===== */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-600">
          When can your horse(s) be picked up?{" "}
          <span className="text-red-500">*</span>
        </label>
        <Select
          value={pickupTimeOption}
          onChange={(e) => {
            setPickupTimeOption(e.target.value);
            clearError("pickupTimeOption");
          }}
          options={pickupTimeOptions}
        />
        {errors?.pickupTimeOption && (
          <p className="text-red-500 text-xs md:text-sm mt-2 font-semibold">
            {errors.pickupTimeOption}
          </p>
        )}
      </div>

      {/* ===== PICKUP DATE RANGE ===== */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-600">
          Pickup Date Range <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">
              Start Date
            </label>
            <DateInput
              value={pickupStartDate}
              onChange={handleStartDateChange}
              error={errors?.pickupStartDate}
              placeholder="Start Date"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">
              End Date
            </label>
            <DateInput
              value={pickupEndDate}
              onChange={handleEndDateChange}
              error={errors?.pickupEndDate}
              placeholder="End Date"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          If pickup is for a single day, select the same date in both fields.
          Only future dates can be selected.
        </p>
      </div>

      {/* ===== HELP TEXT ===== */}
      <div className="bg-[#BF9B53]/10 border border-[#BF9B53] rounded-lg p-4">
        <p className="text-xs md:text-sm text-gray-900">
          <span className="font-semibold">Note:</span> Please enter your pickup
          address or adjust the map marker to set the exact location.
        </p>
      </div>
    </div>
  );
};

export default Step1Pickup;
