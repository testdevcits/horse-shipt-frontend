import React, { createContext, useContext, useState } from "react";
import axios from "axios";

// Create Context
const ProfileContext = createContext();

// Provider
export const ProfileProvider = ({ children }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update Customer Profile Image
  const updateProfileImage = async (file, token) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.put(
        "/api/customer/profile-image", // your backend route
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // pass JWT token
          },
        }
      );

      setProfileImage(response.data.profileImage);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error("Profile Update Error:", err.response || err);
      setError(err.response?.data?.message || "Failed to update profile image");
      setLoading(false);
      throw err;
    }
  };

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
