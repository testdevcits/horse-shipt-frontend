import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  OverlayView,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { FiX, FiNavigation, FiAlertCircle, FiCrosshair } from "react-icons/fi";

const containerStyle = { width: "100%", height: "100%" };

/* ─── Compact Pin Marker ─── */
const PinMarker = ({ label, color, pulse = false }) => (
  <div style={{ transform: "translate(-50%, -100%)", position: "relative" }}>
    {pulse && (
      <div
        style={{
          position: "absolute",
          bottom: "-4px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: color,
          opacity: 0.18,
          animation: "pinPulse 2s ease-out infinite",
          pointerEvents: "none",
        }}
      />
    )}
    <div
      style={{
        background: color,
        borderRadius: "8px",
        padding: "4px 9px",
        border: "2px solid white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        display: "inline-flex",
        alignItems: "center",
        position: "relative",
        zIndex: 2,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          color: "white",
          fontWeight: 800,
          fontSize: "11px",
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </div>
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: `7px solid ${color}`,
        margin: "0 auto",
        position: "relative",
        zIndex: 2,
      }}
    />
  </div>
);

/* ─── Route Info Strip ─── */
const RouteInfoStrip = ({ directions }) => {
  const leg = directions?.routes?.[0]?.legs?.[0];
  if (!leg) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "12px",
        left: "12px",
        right: "12px",
        background: "#fffdf8",
        borderRadius: "14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        border: "1px solid rgba(191,155,83,0.28)",
        padding: "10px 14px",
        zIndex: 10,
        display: "flex",
      }}
    >
      <div
        style={{
          flex: 1,
          textAlign: "center",
          borderRight: "1px solid #f3f4f6",
        }}
      >
        <p
          style={{
            fontSize: "9px",
            fontWeight: 900,
            color: "#997C42",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: "0 0 2px",
          }}
        >
          Distance
        </p>
        <p
          style={{
            fontSize: "17px",
            fontWeight: 900,
            color: "#BF9B53",
            margin: 0,
          }}
        >
          {leg.distance?.text || "—"}
        </p>
      </div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <p
          style={{
            fontSize: "9px",
            fontWeight: 900,
            color: "#997C42",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: "0 0 2px",
          }}
        >
          ETA
        </p>
        <p
          style={{
            fontSize: "17px",
            fontWeight: 900,
            color: "#BF9B53",
            margin: 0,
          }}
        >
          {leg.duration?.text || "—"}
        </p>
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
  const [showRecenter, setShowRecenter] = useState(false);
  const mapRef = useRef(null);
  const ignoreNextIdleRef = useRef(false);

  const hasValidCoords = (loc) =>
    loc &&
    typeof loc.lat === "number" &&
    typeof loc.lng === "number" &&
    !isNaN(loc.lat) &&
    !isNaN(loc.lng);

  const getFocusLocation = useCallback(
    () =>
      hasValidCoords(driverLocation)
        ? driverLocation
        : hasValidCoords(pickupLocation)
        ? pickupLocation
        : hasValidCoords(deliveryLocation)
        ? deliveryLocation
        : null,
    [driverLocation, pickupLocation, deliveryLocation]
  );

  const focusMapOnDriver = useCallback(
    (mapInstance) => {
      if (!window.google || !mapInstance) return;

      const focusLocation = getFocusLocation();
      if (!focusLocation) return;

      ignoreNextIdleRef.current = true;
      mapInstance.panTo(
        new window.google.maps.LatLng(focusLocation.lat, focusLocation.lng)
      );
      mapInstance.setZoom(hasValidCoords(driverLocation) ? 18 : 16);

      window.google.maps.event.addListenerOnce(mapInstance, "idle", () => {
        setShowRecenter(false);
        ignoreNextIdleRef.current = false;
      });
    },
    [driverLocation, getFocusLocation]
  );

  const computeRoute = useCallback(() => {
    if (!hasValidCoords(pickupLocation) || !hasValidCoords(deliveryLocation)) {
      setRouteError(true);
      return;
    }
    new window.google.maps.DirectionsService().route(
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
        } else setRouteError(true);
      }
    );
  }, [pickupLocation, deliveryLocation, driverLocation]);

  const handleMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      computeRoute();
      focusMapOnDriver(map);
    },
    [computeRoute, focusMapOnDriver]
  );

  const handleMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleMapIdle = useCallback(() => {
    const mapInstance = mapRef.current;
    const focusLocation = getFocusLocation();

    if (
      !window.google ||
      !mapInstance ||
      !focusLocation ||
      ignoreNextIdleRef.current
    ) {
      return;
    }

    const visibleBounds = mapInstance.getBounds();
    const center = mapInstance.getCenter();

    if (!visibleBounds || !center) return;

    const routeCenter = new window.google.maps.LatLng(
      focusLocation.lat,
      focusLocation.lng
    );
    const distanceFromCenter =
      window.google.maps.geometry?.spherical?.computeDistanceBetween(
        center,
        routeCenter
      ) || 0;
    const zoom = mapInstance.getZoom() || 0;

    setShowRecenter(distanceFromCenter > 250 || zoom < 17);
  }, [getFocusLocation]);

  const handleRecenter = useCallback(() => {
    if (!mapRef.current) return;
    computeRoute();
    focusMapOnDriver(mapRef.current);
  }, [computeRoute, focusMapOnDriver]);

  useEffect(() => {
    if (!isOpen) {
      setDirections(null);
      setRouteError(false);
      setShowRecenter(false);
      mapRef.current = null;
      ignoreNextIdleRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isLoaded && isOpen && mapRef.current) {
      computeRoute();
      focusMapOnDriver(mapRef.current);
    }
  }, [isLoaded, isOpen, computeRoute, focusMapOnDriver]);

  const center = hasValidCoords(driverLocation)
    ? driverLocation
    : hasValidCoords(pickupLocation)
    ? pickupLocation
    : { lat: 20.5937, lng: 78.9629 };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes pinPulse {
          0%   { transform: translateX(-50%) scale(0.6); opacity: 0.5; }
          100% { transform: translateX(-50%) scale(2.4); opacity: 0; }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[9999] flex flex-col bg-black/55"
        onClick={onClose}
      >
        <div
          className="mt-auto bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col md:mx-auto md:my-8 md:w-[min(92vw,1100px)] md:rounded-2xl"
          style={{ height: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#BF9B53] bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#BF9B53] rounded-md flex items-center justify-center">
                <FiNavigation size={14} className="text-white" />
              </div>
              <div>
                <h2 className="font-black text-systemText text-sm">Route Map</h2>
                <p className="text-[10px] text-tabActive/70">
                  {hasValidCoords(pickupLocation) &&
                  hasValidCoords(deliveryLocation)
                    ? "Full route shown"
                    : "Limited data"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-header rounded-md border border-[#BF9B53] flex items-center justify-center hover:bg-[#BF9B53]/15 active:scale-95 transition-all"
            >
              <FiX size={16} className="text-tabActive" />
            </button>
          </div>

          {/* Address strip */}
          <div className="px-4 py-2 bg-header border-b border-[#BF9B53] shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 min-w-0">
                <div className="w-2 h-2 rounded-full bg-[#BF9B53] shrink-0" />
                <span className="font-semibold text-systemText truncate">
                  {pickupAddress || "Pickup"}
                </span>
              </div>
              <span className="text-tabActive/50 shrink-0 text-sm">→</span>
              <div className="flex items-center gap-1 min-w-0">
                <div className="w-2 h-2 rounded-full bg-success shrink-0" />
                <span className="font-semibold text-systemText truncate">
                  {deliveryAddress || "Delivery"}
                </span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative overflow-hidden">
            {loadError ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <FiAlertCircle size={30} className="text-red-400 mb-3" />
                <p className="font-bold text-gray-700 text-sm">
                  Map failed to load
                </p>
              </div>
            ) : !isLoaded ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-8 h-8 border-[3px] border-[#BF9B53]/20 border-t-[#BF9B53] rounded-full animate-spin" />
                <p className="text-tabActive/75 text-xs font-semibold">
                  Loading map...
                </p>
              </div>
            ) : (
              <>
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={hasValidCoords(driverLocation) ? 18 : 16}
                  onLoad={handleMapLoad}
                  onUnmount={handleMapUnmount}
                  onIdle={handleMapIdle}
                  options={mapOptions}
                >
                  {hasValidCoords(driverLocation) && (
                    <OverlayView
                      position={driverLocation}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <PinMarker label="You" color="#2563EB" pulse />
                    </OverlayView>
                  )}
                  {hasValidCoords(pickupLocation) && (
                    <OverlayView
                      position={pickupLocation}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <PinMarker label="Pickup" color="#BF9B53" />
                    </OverlayView>
                  )}
                  {hasValidCoords(deliveryLocation) && (
                    <OverlayView
                      position={deliveryLocation}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <PinMarker label="Delivery" color="#16a34a" />
                    </OverlayView>
                  )}
                  {directions && (
                    <DirectionsRenderer
                      directions={directions}
                      options={{
                        preserveViewport: true,
                        suppressMarkers: true,
                        polylineOptions: {
                          strokeColor: "#BF9B53",
                          strokeOpacity: 0.85,
                          strokeWeight: 5,
                        },
                      }}
                    />
                  )}
                </GoogleMap>

                {routeError && (
                  <div className="absolute top-3 left-3 right-3 bg-header border border-[#BF9B53] rounded-md px-3 py-2 flex items-center gap-2 z-10">
                    <FiAlertCircle
                      size={13}
                      className="text-[#BF9B53] shrink-0"
                    />
                    <p className="text-xs text-tabActive font-semibold">
                      Route could not load. Coordinates may be missing.
                    </p>
                  </div>
                )}

                {showRecenter && (
                  <button
                    onClick={handleRecenter}
                    className="absolute top-16 left-3 z-10 inline-flex items-center gap-2 rounded-md border border-[#BF9B53] bg-[#BF9B53] px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_22px_rgba(15,23,42,0.14)] transition-all hover:brightness-110 active:scale-95"
                  >
                    <FiCrosshair size={14} />
                    Re-center
                  </button>
                )}

                <RouteInfoStrip directions={directions} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(RouteMapModal);
