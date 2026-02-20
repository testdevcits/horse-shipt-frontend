import React, { useEffect, useState, useMemo } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "350px",
};

const DriverShipmentCard = ({ shipment }) => {
  const [directions, setDirections] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [watchId, setWatchId] = useState(null);

  /* ===============================
     MEMOIZED COORDINATES
  ================================ */

  const pickup = useMemo(() => {
    if (!shipment?.pickupCoords) return null;
    return {
      lat: shipment.pickupCoords.latitude,
      lng: shipment.pickupCoords.longitude,
    };
  }, [shipment?.pickupCoords]);

  const delivery = useMemo(() => {
    if (!shipment?.deliveryCoords) return null;
    return {
      lat: shipment.deliveryCoords.latitude,
      lng: shipment.deliveryCoords.longitude,
    };
  }, [shipment?.deliveryCoords]);

  /* ===============================
     REQUEST LOCATION (BUTTON CLICK)
  ================================ */

  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setLiveLocation(location);
        setShowModal(false);

        // Start live tracking after permission granted
        const id = navigator.geolocation.watchPosition((pos) => {
          setLiveLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        });

        setWatchId(id);
      },
      (error) => {
        alert("Location permission is required to continue.");
        console.error(error);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  /* ===============================
     FETCH ROAD ROUTE
  ================================ */

  useEffect(() => {
    if (!pickup || !delivery || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: pickup,
        destination: delivery,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        }
      }
    );
  }, [pickup, delivery]);

  if (!shipment || !pickup || !delivery) return null;

  return (
    <div className="relative bg-white rounded-lg shadow p-4 mb-6">
      {showModal && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-3">Enable Live Location</h3>
            <p className="text-sm mb-4">
              To start shipment tracking, please turn on your location.
            </p>
            <button
              onClick={handleEnableLocation}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Turn On Location
            </button>
          </div>
        </div>
      )}
      <h4 className="font-bold mb-2">
        {shipment.pickupLocation} → {shipment.deliveryLocation}
      </h4>

      {/* 🔒 FORCE LOCATION MODAL */}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={liveLocation || pickup}
        zoom={9}
      >
        <Marker
          position={pickup}
          icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        />

        <Marker
          position={delivery}
          icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        />

        {liveLocation && (
          <Marker
            position={liveLocation}
            icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          />
        )}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{ suppressMarkers: true }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default DriverShipmentCard;
