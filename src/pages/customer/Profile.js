import React, { useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { FaStar } from "react-icons/fa";

const CustomerProfile = () => {
  const { user } = useAuth();
  const [profilePopup, setProfilePopup] = useState(false);

  return (
    <div className="flex flex-col items-center w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Profile Image */}
      <div className="relative">
        <img
          src={user?.photo || "https://via.placeholder.com/80"}
          alt="Profile"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border border-gray-300 cursor-pointer"
          onClick={() => setProfilePopup(!profilePopup)}
        />
      </div>

      {/* Edit Picture Button */}
      <button className="flex items-center gap-2 px-2 py-2 text-white hover:bg-system-primary-dark transition">
        <FiEdit3 /> Edit Picture
      </button>

      {/* Mobile First Div */}
      <div className="w-[343px] h-[62px] flex items-center justify-between px-4 py-2 border rounded-[14px] border-gray-300 bg-white">
        {/* Shipment */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-base font-bold sm:text-lg">10</span>
          <span className="text-sm text-gray-500">Shipment</span>
        </div>

        {/* Rating */}
        <div className="flex flex-col items-center justify-center">
          <span className="flex items-center gap-1 text-base font-bold sm:text-lg">
            5.0 <FaStar className="text-system-primary" />
          </span>
          <span className="text-sm text-gray-500">Rating</span>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-semibold">Basic Info</h3>
          <button className="p-1 bg-gray-100 rounded hover:bg-gray-200 transition">
            <FiEdit3 />
          </button>
        </div>

        {/* Info Fields */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between items-center border-b border-gray-300 pb-2">
            <span className="text-gray-500">Name:</span>
            <span className="font-medium">{user?.name || "John Doe"}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-300 pb-2">
            <span className="text-gray-500">Email:</span>
            <span className="font-medium">
              {user?.email || "johndoe@example.com"}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-300 pb-2">
            <span className="text-gray-500">Phone:</span>
            <span className="font-medium">
              {user?.phone || "+91 9876543210"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
