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

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------
const ShipperSettingsContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

// Default fallback images
const DEFAULT_PROFILE_IMAGE =
  "https://via.placeholder.com/150x150?text=Profile+Image";
const DEFAULT_BANNER_IMAGE =
  "https://via.placeholder.com/800x300?text=Banner+Image";

// --------------------------------------------------
// PROVIDER
// --------------------------------------------------
export const ShipperSettingsProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [settings, setSettings] = useState({
    notifications: {},
    profileImage: DEFAULT_PROFILE_IMAGE,
    bannerImage: DEFAULT_BANNER_IMAGE,
    currentLocation: null,
  });

  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  // Toast handler
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  // ============================================================
  // FETCH SETTINGS
  // ============================================================
  const fetchSettings = useCallback(async () => {
    if (!token || fetched) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data || {};

      setSettings({
        ...data,
        profileImage: data?.profileImage?.url || DEFAULT_PROFILE_IMAGE,
        bannerImage: data?.bannerImage?.url || DEFAULT_BANNER_IMAGE,
        currentLocation: data?.currentLocation || null,
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

  // ============================================================
  // UPDATE NOTIFICATION SETTINGS
  // ============================================================
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
      console.error("Update Settings Error:", err.response?.data || err);
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
    if (!token) {
      showToast("Unauthorized. Please log in again.", "error");
      return { success: false };
    }

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const res = await axios.put(
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
        profileImage: res.data.data?.profileImage?.url || DEFAULT_PROFILE_IMAGE,
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
    if (!token) {
      showToast("Unauthorized. Please log in again.", "error");
      return { success: false };
    }

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/update-banner-image`,
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
        bannerImage: res.data.data?.bannerImage?.url || DEFAULT_BANNER_IMAGE,
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

  // ============================================================
  // GET CURRENT LOCATION
  // ============================================================
  const fetchCurrentLocation = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/current-location`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data;
      if (data) {
        setSettings((prev) => ({
          ...prev,
          currentLocation: data,
        }));
      }
    } catch (err) {
      console.error("Fetch Current Location Error:", err.response?.data || err);
    }
  }, [token]);

  // ============================================================
  // UPDATE CURRENT LOCATION
  // ============================================================
  const updateCurrentLocation = async (latitude, longitude) => {
    if (!token) {
      showToast("Unauthorized. Please log in again.", "error");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/update-location`,
        { latitude, longitude },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSettings((prev) => ({
        ...prev,
        currentLocation: res.data?.data || null,
      }));

      showToast("Location updated successfully", "success");
      return { success: true };
    } catch (err) {
      console.error("Update Location Error:", err.response?.data || err);
      showToast(
        err.response?.data?.message || "Failed to update location",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // AUTO FETCH ON LOAD
  // ============================================================
  useEffect(() => {
    if (token && user?.role === "shipper") {
      fetchSettings();
      fetchCurrentLocation();
    } else {
      setSettings({
        notifications: {},
        profileImage: DEFAULT_PROFILE_IMAGE,
        bannerImage: DEFAULT_BANNER_IMAGE,
        currentLocation: null,
      });
      setFetched(false);
    }
  }, [token, user, fetchSettings, fetchCurrentLocation]);

  // ============================================================
  // CONTEXT VALUE
  // ============================================================
  return (
    <ShipperSettingsContext.Provider
      value={{
        settings,
        loading,
        fetchSettings,
        updateSettings,
        uploadProfileImage,
        uploadBannerImage,
        fetchCurrentLocation,
        updateCurrentLocation,
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

// --------------------------------------------------
// CUSTOM HOOK
// --------------------------------------------------
export const useShipperSettings = () => useContext(ShipperSettingsContext);
