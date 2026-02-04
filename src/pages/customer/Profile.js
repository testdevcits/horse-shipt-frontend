import React, { useState, useRef } from "react";
import { HiPencil } from "react-icons/hi";
import { FaStar } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../contexts/customerContext/ProfileContext";
import CustomerReviews from "./CustomerReviews";

const CustomerProfile = () => {
  const { user } = useAuth();
  const { profileImage, updateProfileImage, loading } = useProfile();
  const [error, setError] = useState(null);
  const profileInputRef = useRef(null);

  // Handle profile image change
  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await updateProfileImage(file, user.token); // JWT token
      setError(null);
      alert("Profile image updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update profile image");
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      {/* Profile Image Section */}
      <div className="relative">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex-shrink-0">
          <img
            src={
              profileImage?.url ||
              user?.photo ||
              "https://via.placeholder.com/150"
            }
            alt="Profile"
            className={`w-full h-full object-cover rounded-full border ${
              loading ? "opacity-50" : ""
            }`}
          />
          <button
            disabled={loading}
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
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      {/* Shipments & Rating Card */}
      <div className="w-full bg-white flex items-center justify-between px-4 py-3 border rounded-[14px] border-gray-300">
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
      <div className="w-full bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-sm flex flex-col gap-3 border rounded-[14px] border-gray-300">
        {/* Header with Edit Button */}
        <div className="flex justify-between items-center">
          <h3 className="font-montserrat font-semibold text-base leading-6 tracking-normal">
            Basic Info
          </h3>
          <button className="p-2 bg-gray-100 rounded-sm hover:bg-gray-200 transition">
            <HiPencil />
          </button>
        </div>

        {/* Info Fields */}
        <div className="flex flex-col w-full gap-3">
          {/* Name */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-2">
            <span className="font-montserrat font-medium text-sm leading-5 tracking-normal text-gray-500">
              Name:
            </span>
            <span className="font-montserrat font-medium text-sm leading-5 tracking-normal text-systemText">
              {user?.name || "John Doe"}
            </span>
          </div>

          {/* Email */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-2">
            <span className="font-montserrat font-medium text-sm leading-5 tracking-normal text-gray-500">
              Email:
            </span>
            <span className="font-montserrat font-medium text-sm leading-5 tracking-normal text-systemText">
              {user?.email || "johndoe@example.com"}
            </span>
          </div>

          {/* Phone */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-2">
            <span className="font-montserrat font-medium text-sm leading-5 tracking-normal text-gray-500">
              Phone:
            </span>
            <span className="font-montserrat font-medium text-sm leading-5 tracking-normal text-systemText">
              {user?.phone || "+91 9876543210"}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Reviews Component */}
      <CustomerReviews />
    </div>
  );
};

export default CustomerProfile;
