import React, { useEffect, useState, useMemo } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "60vh", // mobile friendly height
};

const DriverShipmentCard = ({ shipment }) => {
  const [directions, setDirections] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [watchId, setWatchId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

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
     ENABLE LOCATION (MOBILE SAFE)
  ================================ */

  const handleEnableLocation = async () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation not supported on this device.");
      return;
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });

      if (permission.state === "denied") {
        setErrorMessage(
          "Location is blocked. Please enable it from browser settings."
        );
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
          setErrorMessage("");

          const id = navigator.geolocation.watchPosition(
            (pos) => {
              setLiveLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            },
            (err) => {
              console.error(err);
            },
            { enableHighAccuracy: true }
          );

          setWatchId(id);
        },
        (error) => {
          setErrorMessage("Please turn ON location services on your phone.");
          console.error(error);
        },
        { enableHighAccuracy: true }
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* Cleanup watcher */
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
      <h4 className="font-bold mb-3 text-center">
        {shipment.pickupLocation} → {shipment.deliveryLocation}
      </h4>

      {/*  LOCATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg text-center shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-3">Enable Live Location</h3>
            <p className="text-sm mb-4">
              To start shipment tracking, please allow location access.
            </p>

            {errorMessage && (
              <p className="text-red-500 text-xs mb-3">{errorMessage}</p>
            )}

            <button
              onClick={handleEnableLocation}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Start Live Tracking
            </button>
          </div>
        </div>
      )}

      {/*  MAP */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={liveLocation || pickup}
        zoom={9}
      >
        {/* Pickup */}
        <Marker
          position={pickup}
          icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        />

        {/* Delivery */}
        <Marker
          position={delivery}
          icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        />

        {/* Live Driver */}
        {liveLocation && (
          <Marker
            position={liveLocation}
            icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          />
        )}

        {/* Route */}
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
