import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Toast from "../../components/common/Toast";

const ShipperPreferredAreaContext = createContext();

const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const ShipperPreferredAreaProvider = ({ children }) => {
  const { token } = useAuth();

  const [preferredAreas, setPreferredAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetchedPreferredAreas, setHasFetchedPreferredAreas] = useState(false);

  // ================================
  // FETCH AREAS
  // ================================
  const fetchPreferredAreas = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE_URL}/shipper/preferred-areas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPreferredAreas(res.data?.data || []);
      setHasFetchedPreferredAreas(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to fetch preferred areas";

      setError(msg);
      setHasFetchedPreferredAreas(true);
      Toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const clearPreferredAreas = useCallback(() => {
    setPreferredAreas([]);
    setError(null);
    setHasFetchedPreferredAreas(false);
  }, []);

  // ================================
  // ADD AREA
  // ================================
  const addPreferredArea = async ({
    locationName,
    latitude,
    longitude,
    radiusKm,
  }) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(
        `${API_BASE_URL}/shipper/preferred-areas`,
        {
          locationName,
          latitude,
          longitude,
          radiusKm,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newArea = res.data?.data;

      setPreferredAreas((prev) => [newArea, ...prev]);
      setHasFetchedPreferredAreas(true);

      Toast.success(res.data?.message || "Area added successfully");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to add preferred area";

      setError(msg);
      Toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // DELETE AREA
  // ================================
  const removePreferredArea = async (areaId) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.delete(
        `${API_BASE_URL}/shipper/preferred-areas/${areaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPreferredAreas((prev) => prev.filter((a) => a._id !== areaId));
      setHasFetchedPreferredAreas(true);

      Toast.success(res.data?.message || "Area removed successfully");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to remove preferred area";

      setError(msg);
      Toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // UPDATE AREA
  // ================================
  const updatePreferredArea = async (areaId, updatedData) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.put(
        `${API_BASE_URL}/shipper/preferred-areas/${areaId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedArea = res.data?.data;

      setPreferredAreas((prev) =>
        prev.map((a) => (a._id === areaId ? updatedArea : a))
      );
      setHasFetchedPreferredAreas(true);

      Toast.success(res.data?.message || "Area updated successfully");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to update preferred area";

      setError(msg);
      Toast.error(msg);
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
        hasFetchedPreferredAreas,
        fetchPreferredAreas,
        clearPreferredAreas,
        addPreferredArea,
        removePreferredArea,
        updatePreferredArea,
      }}
    >
      {children}
    </ShipperPreferredAreaContext.Provider>
  );
};

export const useShipperPreferredArea = () => {
  const context = useContext(ShipperPreferredAreaContext);
  if (!context) {
    throw new Error(
      "useShipperPreferredArea must be used within ShipperPreferredAreaProvider"
    );
  }
  return context;
};
