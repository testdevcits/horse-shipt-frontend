import React, { useRef, useEffect, useCallback } from "react";
import { GoogleMap, Autocomplete, Marker } from "@react-google-maps/api";
import DateInput from "../../../components/common/DateInput";

const containerStyle = {
  width: "100%",
  height: "350px",
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
  deliveryStartDate,
  setDeliveryStartDate,
  deliveryEndDate,
  setDeliveryEndDate,
  pickupStartDate,
  pickupEndDate,
  errors,
  clearError,
}) => {
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const timeOptionInitialized = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!timeOptionInitialized.current) {
      setDeliveryTimeOption("between");
      timeOptionInitialized.current = true;
    }
  }, [setDeliveryTimeOption]);

  const onPlaceChanged = useCallback(() => {
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
  }, [setDeliveryLocation, setDeliveryCoords, clearError]);

  const handleMarkerDragEnd = useCallback(
    (e) => {
      setDeliveryCoords({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    },
    [setDeliveryCoords]
  );

  const handleStartDateChange = useCallback(
    (val) => {
      setDeliveryStartDate(val);
      clearError("deliveryStartDate");
      if (deliveryEndDate) {
        clearError("deliveryEndDate");
      }
    },
    [setDeliveryStartDate, clearError, deliveryEndDate]
  );

  const handleEndDateChange = useCallback(
    (val) => {
      setDeliveryEndDate(val);
      clearError("deliveryEndDate");
      if (deliveryStartDate) {
        clearError("deliveryStartDate");
      }
    },
    [setDeliveryEndDate, clearError, deliveryStartDate]
  );

  // minDate should be the day after pickupEndDate
  const getDeliveryMinDate = () => {
    if (!pickupEndDate) return null;
    const nextDay = new Date(pickupEndDate + "T00:00:00");
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split("T")[0];
  };

  const deliveryMinDate = getDeliveryMinDate();

  return (
    <div className="flex flex-col w-full gap-6 bg-white p-4 md:p-6 font-montserrat">
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
            className={`w-full border-2 rounded-lg px-4 py-2 md:py-3 text-gray-700 text-sm md:text-base focus:outline-none transition-all ${
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
          <p className="text-red-500 text-xs md:text-sm mt-2 font-semibold">
            {errors.deliveryLocation}
          </p>
        )}
      </div>

      {/* Google Map */}
      <div className="w-full overflow-hidden border-2 border-gray-200">
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

      {/* Date Range */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-600">
          Select Drop-Off Date Range <span className="text-red-500">*</span>
        </label>

        {/* Hint when pickup end date is set */}
        {pickupEndDate && (
          <p className="text-xs text-[#BF9B53] font-medium bg-[#BF9B53]/10 p-2">
            Delivery must start AFTER pickup end date ({pickupEndDate}).
            Earliest delivery start date is {deliveryMinDate}.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">
              Start Date
            </label>
            <DateInput
              value={deliveryStartDate}
              onChange={handleStartDateChange}
              error={errors?.deliveryStartDate}
              placeholder="Start Date"
              minDate={deliveryMinDate}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">
              End Date
            </label>
            <DateInput
              value={deliveryEndDate}
              onChange={handleEndDateChange}
              error={errors?.deliveryEndDate}
              placeholder="End Date"
              disabled={!deliveryStartDate}
              minDate={deliveryStartDate || deliveryMinDate}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Both start and end date can be the same day. Only future dates can be
          selected.
        </p>
      </div>

      <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-3 rounded-lg space-y-4">
        <p className="text-xs md:text-sm text-gray-900">
          Please enter your delivery address or adjust the map marker to set the
          exact location. Delivery time will be between start and end date.
        </p>
      </div>
    </div>
  );
};

export default Step2Delivery;
