import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GoArrowSwitch } from "react-icons/go";
import { LuCircleChevronRight } from "react-icons/lu";
import { GoogleMap, DirectionsRenderer } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 22.7,
  lng: 75.9,
};

const ShipmentMap = ({ shipments }) => {
  const navigate = useNavigate();
  const [directionsList, setDirectionsList] = useState([]);

  const handleNavigate = (id) => {
    navigate(`/shipper/shipments/${id}`);
  };

  // Auto center from first shipment
  const mapCenter = useMemo(() => {
    if (shipments?.length && shipments[0]?.pickupCoords?.latitude) {
      return {
        lat: shipments[0].pickupCoords.latitude,
        lng: shipments[0].pickupCoords.longitude,
      };
    }
    return defaultCenter;
  }, [shipments]);

  // Fetch ALL shipment routes using coordinates
  useEffect(() => {
    if (!shipments || shipments.length === 0) return;
    if (!window.google) return;

    const service = new window.google.maps.DirectionsService();
    const newDirections = [];
    let completed = 0;

    shipments.forEach((shipment) => {
      if (
        !shipment.pickupCoords?.latitude ||
        !shipment.deliveryCoords?.latitude
      ) {
        completed++;
        return;
      }

      const origin = {
        lat: shipment.pickupCoords.latitude,
        lng: shipment.pickupCoords.longitude,
      };

      const destination = {
        lat: shipment.deliveryCoords.latitude,
        lng: shipment.deliveryCoords.longitude,
      };

      service.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          completed++;

          if (status === "OK") {
            newDirections.push(result);
          }

          if (completed === shipments.length) {
            setDirectionsList(newDirections);
          }
        }
      );
    });
  }, [shipments]);

  if (!shipments || shipments.length === 0) {
    return (
      <p className="text-center text-gray-500 text-base leading-6 font-montserrat">
        No shipments to show
      </p>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* LEFT SIDE – Shipment List */}
      <div className="flex-1 flex flex-col overflow-y-auto max-h-[456px] bg-white rounded-lg">
        {shipments.map((shipment, index) => (
          <div key={shipment._id} className="flex flex-col px-2 sm:px-4">
            <div className="flex items-center justify-between py-3 gap-3">
              {/* LEFT */}
              <div className="flex flex-col min-w-0">
                <h2 className="text-gray-800 text-sm sm:text-base font-montserrat truncate">
                  Pickup: {shipment.pickupLocation}
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm font-montserrat">
                  Horses: {shipment.numberOfHorses}
                </p>
              </div>

              {/* CENTER ICON */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-9 h-9 rounded-full border border-system-primary flex items-center justify-center">
                  <GoArrowSwitch size={18} className="text-system-primary" />
                </div>
                <span className="hidden sm:inline text-[12px] text-[#735D32]">
                  Route
                </span>
              </div>

              {/* RIGHT */}
              <div
                className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
                onClick={() => handleNavigate(shipment._id)}
              >
                <div className="w-9 h-9 rounded-full border border-system-primary flex items-center justify-center hover:bg-system-primary/10 transition">
                  <LuCircleChevronRight
                    size={18}
                    className="text-system-primary"
                  />
                </div>
                <span className="hidden sm:inline text-[12px] text-[#735D32]">
                  Details
                </span>
              </div>
            </div>

            {index !== shipments.length - 1 && (
              <div className="h-px w-full bg-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* RIGHT SIDE – GOOGLE MAP */}
      <div className="w-full lg:w-[902px] h-[260px] sm:h-[360px] lg:h-[456px] flex-shrink-0 rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={7}
        >
          {directionsList.map((direction, index) => (
            <DirectionsRenderer
              key={index}
              directions={direction}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeOpacity: 0.7,
                  strokeWeight: 4,
                },
              }}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
};

export default ShipmentMap;
