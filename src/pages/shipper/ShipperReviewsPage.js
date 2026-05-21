import React, { useMemo, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useShipperProfile } from "../../contexts/ShipperProfileContext";

const getCustomerImage = (customer) =>
  customer?.profileImage?.url ||
  customer?.profileImage ||
  customer?.profilePicture ||
  "";

const getInitials = (name = "Customer") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C";

const formatDate = (date) => {
  if (!date) return "No date";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const normalizeReview = (review) => {
  const customer = review.customerId || {};
  const reviewerName = customer.name || review.customerName || "Customer";

  return {
    id: review._id || review.id,
    reviewerName,
    reviewerEmail: customer.email || "",
    reviewerImage: getCustomerImage(customer),
    rating: Number(review.rating || 0),
    comment: review.reviewText || review.comment || "",
    date: review.createdAt || review.date,
    source: review.source || "manual",
  };
};

const Stars = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, index) => (
      <FaStar
        key={index}
        size={size}
        className={index < rating ? "text-yellow-400" : "text-gray-300"}
      />
    ))}
  </div>
);

const ReviewerAvatar = ({ review, sizeClass = "h-11 w-11", textClass = "text-sm" }) =>
  review.reviewerImage ? (
    <img
      src={review.reviewerImage}
      alt={review.reviewerName}
      className={`${sizeClass} rounded-full object-cover border border-gray-200`}
    />
  ) : (
    <div
      className={`${sizeClass} rounded-full bg-[#BF9B53]/15 text-[#8B7043] border border-[#BF9B53]/30 flex items-center justify-center font-bold ${textClass}`}
    >
      {getInitials(review.reviewerName)}
    </div>
  );

const ShipperReviewsPage = () => {
  const navigate = useNavigate();
  const { profile } = useShipperProfile();

  const reviews = useMemo(
    () => (profile?.reviews || []).map(normalizeReview),
    [profile?.reviews]
  );

  const [selectedId, setSelectedId] = useState(null);
  const selectedReview =
    reviews.find((review) => review.id === selectedId) || reviews[0] || null;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="w-full min-h-screen font-montserrat">
      <div className="w-full space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#BF9B53] to-[#D4AF77] px-4 sm:px-5 lg:px-6 py-4 sm:py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  Reviews & Ratings
                </h1>
                <div className="flex items-center gap-2 text-white mt-2">
                  <Stars rating={Math.round(Number(averageRating))} />
                  <span className="text-sm sm:text-base font-bold">
                    {averageRating}
                  </span>
                  <span className="text-xs sm:text-sm text-white/85">
                    ({reviews.length})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/shipper/settings?tab=profile")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#BF9B53] shadow-sm transition-all hover:bg-gray-50 active:scale-95"
                title="Back to profile settings"
                aria-label="Back to profile settings"
              >
                <FiArrowLeft size={18} />
              </button>
            </div>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-900">
                  All Reviews
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {reviews.map((review) => {
                  const isActive = selectedReview?.id === review.id;

                  return (
                    <button
                      key={review.id}
                      type="button"
                      onClick={() => setSelectedId(review.id)}
                      className={`w-full text-left p-4 transition-colors ${
                        isActive
                          ? "bg-[#BF9B53]/10"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <ReviewerAvatar review={review} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-gray-900">
                                {review.reviewerName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(review.date)}
                              </p>
                            </div>
                            <Stars rating={review.rating} size={13} />
                          </div>

                          {review.comment && (
                            <p className="mt-2 line-clamp-2 text-xs sm:text-sm text-gray-700">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 lg:p-6">
              <div className="flex items-start gap-4">
                <ReviewerAvatar
                  review={selectedReview}
                  sizeClass="h-16 w-16"
                  textClass="text-lg"
                />
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedReview.reviewerName}
                  </h2>
                  {selectedReview.reviewerEmail && (
                    <p className="break-all text-sm text-gray-500">
                      {selectedReview.reviewerEmail}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <Stars rating={selectedReview.rating} size={16} />
                    <span className="text-sm font-bold text-gray-800">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs font-bold uppercase text-[#BF9B53]">
                    Review Date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {formatDate(selectedReview.date)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs font-bold uppercase text-[#BF9B53]">
                    Source
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize text-gray-800">
                    {selectedReview.source}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase text-[#BF9B53]">
                  Review
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-800">
                  {selectedReview.comment || "No written comment provided."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaStar size={36} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-700 text-sm sm:text-base font-semibold">
              No reviews yet
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Complete your first shipment to receive reviews
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipperReviewsPage;
