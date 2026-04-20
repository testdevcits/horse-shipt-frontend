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

// ── BIG Animated Marker ──
const BigMarker = ({ emoji, label, sublabel, color, pulse = false }) => (
  <div style={{ transform: "translate(-50%, -100%)", position: "relative" }}>
    {/* Pulse ring */}
    {pulse && (
      <div
        style={{
          position: "absolute",
          bottom: "-6px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: color,
          opacity: 0.25,
          animation: "markerPulse 1.8s ease-out infinite",
        }}
      />
    )}
    {/* Pin body */}
    <div
      style={{
        background: color,
        borderRadius: "16px",
        padding: "10px 14px",
        boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
        border: "3px solid white",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minWidth: "120px",
        position: "relative",
        zIndex: 2,
      }}
    >
      <span style={{ fontSize: "26px", lineHeight: 1 }}>{emoji}</span>
      <div>
        <div
          style={{
            color: "white",
            fontWeight: 900,
            fontSize: "14px",
            lineHeight: 1.2,
          }}
        >
          {label}
        </div>
        {sublabel && (
          <div
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "10px",
              maxWidth: "100px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginTop: "2px",
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
    </div>
    {/* Arrow tip */}
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: "12px solid transparent",
        borderRight: "12px solid transparent",
        borderTop: `14px solid ${color}`,
        margin: "0 auto",
        filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.2))",
        position: "relative",
        zIndex: 2,
      }}
    />
  </div>
);

const RouteInfoPanel = ({ directions }) => {
  const leg = directions?.routes?.[0]?.legs?.[0];
  if (!leg) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "16px",
        left: "12px",
        right: "12px",
        background: "rgba(255,255,255,0.97)",
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        border: "1px solid rgba(191,155,83,0.2)",
        padding: "14px 16px",
        zIndex: 10,
      }}
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 900,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "4px",
            }}
          >
            Distance
          </p>
          <p style={{ fontSize: "22px", fontWeight: 900, color: "#BF9B53" }}>
            {leg.distance?.text || "—"}
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 900,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "4px",
            }}
          >
            ETA
          </p>
          <p style={{ fontSize: "22px", fontWeight: 900, color: "#BF9B53" }}>
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
  gestureHandling: "greedy",
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
          setRouteError(true);
        }
      }
    );
  }, [pickupLocation, deliveryLocation, driverLocation]);

  const handleMapLoad = useCallback(
    (map) => {
      computeRoute();
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
        map.fitBounds(bounds, { top: 80, bottom: 140, left: 50, right: 50 });
      }
    },
    [computeRoute, driverLocation, pickupLocation, deliveryLocation]
  );

  const center = hasValidCoords(driverLocation)
    ? driverLocation
    : hasValidCoords(pickupLocation)
    ? pickupLocation
    : { lat: 37.7749, lng: -122.4194 };

  if (!isOpen) return null;

  return (
    <>
      {/* Pulse animation style */}
      <style>{`
        @keyframes markerPulse {
          0% { transform: translateX(-50%) scale(0.5); opacity: 0.6; }
          100% { transform: translateX(-50%) scale(2.5); opacity: 0; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[9999] flex flex-col bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="mt-auto bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ height: "92vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white z-20 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#BF9B53] rounded-xl flex items-center justify-center">
                <FiNavigation size={18} className="text-white" />
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
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
            >
              <FiX size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Route summary strip */}
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <FaLocationDot size={13} className="text-[#BF9B53] shrink-0" />
                <span className="font-semibold text-gray-700 truncate">
                  {pickupAddress || "Pickup"}
                </span>
              </div>
              <div className="text-gray-300 shrink-0 text-base">→</div>
              <div className="flex items-center gap-1.5 min-w-0">
                <FaMapLocationDot
                  size={13}
                  className="text-green-500 shrink-0"
                />
                <span className="font-semibold text-gray-700 truncate">
                  {deliveryAddress || "Delivery"}
                </span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative overflow-hidden">
            {loadError ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <FiAlertCircle size={36} className="text-red-400 mb-3" />
                <p className="font-bold text-gray-700 text-sm">
                  Map failed to load
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
                  {/* Driver — big pulsing blue marker */}
                  {hasValidCoords(driverLocation) && (
                    <OverlayView
                      position={driverLocation}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <BigMarker
                        label="You're Here"
                        color="#2563EB"
                        pulse={true}
                      />
                    </OverlayView>
                  )}

                  {/* Pickup — big gold marker */}
                  {hasValidCoords(pickupLocation) && (
                    <OverlayView
                      position={pickupLocation}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <BigMarker
                        label="Pickup"
                        sublabel={pickupAddress}
                        color="#BF9B53"
                      />
                    </OverlayView>
                  )}

                  {/* Delivery — big green marker */}
                  {hasValidCoords(deliveryLocation) && (
                    <OverlayView
                      position={deliveryLocation}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <BigMarker
                        label="Delivery"
                        sublabel={deliveryAddress}
                        color="#16a34a"
                      />
                    </OverlayView>
                  )}

                  {directions && (
                    <DirectionsRenderer
                      directions={directions}
                      options={{
                        suppressMarkers: true,
                        polylineOptions: {
                          strokeColor: "#BF9B53",
                          strokeOpacity: 0.9,
                          strokeWeight: 7,
                        },
                      }}
                    />
                  )}
                </GoogleMap>

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

                <RouteInfoPanel directions={directions} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(RouteMapModal);
