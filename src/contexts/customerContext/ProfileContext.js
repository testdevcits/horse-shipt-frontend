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
const API_BASE_URL = "https://horse-shipt.vercel.app/api"; // absolute backend URL

export const ProfileProvider = ({ children }) => {
  const { token } = useAuth(); // get JWT from AuthContext
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null); // optional
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null); // full profile

  // ===============================
  // Fetch customer profile on mount
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
  // Update Customer Profile Image
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

        const response = await axios.put(
          `${API_BASE_URL}/customer/profile-image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfileImage(response.data.profileImage);
        // also update profile object
        setProfile((prev) => ({
          ...prev,
          profileImage: response.data.profileImage,
        }));
        setLoading(false);
        return response.data;
      } catch (err) {
        console.error("Profile Update Error:", err.response || err);
        setError(
          err.response?.data?.message || "Failed to update profile image"
        );
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
        updateProfileImage,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Hook to use the context
export const useProfile = () => useContext(ProfileContext);
