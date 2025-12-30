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

// 🔧 Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const DriverShipmentCard = ({ shipment }) => {
  // 📍 STATIC LOCATIONS
  const pickupCoords = [22.7196, 75.8577]; // Indore
  const deliveryCoords = [23.1828, 75.7772]; // Ujjain

  const [routeCoords, setRouteCoords] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);

  // 🛣️ FETCH ROAD ROUTE (OSRM)
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${deliveryCoords[1]},${deliveryCoords[0]}?overview=full&geometries=geojson`
        );

        const data = await res.json();

        if (data.routes?.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );
          setRouteCoords(coords);
        }
      } catch (err) {
        console.error("Route error:", err);
      }
    };

    fetchRoute();
  }, []);

  // 🚚 DRIVER LIVE LOCATION (every 3 sec)
  useEffect(() => {
    if (!navigator.geolocation) return;

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDriverLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.error("GPS error:", err),
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
          center={pickupCoords}
          zoom={9}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* 📍 Pickup */}
          <Marker position={pickupCoords}>
            <Popup>Pickup Location (Indore)</Popup>
          </Marker>

          {/* 📍 Delivery */}
          <Marker position={deliveryCoords}>
            <Popup>Drop Location (Ujjain)</Popup>
          </Marker>

          {/* 🚚 Driver live location */}
          {driverLocation && (
            <Marker position={driverLocation}>
              <Popup>Driver Current Location</Popup>
            </Marker>
          )}

          {/* 🛣️ Road Route */}
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
