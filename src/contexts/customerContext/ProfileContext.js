import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const ProfileContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api"; // absolute backend URL

export const ProfileProvider = ({ children }) => {
  const { token } = useAuth(); // get JWT from AuthContext
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update Customer Profile Image
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
      value={{ profileImage, loading, error, updateProfileImage }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Hook to use the context
export const useProfile = () => useContext(ProfileContext);
