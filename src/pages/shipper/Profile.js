import React, { useState, useEffect, useRef } from "react";
import { useShipperProfile } from "../../contexts/ShipperProfileContext";
import Button from "../../components/common/Button";
import { HiPencil } from "react-icons/hi";

const Profile = () => {
  const {
    profile,
    loading,
    updateProfile,
    updateProfileImage,
    updateBannerImage,
  } = useShipperProfile();

  const [firstName, setFirstName] = useState(profile?.firstName || "");
  const [lastName, setLastName] = useState(profile?.lastName || "");
  const [locale, setLocale] = useState(profile?.locale || "");

  const [preview, setPreview] = useState(profile?.profileImage || "");
  const [bannerPreview, setBannerPreview] = useState(
    profile?.bannerImage || ""
  );

  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // When profile loads from context
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setLocale(profile.locale || "");
      setPreview(profile.profileImage || "");
      setBannerPreview(profile.bannerImage || "");
    }
  }, [profile]);

  // 🔵 Handle profile image selection
  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file)); // instant preview
    await updateProfileImage(file);
  };

  // 🔵 Handle banner image selection
  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBannerPreview(URL.createObjectURL(file));
    await updateBannerImage(file);
  };

  // 🔵 Update text fields
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({ firstName, lastName, locale });
  };

  return (
    <div className="max-w-full mx-auto mt-10 p-2 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Update Profile</h2>

      {/* Banner Image */}
      <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-200 mb-6">
        {bannerPreview && (
          <img
            src={bannerPreview}
            className="w-full h-full object-cover"
            alt="Banner"
          />
        )}

        <button
          type="button"
          onClick={() => bannerInputRef.current.click()}
          className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
        >
          <HiPencil className="w-5 h-5 text-gray-700" />
        </button>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={bannerInputRef}
          onChange={handleBannerChange}
        />
      </div>

      {/* PROFILE SECTION */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Profile Picture */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden">
          <img
            src={preview || "/default-profile.png"}
            className="w-24 h-24 rounded-full object-cover border"
            alt="Profile"
          />

          <button
            type="button"
            onClick={() => profileInputRef.current.click()}
            className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md hover:bg-gray-100"
          >
            <HiPencil className="w-4 h-4 text-gray-700" />
          </button>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={profileInputRef}
            onChange={handleProfileChange}
          />
        </div>

        {/* FIRST NAME */}
        <div>
          <label className="block mb-1 font-medium">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* LAST NAME */}
        <div>
          <label className="block mb-1 font-medium">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* LOCALE */}
        <div>
          <label className="block mb-1 font-medium">Locale</label>
          <input
            type="text"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* SUBMIT */}
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
