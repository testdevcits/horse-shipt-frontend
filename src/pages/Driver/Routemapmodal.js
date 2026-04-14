import React, { useState, useCallback } from "react";
import {
  GoogleMap,
  OverlayView,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { FiX, FiNavigation, FiAlertCircle } from "react-icons/fi";
import { FaLocationDot, FaMapLocationDot } from "react-icons/fa6";

const containerStyle = { width: "100%", height: "100%" };

/* ── Custom Marker Label ── */
const MarkerLabel = ({ emoji, label, sublabel, color }) => (
  <div
    style={{
      background: color,
      transform: "translate(-50%, calc(-100% - 10px))",
    }}
    className="absolute px-3 py-1.5 rounded-2xl shadow-xl text-white text-xs font-bold whitespace-nowrap pointer-events-none"
  >
    <div className="flex items-center gap-1.5">
      <span className="text-base">{emoji}</span>
      <div>
        <div className="font-black">{label}</div>
        {sublabel && (
          <div className="text-[9px] opacity-80 max-w-[120px] truncate">
            {sublabel}
          </div>
        )}
      </div>
    </div>
    {/* Arrow */}
    <div
      style={{
        borderColor: `${color} transparent transparent transparent`,
        bottom: "-8px",
        left: "50%",
        transform: "translateX(-50%)",
      }}
      className="absolute border-8 border-transparent"
    />
  </div>
);

/* ── Route Info Panel ── */
const RouteInfoPanel = ({ directions }) => {
  if (!directions) return null;
  const leg = directions.routes?.[0]?.legs?.[0];
  if (!leg) return null;
  return (
    <div className="absolute bottom-4 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-3 z-10">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Distance
          </p>
          <p className="text-lg font-black text-[#BF9B53]">
            {leg.distance?.text || "—"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            ETA
          </p>
          <p className="text-lg font-black text-[#BF9B53]">
            {leg.duration?.text || "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: "greedy", // better for mobile (no two-finger scroll requirement)
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
  ],
};

const RouteMapModal = ({
  isOpen,
  onClose,
  driverLocation,
  pickupLocation,
  deliveryLocation,
  pickupAddress,
  deliveryAddress,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [directions, setDirections] = useState(null);
  const [routeError, setRouteError] = useState(false);

  const hasValidCoords = (loc) =>
    loc &&
    typeof loc.lat === "number" &&
    typeof loc.lng === "number" &&
    !isNaN(loc.lat) &&
    !isNaN(loc.lng);

  const computeRoute = useCallback(() => {
    if (!hasValidCoords(pickupLocation) || !hasValidCoords(deliveryLocation)) {
      setRouteError(true);
      return;
    }
    const svc = new window.google.maps.DirectionsService();
    svc.route(
      {
        origin: new window.google.maps.LatLng(
          pickupLocation.lat,
          pickupLocation.lng
        ),
        destination: new window.google.maps.LatLng(
          deliveryLocation.lat,
          deliveryLocation.lng
        ),
        waypoints: hasValidCoords(driverLocation)
          ? [
              {
                location: new window.google.maps.LatLng(
                  driverLocation.lat,
                  driverLocation.lng
                ),
                stopover: false,
              },
            ]
          : [],
        optimizeWaypoints: false,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
          setRouteError(false);
        } else {
          console.error("Directions error:", status, result);
          setRouteError(true);
        }
      }
    );
  }, [pickupLocation, deliveryLocation, driverLocation]);

  const handleMapLoad = useCallback(
    (map) => {
      computeRoute();

      // Fit bounds to show all markers
      if (
        window.google &&
        (hasValidCoords(pickupLocation) || hasValidCoords(deliveryLocation))
      ) {
        const bounds = new window.google.maps.LatLngBounds();
        if (hasValidCoords(driverLocation))
          bounds.extend(
            new window.google.maps.LatLng(
              driverLocation.lat,
              driverLocation.lng
            )
          );
        if (hasValidCoords(pickupLocation))
          bounds.extend(
            new window.google.maps.LatLng(
              pickupLocation.lat,
              pickupLocation.lng
            )
          );
        if (hasValidCoords(deliveryLocation))
          bounds.extend(
            new window.google.maps.LatLng(
              deliveryLocation.lat,
              deliveryLocation.lng
            )
          );
        map.fitBounds(bounds, { top: 60, bottom: 120, left: 40, right: 40 });
      }
    },
    [computeRoute, driverLocation, pickupLocation, deliveryLocation]
  );

  // Center fallback
  const center = hasValidCoords(driverLocation)
    ? driverLocation
    : hasValidCoords(pickupLocation)
    ? pickupLocation
    : { lat: 37.7749, lng: -122.4194 };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal sheet - slides up from bottom on mobile */}
      <div
        className="mt-auto bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ height: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white z-20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#BF9B53]/10 rounded-xl flex items-center justify-center">
              <FiNavigation size={16} className="text-[#BF9B53]" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-sm">Route Map</h2>
              <p className="text-[10px] text-gray-400">
                {hasValidCoords(pickupLocation) &&
                hasValidCoords(deliveryLocation)
                  ? "Full route shown"
                  : "Limited location data"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
          >
            <FiX size={18} className="text-gray-600" />
          </button>
        </div>

        {/* ── Route Summary Strip ── */}
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <FaLocationDot size={12} className="text-[#BF9B53] shrink-0" />
              <span className="font-semibold text-gray-700 truncate">
                {pickupAddress || "Pickup"}
              </span>
            </div>
            <div className="text-gray-300 shrink-0">→</div>
            <div className="flex items-center gap-1.5 min-w-0">
              <FaMapLocationDot size={12} className="text-green-500 shrink-0" />
              <span className="font-semibold text-gray-700 truncate">
                {deliveryAddress || "Delivery"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Map Area ── */}
        <div className="flex-1 relative overflow-hidden">
          {loadError ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <FiAlertCircle size={36} className="text-red-400 mb-3" />
              <p className="font-bold text-gray-700 text-sm">
                Map failed to load
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Check your Google Maps API key configuration
              </p>
            </div>
          ) : !isLoaded ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-10 h-10 border-4 border-[#BF9B53]/20 border-t-[#BF9B53] rounded-full animate-spin" />
              <p className="text-gray-400 text-sm font-semibold">
                Loading map...
              </p>
            </div>
          ) : (
            <>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                onLoad={handleMapLoad}
                options={mapOptions}
              >
                {/* Driver Marker */}
                {hasValidCoords(driverLocation) && (
                  <OverlayView
                    position={driverLocation}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div className="relative">
                      <MarkerLabel emoji="🚚" label="You" color="#2563EB" />
                    </div>
                  </OverlayView>
                )}

                {/* Pickup Marker */}
                {hasValidCoords(pickupLocation) && (
                  <OverlayView
                    position={pickupLocation}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div className="relative">
                      <MarkerLabel
                        emoji="📦"
                        label="Pickup"
                        sublabel={pickupAddress}
                        color="#BF9B53"
                      />
                    </div>
                  </OverlayView>
                )}

                {/* Delivery Marker */}
                {hasValidCoords(deliveryLocation) && (
                  <OverlayView
                    position={deliveryLocation}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div className="relative">
                      <MarkerLabel
                        emoji="🏁"
                        label="Delivery"
                        sublabel={deliveryAddress}
                        color="#16a34a"
                      />
                    </div>
                  </OverlayView>
                )}

                {/* Directions Route */}
                {directions && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: true, // we use custom markers
                      polylineOptions: {
                        strokeColor: "#BF9B53",
                        strokeOpacity: 0.85,
                        strokeWeight: 5,
                      },
                    }}
                  />
                )}
              </GoogleMap>

              {/* Error toast for bad coords */}
              {routeError && (
                <div className="absolute top-3 left-3 right-3 bg-orange-50 border border-orange-200 rounded-2xl px-3 py-2 flex items-center gap-2 z-10">
                  <FiAlertCircle
                    size={14}
                    className="text-orange-500 shrink-0"
                  />
                  <p className="text-xs text-orange-700 font-semibold">
                    Could not load route. Coordinate data may be missing.
                  </p>
                </div>
              )}

              {/* Route Info Panel */}
              <RouteInfoPanel directions={directions} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(RouteMapModal);
