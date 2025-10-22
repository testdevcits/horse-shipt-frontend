import React, { useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

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
        {profilePopup && (
          <div className="absolute top-full mt-2 right-0 w-40 bg-white border rounded shadow-lg z-50">
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
              <FiEdit3 /> Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Edit Picture Button */}
      <button className="flex items-center gap-2 px-4 py-2 bg-system-primary text-white rounded hover:bg-system-primary-dark transition">
        <FiEdit3 /> Edit Picture
      </button>

      {/* Mobile First Div */}
      <div className="w-[343px] h-[62px] flex items-center justify-between gap-[37px] p-2 sm:p-4 border rounded-[14px] border-gray-300 md:hidden">
        <span className="text-sm font-semibold">
          {user?.name || "John Doe"}
        </span>
        <button className="p-1 bg-gray-100 rounded hover:bg-gray-200 transition">
          <FiEdit3 />
        </button>
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
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Name:</span>
            <span className="font-medium">{user?.name || "John Doe"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email:</span>
            <span className="font-medium">
              {user?.email || "johndoe@example.com"}
            </span>
          </div>
          <div className="flex justify-between">
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
