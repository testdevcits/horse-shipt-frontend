import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTracking } from "../contexts/common/TrackingContext";
import {
  useJsApiLoader,
  GoogleMap,
  OverlayView,
  DirectionsRenderer,
} from "@react-google-maps/api";
import {
  FiRefreshCw,
  FiAlertCircle,
  FiPackage,
  FiNavigation,
  FiCrosshair,
  FiClock,
  FiMapPin,
} from "react-icons/fi";
import { FaTruck } from "react-icons/fa";
import { DEFAULT_US_MAP_CENTER } from "../constants/mapDefaults";
import { getGoogleMapsLoaderOptions } from "../constants/googleMapsLoader";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const isValidCoord = (lat, lng) =>
  typeof lat === "number" &&
  typeof lng === "number" &&
  !Number.isNaN(lat) &&
  !Number.isNaN(lng);

const fmtTime = (iso) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const fmtEta = (min) => {
  if (min == null) return "N/A";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
};

/* ─────────────────────────────────────────
   CUSTOM PIN MARKERS (OverlayView style)
───────────────────────────────────────── */
const PinMarker = ({ label, color, pulse = false, icon }) => (
  <div style={{ transform: "translate(-50%, -100%)", position: "relative" }}>
    {pulse && (
      <div
        style={{
          position: "absolute",
          bottom: "-4px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: color,
          opacity: 0.2,
          animation: "pinPulse 2s ease-out infinite",
          pointerEvents: "none",
        }}
      />
    )}
    <div
      style={{
        background: color,
        borderRadius: "10px",
        padding: "5px 10px",
        border: "2px solid white",
        boxShadow: "0 3px 12px rgba(0,0,0,0.22)",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        position: "relative",
        zIndex: 2,
        whiteSpace: "nowrap",
      }}
    >
      {icon && <span style={{ fontSize: "11px", lineHeight: 1 }}>{icon}</span>}
      <span
        style={{
          color: "white",
          fontWeight: 800,
          fontSize: "11px",
          fontFamily: "Montserrat, sans-serif",
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
        borderLeft: "6px solid transparent",
        borderRight: "6px solid transparent",
        borderTop: `8px solid ${color}`,
        margin: "0 auto",
        position: "relative",
        zIndex: 2,
      }}
    />
  </div>
);

/* ─────────────────────────────────────────
   ROUTE INFO STRIP (bottom of map)
───────────────────────────────────────── */
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
        borderRadius: "16px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
        border: "1px solid rgba(191,155,83,0.3)",
        padding: "10px 18px",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          flex: 1,
          textAlign: "center",
          borderRight: "1px solid #f0ead8",
          paddingRight: "14px",
        }}
      >
        <p
          style={{
            fontSize: "9px",
            fontWeight: 900,
            color: "#997C42",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: "0 0 2px",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          Total Distance
        </p>
        <p
          style={{
            fontSize: "18px",
            fontWeight: 900,
            color: "#BF9B53",
            margin: 0,
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {leg.distance?.text || "—"}
        </p>
      </div>
      <div style={{ flex: 1, textAlign: "center", paddingLeft: "14px" }}>
        <p
          style={{
            fontSize: "9px",
            fontWeight: 900,
            color: "#997C42",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: "0 0 2px",
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          ETA
        </p>
        <p
          style={{
            fontSize: "18px",
            fontWeight: 900,
            color: "#BF9B53",
            margin: 0,
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          {leg.duration?.text || "—"}
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   MAP STYLE
───────────────────────────────────────── */
const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f5f0e8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f0e8" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7a6a4f" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#fef3c7" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#fde68a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#BF9B53" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#dbeafe" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3b82f6" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4b3e2a" }],
  },
];

/* ─────────────────────────────────────────
   SKELETON SHIMMER
───────────────────────────────────────── */
const Shimmer = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-amber-50 rounded-2xl ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

/* ─────────────────────────────────────────
   INFO CARD COMPONENT
───────────────────────────────────────── */
const InfoCard = ({
  header,
  headerBg,
  headerBorder,
  icon,
  iconBg,
  children,
}) => (
  <div
    className={`bg-white rounded-2xl border ${headerBorder} overflow-hidden shadow-sm`}
  >
    <div
      className={`px-4 py-3 ${headerBg} border-b ${headerBorder} flex items-center gap-2.5`}
    >
      <div
        className={`w-7 h-7 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      {header}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

/* ─────────────────────────────────────────
   MAIN TRACKING PAGE
───────────────────────────────────────── */
const TrackShipmentPage = () => {
  const { quoteId } = useParams();
  const { trackingData, loading, error, trackShipment, clearTracking } =
    useTracking();

  const { isLoaded: mapsLoaded } = useJsApiLoader(getGoogleMapsLoaderOptions());

  const mapRef = useRef(null);
  const ignoreNextIdleRef = useRef(false);
  const [directions, setDirections] = useState(null);
  const [routeError, setRouteError] = useState(false);
  const [showRecenter, setShowRecenter] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  /* ── Fetch tracking data ── */
  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("driverToken");
    if (!quoteId || !token) return;

    trackShipment(quoteId, token);
    setLastRefresh(new Date());

    const iv = setInterval(() => {
      trackShipment(quoteId, token, true);
      setLastRefresh(new Date());
    }, 15000);

    return () => {
      clearInterval(iv);
      clearTracking();
    };
  }, [quoteId, trackShipment, clearTracking]);

  /* ── Seconds-ago ticker ── */
  useEffect(() => {
    if (!lastRefresh) return;
    const iv = setInterval(() => {
      setSecondsAgo(Math.round((Date.now() - lastRefresh.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, [lastRefresh]);

  /* ── Compute directions route ── */
  const computeRoute = useCallback((pickup, delivery, driver) => {
    if (
      !window.google ||
      !isValidCoord(pickup?.lat, pickup?.lng) ||
      !isValidCoord(delivery?.lat, delivery?.lng)
    ) {
      setRouteError(true);
      return;
    }

    new window.google.maps.DirectionsService().route(
      {
        origin: new window.google.maps.LatLng(pickup.lat, pickup.lng),
        destination: new window.google.maps.LatLng(delivery.lat, delivery.lng),
        waypoints: isValidCoord(driver?.lat, driver?.lng)
          ? [
              {
                location: new window.google.maps.LatLng(driver.lat, driver.lng),
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
  }, []);

  /* ── Focus map on driver ── */
  const focusMap = useCallback((map, driver, pickup) => {
    if (!window.google || !map) return;
    const focusLoc = isValidCoord(driver?.lat, driver?.lng)
      ? { lat: driver.lat, lng: driver.lng }
      : isValidCoord(pickup?.lat, pickup?.lng)
      ? { lat: pickup.lat, lng: pickup.lng }
      : null;
    if (!focusLoc) return;

    ignoreNextIdleRef.current = true;
    map.panTo(new window.google.maps.LatLng(focusLoc.lat, focusLoc.lng));
    map.setZoom(isValidCoord(driver?.lat, driver?.lng) ? 13 : 12);

    window.google.maps.event.addListenerOnce(map, "idle", () => {
      setShowRecenter(false);
      ignoreNextIdleRef.current = false;
    });
  }, []);

  /* ── Map load ── */
  const handleMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      if (!trackingData) return;
      const { driver, pickup, delivery } = trackingData;
      computeRoute(pickup, delivery, driver);
      focusMap(map, driver, pickup);
    },
    [trackingData, computeRoute, focusMap]
  );

  /* ── Re-compute route when data changes ── */
  useEffect(() => {
    if (!mapsLoaded || !trackingData || !mapRef.current) return;
    const { driver, pickup, delivery } = trackingData;
    computeRoute(pickup, delivery, driver);
  }, [trackingData, mapsLoaded, computeRoute]);

  /* ── Map idle — detect if driver out of view ── */
  const handleMapIdle = useCallback(() => {
    const map = mapRef.current;
    if (!window.google || !map || ignoreNextIdleRef.current || !trackingData)
      return;

    const driver = trackingData.driver;
    const focusLoc = isValidCoord(driver?.lat, driver?.lng)
      ? { lat: driver.lat, lng: driver.lng }
      : null;
    if (!focusLoc) return;

    const center = map.getCenter();
    if (!center) return;

    const dist =
      window.google.maps.geometry?.spherical?.computeDistanceBetween(
        center,
        new window.google.maps.LatLng(focusLoc.lat, focusLoc.lng)
      ) || 0;

    setShowRecenter(dist > 500 || (map.getZoom() || 0) < 10);
  }, [trackingData]);

  /* ── Recenter handler ── */
  const handleRecenter = useCallback(() => {
    if (!mapRef.current || !trackingData) return;
    const { driver, pickup, delivery } = trackingData;
    computeRoute(pickup, delivery, driver);
    focusMap(mapRef.current, driver, pickup);
  }, [trackingData, computeRoute, focusMap]);

  /* ─── LOADING ─── */
  if (loading && !trackingData) {
    return (
      <div className="min-h-screen font-[Montserrat] p-4">
        <style>{`@keyframes shimmer { to { transform: translateX(200%); } }`}</style>
        <div className="max-w-6xl mx-auto space-y-4">
          <Shimmer className="h-24 w-full" />
          <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
            <Shimmer className="h-[540px]" />
            <div className="space-y-3">
              <Shimmer className="h-32" />
              <Shimmer className="h-32" />
              <Shimmer className="h-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── ERROR ─── */
  if (error && !trackingData) {
    return (
      <div className="min-h-screen font-[Montserrat] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle size={28} className="text-red-500" />
          </div>
          <p className="font-black text-gray-900 text-base mb-1">
            Tracking Error
          </p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  /* ─── NO DATA ─── */
  if (!trackingData) {
    return (
      <div className="min-h-screen font-[Montserrat] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full text-center">
          <FiPackage className="text-gray-200 text-5xl mx-auto mb-3" />
          <p className="text-gray-400 font-semibold text-sm">
            No tracking data found
          </p>
        </div>
      </div>
    );
  }

  const { tripStatus, message: trackingMessage, driver, pickup, delivery } =
    trackingData;

  const driverPos = isValidCoord(driver?.lat, driver?.lng)
    ? { lat: driver.lat, lng: driver.lng }
    : null;
  const pickupPos = isValidCoord(pickup?.lat, pickup?.lng)
    ? { lat: pickup.lat, lng: pickup.lng }
    : null;
  const deliveryPos = isValidCoord(delivery?.lat, delivery?.lng)
    ? { lat: delivery.lat, lng: delivery.lng }
    : null;

  const mapCenter = driverPos || pickupPos || deliveryPos || DEFAULT_US_MAP_CENTER;

  const statusMap = {
    inTransit: {
      label: "In Transit",
      bg: "bg-blue-50",
      border: "border-blue-200",
      dot: "bg-blue-500 animate-pulse",
      text: "text-blue-700",
    },
    completed: {
      label: "Completed",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      text: "text-emerald-700",
    },
    pending: {
      label: "Pending",
      bg: "bg-amber-50",
      border: "border-amber-200",
      dot: "bg-amber-400",
      text: "text-amber-700",
    },
    notStarted: {
      label: "Not Started",
      bg: "bg-amber-50",
      border: "border-amber-200",
      dot: "bg-amber-400",
      text: "text-amber-700",
    },
    started: {
      label: "Started",
      bg: "bg-blue-50",
      border: "border-blue-200",
      dot: "bg-blue-500 animate-pulse",
      text: "text-blue-700",
    },
  };
  const statusCfg = statusMap[tripStatus] || {
    label: tripStatus || "Unknown",
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-400",
    text: "text-gray-600",
  };

  return (
    <>
      <style>{`
        @keyframes shimmer { to { transform: translateX(200%); } }
        @keyframes pinPulse {
          0%   { transform: translateX(-50%) scale(0.6); opacity: 0.5; }
          100% { transform: translateX(-50%) scale(2.4); opacity: 0; }
        }
      `}</style>

      <div className="font-[Montserrat]">
        <div className="max-w-full mx-auto space-y-4">
          {/* ── Header ── */}
          <div className="bg-white rounded-3xl border border-[#BF9B53]/20 p-5 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#BF9B53] mb-1">
                  Live Tracking
                </p>
                <h2 className="text-xl font-black text-gray-900 leading-tight flex items-center gap-2">
                  <FiNavigation className="text-[#BF9B53]" size={18} />
                  Shipment Route Status
                </h2>
                <p className="text-xs text-gray-400 mt-1.5 font-semibold flex items-center gap-1.5">
                  <FiRefreshCw
                    size={10}
                    className={
                      secondsAgo < 5 ? "animate-spin text-[#BF9B53]" : ""
                    }
                  />
                  {lastRefresh
                    ? secondsAgo < 5
                      ? "Just updated"
                      : `Updated ${secondsAgo}s ago · Auto-refresh every 15s`
                    : "Connecting..."}
                </p>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusCfg.bg} ${statusCfg.border} self-start sm:self-auto`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusCfg.dot}`}
                />
                <span className={`text-sm font-black ${statusCfg.text}`}>
                  {statusCfg.label}
                </span>
              </div>
            </div>
            {trackingMessage && (
              <div className="mt-4 rounded-xl border border-[#BF9B53]/25 bg-[#fffaf2] px-4 py-3 text-sm font-semibold text-[#735D32]">
                {trackingMessage}
              </div>
            )}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            {/* ── MAP PANEL ── */}
            <div className="bg-white rounded-3xl border border-[#BF9B53]/20 overflow-hidden shadow-sm">
              {/* Map top bar */}
              <div className="px-5 py-3.5 border-b border-[#BF9B53]/10 bg-[#fffaf2] flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-900">
                    Live Route Map
                  </p>
                  <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                    Google Maps · Real-time driver position
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-gray-400">
                  {driverPos && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      Driver
                    </span>
                  )}
                  {pickupPos && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#BF9B53] inline-block" />
                      Pickup
                    </span>
                  )}
                  {deliveryPos && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Delivery
                    </span>
                  )}
                </div>
              </div>

              {/* Address strip */}
              {(pickupPos || deliveryPos) && (
                <div className="px-5 py-2.5 bg-[#fffaf2] border-b border-[#BF9B53]/10">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-[#BF9B53] shrink-0" />
                      <span className="font-semibold text-gray-700 truncate">
                        {pickup?.location?.split(",")[0] || "Pickup"}
                      </span>
                    </div>
                    <span className="text-gray-300 shrink-0 font-bold">→</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-semibold text-gray-700 truncate">
                        {delivery?.location?.split(",")[0] || "Delivery"}
                      </span>
                    </div>
                    {delivery?.distanceKm && (
                      <span className="ml-auto shrink-0 text-[#BF9B53] font-black">
                        {delivery.distanceKm} km
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="h-[440px] md:h-[520px] w-full relative">
                {!mapsLoaded ? (
                  <div className="h-full w-full flex items-center justify-center bg-amber-50/40">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-[#BF9B53]/20 border-t-[#BF9B53] rounded-full animate-spin" />
                      <p className="text-sm text-gray-400 font-semibold">
                        Loading map…
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      center={mapCenter}
                      zoom={12}
                      onLoad={handleMapLoad}
                      onUnmount={() => {
                        mapRef.current = null;
                      }}
                      onIdle={handleMapIdle}
                      options={{
                        styles: MAP_STYLE,
                        disableDefaultUI: false,
                        zoomControl: true,
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: true,
                        gestureHandling: "greedy",
                      }}
                    >
                      {/* Directions route */}
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

                      {/* Driver pin */}
                      {driverPos && (
                        <OverlayView
                          position={driverPos}
                          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                          <PinMarker
                            label="Driver"
                            color="#2563EB"
                            pulse
                            icon="🚛"
                          />
                        </OverlayView>
                      )}

                      {/* Pickup pin */}
                      {pickupPos && (
                        <OverlayView
                          position={pickupPos}
                          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                          <PinMarker label="Pickup" color="#BF9B53" icon="📦" />
                        </OverlayView>
                      )}

                      {/* Delivery pin */}
                      {deliveryPos && (
                        <OverlayView
                          position={deliveryPos}
                          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                          <PinMarker
                            label="Delivery"
                            color="#10b981"
                            icon="📍"
                          />
                        </OverlayView>
                      )}
                    </GoogleMap>

                    {/* Route error banner */}
                    {routeError && (
                      <div className="absolute top-3 left-3 right-3 bg-white border border-amber-300 rounded-xl px-3 py-2 flex items-center gap-2 z-10 shadow-sm">
                        <FiAlertCircle
                          size={13}
                          className="text-amber-500 shrink-0"
                        />
                        <p className="text-xs text-gray-600 font-semibold">
                          Route directions unavailable. Showing pins only.
                        </p>
                      </div>
                    )}

                    {/* Recenter button */}
                    {showRecenter && (
                      <button
                        onClick={handleRecenter}
                        className="absolute top-14 left-3 z-10 inline-flex items-center gap-2 rounded-xl border border-[#BF9B53] bg-[#BF9B53] px-4 py-2.5 text-xs font-black text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
                      >
                        <FiCrosshair size={13} />
                        Re-center
                      </button>
                    )}

                    {/* Route info strip */}
                    <RouteInfoStrip directions={directions} />
                  </>
                )}
              </div>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="space-y-3">
              {/* Driver Card */}
              <InfoCard
                headerBg="bg-blue-50"
                headerBorder="border-blue-200/50"
                iconBg="bg-blue-600"
                icon={<FaTruck size={13} className="text-white" />}
                header={
                  <div>
                    <p className="text-xs font-black text-blue-900">
                      Driver Live Location
                    </p>
                    {driverPos && tripStatus === "inTransit" && (
                      <p className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                        Tracking active
                      </p>
                    )}
                  </div>
                }
              >
                {driverPos ? (
                  <div className="space-y-2.5">
                    {[
                      ["Latitude", driver?.lat?.toFixed(6)],
                      ["Longitude", driver?.lng?.toFixed(6)],
                      ["Heading", `${driver?.heading ?? 0}°`],
                      ["Updated", fmtTime(driver?.updatedAt)],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between"
                      >
                        <span className="text-[11px] font-black text-gray-400 uppercase">
                          {label}
                        </span>
                        <span className="text-xs font-bold text-gray-800">
                          {val || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">
                    {trackingMessage || "Driver location unavailable"}
                  </p>
                )}
              </InfoCard>

              {/* Pickup Card */}
              <InfoCard
                headerBg="bg-[#BF9B53]/5"
                headerBorder="border-[#BF9B53]/25"
                iconBg="bg-[#BF9B53]"
                icon={<FiMapPin size={13} className="text-white" />}
                header={
                  <p className="text-xs font-black text-[#BF9B53]">
                    Pickup Location
                  </p>
                }
              >
                <p className="text-sm font-bold text-gray-800 leading-snug mb-3">
                  {pickup?.location || "N/A"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">
                      Distance
                    </p>
                    <p className="text-sm font-black text-[#BF9B53]">
                      {pickup?.distanceKm ?? "N/A"} km
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">
                      ETA
                    </p>
                    <p className="text-sm font-black text-[#BF9B53]">
                      {fmtEta(pickup?.etaMinutes)}
                    </p>
                  </div>
                </div>
              </InfoCard>

              {/* Delivery Card */}
              <InfoCard
                headerBg="bg-emerald-50"
                headerBorder="border-emerald-200/50"
                iconBg="bg-emerald-500"
                icon={<FiMapPin size={13} className="text-white" />}
                header={
                  <p className="text-xs font-black text-emerald-800">
                    Delivery Location
                  </p>
                }
              >
                <p className="text-sm font-bold text-gray-800 leading-snug mb-3">
                  {delivery?.location || "N/A"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">
                      Distance
                    </p>
                    <p className="text-sm font-black text-emerald-600">
                      {delivery?.distanceKm ?? "N/A"} km
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">
                      ETA
                    </p>
                    <p className="text-sm font-black text-emerald-600">
                      {fmtEta(delivery?.etaMinutes)}
                    </p>
                  </div>
                </div>
              </InfoCard>

              {/* Auto-refresh notice */}
              <div className="bg-white border border-gray-100 rounded-2xl p-3.5 flex items-center gap-3">
                <FiClock size={14} className="text-[#BF9B53] flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-black text-gray-700">
                    Auto-refreshing
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold">
                    Updates every 15s · skips if no movement
                  </p>
                </div>
                {secondsAgo !== null && (
                  <span className="ml-auto text-[10px] font-black text-[#BF9B53] bg-amber-50 px-2 py-1 rounded-lg flex-shrink-0">
                    {secondsAgo}s ago
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrackShipmentPage;
