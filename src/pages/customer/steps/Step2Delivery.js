// /pages/customer/steps/Step2Delivery.jsx
// UPDATED FILE - DATE RANGE + LABEL FIX

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

const deliveryTimeOptions = [
  { value: "on", label: "On" },
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
  { value: "between", label: "Between" },
];

const Step2Delivery = ({
  deliveryLocation,
  setDeliveryLocation,
  deliveryCoords,
  setDeliveryCoords,
  deliveryTimeOption,
  setDeliveryTimeOption,

  // ✅ NEW DATE RANGE STATES
  deliveryStartDate,
  setDeliveryStartDate,
  deliveryEndDate,
  setDeliveryEndDate,

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

    setDeliveryLocation(place.formatted_address || "");
    setDeliveryCoords({ lat, lng });
    clearError("deliveryLocation");

    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(14);
    }
  };

  // Handle marker drag
  const handleMarkerDragEnd = (e) => {
    setDeliveryCoords({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  return (
    <div className="flex flex-col w-full gap-6 bg-white p-6 rounded-lg font-montserrat">
      {/* ===== LOCATION INPUT ===== */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-600">
          Delivery Location <span className="text-red-500">*</span>
        </label>

        <Autocomplete
          onLoad={(auto) => (autocompleteRef.current = auto)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            value={deliveryLocation}
            placeholder="Search delivery address"
            className={`w-full border-2 rounded-lg px-4 py-2 text-gray-700 focus:outline-none transition-all ${
              errors?.deliveryLocation
                ? "border-red-500 focus:ring-2 focus:ring-red-300"
                : "border-gray-300 focus:ring-2 focus:ring-[#BF9B53]"
            }`}
            onChange={(e) => {
              setDeliveryLocation(e.target.value);
              setDeliveryCoords(null);
              clearError("deliveryLocation");
            }}
          />
        </Autocomplete>

        {errors?.deliveryLocation && (
          <p className="text-red-500 text-sm mt-2 font-semibold">
            {errors.deliveryLocation}
          </p>
        )}
      </div>

      {/* ===== GOOGLE MAP ===== */}
      <div className="w-full rounded-lg overflow-hidden border-2 border-gray-200">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={deliveryCoords || defaultCenter}
          zoom={deliveryCoords ? 14 : 4}
          onLoad={(map) => (mapRef.current = map)}
          options={{
            mapId: process.env.REACT_APP_GOOGLE_MAP_ID || "",
            disableDefaultUI: false,
          }}
        >
          {deliveryCoords && (
            <Marker
              position={deliveryCoords}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              title="Delivery Location"
            />
          )}
        </GoogleMap>
      </div>

      {/* ===== DELIVERY TIME ===== */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-600">
          When should your horse(s) be delivered?{" "}
          <span className="text-red-500">*</span>
        </label>
        <Select
          value={deliveryTimeOption}
          onChange={(e) => {
            setDeliveryTimeOption(e.target.value);
            clearError("deliveryTimeOption");
          }}
          options={deliveryTimeOptions}
        />
        {errors?.deliveryTimeOption && (
          <p className="text-red-500 text-sm mt-2 font-semibold">
            {errors.deliveryTimeOption}
          </p>
        )}
      </div>

      {/* ===== DELIVERY DATE RANGE ===== */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-600">
          Select Drop-Off Date Range <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <DateInput
            value={deliveryStartDate}
            onChange={(val) => {
              setDeliveryStartDate(val);
              clearError("deliveryStartDate");
            }}
            error={errors?.deliveryStartDate}
            placeholder="Start Date"
          />

          {/* End Date */}
          <DateInput
            value={deliveryEndDate}
            onChange={(val) => {
              setDeliveryEndDate(val);
              clearError("deliveryEndDate");
            }}
            error={errors?.deliveryEndDate}
            placeholder="End Date"
          />
        </div>

        {(errors?.deliveryStartDate || errors?.deliveryEndDate) && (
          <p className="text-red-500 text-sm mt-2 font-semibold">
            {errors?.deliveryStartDate || errors?.deliveryEndDate}
          </p>
        )}

        <p className="text-xs text-gray-500 mt-2">
          If delivery is for a single day, select the same date in both fields.
        </p>
      </div>

      {/* ===== HELP TEXT ===== */}
      <div className="bg-[#BF9B53]/10 border border-[#BF9B53] rounded-lg p-4">
        <p className="text-sm text-gray-900">
          <span className="font-semibold">Note:</span> Please enter your
          delivery address or adjust the map marker to set the exact location.
        </p>
      </div>
    </div>
  );
};

export default Step2Delivery;
