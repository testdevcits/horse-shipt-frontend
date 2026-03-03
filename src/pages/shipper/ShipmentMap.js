import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoArrowSwitch } from "react-icons/go";
import { LuCircleChevronRight } from "react-icons/lu";
import { createShipmentQueryToken } from "../../utils/createQueryToken";

import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

/* ================= DEFAULT CENTER ================= */

const defaultCenter = {
  lat: 22.7,
  lng: 75.9,
};

/* ================= COMPONENT ================= */

const ShipmentMap = ({ shipments = [], pagination = {}, onPageChange }) => {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [directions, setDirections] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showEstimate, setShowEstimate] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  /* ================= NAVIGATION ================= */

  const handleNavigateWithQuery = (shipment) => {
    if (!shipment?._id) return;

    const token = createShipmentQueryToken(shipment._id);

    const params = new URLSearchParams({
      shipmentId: shipment._id,
      ref: token,
    });

    navigate(`/shipper/shipments/details?${params.toString()}`);
  };

  /* ================= MAP CENTER ================= */

  const mapCenter = useMemo(() => {
    if (selectedShipment?.pickupCoords) return selectedShipment.pickupCoords;

    if (shipments?.length && shipments[0]?.pickupCoords)
      return shipments[0]?.pickupCoords;

    return defaultCenter;
  }, [shipments, selectedShipment]);

  /* ================= ROUTE DRAW ================= */

  useEffect(() => {
    if (!isLoaded || !selectedShipment || !window.google) return;

    const { pickupCoords, deliveryCoords } = selectedShipment;

    if (!pickupCoords || !deliveryCoords) return;

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
      }
    );
  }, [isLoaded, selectedShipment]);

  if (!isLoaded) return <div>Loading Map...</div>;

  if (!shipments?.length) {
    return <p className="text-center text-gray-500">No shipments found</p>;
  }

  /* ================= PAGINATION SAFE ================= */

  const page = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;

  const isPrevDisabled = page <= 1;
  const isNextDisabled = page >= totalPages;

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* ================= MAP PANEL ================= */}

      <div
        className="
        order-1 lg:order-2
        w-full lg:w-[65%]

        h-[260px] sm:h-[320px] md:h-[380px] lg:h-[456px]

        rounded-xl overflow-hidden relative
        border-4 border-[#BF9B53]
        shadow-md
      "
      >
        {selectedShipment?.estimatedDistance && showEstimate && (
          <div
            className="
            absolute top-3 left-1/2 -translate-x-1/2
            w-[90%] max-w-[380px]
            bg-[#BF9B53] text-white px-4 py-2
            rounded-lg shadow-lg z-[1000]
            text-xs sm:text-sm font-semibold text-center
          "
          >
            {selectedShipment.estimatedDistance.km} km (Estimated)
          </div>
        )}

        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={mapCenter}
          zoom={6}
          onLoad={(map) => (mapRef.current = map)}
        >
          {directions && selectedShipment && (
            <>
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: "#BF9B53",
                    strokeWeight: 5,
                  },
                }}
              />

              <Marker
                position={selectedShipment.pickupCoords}
                label={{ text: "P", color: "#fff" }}
              />

              <Marker
                position={selectedShipment.deliveryCoords}
                label={{ text: "D", color: "#fff" }}
              />
            </>
          )}
        </GoogleMap>
      </div>

      {/* ================= LIST PANEL ================= */}

      <div
        className="
        order-2 lg:order-1
        flex-1

        bg-white rounded-xl
        shadow-md

        flex flex-col
        max-h-[320px] sm:max-h-[380px] lg:max-h-[456px]

        overflow-hidden
      "
      >
        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto">
          {shipments.map((shipment, index) => (
            <div key={shipment._id} className="relative">
              <div className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-md text-gray-800 truncate">
                    Pickup : {shipment.pickupLocation}
                  </span>

                  <span className="text-xs text-gray-500 truncate">
                    Shipment: {shipment.shipmentCode}
                  </span>
                </div>

                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={() => setSelectedShipment(shipment)}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-system-primary hover:bg-system-primary/10 transition"
                  >
                    <GoArrowSwitch
                      size={18}
                      className="text-system-primary w-7 h-7 cursor-pointer rounded-full p-1 z-10 
             hover:scale-110 transition-transform duration-200"
                    />
                  </button>

                  <button
                    onClick={() => handleNavigateWithQuery(shipment)}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-system-primary hover:bg-system-primary/10 transition"
                  >
                    <LuCircleChevronRight
                      size={18}
                      className="text-system-primary w-7 h-7 cursor-pointer rounded-full p-1 z-10 
             hover:scale-110 transition-transform duration-200"
                    />
                  </button>
                </div>
              </div>

              {index !== shipments.length - 1 && (
                <div className="h-px bg-gray-200 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* ================= PAGINATION FIXED BOTTOM ================= */}

        <div
          className="
          sticky bottom-0
          bg-white border-t p-3
          flex flex-wrap justify-center gap-4 items-center
          text-sm
        "
        >
          <button
            disabled={isPrevDisabled}
            onClick={() => onPageChange?.(page - 1)}
            className="px-3 py-1 border rounded-md disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-gray-600 whitespace-nowrap">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={isNextDisabled || shipments.length === 0}
            onClick={() => onPageChange?.(page + 1)}
            className="px-3 py-1 border rounded-md disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentMap;
