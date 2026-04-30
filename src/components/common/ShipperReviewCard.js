import React, { useState } from "react";
import { GoStar } from "react-icons/go";
import { MdFavoriteBorder, MdFavorite, MdChat } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { FaTruck, FaUser, FaClock, FaDollarSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/**
 * ============================================================
 * MODERN SHIPPER REVIEW CARD
 * With chat button, favorites, and additional fields
 * ============================================================
 */

const ShipperReviewCard = ({ shipper }) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);

  /**
   * ================= HANDLERS =================
   */
  const handleClick = () => {
    navigate(`/customer/shipper-profile/${shipper.id}`);
  };

  const handleChat = (e) => {
    e.stopPropagation();
    navigate(`/customer/chats/${shipper.id}`);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
   
  };

  /**
   * ================= GENERATE STARS =================
   */
  const generateStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <GoStar
          key={`full-${i}`}
          className="text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 fill-current"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-4 h-4 sm:w-5 sm:h-5">
          <GoStar className="text-gray-300 w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          <div className="absolute top-0 left-0 overflow-hidden w-2 h-4 sm:w-2.5 sm:h-5">
            <GoStar className="text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          </div>
        </div>
      );
    }

    while (stars.length < 5) {
      stars.push(
        <GoStar
          key={`empty-${stars.length}`}
          className="text-gray-300 w-4 h-4 sm:w-5 sm:h-5 fill-current"
        />
      );
    }

    return stars;
  };

  return (
    <div
      onClick={handleClick}
      className="group w-full h-full bg-white rounded-md border border-gray-200 hover:border-[#BF9B53] p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
    >
      {/* ===================== TOP SECTION - PROFILE & ACTIONS ===================== */}
      <div className="flex items-start justify-between gap-3 mb-4">
        {/* Left: Profile Image + Name + Rating */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Profile Image */}
          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-[#BF9B53] transition-colors">
            <img
              src={shipper.profileImage || "/default-avatar.png"}
              alt={shipper.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name + Rating */}
          <div className="flex-1 min-w-0">
            <h3 className="font-montserrat font-bold text-sm sm:text-base text-gray-900 truncate mb-1">
              {shipper.name || "Anonymous"}
            </h3>

            {/* Rating Stars */}
            <div className="flex items-center gap-1.5 mb-1">
              <div className="flex items-center gap-0.5">
                {generateStars(Number(shipper.rating || 0))}
              </div>
              <span className="text-yellow-500 font-bold text-xs sm:text-sm">
                {(shipper.rating || 0).toFixed(1)}/5
              </span>
              {shipper.reviewCount > 0 && (
                <span className="text-gray-500 text-xs sm:text-sm">
                  ({shipper.reviewCount})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="p-2 rounded-full hover:bg-red-50 transition-colors"
            title="Add to favorites"
          >
            {isFavorited ? (
              <MdFavorite size={20} className="text-red-500" />
            ) : (
              <MdFavoriteBorder
                size={20}
                className="text-gray-400 group-hover:text-red-400"
              />
            )}
          </button>

          {/* Chat Button */}
          <button
            onClick={handleChat}
            className="p-2 rounded-full bg-[#BF9B53]/10 hover:bg-[#BF9B53]/20 transition-colors"
            title="Send message"
          >
            <MdChat size={20} className="text-[#BF9B53]" />
          </button>
        </div>
      </div>

      {/* ===================== REVIEW TEXT ===================== */}
      <p className="text-sm sm:text-base text-gray-700 font-montserrat line-clamp-3 mb-4 flex-grow">
        {shipper.reviewText ||
          "A professional and reliable shipper with excellent service."}
      </p>

      {/* ===================== DIVIDER ===================== */}
      <div className="h-px bg-gray-200 mb-4" />

      {/* ===================== INFO GRID ===================== */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs sm:text-sm">
        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600">
          <IoLocationOutline
            size={16}
            className="text-[#BF9B53] flex-shrink-0"
          />
          <span className="truncate">{shipper.region || "N/A"}</span>
        </div>

        {/* Transport Type */}
        {shipper.transportType && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaTruck size={14} className="text-[#BF9B53] flex-shrink-0" />
            <span className="truncate text-xs">{shipper.transportType}</span>
          </div>
        )}

        {/* Experience Level */}
        {shipper.experienceLevel && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaUser size={14} className="text-[#BF9B53] flex-shrink-0" />
            <span className="truncate text-xs">{shipper.experienceLevel}</span>
          </div>
        )}

        {/* Response Time */}
        {shipper.responseTime && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaClock size={14} className="text-[#BF9B53] flex-shrink-0" />
            <span className="truncate text-xs">{shipper.responseTime}</span>
          </div>
        )}

        {/* Price Range */}
        {shipper.priceRange && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaDollarSign size={14} className="text-[#BF9B53] flex-shrink-0" />
            <span className="truncate text-xs">{shipper.priceRange}</span>
          </div>
        )}
      </div>

      {/* ===================== BADGES ===================== */}
      <div className="flex flex-wrap gap-2">
        {shipper.rating >= 4.5 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            ⭐ Top Rated
          </span>
        )}
        {shipper.responseTime === "Very Fast" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            ⚡ Quick Response
          </span>
        )}
        {shipper.experienceLevel === "Expert" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            ✓ Expert
          </span>
        )}
      </div>
    </div>
  );
};

export default ShipperReviewCard;
