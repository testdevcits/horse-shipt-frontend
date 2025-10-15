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

      {/* Overlay for dark effect */}
      <div className="absolute inset-0 bg-black/20 rounded-[12px]"></div>

      {/* Content Container */}
      <div className="relative flex items-center h-full px-6">
        {/* Profile Card - smaller, left aligned */}
        <div className="relative flex items-center gap-6 bg-white rounded-[14px] p-4 w-[326px] h-[152px]">
          {/* Profile Image */}
          <div className="relative w-[120px] h-[120px] rounded-full flex-shrink-0">
            <img
              src={user?.photo || "/assets/images/profile.png"}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
            {/* Edit icon */}
            <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition flex items-center justify-center">
              <HiPencil className="text-gray-700 w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex flex-col justify-center gap-2 truncate">
            <h2 className="text-gray-900 font-semibold text-lg md:text-xl lg:text-2xl truncate">
              {user?.name || "User Name"}
            </h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium w-max">
              {user?.role || "Role"}
            </span>
          </div>
        </div>

        {/* You can add other content on the right side if needed */}
      </div>
    </div>
  );
};

export default CommentBanner;
