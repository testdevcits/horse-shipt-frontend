import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const ProfileContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const ProfileProvider = ({ children }) => {
  const { token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===============================
  // Fetch Profile
  // ===============================
  const fetchProfile = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/customer/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data.data;

      setProfile(data);
      setProfileImage(data.profileImage);
      setBannerImage(data.bannerImage || null);

      setLoading(false);
    } catch (err) {
      console.error("Fetch Profile Error:", err.response || err);
      setError(err.response?.data?.message || "Failed to fetch profile");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ===============================
  //  Update Profile Details (NO IMAGE)
  // ===============================
  const updateProfileDetails = useCallback(
    async ({ firstName, lastName, phone, locale }) => {
      if (!token) {
        setError("Unauthorized");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await axios.put(
          `${API_BASE_URL}/customer/profile-details`,
          { firstName, lastName, phone, locale },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updated = res.data.data;

        setProfile(updated);

        setLoading(false);
        return updated;
      } catch (err) {
        console.error("Update Profile Error:", err.response || err);
        setError(err.response?.data?.message || "Failed to update profile");
        setLoading(false);
        throw err;
      }
    },
    [token]
  );

  // ===============================
  //  Update Profile Image (SEPARATE API)
  // ===============================
  const updateProfileImage = useCallback(
    async (file) => {
      if (!token) {
        setError("Unauthorized");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await axios.put(
          `${API_BASE_URL}/customer/profile-image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const image = res.data.profileImage;

        setProfileImage(image);

        // sync profile also
        setProfile((prev) => ({
          ...prev,
          profileImage: image,
        }));

        setLoading(false);
        return res.data;
      } catch (err) {
        console.error("Image Update Error:", err.response || err);
        setError(err.response?.data?.message || "Failed to update image");
        setLoading(false);
        throw err;
      }
    },
    [token]
  );

  return (
    <ProfileContext.Provider
      value={{
        profile,
        profileImage,
        bannerImage,
        loading,
        error,
        fetchProfile,
        updateProfileDetails, 
        updateProfileImage, 
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
