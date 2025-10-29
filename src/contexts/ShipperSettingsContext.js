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
const ShipperSettingsContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

// Default images (used when no upload yet)
const DEFAULT_PROFILE_IMAGE =
  "https://via.placeholder.com/150x150?text=Profile+Image";
const DEFAULT_BANNER_IMAGE =
  "https://via.placeholder.com/800x300?text=Banner+Image";

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
    profileImage: DEFAULT_PROFILE_IMAGE, // Default on load
    bannerImage: DEFAULT_BANNER_IMAGE, // Default on load
  });

  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  // ---------------- TOAST HANDLER ----------------
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  // ---------------- FETCH SETTINGS ----------------
  const fetchSettings = useCallback(async () => {
    if (!token || fetched) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.data || {};

      // ✅ Ensure fallback images if not set
      setSettings({
        ...data,
        profileImage: data.profileImage || DEFAULT_PROFILE_IMAGE,
        bannerImage: data.bannerImage || DEFAULT_BANNER_IMAGE,
      });

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

      setSettings((prev) => ({
        ...prev,
        ...res.data.data,
      }));
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

  // ============================================================
  // UPLOAD PROFILE IMAGE
  // ============================================================
  const uploadProfileImage = async (file) => {
    if (!token) return showToast("Unauthorized. Please log in again.", "error");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/update-profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSettings((prev) => ({
        ...prev,
        profileImage: res.data.photo || DEFAULT_PROFILE_IMAGE, // ✅ fallback
      }));

      showToast("Profile image updated successfully", "success");
      return { success: true };
    } catch (err) {
      console.error("Upload Profile Image Error:", err.response?.data || err);
      showToast(
        err.response?.data?.message || "Failed to upload profile image",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UPLOAD BANNER IMAGE
  // ============================================================
  const uploadBannerImage = async (file) => {
    if (!token) return showToast("Unauthorized. Please log in again.", "error");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/upload-banner-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSettings((prev) => ({
        ...prev,
        bannerImage: res.data.bannerImage || DEFAULT_BANNER_IMAGE, // ✅ fallback
      }));

      showToast("Banner image updated successfully", "success");
      return { success: true };
    } catch (err) {
      console.error("Upload Banner Image Error:", err.response?.data || err);
      showToast(
        err.response?.data?.message || "Failed to upload banner image",
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
      setSettings({
        notifications: {},
        profileImage: DEFAULT_PROFILE_IMAGE,
        bannerImage: DEFAULT_BANNER_IMAGE,
      });
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
        updateSettings,
        uploadProfileImage,
        uploadBannerImage,
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
