import React, { useState, useEffect, useRef, useCallback } from "react";
import { MdMyLocation, MdCheckCircle, MdLocationOff } from "react-icons/md";
import { FiNavigation, FiAlertCircle, FiMapPin, FiZap } from "react-icons/fi";
import { useDriverAuth } from "../../contexts/DriverAuthContext";

const UpdateLocation = ({
  driver,
  driverLocation,
  onLocationUpdated,
  onOpenMap,
}) => {
  const { updateDriverLocation, locationPermission, checkLocationPermission } =
    useDriverAuth();

  const [status, setStatus] = useState("idle");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [coords, setCoords] = useState(driverLocation || null);
  const [isAutoTracking, setIsAutoTracking] = useState(false);
  const [autoCount, setAutoCount] = useState(0);

  const intervalRef = useRef(null);
  const isSyncingRef = useRef(false);

  const getBrowserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
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
    });
  }, []);

  // ── Core sync function ──
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
          setCoords(locObj);
          setLastUpdated(new Date());
          setStatus("success");
          setErrorMsg("");
          setAutoCount((c) => c + 1);
          if (onLocationUpdated) onLocationUpdated(locObj);

          // ✅ Auto open map on first manual update
          if (isManual && onOpenMap) {
            setTimeout(() => onOpenMap(), 600);
          }
        } else {
          throw new Error(res?.message || "Update failed");
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg(
          err?.message === "User denied Geolocation"
            ? "Location permission denied."
            : err?.message || "Failed to update location"
        );
      } finally {
        isSyncingRef.current = false;
      }
    },
    [getBrowserLocation, updateDriverLocation, onLocationUpdated, onOpenMap]
  );

  // ── Start auto tracking every 5 seconds ──
  const startAutoTracking = useCallback(async () => {
    let hasPermission = locationPermission === "granted";
    if (!hasPermission) hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      setStatus("error");
      setErrorMsg("Location permission required.");
      return;
    }
    setIsAutoTracking(true);
    await syncLocation(true); // first call = manual (opens map)

    intervalRef.current = setInterval(() => {
      syncLocation(false); // subsequent calls = silent
    }, 5000);
  }, [locationPermission, checkLocationPermission, syncLocation]);

  const stopAutoTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAutoTracking(false);
    setStatus("idle");
  }, []);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    []
  );

  const formatTime = (date) =>
    date?.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const cfg = {
    idle: {
      color: "text-gray-500",
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "Tap below to update location",
    },
    locating: {
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "Getting your location...",
    },
    uploading: {
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "Syncing with server...",
    },
    success: {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "Location updated!",
    },
    error: {
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      text: errorMsg,
    },
  }[status];

  return (
    <div className="px-3 pt-4 space-y-4">
      <div className="bg-white rounded-2xl border border-[#BF9B53]/30 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-[#BF9B53]/10 to-amber-50 px-4 py-3 border-b border-[#BF9B53]/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#BF9B53] rounded-xl flex items-center justify-center">
              <FiMapPin size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-[#BF9B53] text-sm">
                Live Location
              </h2>
              <p className="text-[10px] text-gray-400">
                Update your position on the map
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className={`rounded-xl border p-3 ${cfg.bg} ${cfg.border}`}>
            <div className="flex items-center gap-2 mb-2">
              {status === "locating" || status === "uploading" ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
              ) : status === "success" ? (
                <MdCheckCircle size={16} className={cfg.color} />
              ) : status === "error" ? (
                <FiAlertCircle size={16} className={cfg.color} />
              ) : (
                <MdMyLocation size={16} className={cfg.color} />
              )}
              <span className={`text-xs font-bold ${cfg.color}`}>
                {cfg.text}
              </span>
            </div>
            {coords && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase">
                    Latitude
                  </p>
                  <p className="text-sm font-black text-gray-800">
                    {coords.lat.toFixed(6)}
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase">
                    Longitude
                  </p>
                  <p className="text-sm font-black text-gray-800">
                    {coords.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {lastUpdated && (
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FiZap size={11} className="text-[#BF9B53]" />
                Last sync:{" "}
                <span className="font-bold text-gray-600">
                  {formatTime(lastUpdated)}
                </span>
              </span>
              {autoCount > 0 && (
                <span className="bg-[#BF9B53]/10 text-[#BF9B53] font-black px-2 py-0.5 rounded-full text-[10px]">
                  {autoCount} syncs
                </span>
              )}
            </div>
          )}

          {isAutoTracking && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-blue-700">
                  Auto-tracking Active
                </p>
                <p className="text-[10px] text-blue-500">
                  Updating every 5 seconds
                </p>
              </div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
                LIVE
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => syncLocation(true)}
          disabled={status === "locating" || status === "uploading"}
          className="w-full flex items-center justify-center gap-2 py-4 bg-[#BF9B53] text-white font-black text-sm rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {status === "locating" || status === "uploading" ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {status === "locating" ? "Getting Location..." : "Syncing..."}
            </>
          ) : (
            <>
              <MdMyLocation size={20} />
              Update Location &amp; Open Map
            </>
          )}
        </button>

        {!isAutoTracking ? (
          <button
            onClick={startAutoTracking}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white font-black text-sm rounded-2xl shadow-md hover:bg-blue-700 active:scale-95 transition-all"
          >
            <FiZap size={18} />
            Start Auto-Tracking (Every 5s)
          </button>
        ) : (
          <button
            onClick={stopAutoTracking}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 border border-red-200 text-red-600 font-black text-sm rounded-2xl hover:bg-red-100 active:scale-95 transition-all"
          >
            <MdLocationOff size={18} />
            Stop Auto-Tracking
          </button>
        )}

        {coords && onOpenMap && (
          <button
            onClick={onOpenMap}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#BF9B53] text-[#BF9B53] font-black text-sm rounded-2xl hover:bg-[#BF9B53]/5 active:scale-95 transition-all"
          >
            <FiNavigation size={16} />
            View Route on Map
          </button>
        )}
      </div>
    </div>
  );
};

export default UpdateLocation;
