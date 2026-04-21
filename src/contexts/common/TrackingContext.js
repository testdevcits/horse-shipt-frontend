import React, { createContext, useContext, useState, useCallback } from "react";

const API_BASE_URL = "https://horse-shipt.vercel.app";

const TrackingContext = createContext();

export const TrackingProvider = ({ children }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // TRACK SHIPMENT (STABLE)
  // =========================
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

        if (data.success) {
          setTrackingData({
            tripStatus: data.tripStatus,
            driver: data.driver,
            pickup: data.pickup,
            delivery: data.delivery,
          });
        } else {
          setTrackingData(null);
          setError(data.message || "Failed to track shipment");
        }
      } catch (err) {
        console.error("Tracking error:", err);
        setTrackingData(null);
        setError("Something went wrong");
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    []
  );

  // =========================
  // CLEAR TRACKING (STABLE)
  // =========================
  const clearTracking = useCallback(() => {
    setTrackingData(null);
    setError(null);
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
