// ---------------------------------------------
// src/contexts/ShipperLocationContext.js
// ---------------------------------------------
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import Toast from "../components/common/Toast";

const ShipperLocationContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

export const ShipperLocationProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  // ---------------- TOAST HANDLER ----------------
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  }, []);

  // ---------------- FETCH CURRENT LOCATION ----------------
  const fetchCurrentLocation = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/current-location`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocation(res.data.data || null);
    } catch (err) {
      console.error("Fetch Location Error:", err);
      showToast("Failed to fetch location", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  // ---------------- UPDATE CURRENT LOCATION ----------------
  const updateLocation = async (locationData) => {
    if (!token) return { success: false };

    setLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/update-location`,
        locationData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLocation(res.data.data || locationData);
      showToast("Location updated successfully ✅", "success");

      return { success: true };
    } catch (err) {
      console.error("Update Location Error:", err);
      showToast("Failed to update location", "error");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- AUTO FETCH ----------------
  useEffect(() => {
    if (token && user?.role === "shipper") {
      fetchCurrentLocation();
    } else {
      setLocation(null);
    }
  }, [token, user, fetchCurrentLocation]);

  // ---------------- CONTEXT PROVIDER ----------------
  return (
    <ShipperLocationContext.Provider
      value={{
        location,
        loading,
        fetchCurrentLocation,
        updateLocation,
      }}
    >
      {children}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "", visible: false })}
        />
      )}
    </ShipperLocationContext.Provider>
  );
};

export const useShipperLocation = () => useContext(ShipperLocationContext);
