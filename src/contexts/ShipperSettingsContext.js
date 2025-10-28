// ---------------------------------------------
// src/contexts/ShipperSettingsContext.js
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

// ---------------------------------------------
// Context setup
// ---------------------------------------------
const ShipperSettingsContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

// ---------------------------------------------
// Provider Component
// ---------------------------------------------
export const ShipperSettingsProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [settings, setSettings] = useState({
    notifications: {
      quote: { email: false, sms: false },
      opportunity: { email: false, sms: false },
      message: { email: false, sms: false },
      review: { email: false, sms: false },
      shipment: { email: false, sms: false },
    },
  });

  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  // ---------------- TOAST HANDLER ----------------
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  // ---------------- FETCH SETTINGS (Logged-in Shipper) ----------------
  const fetchSettings = useCallback(async () => {
    if (!token || fetched) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSettings(res.data.data || {});
      setFetched(true);
    } catch (err) {
      console.error("Fetch Settings Error:", err.response?.data || err.message);
      showToast(
        err.response?.data?.message || "Failed to fetch settings",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [token, fetched]);

  // ---------------- FETCH SETTINGS BY ID (Admin Access) ----------------
  const fetchSettingsById = async (shipperId) => {
    if (!token || !shipperId) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/settings/${shipperId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSettings(res.data.data || {});
      showToast("Settings fetched successfully", "success");
      return { success: true, data: res.data.data };
    } catch (err) {
      console.error(
        "Fetch Settings by ID Error:",
        err.response?.data || err.message
      );
      showToast(
        err.response?.data?.message || "Failed to fetch shipper settings by ID",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE SETTINGS ----------------
  const updateSettings = async (updatedData) => {
    if (!token) {
      showToast("Unauthorized. Please log in again.", "error");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/settings/update-notifications`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSettings(res.data.data || updatedData);
      showToast("Settings updated successfully", "success");
      return { success: true };
    } catch (err) {
      console.error(
        "Update Settings Error:",
        err.response?.data || err.message
      );
      showToast(
        err.response?.data?.message || "Failed to update settings",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- AUTO FETCH ----------------
  useEffect(() => {
    if (token && user?.role === "shipper") {
      fetchSettings();
    } else {
      setSettings(null);
      setFetched(false);
    }
  }, [token, user, fetchSettings]);

  // ---------------- CONTEXT VALUE ----------------
  return (
    <ShipperSettingsContext.Provider
      value={{
        settings,
        loading,
        fetchSettings,
        fetchSettingsById,
        updateSettings,
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
    </ShipperSettingsContext.Provider>
  );
};

// ---------------------------------------------
// Custom Hook
// ---------------------------------------------
export const useShipperSettings = () => useContext(ShipperSettingsContext);
