import React, { useState, useCallback } from "react";
import {
  GoogleMap,
  OverlayView,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { FiX } from "react-icons/fi";

const containerStyle = {
  width: "100%",
  height: "80vh",
};

const centerFallback = { lat: 0, lng: 0 };

const RouteMapModal = ({
  isOpen,
  onClose,
  driverLocation,
  pickupLocation,
  deliveryLocation,
  pickupAddress,
  deliveryAddress,
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [directions, setDirections] = useState(null);

  const computeRoute = useCallback(() => {
    if (!pickupLocation || !deliveryLocation) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: pickupLocation.lat, lng: pickupLocation.lng },
        destination: { lat: deliveryLocation.lat, lng: deliveryLocation.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
        } else {
          console.error("Error fetching directions", result);
        }
      }
    );
  }, [pickupLocation, deliveryLocation]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose} // close when clicking the backdrop
    >
      <div
        className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white rounded-full p-1 hover:bg-gray-100 shadow-md transition-colors"
          title="Close"
        >
          <FiX size={28} />
        </button>

        {!isLoaded ? (
          <div className="flex items-center justify-center h-[80vh]">
            <p className="text-gray-500 font-medium">Loading map...</p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={driverLocation || centerFallback}
            zoom={12}
            onLoad={computeRoute}
          >
            {/* Driver marker */}
            {driverLocation && (
              <OverlayView
                position={driverLocation}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className="bg-blue-600 text-white px-3 py-1 rounded-lg shadow-lg text-xs font-bold whitespace-nowrap transform -translate-x-1/2 translate-y-8">
                  🚚 You
                </div>
              </OverlayView>
            )}

            {/* Pickup marker */}
            {pickupLocation && (
              <OverlayView
                position={pickupLocation}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className="bg-emerald-500 text-white px-3 py-1 rounded-lg shadow-lg text-xs font-bold whitespace-nowrap transform -translate-x-1/2 translate-y-8">
                  📦 Pickup
                  <div className="text-xs font-normal">{pickupAddress}</div>
                </div>
              </OverlayView>
            )}

            {/* Delivery marker */}
            {deliveryLocation && (
              <OverlayView
                position={deliveryLocation}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div className="bg-red-500 text-white px-3 py-1 rounded-lg shadow-lg text-xs font-bold whitespace-nowrap transform -translate-x-1/2 translate-y-8">
                  🏁 Delivery
                  <div className="text-xs font-normal">{deliveryAddress}</div>
                </div>
              </OverlayView>
            )}

            {/* Directions */}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        )}
      </div>

      {/* Animation */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default React.memo(RouteMapModal);
