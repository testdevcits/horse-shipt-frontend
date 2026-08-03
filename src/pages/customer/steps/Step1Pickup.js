import React, { useRef, useEffect, useCallback } from "react";
import { GoogleMap, Autocomplete, Marker } from "@react-google-maps/api";
import DateInput from "../../../components/common/DateInput";
import { DEFAULT_US_MAP_CENTER } from "../../../constants/mapDefaults";

const containerStyle = {
  width: "100%",
  height: "350px",
};

const defaultCenter = DEFAULT_US_MAP_CENTER;

const Step1Pickup = ({
  pickupLocation,
  setPickupLocation,
  pickupCoords,
  setPickupCoords,
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
  const timeOptionInitialized = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!timeOptionInitialized.current) {
      setPickupTimeOption("between");
      timeOptionInitialized.current = true;
    }
  }, [setPickupTimeOption]);

  const onPlaceChanged = useCallback(() => {
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
  }, [setPickupLocation, setPickupCoords, clearError]);

  const handleMarkerDragEnd = useCallback(
    (e) => {
      setPickupCoords({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    },
    [setPickupCoords]
  );

  const handleStartDateChange = useCallback(
    (val) => {
      setPickupStartDate(val);
      clearError("pickupStartDate");
      if (pickupEndDate) {
        clearError("pickupEndDate");
      }
    },
    [setPickupStartDate, clearError, pickupEndDate]
  );

  const handleEndDateChange = useCallback(
    (val) => {
      setPickupEndDate(val);
      clearError("pickupEndDate");
      if (pickupStartDate) {
        clearError("pickupStartDate");
      }
    },
    [setPickupEndDate, clearError, pickupStartDate]
  );

  return (
    <div className="flex flex-col w-full gap-6 bg-white p-4 md:p-6 font-montserrat">
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
            className={`w-full border-2 px-4 py-2 md:py-3 text-gray-700 text-sm md:text-base focus:outline-none transition-all ${
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

      {/* Google Map */}
      <div className="w-full overflow-hidden border-2 border-gray-200">
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

      {/* Date Range */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-600">
          Pickup Date Range <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
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

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">
              End Date
            </label>
            <DateInput
              value={pickupEndDate}
              onChange={handleEndDateChange}
              error={errors?.pickupEndDate}
              placeholder="End Date"
              disabled={!pickupStartDate}
              minDate={pickupStartDate || null}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Both start and end date can be the same day. Only future dates can be
          selected.
        </p>
      </div>

      <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-3 space-y-4">
        <p className="text-xs md:text-sm text-gray-900">
          Please enter your pickup address or adjust the map marker to set the
          exact location.
        </p>
      </div>
    </div>
  );
};

export default Step1Pickup;
