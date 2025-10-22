import React, { useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { FaStar } from "react-icons/fa";

const CustomerProfile = () => {
  const { user } = useAuth();
  const [profilePopup, setProfilePopup] = useState(false);

  return (
    <div className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-16 py-6 space-y-6">
      {/* Top Profile Image */}
      <div className="relative">
        <img
          src={user?.photo || "https://via.placeholder.com/80"}
          alt="Profile"
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover border border-gray-300 cursor-pointer"
        />
      </div>

      {/* Edit Picture Button */}
      <button
        className="flex items-center gap-2 px-3 py-2  text-gray-100 transition text-sm sm:text-base md:text-lg"
        onClick={() => setProfilePopup(!profilePopup)}
      >
        <FiEdit3 /> Edit Picture
      </button>

      {/* Shipments & Rating Card */}
      <div className="w-full max-w-sm bg-white flex items-center justify-between px-4 py-3 border rounded-[14px] border-gray-300 ">
        {/* Shipments */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-base sm:text-lg md:text-xl font-bold">10</span>
          <span className="text-xs sm:text-sm md:text-base text-gray-500">
            Shipment
          </span>
        </div>

        {/* Rating */}
        <div className="flex flex-col items-center justify-center">
          <span className="flex items-center gap-1 text-base sm:text-lg md:text-xl font-bold">
            5.0 <FaStar className="text-system-primary" />
          </span>
          <span className="text-xs sm:text-sm md:text-base text-gray-500">
            Rating
          </span>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="w-full max-w-md bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-sm flex flex-col gap-4">
        {/* Header with Edit Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold">
            Basic Info
          </h3>
          <button className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition">
            <FiEdit3 />
          </button>
        </div>

        {/* Info Fields */}
        <div className="flex flex-col w-full gap-3">
          {/* Name */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-2">
            <span className="text-gray-500 text-sm sm:text-base md:text-lg">
              Name:
            </span>
            <span className="font-medium text-sm sm:text-base md:text-lg">
              {user?.name || "John Doe"}
            </span>
          </div>

          {/* Email */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-2">
            <span className="text-gray-500 text-sm sm:text-base md:text-lg">
              Email:
            </span>
            <span className="font-medium text-sm sm:text-base md:text-lg">
              {user?.email || "johndoe@example.com"}
            </span>
          </div>

          {/* Phone */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-2">
            <span className="text-gray-500 text-sm sm:text-base md:text-lg">
              Phone:
            </span>
            <span className="font-medium text-sm sm:text-base md:text-lg">
              {user?.phone || "+91 9876543210"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
