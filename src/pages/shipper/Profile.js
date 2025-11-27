import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import Button from "../../components/common/Button";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const Profile = () => {
  const { user, token, setUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [locale, setLocale] = useState(user?.locale || "");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(
    user?.profilePicture ? `http://localhost:5000/${user.profilePicture}` : ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profilePicture) return;
    const objectUrl = URL.createObjectURL(profilePicture);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePicture]);

  const handleFileChange = (e) => setProfilePicture(e.target.files[0]);

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
      setPreview(`http://localhost:5000/${updatedUser.profilePicture}`);
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-full mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Update Profile</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-medium">Profile Picture</label>
          {preview && (
            <img
              src={preview}
              alt="Profile"
              className="w-24 h-24 rounded-full mb-2 object-cover"
            />
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
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
