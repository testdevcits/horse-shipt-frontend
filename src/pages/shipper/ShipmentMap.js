import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoArrowSwitch } from "react-icons/go";
import { LuCircleChevronRight, LuMap, LuList } from "react-icons/lu";
import { FiMapPin, FiNavigation } from "react-icons/fi";
import { createShipmentQueryToken } from "../../utils/createQueryToken";

import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

/**
 * ============================================================
 * MODERN SHIPMENT MAP COMPONENT
 * Professional UI with clear layout and better UX
 * ============================================================
 */

/* ================= DEFAULT CENTER ================= */
const defaultCenter = {
  lat: 22.7,
  lng: 75.9,
};

/* ================= COMPONENT ================= */
const ShipmentMap = ({ shipments = [], pagination = {}, onPageChange }) => {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  // State Management
  const [directions, setDirections] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showEstimate, setShowEstimate] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  // Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  /**
   * ================= NAVIGATION HANDLER =================
   * Navigate to shipment details with query token
   */
  const handleNavigateWithQuery = (shipment) => {
    if (!shipment?._id) return;

    const token = createShipmentQueryToken(shipment._id);
    const params = new URLSearchParams({
      shipmentId: shipment._id,
      ref: token,
    });

    navigate(`/shipper/shipments/details?${params.toString()}`);
  };

  /**
   * ================= MAP CENTER CALCULATION =================
   * Set map center based on selected shipment or first shipment
   */
  const mapCenter = useMemo(() => {
    if (selectedShipment?.pickupCoords) return selectedShipment.pickupCoords;
    if (shipments?.length && shipments[0]?.pickupCoords)
      return shipments[0]?.pickupCoords;
    return defaultCenter;
  }, [shipments, selectedShipment]);

  /**
   * ================= ROUTE DRAWING =================
   * Draw directions and route on map when shipment is selected
   */
  useEffect(() => {
    if (!isLoaded || !selectedShipment || !window.google) return;

    const { pickupCoords, deliveryCoords } = selectedShipment;
    if (!pickupCoords || !deliveryCoords) return;

    setMapLoading(true);
    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin: pickupCoords,
        destination: deliveryCoords,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);

          if (mapRef.current) {
            const bounds = new window.google.maps.LatLngBounds();
            result.routes[0].overview_path.forEach((point) =>
              bounds.extend(point)
            );
            mapRef.current.fitBounds(bounds);
          }

          setShowEstimate(true);
          setTimeout(() => setShowEstimate(false), 5000);
        }
        setMapLoading(false);
      }
    );
  }, [isLoaded, selectedShipment]);

  /**
   * ================= PAGINATION STATE =================
   * Safe pagination state handling
   */
  const page = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const isPrevDisabled = page <= 1;
  const isNextDisabled = page >= totalPages;

  /**
   * ================= ERROR STATES =================
   */
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl border border-gray-200">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">🗺️</div>
          <p className="text-gray-600 font-medium">Loading Map...</p>
        </div>
      </div>
    );
  }

  if (!shipments?.length) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl border border-gray-200">
        <div className="text-center">
          <LuMap size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium">No shipments found</p>
          <p className="text-gray-500 text-sm mt-1">
            Create a shipment to view it on the map
          </p>
        </div>
      </div>
    );
  }

  /**
   * ================= MAIN RENDER =================
   */
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* ==================== MAP SECTION ==================== */}
        <div className="order-1 lg:order-2 w-full lg:w-[65%] flex flex-col gap-2">
          {/* Map Header */}
          <div className="flex items-center gap-2 px-4 py-2 border border-[#BF9B53] rounded">
            <LuMap size={20} className="text-[#BF9B53]" />
            <h3 className="text-lg font-semibold text-gray-900">
              Shipment Route
            </h3>
            {selectedShipment && (
              <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {selectedShipment.shipmentCode || "Selected"}
              </span>
            )}
          </div>

          {/* Map Container */}
          <div className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[400px] rounded-md overflow-hidden border-2 border-[#BF9B53] shadow-[inset_0_4px_10px_rgba(0,0,0,0.25)] transition-shadow">
            {/* Distance Estimate Toast */}
            {selectedShipment?.estimatedDistance && showEstimate && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[10] animate-fadeInDown">
                <div className="bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] text-white px-6 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2 text-sm md:text-base">
                  <FiNavigation size={18} className="animate-pulse" />
                  <span>{selectedShipment.estimatedDistance.km} km</span>
                  <span className="text-xs opacity-75">
                    (Estimated Distance)
                  </span>
                </div>
              </div>
            )}

            {/* Map Loading State */}
            {mapLoading && selectedShipment && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
                <div className="text-center">
                  <div className="animate-spin text-3xl mb-2">🗺️</div>
                  <p className="text-gray-600 text-sm">Calculating route...</p>
                </div>
              </div>
            )}

            {/* Google Map */}
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={mapCenter}
              zoom={6}
              onLoad={(map) => {
                mapRef.current = map;
                setMapLoading(false);
              }}
              options={{
                styles: [
                  {
                    featureType: "water",
                    elementType: "geometry",
                    stylers: [{ color: "#ffffff" }],
                  },
                ],
              }}
            >
              {directions && selectedShipment && (
                <>
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: "#BF9B53",
                        strokeWeight: 4,
                        geodesic: true,
                      },
                    }}
                  />

                  {/* Pickup Marker */}
                  <Marker
                    position={selectedShipment.pickupCoords}
                    title="Pickup Location"
                    label={{
                      text: "P",
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  />

                  {/* Delivery Marker */}
                  <Marker
                    position={selectedShipment.deliveryCoords}
                    title="Delivery Location"
                    label={{
                      text: "D",
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  />
                </>
              )}
            </GoogleMap>

            {/* No Shipment Selected Message */}
            {!selectedShipment && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-40">
                <div className="text-center">
                  <FiMapPin size={40} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">Select a shipment</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Click the route icon to view shipment on map
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================== LIST SECTION ==================== */}
        <div className="order-2 lg:order-1 flex-1 bg-white rounded-md  border border-[#BF9B53] flex flex-col overflow-hidden max-h-[456px]">
          {/* List Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <LuList size={20} className="text-[#BF9B53]" />
              <h3 className="text-lg font-semibold text-gray-900">
                Shipments{" "}
                {shipments.length > 0 && (
                  <span className="text-[#BF9B53]">({shipments.length})</span>
                )}
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select a shipment to view route on map
            </p>
          </div>

          {/* Scrollable Shipments List */}
          <div className="flex-1 overflow-y-auto scroll-smooth">
            {shipments.map((shipment, index) => (
              <div
                key={shipment._id}
                className={`transition-all duration-200 cursor-pointer ${
                  selectedShipment?._id === shipment._id
                    ? "bg-yellow-50 border-l-4 border-[#BF9B53]"
                    : "hover:bg-gray-50"
                }`}
              >
                {/* Shipment Row */}
                <div className="flex items-center justify-between px-4 py-4 gap-3">
                  {/* Left Content */}
                  <div className="flex-1 min-w-0">
                    {/* Pickup Location */}
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-1">
                      <FiMapPin
                        size={14}
                        className="text-[#BF9B53] flex-shrink-0"
                      />
                      <span className="truncate">
                        {shipment.pickupLocation}
                      </span>
                    </p>

                    {/* Shipment Code */}
                    <p className="text-xs text-gray-500 truncate ml-6">
                      {shipment.shipmentCode || "No Code"}
                    </p>

                    {/* Delivery Location (Mobile Only) */}
                    <p className="text-xs text-gray-600 truncate mt-1 sm:hidden">
                      → {shipment.deliveryLocation}
                    </p>
                  </div>

                  {/* Right Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {/* View Route Button */}
                    <button
                      onClick={() => setSelectedShipment(shipment)}
                      className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-200 ${
                        selectedShipment?._id === shipment._id
                          ? "border-[#BF9B53] bg-[#BF9B53] text-white"
                          : "border-gray-300 text-gray-600 hover:border-[#BF9B53] hover:text-[#BF9B53]"
                      }`}
                      title="View Route"
                    >
                      <GoArrowSwitch size={18} />
                    </button>

                    {/* View Details Button */}
                    <button
                      onClick={() => handleNavigateWithQuery(shipment)}
                      className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-gray-300 text-gray-600 hover:border-[#BF9B53] hover:text-[#BF9B53] transition-all duration-200"
                      title="View Details"
                    >
                      <LuCircleChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Delivery Location (Desktop) */}
                <div className="hidden sm:block px-4 pb-2 text-xs text-gray-500 ml-6">
                  → {shipment.deliveryLocation}
                </div>

                {/* Divider */}
                {index !== shipments.length - 1 && (
                  <div className="mx-4 h-px bg-gray-200" />
                )}
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex flex-wrap justify-center items-center gap-4">
              {/* Previous Button */}
              <button
                disabled={isPrevDisabled}
                onClick={() => onPageChange?.(page - 1)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isPrevDisabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-[#BF9B53] hover:text-white"
                }`}
              >
                ← Prev
              </button>

              {/* Page Indicator */}
              <div className="text-sm text-gray-600 font-semibold min-w-max">
                <span className="text-[#BF9B53]">{page}</span> / {totalPages}
              </div>

              {/* Next Button */}
              <button
                disabled={isNextDisabled || shipments.length === 0}
                onClick={() => onPageChange?.(page + 1)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isNextDisabled || shipments.length === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-[#BF9B53] hover:text-white"
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>{" "}
    </>
  );
};

export default ShipmentMap;
