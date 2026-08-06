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
import { SHIPPER_API_BASE_URL as API_BASE_URL } from "../config/api";
import { validateImageUpload } from "../utils/uploadValidation";

const ShipperProfileContext = createContext();
export const ShipperProfileProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = useCallback((message, type = "info") => {
    if (type === "success") Toast.success(message);
    else if (type === "error") Toast.error(message);
    else if (type === "warning") Toast.warning(message);
    else Toast.info(message);
  }, []);

  const normalizeProfile = (data) => ({
    ...data,
    profileImage: data?.profileImage?.url || data?.profileImage || "",
    bannerImage: data?.bannerImage?.url || data?.bannerImage || "",
    mobile: data?.mobile || "",
    description: data?.description || "",
    locale: {
      address: data?.locale?.address || "",
      latitude: data?.locale?.latitude || null,
      longitude: data?.locale?.longitude || null,
    },
  });

  // -------------------------
  // Fetch Profile
  // -------------------------
  const fetchProfile = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(normalizeProfile(res.data.data || {}));
    } catch (err) {
      console.error("Fetch Profile Error:", err);
      showToast(
        err.response?.data?.message || "Failed to fetch profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  // -------------------------
  // Update Profile
  // -------------------------
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

      setProfile(normalizeProfile(res.data.data));
      showToast("Profile updated successfully", "success");

      return { success: true };
    } catch (err) {
      console.error("Update Profile Error:", err);
      showToast(
        err.response?.data?.message || "Failed to update profile",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Update Profile Image
  // -------------------------
  const updateProfileImage = async (file, supportedFormats = "") => {
    if (!token) return { success: false };
    if (!file) {
      showToast(
        supportedFormats
          ? `Unsupported image format. Please upload ${supportedFormats}.`
          : "Please choose an image to upload.",
        "error"
      );
      return { success: false };
    }

    const validationError = validateImageUpload(file);
    if (validationError) {
      showToast(validationError, "error");
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

      const image = res.data?.profileImage || res.data?.data?.profileImage;
      const url = image?.url || image;
      const finalUrl = `${url}?t=${Date.now()}`;

      setProfile((prev) => ({ ...prev, profileImage: finalUrl }));

      showToast("Profile image updated successfully", "success");
      return { success: true, imageUrl: finalUrl };
    } catch (err) {
      console.error("Profile Image Update Error:", err);
      showToast(
        err.response?.data?.message || "Failed to update profile image",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Update Banner Image
  // -------------------------
  const updateBannerImage = async (file, supportedFormats = "") => {
    if (!token) return { success: false };
    if (!file) {
      showToast(
        supportedFormats
          ? `Unsupported image format. Please upload ${supportedFormats}.`
          : "Please choose a banner image to upload.",
        "error"
      );
      return { success: false };
    }

    const validationError = validateImageUpload(file);
    if (validationError) {
      showToast(validationError, "error");
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

      const image = res.data?.bannerImage || res.data?.data?.bannerImage;
      const url = image?.url || image;
      const finalUrl = `${url}?t=${Date.now()}`;

      setProfile((prev) => ({ ...prev, bannerImage: finalUrl }));

      showToast("Banner image updated successfully", "success");
      return { success: true, imageUrl: finalUrl };
    } catch (err) {
      console.error("Banner Image Update Error:", err);
      showToast(
        err.response?.data?.message || "Failed to update banner image",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Auto Fetch
  // -------------------------
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
    </ShipperProfileContext.Provider>
  );
};

export const useShipperProfile = () => useContext(ShipperProfileContext);
