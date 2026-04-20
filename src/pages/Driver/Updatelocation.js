import React, { useState, useRef, useCallback } from "react";
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";
import { MdMyLocation, MdLocationOn, MdCheckCircle } from "react-icons/md";
import { FiSearch, FiAlertCircle } from "react-icons/fi";
import { FaMapLocationDot } from "react-icons/fa6";
import Toast from "../../components/common/Toast";
import { useDriverAuth } from "../../contexts/DriverAuthContext";

const containerStyle = { width: "100%", height: "320px" };

const defaultCenter = { lat: 39.8283, lng: -98.5795 };

/* ── Status Pill ── */
const StatusPill = ({ type, children }) => {
  const styles = {
    success: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    error: "bg-red-50 border border-red-200 text-red-600",
    info: "bg-blue-50 border border-blue-200 text-blue-700",
    warning: "bg-amber-50 border border-[#BF9B53]/40 text-amber-700",
  };
  const icons = {
    success: <MdCheckCircle size={14} className="shrink-0" />,
    error: <FiAlertCircle size={14} className="shrink-0" />,
    info: <MdLocationOn size={14} className="shrink-0" />,
    warning: <FiAlertCircle size={14} className="shrink-0" />,
  };
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${styles[type]}`}
    >
      {icons[type]}
      {children}
    </div>
  );
};

/* ── Coord Display ── */
const CoordBadge = ({ label, value }) => (
  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-sm font-black text-gray-800 font-mono">
      {value !== null && value !== undefined ? value.toFixed(5) : "—"}
    </p>
  </div>
);

const UpdateLocation = ({ driver, driverLocation, onLocationUpdated }) => {
  const { updateDriverLocation } = useDriverAuth();

  const [selectedLocation, setSelectedLocation] = useState(
    driverLocation || null
  );
  const [searchAddress, setSearchAddress] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [gpsError, setGpsError] = useState(false);

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  /* ── Use GPS ── */
  const handleUseGPS = useCallback(() => {
    if (!navigator.geolocation) {
      Toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsGpsLoading(true);
    setGpsError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setSelectedLocation(loc);
        setIsGpsLoading(false);
        if (mapRef.current) {
          mapRef.current.panTo(loc);
          mapRef.current.setZoom(15);
        }
        onLocationUpdated?.(loc);
      },
      (err) => {
        setIsGpsLoading(false);
        setGpsError(true);
        Toast.error(
          "Could not get GPS location. Please allow location access."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onLocationUpdated]);

  /* ── Autocomplete place changed ── */
  const onPlaceChanged = useCallback(() => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry?.location) return;

    const loc = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setSelectedLocation(loc);
    setSearchAddress(place.formatted_address || "");

    if (mapRef.current) {
      mapRef.current.panTo(loc);
      mapRef.current.setZoom(15);
    }
  }, []);

  /* ── Marker drag ── */
  const handleMarkerDragEnd = useCallback((e) => {
    setSelectedLocation({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  }, []);

  /* ── Map click ── */
  const handleMapClick = useCallback((e) => {
    setSelectedLocation({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  }, []);

  /* ── Submit ── */
  const handleUpdateLocation = async () => {
    if (!selectedLocation) {
      Toast.error("Please select a location first.");
      return;
    }

    try {
      setIsUpdating(true);
      await updateDriverLocation({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
      });
      setLastUpdated(new Date());
      onLocationUpdated?.(selectedLocation);
      Toast.success("Location updated successfully!");
    } catch (err) {
      console.error(err);
      Toast.error(err?.message || "Failed to update location.");
    } finally {
      setIsUpdating(false);
    }
  };

  const center = selectedLocation || driverLocation || defaultCenter;

  return (
    <div className="px-3 pt-4 space-y-4">
      {/* Header card */}
      <div className="bg-gradient-to-r from-[#BF9B53]/10 to-amber-50 border border-[#BF9B53]/30 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-[#BF9B53] rounded-xl flex items-center justify-center shadow">
            <FaMapLocationDot className="text-white text-base" />
          </div>
          <div>
            <h2 className="font-black text-gray-900 text-base">
              Update My Location
            </h2>
            <p className="text-xs text-gray-500">
              Keep your location accurate for dispatchers
            </p>
          </div>
        </div>

        {lastUpdated && (
          <StatusPill type="success">
            Last updated:{" "}
            {lastUpdated.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </StatusPill>
        )}
      </div>

      {/* GPS Button */}
      <button
        onClick={handleUseGPS}
        disabled={isGpsLoading}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-blue-600 text-white font-bold text-sm rounded-2xl shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGpsLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Getting GPS...
          </>
        ) : (
          <>
            <MdMyLocation size={18} />
            Use My Current GPS Location
          </>
        )}
      </button>

      {gpsError && (
        <StatusPill type="error">
          GPS access denied. Please enable location permissions in your browser
          settings.
        </StatusPill>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          or search
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Search Box */}
      <div className="relative">
        <Autocomplete
          onLoad={(auto) => (autocompleteRef.current = auto)}
          onPlaceChanged={onPlaceChanged}
        >
          <div className="relative">
            <FiSearch
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Search address or landmark..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20 transition-all bg-white"
            />
          </div>
        </Autocomplete>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={selectedLocation ? 14 : 4}
          onLoad={(map) => (mapRef.current = map)}
          onClick={handleMapClick}
          options={{
            mapId: process.env.REACT_APP_GOOGLE_MAP_ID || "",
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: "greedy",
          }}
        >
          {selectedLocation && (
            <Marker
              position={selectedLocation}
              draggable
              onDragEnd={handleMarkerDragEnd}
              title="Your Location"
            />
          )}
        </GoogleMap>
      </div>

      {/* Hint */}
      <StatusPill type="info">
        Tap anywhere on the map or drag the marker to fine-tune your location
      </StatusPill>

      {/* Coordinates display */}
      {selectedLocation && (
        <div className="flex gap-3">
          <CoordBadge label="Latitude" value={selectedLocation.lat} />
          <CoordBadge label="Longitude" value={selectedLocation.lng} />
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleUpdateLocation}
        disabled={isUpdating || !selectedLocation}
        className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-[#BF9B53] to-amber-500 text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isUpdating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <MdLocationOn size={18} />
            Update Location
          </>
        )}
      </button>

      {/* Tips card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2 shadow-sm mb-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
          Tips
        </p>
        <ul className="space-y-1.5 text-xs text-gray-600">
          {[
            "Use GPS for the most accurate location.",
            "Drag the map marker to pinpoint exact location.",
            "Update your location at every major stop.",
            "Dispatchers use this to track your progress.",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#BF9B53] font-black shrink-0 mt-0.5">
                ·
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UpdateLocation;
