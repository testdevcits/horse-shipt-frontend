import React, { useEffect, useState, useMemo } from "react";
import { FiChevronDown, FiChevronUp, FiMap } from "react-icons/fi";
import { FaLocationDot, FaMapLocationDot } from "react-icons/fa6";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";

const DriverShipmentCard = ({ shipment, driverLocation }) => {
  const [expanded, setExpanded] = useState(false);
  const [directions, setDirections] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Memoized coordinates
  const pickup = useMemo(() => {
    if (
      !shipment?.pickupCoords?.latitude ||
      !shipment?.pickupCoords?.longitude
    ) {
      return null;
    }
    return {
      lat: shipment.pickupCoords.latitude,
      lng: shipment.pickupCoords.longitude,
    };
  }, [shipment?.pickupCoords]);

  const delivery = useMemo(() => {
    if (
      !shipment?.deliveryCoords?.latitude ||
      !shipment?.deliveryCoords?.longitude
    ) {
      return null;
    }
    return {
      lat: shipment.deliveryCoords.latitude,
      lng: shipment.deliveryCoords.longitude,
    };
  }, [shipment?.deliveryCoords]);

  // Fetch directions
  useEffect(() => {
    if (!pickup || !delivery || !window.google || !showMap) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: pickup,
        destination: delivery,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [pickup, delivery, showMap]);

  if (!shipment || !pickup || !delivery) {
    return null;
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "⏳";
      case "in_progress":
      case "in-progress":
        return "🚚";
      case "completed":
        return "✅";
      case "cancelled":
        return "❌";
      default:
        return "📦";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    } catch {
      return timeString;
    }
  };

  const mapContainerStyle = {
    width: "100%",
    height: "300px",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/50 overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* CARD HEADER - Always Visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors border-b border-slate-200/50"
      >
        {/* Status Indicator */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${getStatusColor(
            shipment.shipmentStatus
          )}`}
        >
          {getStatusIcon(shipment.shipmentStatus)}
        </div>

        {/* Info */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-slate-900 truncate text-sm sm:text-base">
              {shipment.pickupAddress}
            </h4>
            <span className="text-slate-400">→</span>
            <p className="text-slate-600 truncate text-sm hidden sm:block">
              {shipment.deliveryAddress}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 rounded font-semibold">
              {shipment.shipmentStatus || "N/A"}
            </span>
            {shipment.numberOfHorses && (
              <span className="text-slate-600">
                🐴 {shipment.numberOfHorses} Horses
              </span>
            )}
          </div>
        </div>

        {/* Expand Icon */}
        <div className="text-slate-400 flex-shrink-0">
          {expanded ? <FiChevronUp size={22} /> : <FiChevronDown size={22} />}
        </div>
      </button>

      {/* EXPANDED CONTENT */}
      {expanded && (
        <div className="px-5 py-6 space-y-5 border-t border-slate-200/50 bg-gradient-to-b from-white to-slate-50">
          {/* ROUTE OVERVIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pickup */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200/50">
              <div className="flex items-center gap-2 mb-2">
                <FaLocationDot className="text-emerald-600" size={18} />
                <h5 className="font-bold text-emerald-900 text-sm">Pickup</h5>
              </div>
              <p className="text-slate-700 font-medium text-sm mb-2">
                {shipment.pickupAddress}
              </p>
              <div className="text-xs text-slate-600 space-y-1">
                <p>📅 {formatDate(shipment.pickupDate)}</p>
                <p>⏰ {formatTime(shipment.pickupTime)}</p>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-red-50 rounded-xl p-4 border border-red-200/50">
              <div className="flex items-center gap-2 mb-2">
                <FaMapLocationDot className="text-red-600" size={18} />
                <h5 className="font-bold text-red-900 text-sm">Delivery</h5>
              </div>
              <p className="text-slate-700 font-medium text-sm mb-2">
                {shipment.deliveryAddress}
              </p>
              <div className="text-xs text-slate-600 space-y-1">
                <p>📅 {formatDate(shipment.deliveryDate)}</p>
                <p>⏰ {formatTime(shipment.deliveryTime)}</p>
              </div>
            </div>
          </div>

          {/* SHIPMENT DETAILS */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200/50">
            <h5 className="font-bold text-blue-900 mb-3 text-sm">
              Shipment Details
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {shipment.numberOfHorses && (
                <div>
                  <p className="text-slate-600 font-semibold text-xs uppercase tracking-wide">
                    Horses
                  </p>
                  <p className="font-bold text-slate-900">
                    {shipment.numberOfHorses}
                  </p>
                </div>
              )}
              {shipment.weight && (
                <div>
                  <p className="text-slate-600 font-semibold text-xs uppercase tracking-wide">
                    Weight
                  </p>
                  <p className="font-bold text-slate-900">{shipment.weight}</p>
                </div>
              )}
              {shipment.referenceNumber && (
                <div>
                  <p className="text-slate-600 font-semibold text-xs uppercase tracking-wide">
                    Reference
                  </p>
                  <p className="font-bold text-slate-900 text-xs">
                    {shipment.referenceNumber}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* NOTES */}
          {shipment.notes && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/50">
              <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-2">
                📝 Special Notes
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {shipment.notes}
              </p>
            </div>
          )}

          {/* MAP VIEW BUTTON */}
          <button
            onClick={() => setShowMap(!showMap)}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            <FiMap size={18} />
            {showMap ? "Hide Map" : "View Route on Map"}
          </button>

          {/* EMBEDDED MAP */}
          {showMap && (
            <div className="rounded-xl overflow-hidden border-2 border-blue-200 shadow-lg">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={pickup}
                zoom={10}
                options={{
                  zoomControl: true,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
              >
                {/* Pickup Marker */}
                <Marker
                  position={pickup}
                  icon={{
                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 8,
                    fillColor: "#10b981",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 2,
                  }}
                  title="Pickup Location"
                />

                {/* Delivery Marker */}
                <Marker
                  position={delivery}
                  icon={{
                    path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    scale: 8,
                    fillColor: "#ef4444",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 2,
                    rotation: 180,
                  }}
                  title="Delivery Location"
                />

                {/* Driver Location (if available) */}
                {driverLocation && (
                  <Marker
                    position={driverLocation}
                    title="Your Location"
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 8,
                      fillColor: "#3b82f6",
                      fillOpacity: 1,
                      strokeColor: "#ffffff",
                      strokeWeight: 2,
                    }}
                  />
                )}

                {/* Route */}
                {directions && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      polylineOptions: {
                        strokeColor: "#0ea5e9",
                        strokeWeight: 4,
                        strokeOpacity: 0.8,
                      },
                      suppressMarkers: true,
                    }}
                  />
                )}
              </GoogleMap>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverShipmentCard;
