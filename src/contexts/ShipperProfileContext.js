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

const ShipperProfileContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

export const ShipperProfileProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  }, []);

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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile((prev) => ({ ...prev, ...res.data.data }));
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

      const imageUrl =
        res.data?.data?.imageUrl ||
        res.data?.data?.profileImage ||
        res.data?.profileImage;

      const newUrl = `${imageUrl}?t=${Date.now()}`;
      setProfile((prev) => ({ ...prev, profileImage: newUrl }));

      showToast("Profile image updated successfully", "success");
      return { success: true, imageUrl: newUrl };
    } catch (err) {
      console.error("Profile Image Update Error:", err);
      showToast("Failed to update profile image", "error");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

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

      const imageUrl =
        res.data?.data?.imageUrl ||
        res.data?.data?.bannerImage ||
        res.data?.bannerImage;

      const newUrl = `${imageUrl}?t=${Date.now()}`;
      setProfile((prev) => ({ ...prev, bannerImage: newUrl }));

      showToast("Banner image updated successfully", "success");
      return { success: true, imageUrl: newUrl };
    } catch (err) {
      console.error("Banner Image Update Error:", err);
      showToast("Failed to update banner image", "error");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === "shipper") {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [token, user, fetchProfile]);

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

export const useShipperProfile = () => useContext(ShipperProfileContext);
