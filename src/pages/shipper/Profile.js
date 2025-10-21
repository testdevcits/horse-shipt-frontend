import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

const Profile = () => {
  const { user, token, setUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [locale, setLocale] = useState(user?.locale || "");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(
    user?.profilePicture
      ? user.profilePicture.startsWith("http")
        ? user.profilePicture
        : `${API_BASE_URL}/${user.profilePicture.replace(/^\/?/, "")}`
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Update preview when file changes
  useEffect(() => {
    if (!profilePicture) return;
    const objectUrl = URL.createObjectURL(profilePicture);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePicture]);

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("locale", locale);
      if (profilePicture) formData.append("profilePicture", profilePicture);

      // Determine route based on role
      const route =
        user.role === "shipper"
          ? "shipper/update-profile"
          : "customer/update-profile";

      const res = await axios.put(`${API_BASE_URL}/${route}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedData = res.data.data;

      // Update AuthContext and localStorage
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem("horseShiptUser", JSON.stringify(updatedUser));

      // Update preview to full URL
      setPreview(
        updatedUser.profilePicture
          ? updatedUser.profilePicture.startsWith("http")
            ? updatedUser.profilePicture
            : `${API_BASE_URL}/${updatedUser.profilePicture.replace(
                /^\/?/,
                ""
              )}`
          : ""
      );

      setMessage(res.data.message || "Profile updated successfully");
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Error updating profile. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-full mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Update Profile</h2>

      {message && <p className="mb-4 text-green-600">{message}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Profile Picture */}
        <div>
          <label className="block mb-1 font-medium">Profile Picture</label>
          {preview && (
            <img
              src={preview}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full mb-2 object-cover"
            />
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {/* First Name */}
        <div>
          <label className="block mb-1 font-medium">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block mb-1 font-medium">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Locale */}
        <div>
          <label className="block mb-1 font-medium">Locale</label>
          <input
            type="text"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
