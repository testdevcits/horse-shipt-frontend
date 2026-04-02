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

const Step2Delivery = ({
  deliveryLocation,
  setDeliveryLocation,
  deliveryCoords,
  setDeliveryCoords,
  deliveryTimeOption,
  setDeliveryTimeOption,
  deliveryDate,
  setDeliveryDate,
  errors,
  clearError,
}) => {
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  const deliveryTimeOptions = [
    { value: "on", label: "On" },
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
    { value: "between", label: "Between" },
  ];

  // ONLY when dropdown option is selected
  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setDeliveryLocation(place.formatted_address);
    setDeliveryCoords({ lat, lng });
    clearError("deliveryLocation");

    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(14);
    }
  };

  // Marker drag updates parent coords
  const handleMarkerDragEnd = (e) => {
    setDeliveryCoords({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  return (
    <div className="flex flex-col w-full gap-4 bg-gray-50 p-4 rounded-lg font-montserrat">
      {/* Delivery Location */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-500">
          Delivery Location
        </label>

        <Autocomplete
          onLoad={(auto) => (autocompleteRef.current = auto)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            value={deliveryLocation}
            placeholder="Search delivery address"
            className={`w-full border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 ${
              errors?.deliveryLocation
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-system-primary"
            }`}
            onChange={(e) => {
              setDeliveryLocation(e.target.value);
              setDeliveryCoords(null);
              clearError("deliveryLocation");
            }}
          />
        </Autocomplete>

        {errors?.deliveryLocation && (
          <p className="text-red-500 text-sm mt-1">{errors.deliveryLocation}</p>
        )}
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={deliveryCoords || defaultCenter}
        zoom={deliveryCoords ? 14 : 4}
        onLoad={(map) => (mapRef.current = map)}
        options={{
          mapId: process.env.REACT_APP_GOOGLE_MAP_ID,
        }}
      >
        {deliveryCoords && (
          <Marker
            position={deliveryCoords}
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        )}
      </GoogleMap>

      {/* Delivery Time */}
      <Select
        label="When should your horse(s) be delivered?"
        value={deliveryTimeOption}
        onChange={(e) => {
          setDeliveryTimeOption(e.target.value);
          clearError("deliveryTimeOption");
        }}
        options={deliveryTimeOptions}
      />

      {errors?.deliveryTimeOption && (
        <p className="text-red-500 text-sm">{errors.deliveryTimeOption}</p>
      )}

      {/* Delivery Date */}
      <DateInput
        value={deliveryDate}
        onChange={(val) => {
          setDeliveryDate(val);
          clearError("deliveryDate");
        }}
        error={errors?.deliveryDate}
      />
    </div>
  );
};

export default Step2Delivery;
