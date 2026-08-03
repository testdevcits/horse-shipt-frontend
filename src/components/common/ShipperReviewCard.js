import React, { useState } from "react";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { FaGoogle, FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/images/default-avatar.jpg";

const ShipperReviewCard = ({ shipper }) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);

  const ratingValue = Number(shipper.rating || 0);
  const hasCustomerReviews = Number(shipper.reviewCount || 0) > 0;
  const hasGoogleReviewLink = Boolean(shipper.googleReviewLink);
  const preferredAreas = Array.isArray(shipper.preferredAreas)
    ? shipper.preferredAreas.filter((area) => area?.locationName)
    : [];

  const handleClick = () => {
    navigate(`/customer/shipper-profile/${shipper.id}`);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorited((current) => !current);
  };

  const handleGoogleReviewClick = (e) => {
    e.stopPropagation();
  };

  const renderActionButtons = (className = "") => (
    <div className={`flex flex-wrap items-center gap-1 sm:gap-2 ${className}`}>
      <span className="inline-flex min-h-[28px] items-center gap-1 whitespace-nowrap border border-[#C39A3C] px-1.5 py-1 text-[8px] font-bold uppercase tracking-wide text-[#9A7635] sm:px-2 sm:text-[9px]">
        <FaStar className="h-3 w-3 shrink-0 fill-current" />
        <span>Top Rated</span>
      </span>

      <button
        onClick={handleFavorite}
        type="button"
        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        className="inline-flex min-h-[28px] items-center gap-1 whitespace-nowrap border border-[#FF4E4E] px-1.5 py-1 text-[8px] font-bold uppercase tracking-wide text-[#FF3B3B] transition hover:bg-red-50 sm:px-2 sm:text-[9px]"
      >
        {isFavorited ? (
          <MdFavorite size={13} className="shrink-0 text-[#FF3B3B]" />
        ) : (
          <MdFavoriteBorder size={13} className="shrink-0 text-[#FF3B3B]" />
        )}

        <span>Like</span>
      </button>
    </div>
  );

  const generateStars = (rating) => {
    const stars = [];
    const normalizedRating = Math.max(0, Math.min(5, Number(rating) || 0));
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar
          key={`full-${i}`}
          className="h-3.5 w-3.5 fill-current text-[#C39A3C]"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative h-3.5 w-3.5">
          <FaStar className="h-3.5 w-3.5 fill-current text-[#D1D5DB]" />
          <FaStarHalfAlt className="absolute left-0 top-0 h-3.5 w-3.5 fill-current text-[#C39A3C]" />
        </div>
      );
    }

    while (stars.length < 5) {
      stars.push(
        <FaStar
          key={`empty-${stars.length}`}
          className="h-3.5 w-3.5 fill-current text-[#D1D5DB]"
        />
      );
    }

    return stars;
  };

  return (
    <div
      onClick={handleClick}
      className="group flex h-full min-h-[175px] w-full cursor-pointer flex-col bg-white px-5 py-5 transition-all duration-200 hover:shadow-[0_14px_34px_rgba(17,24,39,0.08)]"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex flex-1 items-start gap-2">
          <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border-[0.5px] border-[#735D32] bg-[#F8F4EA] p-0.5">
            <img
              src={shipper.profileImage || defaultAvatar}
              alt={shipper.name || "Shipper"}
              className="h-full w-full rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = defaultAvatar;
              }}
            />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="mb-1 flex flex-wrap items-center gap-1">
              <div className="flex items-center gap-[1px]">
                {generateStars(ratingValue)}
              </div>
              <span className="text-[10px] font-bold text-[#8B6B2F] ">
                {ratingValue.toFixed(1)}/5
              </span>
              {shipper.reviewCount > 0 && (
                <span className="text-[10px] font-semibold text-[#8B6B2F]">
                  ({String(shipper.reviewCount).padStart(2, "0")})
                </span>
              )}
            </div>

            {renderActionButtons("mt-2 hidden lg:max-xl:flex")}

            <h3 className="mt-1 line-clamp-1 break-words font-montserrat text-[18px] font-medium leading-[30px] text-[#111827]">
              {shipper.name || "Anonymous"}
            </h3>
          </div>
        </div>

        {renderActionButtons("lg:max-xl:hidden")}
      </div>

      {hasCustomerReviews || !hasGoogleReviewLink ? (
        <p className="mb-5 line-clamp-2 flex-grow font-montserrat text-[18px] font-semibold leading-[30px] text-[#111827]">
          {shipper.reviewText ||
            "A professional and reliable shipper with excellent service."}
        </p>
      ) : (
        <div className="mb-4 flex-grow">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-[#374151]">
            <FaGoogle size={14} className="text-[#4285F4]" />
            Google Reviews Available
          </div>
          <div className="bg-[#F3F4F7] px-4 py-3">
            <p className="text-[11px] leading-5 text-[#4B5563]">
              This shipper has not received customer reviews here yet.
            </p>
            <p className="text-[11px] leading-5 text-[#4B5563]">
              View their Google Reviews link to check reputation.
            </p>
            <a
              href={shipper.googleReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGoogleReviewClick}
              className="mt-3 inline-flex h-8 items-center gap-2 bg-[#BF9B53] px-3 text-[11px] font-bold uppercase text-white transition hover:bg-[#9d7d42]"
            >
              View Google Reviews
              <FaExternalLinkAlt size={10} />
            </a>
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-[#E5E7EB] pt-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#9A7635]">
          Location
        </p>
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#4B5563]">
          <IoLocationOutline size={17} className="shrink-0 text-[#9A7635]" />
          <span className="truncate font-montserrat text-[12px] font-semibold leading-[20px] text-[#4B5563]">
            {shipper.region || "Available"}
          </span>
        </div>
        {preferredAreas.length > 0 && (
          <>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-[#9A7635]">
              Coverage Areas
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {preferredAreas.slice(0, 3).map((area) => (
                <span
                  key={area.id || area._id || area.locationName}
                  className="inline-flex items-center bg-[#F5EFE2] px-2 py-1 text-[10px] font-semibold text-[#735D32]"
                >
                  {area.locationName}
                  {area.radiusKm ? ` (${area.radiusKm} km)` : ""}
                </span>
              ))}
              {preferredAreas.length > 3 && (
                <span className="inline-flex items-center bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
                  +{preferredAreas.length - 3} more
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShipperReviewCard;
