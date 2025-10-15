import React from "react";
import { HiPencil } from "react-icons/hi";
import bannerBg from "../../assets/images/shipperProfileBanner.jpg"; // main banner background
import { useAuth } from "../../contexts/AuthContext";

const CommentBanner = () => {
  const { user } = useAuth();

  return (
    <div className="relative w-full rounded-[12px] overflow-hidden shadow-md h-[232px]">
      {/* Main Banner Background */}
      <div
        className="absolute inset-0 bg-cover bg-center rounded-[12px]"
        style={{ backgroundImage: `url(${bannerBg})` }}
      ></div>

      {/* Overlay for slightly dark effect */}
      <div className="absolute inset-0 bg-black/20 rounded-[12px]"></div>

      {/* Content Container */}
      <div className="relative flex items-center h-full px-6">
        {/* Profile Card - left aligned */}
        <div className="relative flex items-center gap-4 bg-white rounded-[14px] p-4 w-[326px] h-[152px]">
          {/* Profile Image */}
          <div className="relative w-16 h-16 rounded-full flex-shrink-0">
            <img
              src={user?.photo || "/assets/images/profile.png"}
              alt="Profile"
              className="w-16 h-16 object-cover rounded-full"
            />
            {/* Edit icon */}
            <button className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md hover:bg-gray-100 transition flex items-center justify-center">
              <HiPencil className="text-gray-700 w-4 h-4" />
            </button>
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

        {/* Right side content can go here if needed */}
      </div>
    </div>
  );
};

export default CommentBanner;
