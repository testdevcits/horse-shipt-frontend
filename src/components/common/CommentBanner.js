import React from "react";
import { HiPencil } from "react-icons/hi";
import bannerBg from "../../assets/images/shipperProfileBanner.jpg"; // banner background image
import { useAuth } from "../../contexts/AuthContext";

const CommentBanner = () => {
  const { user } = useAuth(); // get logged-in user info

  return (
    <div
      className="relative w-full max-w-full lg:max-w-4xl mx-auto rounded-xl overflow-hidden shadow-md"
      style={{
        height: "152px",
        backgroundImage: `url(${bannerBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for slightly dark effect */}
      <div className="absolute inset-0 bg-black/20 rounded-xl"></div>

      {/* Content container */}
      <div className="relative flex items-center h-full px-4 md:px-6 gap-10">
        {/* Profile Image Container */}
        <div
          className="relative w-[326px] h-[152px] rounded-[14px] flex-shrink-0"
          style={{ background: "var(--System-Background, #FEFEFE)" }}
        >
          <img
            src={user?.photo || "/assets/images/profile.png"}
            alt="Profile"
            className="w-full h-full object-cover rounded-[14px]"
          />

          {/* Edit icon on profile image */}
          <button className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow-md hover:bg-gray-100 transition">
            <HiPencil className="text-gray-700 w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex flex-col justify-center gap-2">
          <h2 className="text-white font-semibold text-lg md:text-xl lg:text-2xl">
            {user?.name || "User Name"}
          </h2>
          <span className="px-3 py-1 bg-white text-gray-800 rounded-full text-sm font-medium w-max">
            {user?.role || "Role"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommentBanner;
