import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import Button from "../../components/common/Button";
import { HiPencil } from "react-icons/hi";

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
      ? `${API_BASE_URL}/${user.profilePicture}`
      : "/default-profile.png"
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const profileInputRef = useRef(null);

  // Preview selected image immediately
  useEffect(() => {
    if (!profilePicture) return;
    const objectUrl = URL.createObjectURL(profilePicture);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePicture]);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicture(file);
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

      const res = await axios.put(
        `${API_BASE_URL}/shipper/update-profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedData = res.data.data;
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem("horseShiptUser", JSON.stringify(updatedUser));
      setPreview(
        updatedData.profilePicture
          ? `${API_BASE_URL}/${updatedData.profilePicture}`
          : "/default-profile.png"
      );
      setMessage(res.data.message || "Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Update Profile</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Profile Image */}
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden">
            <img
              src={preview}
              alt="Profile"
              className={`w-24 h-24 object-cover rounded-full border ${
                loading ? "opacity-50" : ""
              }`}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => profileInputRef.current.click()}
              className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md hover:bg-gray-100 flex items-center justify-center transition"
            >
              <HiPencil className="text-gray-700 w-4 h-4" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={profileInputRef}
              onChange={handleProfileChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-gray-700 font-medium">Profile Picture</p>
            <p className="text-sm text-gray-500">
              Click the pencil to change your profile image
            </p>
          </div>
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

        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          borderColor="transparent"
          rounded={false}
          className="rounded-md px-6 py-2 font-montserrat"
        >
          {loading ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </div>
  );
};

export default Profile;
