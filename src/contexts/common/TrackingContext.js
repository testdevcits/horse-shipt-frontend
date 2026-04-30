import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

const API_BASE_URL = "https://horse-shipt.vercel.app";
const TrackingContext = createContext();

export const TrackingProvider = ({ children }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const prevDriverRef = useRef(null);

  // TRACK SHIPMENT WITH CACHE

  const trackShipment = useCallback(
    async (quoteId, token, isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_BASE_URL}/api/tracking/track/${quoteId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!data.success) {
          setError(data.message || "Failed to track shipment");
          return;
        }

        const newDriver = data.driver;

        // CACHE CHECK — skip if driver hasn't moved

        if (prevDriverRef.current && newDriver) {
          const prev = prevDriverRef.current;
          const isSameLocation =
            prev.lat === newDriver.lat && prev.lng === newDriver.lng;

      
        }

        prevDriverRef.current = newDriver
          ? {
              lat: newDriver.lat,
              lng: newDriver.lng,
              updatedAt: newDriver.updatedAt,
            }
          : null;

        setTrackingData({
          tripStatus: data.tripStatus,
          driver: data.driver,
          pickup: data.pickup,
          delivery: data.delivery,
        });
      } catch (err) {
        console.error("Tracking error:", err);
        setError("Something went wrong");
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    []
  );

  // =========================
  // CLEAR TRACKING
  // =========================
  const clearTracking = useCallback(() => {
    setTrackingData(null);
    setError(null);
    prevDriverRef.current = null;
  }, []);

  return (
    <TrackingContext.Provider
      value={{
        trackingData,
        loading,
        error,
        trackShipment,
        clearTracking,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => useContext(TrackingContext);
