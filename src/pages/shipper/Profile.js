import React, { useState, useEffect, useRef } from "react";
import { useShipperProfile } from "../../contexts/ShipperProfileContext";
import Button from "../../components/common/Button";
import { HiPencil } from "react-icons/hi";

const Profile = () => {
  const { profile, loading, updateProfile, updateProfileImage } =
    useShipperProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [locale, setLocale] = useState("");

  const [preview, setPreview] = useState("");

  const profileInputRef = useRef(null);

  // Sync UI with Context Profile
  useEffect(() => {
    if (!profile) return;

    setFirstName(profile.firstName || "");
    setLastName(profile.lastName || "");
    setLocale(profile.locale || "");

    // FULL URL FIX
    setPreview(
      profile.profileImage
        ? `${profile.profileImage}?t=${Date.now()}`
        : "/default-profile.png"
    );
  }, [profile]);

  // Handle PROFILE image upload
  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file)); // instant
    await updateProfileImage(file);
  };

  // Update text fields
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({ firstName, lastName, locale });
  };

  return (
    <div className="w-full mx-auto font-[Montserrat] animate-slide-fade-in">
      <h2 className="text-[16px] sm:text-[18px] lg:text-[20px] font-medium text-gray-800">
        Update Profile
      </h2>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border mt-4 rounded shadow bg-white">
        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Profile Picture */}
          <div className="relative w-24 h-24 rounded-full">
            <img
              src={preview}
              alt="Profile"
              className="w-24 h-24 object-cover rounded-full border"
            />

            <button
              type="button"
              onClick={() => profileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-lg hover:bg-gray-100 border"
            >
              <HiPencil className="w-4 h-4 text-black" />
            </button>

            <input
              type="file"
              accept="image/*"
              ref={profileInputRef}
              className="hidden"
              onChange={handleProfileChange}
            />
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

          {/* Submit */}
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
    </div>
  );
};

export default Profile;
