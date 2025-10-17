// src/components/ShipperReviewCard.js
import React from "react";
import { GoStar } from "react-icons/go";
import { MdFavoriteBorder } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const ShipperReviewCard = ({ shipper }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/shipper-profile/${shipper.id}`);
  };

  // Generate stars based on rating
  const generateStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <GoStar key={i} className="text-yellow-500  w-4 h-4 sm:w-5 sm:h-5" />
      );
    }

    if (rating - fullStars >= 0.5) {
      stars.push(
        <GoStar key="half" className="text-yellow-500  w-4 h-4 sm:w-5 sm:h-5" />
      );
    }

    while (stars.length < 5) {
      stars.push(
        <GoStar
          key={`empty-${stars.length}`}
          className="text-gray-300 w-4 h-4 sm:w-5 sm:h-5"
        />
      );
    }

    return stars;
  };

  return (
    <div
      onClick={handleClick}
      className="w-full h-auto p-3 border border-gray-300 rounded-[14px] bg-system-background cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      {/* Inner Row: Profile + Details + Favorite */}
      <div className="flex flex-row items-center gap-3">
        {/* Profile Image */}
        <div className="flex-shrink-0 w-[50px] h-[50px] rounded-full overflow-hidden">
          <img
            src={shipper.profileImage}
            alt={shipper.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col justify-center gap-1 w-full min-w-0">
          <div className="font-montserrat font-semibold text-sm sm:text-base text-systemText truncate">
            {shipper.name}
          </div>

          {/* Stars + Numeric Rating */}
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {generateStars(Number(shipper.rating))}
            <span className="text-yellow-500 font-medium text-xs sm:text-sm ml-1">
              {shipper.rating}/5
            </span>
          </div>
        </div>

        {/* Favorite Icon */}
        <div className="flex-shrink-0 flex justify-end items-center w-[42px] h-[42px]">
          <MdFavoriteBorder size={24} className="text-yellow-500" />
        </div>
      </div>

      {/* Shipments + Region */}
      <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm text-gray-600 flex-wrap">
        {/* Shipments */}
        <span className="font-medium">{shipper.shipments || 80} Shipments</span>

        {/* Region */}
        <div className="flex items-center gap-1">
          <IoLocationOutline
            size={16}
            className="text-gray-500"
            style={{
              width: "21.33px", // 5.3333 * 4 (adjust scale for tailwind)
              height: "21.33px",
              top: "4px",
              left: "5.33px",
              opacity: 1,
            }}
          />
          <span>{shipper.region || "Region Name"}</span>
        </div>
      </div>
    </div>
  );
};

export default ShipperReviewCard;
