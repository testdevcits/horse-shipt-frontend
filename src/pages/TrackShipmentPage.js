import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTracking } from "../contexts/common/TrackingContext";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";

const isValidPosition = (pos) =>
  Array.isArray(pos) &&
  pos.length === 2 &&
  typeof pos[0] === "number" &&
  typeof pos[1] === "number" &&
  !Number.isNaN(pos[0]) &&
  !Number.isNaN(pos[1]);

const FitMapToRoute = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    const validPoints = points.filter(isValidPosition);
    if (validPoints.length === 0) return;

    if (validPoints.length === 1) {
      map.setView(validPoints[0], 12);
      return;
    }

    map.fitBounds(validPoints, { padding: [40, 40] });
  }, [map, points]);

  return null;
};

const InfoCard = ({ title, children }) => (
  <div className="rounded-2xl border border-[#BF9B53]/20 bg-white p-4 shadow-sm">
    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#BF9B53]">
      {title}
    </p>
    <div className="mt-3">{children}</div>
  </div>
);

const TrackShipmentPage = () => {
  const { quoteId } = useParams();
  const { trackingData, loading, error, trackShipment, clearTracking } =
    useTracking();

  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("driverToken");

    if (!quoteId || !token) return;

    trackShipment(quoteId, token);

    const intervalId = setInterval(() => {
      trackShipment(quoteId, token, true);
    }, 15000);

    return () => {
      clearInterval(intervalId);
      clearTracking();
    };
  }, [quoteId, trackShipment, clearTracking]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center font-[Montserrat]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-[#BF9B53]" />
        <p className="mt-3 text-sm text-gray-500">Fetching live tracking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center px-4 font-[Montserrat]">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-gray-400 font-[Montserrat]">
        No tracking data found
      </div>
    );
  }

  const { tripStatus, driver, pickup, delivery } = trackingData;

  const driverPos =
    typeof driver?.lat === "number" && typeof driver?.lng === "number"
      ? [driver.lat, driver.lng]
      : null;
  const pickupPos =
    typeof pickup?.lat === "number" && typeof pickup?.lng === "number"
      ? [pickup.lat, pickup.lng]
      : null;
  const deliveryPos =
    typeof delivery?.lat === "number" && typeof delivery?.lng === "number"
      ? [delivery.lat, delivery.lng]
      : null;

  const allPoints = [pickupPos, driverPos, deliveryPos].filter(isValidPosition);

  const routeToDestination =
    driverPos && deliveryPos ? [driverPos, deliveryPos] : [];
  const routeFromPickup =
    pickupPos && driverPos
      ? [pickupPos, driverPos]
      : pickupPos && deliveryPos
      ? [pickupPos, deliveryPos]
      : [];

  const statusLabel =
    tripStatus === "inTransit"
      ? "In Transit"
      : tripStatus === "completed"
      ? "Completed"
      : tripStatus === "pending"
      ? "Pending"
      : tripStatus || "Unknown";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 font-[Montserrat] md:p-6">
      <div className="rounded-[28px] border border-[#BF9B53]/20 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#BF9B53]">
              Live Tracking
            </p>
            <h2 className="mt-1 text-2xl font-black text-gray-900 md:text-3xl">
              Shipment Route Status
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Driver location updates refresh automatically every 15 seconds.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BF9B53]/20 bg-[#BF9B53]/5 px-4 py-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                tripStatus === "inTransit"
                  ? "bg-emerald-500 animate-pulse"
                  : tripStatus === "completed"
                  ? "bg-[#BF9B53]"
                  : "bg-gray-400"
              }`}
            />
            <span className="text-sm font-black text-[#BF9B53]">
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-[28px] border border-[#BF9B53]/20 bg-white shadow-sm">
          <div className="border-b border-[#BF9B53]/10 bg-[#fffaf2] px-5 py-4">
            <p className="text-sm font-black text-gray-900">
              Driver to Delivery Live Route
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Using live driver coordinates and shipment route points
            </p>
          </div>

          <div className="h-[420px] w-full md:h-[520px]">
            <MapContainer
              center={
                driverPos || pickupPos || deliveryPos || [22.9734, 78.6569]
              }
              zoom={10}
              className="h-full w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitMapToRoute points={allPoints} />

              {pickupPos && (
                <Marker position={pickupPos}>
                  <Popup>
                    <strong>Pickup</strong>
                    <br />
                    {pickup.location}
                  </Popup>
                </Marker>
              )}

              {driverPos && (
                <Marker position={driverPos}>
                  <Popup>
                    <strong>Driver Live Location</strong>
                    <br />
                    Updated:{" "}
                    {driver?.updatedAt
                      ? new Date(driver.updatedAt).toLocaleString()
                      : "N/A"}
                  </Popup>
                </Marker>
              )}

              {deliveryPos && (
                <Marker position={deliveryPos}>
                  <Popup>
                    <strong>Delivery</strong>
                    <br />
                    {delivery.location}
                  </Popup>
                </Marker>
              )}

              {routeFromPickup.length === 2 && (
                <Polyline
                  positions={routeFromPickup}
                  pathOptions={{
                    color: "#BF9B53",
                    weight: 4,
                    opacity: 0.55,
                    dashArray: "8 10",
                  }}
                />
              )}

              {routeToDestination.length === 2 && (
                <Polyline
                  positions={routeToDestination}
                  pathOptions={{
                    color: "#10B981",
                    weight: 5,
                    opacity: 0.9,
                  }}
                />
              )}
            </MapContainer>
          </div>
        </div>

        <div className="space-y-4">
          <InfoCard title="Driver Location">
            {driverPos ? (
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-black text-gray-900">Latitude:</span>{" "}
                  {driver.lat}
                </p>
                <p>
                  <span className="font-black text-gray-900">Longitude:</span>{" "}
                  {driver.lng}
                </p>
                <p>
                  <span className="font-black text-gray-900">Heading:</span>{" "}
                  {driver.heading ?? 0}
                </p>
                <p>
                  <span className="font-black text-gray-900">Updated:</span>{" "}
                  {driver.updatedAt
                    ? new Date(driver.updatedAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Driver live location not available
              </p>
            )}
          </InfoCard>

          <InfoCard title="Pickup">
            <p className="text-sm font-semibold text-gray-800">
              {pickup?.location || "N/A"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Distance: {pickup?.distanceKm ?? "N/A"} km
            </p>
            <p className="text-sm text-gray-500">
              ETA: {pickup?.etaMinutes ?? "N/A"} min
            </p>
          </InfoCard>

          <InfoCard title="Delivery">
            <p className="text-sm font-semibold text-gray-800">
              {delivery?.location || "N/A"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Distance: {delivery?.distanceKm ?? "N/A"} km
            </p>
            <p className="text-sm text-gray-500">
              ETA: {delivery?.etaMinutes ?? "N/A"} min
            </p>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default TrackShipmentPage;
