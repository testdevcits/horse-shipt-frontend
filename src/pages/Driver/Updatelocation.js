import React, { useState, useCallback, useEffect, useRef } from "react";
import { MdMyLocation, MdLocationOff } from "react-icons/md";
import { FiAlertCircle, FiZap } from "react-icons/fi";
import { FaMapLocationDot } from "react-icons/fa6";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import Toast from "../../components/common/Toast";
import { useDriverAuth } from "../../contexts/DriverAuthContext";
import { DEFAULT_US_MAP_CENTER } from "../../constants/mapDefaults";
import { getGoogleMapsLoaderOptions } from "../../constants/googleMapsLoader";

const mapContainerStyle = { width: "100%", height: "100%" };
const mapOptions = {
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: "greedy",
};

const LiveRouteMap = ({ driverLocation, shipment }) => {
  const { isLoaded, loadError } = useJsApiLoader(getGoogleMapsLoaderOptions());
  const [directions, setDirections] = useState(null);
  const pickupLat = shipment?.pickupCoords?.latitude;
  const pickupLng = shipment?.pickupCoords?.longitude;
  const deliveryLat = shipment?.deliveryCoords?.latitude;
  const deliveryLng = shipment?.deliveryCoords?.longitude;
  const driverLat = driverLocation?.lat;
  const driverLng = driverLocation?.lng;
  const pickup = {
    lat: Number(pickupLat),
    lng: Number(pickupLng),
  };
  const delivery = {
    lat: Number(deliveryLat),
    lng: Number(deliveryLng),
  };
  const hasPickup = Number.isFinite(pickup.lat) && Number.isFinite(pickup.lng) && shipment?.pickupCoords?.latitude != null && shipment?.pickupCoords?.longitude != null;
  const hasDelivery = Number.isFinite(delivery.lat) && Number.isFinite(delivery.lng) && shipment?.deliveryCoords?.latitude != null && shipment?.deliveryCoords?.longitude != null;
  const hasDriver = Number.isFinite(driverLat) && Number.isFinite(driverLng);

  useEffect(() => {
    if (!isLoaded || !hasPickup || !hasDelivery || !window.google) {
      setDirections(null);
      return;
    }
    new window.google.maps.DirectionsService().route({
      origin: { lat: Number(pickupLat), lng: Number(pickupLng) },
      destination: { lat: Number(deliveryLat), lng: Number(deliveryLng) },
      waypoints: hasDriver ? [{ location: { lat: driverLat, lng: driverLng }, stopover: false }] : [],
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => setDirections(status === "OK" ? result : null));
  }, [isLoaded, hasPickup, hasDelivery, pickupLat, pickupLng, deliveryLat, deliveryLng, hasDriver, driverLat, driverLng]);

  const center = hasDriver ? driverLocation : hasPickup ? pickup : DEFAULT_US_MAP_CENTER;

  if (loadError) return <div className="flex h-full items-center justify-center p-6 text-center text-sm text-red-700">Map failed to load. Check the Google Maps API configuration.</div>;
  if (!isLoaded) return <div className="flex h-full items-center justify-center gap-3 text-xs font-semibold text-slate-600"><span className="h-6 w-6 animate-spin rounded-full border-2 border-[#c09a4a] border-t-transparent" />Loading live map…</div>;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={hasDriver ? 15 : 6} options={mapOptions}>
      {hasDriver && <Marker position={driverLocation} label="You" />}
      {hasPickup && <Marker position={pickup} label="Pickup" />}
      {hasDelivery && <Marker position={delivery} label="Delivery" />}
      {directions && <DirectionsRenderer directions={directions} options={{ preserveViewport: true, suppressMarkers: true, polylineOptions: { strokeColor: "#BF9B53", strokeOpacity: 0.85, strokeWeight: 5 } }} />}
    </GoogleMap>
  );
};

const UpdateLocation = ({
  driver,
  driverLocation,
  currentShipment,
  onLocationUpdated,
  onOpenMap,
}) => {
  const {
    updateDriverLocation,
    locationPermission,
    checkLocationPermission,
    isTrackingEnabled,
    setIsTrackingEnabled,
  } = useDriverAuth();

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const isSyncingRef = useRef(false);
  const hasLocation = Boolean(driverLocation?.lat && driverLocation?.lng);

  const getBrowserLocation = useCallback(
    () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              speed: pos.coords.speed || 0,
              heading: pos.coords.heading || 0,
            }),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }),
    []
  );

  const syncLocation = useCallback(
    async (isManual = false) => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      if (isManual) setStatus("locating");

      try {
        const position = await getBrowserLocation();
        if (isManual) setStatus("uploading");
        const res = await updateDriverLocation(position);

        if (res?.success !== false) {
          const locObj = { lat: position.latitude, lng: position.longitude };
          setStatus("success");
          setErrorMsg("");
          if (onLocationUpdated) onLocationUpdated(locObj);
          if (isManual) {
            Toast.success("Location updated!");
            if (onOpenMap) setTimeout(() => onOpenMap(), 500);
          }
        } else {
          throw new Error(res?.message || "Update failed");
        }
      } catch (err) {
        setStatus("error");
        const msg =
          err?.message === "User denied Geolocation"
            ? "Location permission denied. Enable it in settings."
            : err?.message || "Failed to get location";
        setErrorMsg(msg);
        if (isManual) Toast.error(msg);
      } finally {
        isSyncingRef.current = false;
      }
    },
    [getBrowserLocation, updateDriverLocation, onLocationUpdated, onOpenMap]
  );

  const toggleAutoTracking = useCallback(async () => {
    if (isTrackingEnabled) {
      setIsTrackingEnabled(false);
      Toast.success("Auto-tracking stopped");
      return;
    }
    let hasPermission = locationPermission === "granted";
    if (!hasPermission) hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      setStatus("error");
      setErrorMsg("Location permission required for auto-tracking");
      Toast.error("Enable location permission first");
      return;
    }
    setIsTrackingEnabled(true);
    await syncLocation(true);
    Toast.success("Auto-tracking started");
  }, [
    isTrackingEnabled,
    setIsTrackingEnabled,
    locationPermission,
    checkLocationPermission,
    syncLocation,
  ]);

  const isLoading = status === "locating" || status === "uploading";
  const shipment = currentShipment?.shipment || currentShipment || {};
  const pickup = shipment.pickupLocation?.split(",")?.[0] || "Pickup";
  const delivery = shipment.deliveryLocation?.split(",")?.[0] || "Delivery";

  return (
    <div className="px-4 pb-28 pt-4 md:px-0 md:pb-8">
      <div className="mx-auto grid w-full max-w-[1440px] gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
        <section className="overflow-hidden rounded-2xl border border-[#eadfca] bg-white shadow-sm">
          <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c09a4a] text-white"><FaMapLocationDot size={17} /></div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black text-slate-900">Route map</h2>
              <p className="truncate text-xs text-slate-500">{pickup} <span className="mx-1">→</span> {delivery}</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${hasLocation ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-current" />{hasLocation ? "Synced" : "Not synced"}
            </span>
          </div>
          <div className="relative h-[280px] w-full overflow-hidden border-y border-[#e3d9c6] bg-[#eee9dc] sm:h-[360px] lg:h-[430px]">
            <LiveRouteMap driverLocation={driverLocation} shipment={shipment} />
            {(!shipment?.pickupCoords || !shipment?.deliveryCoords) && <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-white/95 px-3 py-2 text-[11px] text-slate-600 shadow-sm">Route line appears when pickup and delivery coordinates are available.</div>}
          </div>
          {(isLoading || status === "error") && <div className={`mx-4 mt-3 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs sm:mx-5 ${status === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[#eadfca] bg-[#f8f4eb] text-slate-700"}`}>{isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#c09a4a] border-t-transparent" /> : <FiAlertCircle />}{isLoading ? (status === "locating" ? "Getting your location…" : "Syncing to server…") : errorMsg}</div>}
          <div className="grid gap-2 p-4 sm:grid-cols-2 sm:p-5">
            <button onClick={() => syncLocation(true)} disabled={isLoading} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#c09a4a] bg-[#c09a4a] px-4 py-3 text-sm font-black text-white transition hover:brightness-105 disabled:opacity-60">
              <MdMyLocation size={17} />{isLoading ? (status === "locating" ? "Getting location…" : "Syncing…") : "Update my location"}
            </button>
            <button onClick={toggleAutoTracking} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-black transition ${isTrackingEnabled ? "border-emerald-600 bg-emerald-600 text-white" : "border-[#c09a4a] bg-white text-[#8a6a2c] hover:bg-[#fbf7ef]"}`}>
              {isTrackingEnabled ? <MdLocationOff size={17} /> : <FiZap size={16} />}{isTrackingEnabled ? "Stop auto-track" : "Start auto-track"}
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#eadfca] bg-white p-5">
            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Driver</p>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#c09a4a] text-lg font-black text-white">{driver?.name?.[0]?.toUpperCase() || "D"}</div>
              <div><p className="text-sm font-black text-slate-900">{driver?.name || "Driver"}</p><p className="mt-1 flex items-center gap-1.5 text-[11px] font-bold uppercase text-[#8a6a2c]"><span className="h-1.5 w-1.5 rounded-full bg-[#c09a4a]" />{driver?.driverStatus?.replace(/[_-]/g, " ") || "Status unavailable"}</p></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[#e9e1d3] bg-[#f7f3ea] p-3"><p className="text-[11px] text-slate-500">Latitude</p><p className="mt-1 break-all text-sm font-black text-slate-900">{hasLocation ? driverLocation.lat.toFixed(5) : "—"}</p></div>
              <div className="rounded-xl border border-[#e9e1d3] bg-[#f7f3ea] p-3"><p className="text-[11px] text-slate-500">Longitude</p><p className="mt-1 break-all text-sm font-black text-slate-900">{hasLocation ? driverLocation.lng.toFixed(5) : "—"}</p></div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Last synced <span className="font-semibold text-slate-700">{hasLocation ? "Just now" : "Not yet"}</span></p>
          </section>
          <section className="rounded-2xl border border-[#ead39a] bg-[#fbf6e9] p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a6a2c]">Location tip</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">Tap “Update my location” to sync your position. Turn on Auto-track to share it automatically during a trip.</p>
            {isTrackingEnabled && <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-emerald-700"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />Auto-track is on</p>}
          </section>
          <section className="rounded-2xl border border-[#eadfca] bg-white p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Current route</p>
            <p className="mt-3 flex items-center gap-2 text-sm font-black text-slate-900"><span className="truncate">{pickup}</span><span aria-hidden="true">→</span><span className="truncate">{delivery}</span></p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default UpdateLocation;
