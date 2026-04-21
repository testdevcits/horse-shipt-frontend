import React, { useState, useRef, useCallback } from "react";
import { MdMyLocation, MdLocationOff } from "react-icons/md";
import { FiAlertCircle, FiZap } from "react-icons/fi";
import { FaMapLocationDot } from "react-icons/fa6";
import Toast from "../../components/common/Toast";
import { useDriverAuth } from "../../contexts/DriverAuthContext";

const UpdateLocation = ({
  driver,
  driverLocation,
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

  return (
    <div className="px-4 pt-4 pb-4 md:px-0">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-md border border-[#BF9B53] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#BF9B53] rounded-md flex items-center justify-center shadow-sm">
              <FaMapLocationDot size={15} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-systemText text-sm">
                Location Tracking
              </h2>
              <p className="text-[10px] text-tabActive/70">
                Update and open your live map
              </p>
            </div>
          </div>

          <div className="mb-3 rounded-md border border-[#BF9B53] bg-header px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-tabActive/70">
              Driver
            </p>
            <p className="mt-1 text-sm font-black text-systemText">
              {driver?.name || "Driver"}
            </p>
            <p className="mt-1 text-xs text-tabActive/75">
              {hasLocation
                ? `Lat ${driverLocation.lat.toFixed(5)}, Lng ${driverLocation.lng.toFixed(5)}`
                : "No synced location yet"}
            </p>
          </div>

          {(isLoading || status === "error") && (
            <div
              className={`mb-3 rounded-md border px-3 py-2.5 flex items-center gap-2.5 ${
                status === "error"
                  ? "bg-red-50 border-red-200"
                  : "bg-header border-[#BF9B53]"
              }`}
            >
              {isLoading ? (
                <div
                  className={`w-4 h-4 border-2 rounded-full animate-spin shrink-0 ${
                    status === "locating"
                      ? "border-[#BF9B53] border-t-transparent"
                      : "border-[#BF9B53] border-t-transparent"
                  }`}
                />
              ) : (
                <FiAlertCircle size={15} className="text-red-500 shrink-0" />
              )}
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold truncate ${
                    status === "error" ? "text-red-700" : "text-tabActive"
                  }`}
                >
                  {isLoading
                    ? status === "locating"
                      ? "Getting your location..."
                      : "Syncing to server..."
                    : errorMsg}
                </p>
              </div>
            </div>
          )}

          {isTrackingEnabled && (
            <div className="mb-3 bg-header border border-[#BF9B53] rounded-md px-3 py-2.5 flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-2.5 h-2.5 bg-[#BF9B53] rounded-full" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-[#BF9B53] rounded-full animate-ping opacity-75" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-tabActive">
                  Auto-tracking active
                </p>
                <p className="text-[10px] text-tabActive/75">
                  Updating every 5 seconds
                </p>
              </div>
              <span className="text-[10px] font-black text-tabActive bg-white px-2 py-0.5 rounded-md shrink-0 border border-[#BF9B53]">
                LIVE
              </span>
            </div>
          )}

          <button
            onClick={() => syncLocation(true)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#BF9B53] border border-[#BF9B53] text-white font-black text-sm rounded-md shadow-sm hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {status === "locating" ? "Getting location..." : "Syncing..."}
              </>
            ) : (
              <>
                <MdMyLocation size={18} />
                Update My Location
              </>
            )}
          </button>

          <div className="mt-2">
            {!isTrackingEnabled ? (
              <button
                onClick={toggleAutoTracking}
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-[#BF9B53] border border-[#BF9B53] text-white font-black text-xs rounded-md hover:brightness-110 active:scale-95 transition-all"
              >
                <FiZap size={13} />
                Start Auto-Track
              </button>
            ) : (
              <button
                onClick={toggleAutoTracking}
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-white border border-[#BF9B53] text-tabActive font-black text-xs rounded-md hover:bg-header active:scale-95 transition-all"
              >
                <MdLocationOff size={14} />
                Stop Tracking
              </button>
            )}
          </div>
        </div>
        <div className="rounded-md border border-[#BF9B53] bg-white p-3 shadow-sm h-fit">
          <p className="text-[10px] font-black text-tabActive/70 uppercase tracking-wider mb-1.5">
            Tip
          </p>
          <p className="text-xs text-tabActive/75 leading-relaxed">
            Tap update to sync your current position and open the route map.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateLocation;
