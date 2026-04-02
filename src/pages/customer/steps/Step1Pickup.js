import React, { useRef } from "react";
import { GoogleMap, Autocomplete, Marker } from "@react-google-maps/api";
import DateInput from "../../../components/common/DateInput";
import Select from "../../../components/common/Select";

const containerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795,
};

const Step1Pickup = ({
  pickupLocation,
  setPickupLocation,
  pickupCoords,
  setPickupCoords,
  pickupTimeOption,
  setPickupTimeOption,
  pickupDate,
  setPickupDate,
  errors,
  clearError,
}) => {
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  const pickupTimeOptions = [
    { value: "on", label: "On" },
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
    { value: "between", label: "Between" },
  ];

  // ONLY when user selects from dropdown
  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setPickupLocation(place.formatted_address);
    setPickupCoords({ lat, lng });
    clearError("pickupLocation");

    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(14);
    }
  };

  // Marker drag updates parent coords
  const handleMarkerDragEnd = (e) => {
    setPickupCoords({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  return (
    <div className="flex flex-col w-full gap-4 bg-gray-50 p-4 rounded-lg font-montserrat">
      {/* Pickup Location */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-500">
          Pickup Location
        </label>

        <Autocomplete
          onLoad={(auto) => (autocompleteRef.current = auto)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            value={pickupLocation}
            placeholder="Search pickup address"
            className={`w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 ${
              errors?.pickupLocation
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-system-primary"
            }`}
            onChange={(e) => {
              setPickupLocation(e.target.value);
              setPickupCoords(null);
              clearError("pickupLocation");
            }}
          />
        </Autocomplete>

        {errors?.pickupLocation && (
          <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>
        )}
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={pickupCoords || defaultCenter}
        zoom={pickupCoords ? 14 : 4}
        onLoad={(map) => (mapRef.current = map)}
        options={{
          mapId: process.env.REACT_APP_GOOGLE_MAP_ID,
        }}
      >
        {pickupCoords && (
          <Marker
            position={pickupCoords}
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        )}
      </GoogleMap>

      {/* Pickup Time */}
      <Select
        label="When can your horse(s) be picked up?"
        value={pickupTimeOption}
        onChange={(e) => {
          setPickupTimeOption(e.target.value);
          clearError("pickupTimeOption");
        }}
        options={pickupTimeOptions}
      />

      {/* Pickup Date */}
      <DateInput
        value={pickupDate}
        onChange={(val) => {
          setPickupDate(val);
          clearError("pickupDate");
        }}
        error={errors?.pickupDate}
      />
    </div>
  );
};

export default Step1Pickup;
