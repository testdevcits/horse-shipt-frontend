import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ===============================
   FIX LEAFLET DEFAULT ICON ISSUE
================================ */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* ===============================
   STATIC LOCATIONS (OUTSIDE)
================================ */
const PICKUP_COORDS = [22.737848, 75.888239]; // Indore
const DELIVERY_COORDS = [23.1828, 75.7772]; // Ujjain

const DriverShipmentCard = ({ shipment }) => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);

  /* ===============================
     FETCH ROAD ROUTE (OSRM)
  ================================ */
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${PICKUP_COORDS[1]},${PICKUP_COORDS[0]};${DELIVERY_COORDS[1]},${DELIVERY_COORDS[0]}?overview=full&geometries=geojson`
        );

        const data = await res.json();

        if (data.routes?.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );
          setRouteCoords(coords);
        }
      } catch (error) {
        console.error("Route fetch error:", error);
      }
    };

    fetchRoute();
  }, []); // ESLint clean

  /* ===============================
     DRIVER LIVE LOCATION (3 sec)
  ================================ */
  useEffect(() => {
    if (!navigator.geolocation) return;

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => console.error("GPS error:", error),
        { enableHighAccuracy: true }
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!shipment) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h4 className="font-bold mb-2">
        {shipment.pickupLocation} → {shipment.deliveryLocation}
      </h4>

      <div className="w-full h-72">
        <MapContainer
          center={PICKUP_COORDS}
          zoom={9}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Pickup Location */}
          <Marker position={PICKUP_COORDS}>
            <Popup>Pickup Location (Indore)</Popup>
          </Marker>

          {/* Delivery Location */}
          <Marker position={DELIVERY_COORDS}>
            <Popup>Drop Location (Ujjain)</Popup>
          </Marker>

          {/* Driver Live Location */}
          {driverLocation && (
            <Marker position={driverLocation}>
              <Popup>Driver Current Location</Popup>
            </Marker>
          )}

          {/* Route Path */}
          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{ color: "#BF9B53", weight: 5 }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default DriverShipmentCard;
