import React, { useEffect, useState, useMemo } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "60vh", // mobile friendly height
};

const DriverShipmentCard = ({ shipment }) => {
  const [directions, setDirections] = useState(null);

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
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [pickup, delivery]);

  if (!shipment || !pickup || !delivery) return null;

  return (
    <div className="relative bg-white rounded-lg shadow p-4 mb-6">
      <h4 className="font-bold mb-3 text-center">
        {shipment.pickupAddress} → {shipment.deliveryAddress}
      </h4>

      {/*  MAP */}
      <GoogleMap mapContainerStyle={containerStyle} center={pickup} zoom={9}>
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
