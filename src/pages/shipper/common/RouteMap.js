import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "300px",
};

const RouteMap = ({ pickup, delivery }) => {
  const [directions, setDirections] = useState(null);
  const mapRef = useRef(null);

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

          // AUTO FIT BOUNDS (IMPORTANT FIX)
          const bounds = new window.google.maps.LatLngBounds();
          result.routes[0].overview_path.forEach((point) => {
            bounds.extend(point);
          });

          if (mapRef.current) {
            mapRef.current.fitBounds(bounds);
          }
        }
      }
    );
  }, [pickup, delivery]);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      onLoad={(map) => (mapRef.current = map)}
    >
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
};

export default RouteMap;
