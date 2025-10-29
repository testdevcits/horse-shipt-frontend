import React, { useRef } from "react";
import { HiPencil } from "react-icons/hi";
import { useAuth } from "../../contexts/AuthContext";
import { useShipperSettings } from "../../contexts/ShipperSettingsContext";

const CommentBanner = () => {
  const { user } = useAuth();
  const { settings, updateProfileImage, updateBannerImage } =
    useShipperSettings();

  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const bannerImage = settings?.bannerImage;
  const profileImage = settings?.profileImage;

  // ============================================================
  // HANDLE BANNER UPLOAD
  // ============================================================
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) updateBannerImage(file);
  };

  // ============================================================
  // HANDLE PROFILE UPLOAD
  // ============================================================
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) updateProfileImage(file);
  };

  return (
    <div className="relative w-full rounded-[12px] overflow-hidden shadow-md h-[232px]">
      {/* Banner Background */}
      <div
        className="absolute inset-0 bg-cover bg-center rounded-[12px]"
        style={{ backgroundImage: `url(${bannerImage})` }}
      ></div>

      <div className="absolute inset-0 bg-black/20 rounded-[12px]"></div>

      {/* New Banner Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => bannerInputRef.current.click()}
          className="px-4 py-2 bg-gray-200 text-[#333333] border rounded-lg text-sm font-medium hover:bg-opacity-50 transition"
        >
          New Banner
        </button>
        <input
          type="file"
          accept="image/*"
          ref={bannerInputRef}
          onChange={handleBannerChange}
          className="hidden"
        />
      </div>

      {/* Profile Card */}
      <div className="relative flex items-center h-full px-6">
        <div className="relative flex items-center gap-4 bg-white rounded-[14px] p-4 w-[326px] h-[152px]">
          <div className="relative w-16 h-16 rounded-full flex-shrink-0">
            <img
              src={profileImage}
              alt="Profile"
              className="w-16 h-16 object-cover rounded-full"
            />
            <button
              onClick={() => profileInputRef.current.click()}
              className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md hover:bg-gray-100 transition flex items-center justify-center"
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
            <span className="px-3 py-1 text-sm font-medium w-max">
              {user?.role || "Role"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentBanner;
