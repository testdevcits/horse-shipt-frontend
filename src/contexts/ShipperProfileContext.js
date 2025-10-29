// ---------------------------------------------
// src/contexts/ShipperProfileContext.js
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
const ShipperProfileContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

// ---------------------------------------------
// Provider Component
// ---------------------------------------------
export const ShipperProfileProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------- TOAST HANDLER ----------------
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  }, []);

  // ---------------- FETCH SHIPPER PROFILE ----------------
  const fetchProfile = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.data || {});
    } catch (err) {
      console.error("Fetch Profile Error:", err.response?.data || err.message);
      showToast(
        err.response?.data?.message || "Failed to fetch profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  // ---------------- UPDATE PROFILE ----------------
  const updateProfile = async (updatedData) => {
    if (!token) {
      showToast("Unauthorized. Please log in again.", "error");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/update-profile`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProfile(res.data.data || updatedData);
      showToast("Profile updated successfully", "success");
      return { success: true };
    } catch (err) {
      console.error("Update Profile Error:", err.response?.data || err.message);
      showToast(
        err.response?.data?.message || "Failed to update profile",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE PROFILE IMAGE ----------------
  const updateProfileImage = async (file) => {
    if (!token || !file) return { success: false };

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
      setProfile((prev) => ({ ...prev, profileImage: res.data.data.imageUrl }));
      showToast("Profile image updated successfully", "success");
      return { success: true };
    } catch (err) {
      console.error("Profile Image Update Error:", err);
      showToast("Failed to update profile image", "error");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE BANNER IMAGE ----------------
  const updateBannerImage = async (file) => {
    if (!token || !file) return { success: false };

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
      setProfile((prev) => ({ ...prev, bannerImage: res.data.data.imageUrl }));
      showToast("Banner image updated successfully", "success");
      return { success: true };
    } catch (err) {
      console.error("Banner Image Update Error:", err);
      showToast("Failed to update banner image", "error");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- AUTO FETCH ----------------
  useEffect(() => {
    if (token && user?.role === "shipper") {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [token, user, fetchProfile]);

  // ---------------- CONTEXT VALUE ----------------
  return (
    <ShipperProfileContext.Provider
      value={{
        profile,
        loading,
        fetchProfile,
        updateProfile,
        updateProfileImage,
        updateBannerImage,
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
    </ShipperProfileContext.Provider>
  );
};

// ---------------------------------------------
// Custom Hook
// ---------------------------------------------
export const useShipperProfile = () => useContext(ShipperProfileContext);
