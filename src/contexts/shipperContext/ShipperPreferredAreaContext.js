import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const ShipperPreferredAreaContext = createContext();

const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const ShipperPreferredAreaProvider = ({ children }) => {
  const { token } = useAuth();

  const [preferredAreas, setPreferredAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ================= FETCH PREFERRED AREAS =================
  const fetchPreferredAreas = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE_URL}/shipper/preferred-areas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPreferredAreas(res.data.areas || []);
    } catch (err) {
      console.error("Fetch preferred areas error:", err);
      setError(
        err?.response?.data?.message || "Failed to fetch preferred areas"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ================= ADD PREFERRED AREA =================
  const addPreferredArea = async (area) => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE_URL}/shipper/preferred-areas`,
        { area },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPreferredAreas((prev) => [...prev, res.data.area]);
    } catch (err) {
      console.error("Add preferred area error:", err);
      setError(err?.response?.data?.message || "Failed to add preferred area");
    } finally {
      setLoading(false);
    }
  };

  // ================= REMOVE PREFERRED AREA =================
  const removePreferredArea = async (areaId) => {
    if (!token) return;

    try {
      setLoading(true);

      await axios.delete(`${API_BASE_URL}/shipper/preferred-areas/${areaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPreferredAreas((prev) => prev.filter((a) => a.id !== areaId));
    } catch (err) {
      console.error("Remove preferred area error:", err);
      setError(
        err?.response?.data?.message || "Failed to remove preferred area"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShipperPreferredAreaContext.Provider
      value={{
        preferredAreas,
        loading,
        error,
        fetchPreferredAreas,
        addPreferredArea,
        removePreferredArea,
      }}
    >
      {children}
    </ShipperPreferredAreaContext.Provider>
  );
};

// Custom hook for using the context
export const useShipperPreferredArea = () =>
  useContext(ShipperPreferredAreaContext);
