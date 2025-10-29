import React, { useRef } from "react";
import { HiPencil } from "react-icons/hi";
import { useAuth } from "../../contexts/AuthContext";
import { useShipperSettings } from "../../contexts/ShipperSettingsContext";
import bannerBg from "../../assets/images/shipperProfileBanner.jpg"; // local default banner
import defaultProfile from "../../assets/images/profile.png"; // local default profile

const CommentBanner = () => {
  const { user } = useAuth();
  const { settings, uploadProfileImage, uploadBannerImage } =
    useShipperSettings();

  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  // =======================
  // HANDLERS
  // =======================
  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (file) await uploadBannerImage(file);
  };

  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) await uploadProfileImage(file);
  };

  return (
    <div className="relative w-full rounded-[12px] overflow-hidden shadow-md h-[232px]">
      {/* ---------------- Banner Background ---------------- */}
      <div
        className="absolute inset-0 bg-cover bg-center rounded-[12px]"
        style={{
          backgroundImage: `url(${settings?.bannerImage || bannerBg})`,
        }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 rounded-[12px]" />

      {/* Edit Banner Icon (top-right) */}
      <button
        onClick={() => bannerInputRef.current?.click()}
        className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition"
        title="Change Banner"
      >
        <HiPencil className="text-gray-700 w-5 h-5" />
      </button>
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        onChange={handleBannerUpload}
        className="hidden"
      />

      {/* ---------------- Content Container ---------------- */}
      <div className="relative flex items-center h-full px-6">
        {/* Profile Card */}
        <div className="relative flex items-center gap-4 bg-white rounded-[14px] p-4 w-[326px] h-[152px]">
          {/* Profile Image */}
          <div className="relative w-16 h-16 rounded-full flex-shrink-0">
            <img
              src={settings?.profileImage || user?.photo || defaultProfile}
              alt="Profile"
              className="w-16 h-16 object-cover rounded-full"
            />
            {/* Edit icon */}
            <button
              onClick={() => profileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md hover:bg-gray-100 transition flex items-center justify-center"
              title="Change Profile Photo"
            >
              <HiPencil className="text-gray-700 w-4 h-4" />
            </button>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileUpload}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="flex flex-col justify-center gap-2 truncate">
            <h2
              className="text-gray-900 truncate"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                fontStyle: "normal",
                fontSize: "30px",
                lineHeight: "38px",
              }}
            >
              {user?.name || "User Name"}
            </h2>
            <span className="px-3 py-1 text-sm font-medium w-max bg-gray-100 rounded-md text-gray-700">
              {user?.role || "Role"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentBanner;
