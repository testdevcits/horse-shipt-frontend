import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaStar, FaUser } from "react-icons/fa";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE_URL = "https://horse-shipt.vercel.app/api";

const getShipperImage = (shipper) =>
  shipper?.profileImage?.url || shipper?.profileImage || shipper?.profilePicture || "";

const CustomerReviews = () => {
  const { token } = useAuth();
  const [expandedReview, setExpandedReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    axios
      .get(`${API_BASE_URL}/customer/reviews/received`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const normalized = (res.data?.data || []).map((review) => ({
          id: review._id,
          shipmentRef: review.shipmentId?.shipmentCode || "Shipment",
          rating: Number(review.rating || 0),
          title: review.shipperId?.name || review.shipperName || "Shipper",
          comment: review.reviewText || "No written comment provided.",
          date: review.createdAt,
          verified: true,
          shipperImage: getShipperImage(review.shipperId),
        }));

        setReviews(normalized);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [token]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return "0.0";
    return (
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1);
  }, [reviews]);

  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const toggleExpand = (id) => {
    setExpandedReview(expandedReview === id ? null : id);
  };

  const getStarColor = (rating) => {
    if (rating >= 4) return "text-[#BF9B53]";
    if (rating === 3) return "text-yellow-500";
    return "text-red-500";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-3">
      {loading && (
        <p className="text-xs text-[#8B7043] font-semibold">
          Loading reviews...
        </p>
      )}

      {/* Rating Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Overall Rating */}
        <div className="bg-gradient-to-br from-[#BF9B53]/10 to-[#D4AF85]/10 p-4 border border-[#BF9B53]/30">
          <p className="text-xs font-bold text-[#8B7043]">OVERALL RATING</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="text-4xl font-bold text-[#BF9B53]">
              {averageRating}
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  size={14}
                  className={
                    i < Math.round(averageRating)
                      ? "text-[#BF9B53]"
                      : "text-[#BF9B53]/30"
                  }
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-[#8B7043] font-bold mt-2">
            Based on <span className="text-[#BF9B53]">{reviews.length}</span>{" "}
            reviews
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-16">
                <span className="text-xs font-bold text-[#8B7043]">
                  {rating}
                </span>
                <FaStar size={12} className="text-[#BF9B53]" />
              </div>
              <div className="flex-1 h-2 bg-[#BF9B53]/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#BF9B53] to-[#D4AF85] rounded-full transition-all"
                  style={{
                    width: `${
                      reviews.length > 0
                        ? (ratingDistribution[rating] / reviews.length) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="text-xs font-bold text-[#BF9B53] w-6 text-right">
                {ratingDistribution[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-sm font-bold text-[#BF9B53] mb-2">
          All Reviews ({reviews.length})
        </h3>

        <div className="space-y-2">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gradient-to-br from-white to-amber-50/50 border border-[#BF9B53]/30 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <button
                onClick={() => toggleExpand(review.id)}
                className="w-full px-3 py-3 flex items-start gap-3 hover:bg-[#BF9B53]/5 transition-colors text-left"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {review.shipperImage ? (
                    <img
                      src={review.shipperImage}
                      alt={review.title}
                      className="w-10 h-10 rounded-lg object-cover border border-[#BF9B53]/30"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-[#BF9B53]/20 to-[#D4AF85]/20 rounded-lg flex items-center justify-center">
                      <FaUser className="text-[#BF9B53] text-sm" />
                    </div>
                  )}
                </div>

                {/* Review Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={12}
                          className={`${getStarColor(review.rating)} ${
                            i < review.rating ? "opacity-100" : "opacity-30"
                          }`}
                        />
                      ))}
                    </div>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-[#BF9B53] text-sm">
                    {review.title}
                  </h4>

                  <div className="flex items-center gap-2 mt-1 text-xs text-[#8B7043]">
                    <span className="bg-[#BF9B53]/20 px-2 py-0.5 rounded">
                      {review.shipmentRef}
                    </span>
                    <span>•</span>
                    <span>{formatDate(review.date)}</span>
                  </div>
                </div>

                {/* Expand Icon */}
                <div
                  className={`flex-shrink-0 text-[#BF9B53] transition-transform text-sm ${
                    expandedReview === review.id ? "rotate-180" : ""
                  }`}
                >
                  {expandedReview === review.id ? (
                    <HiChevronUp size={16} />
                  ) : (
                    <HiChevronDown size={16} />
                  )}
                </div>
              </button>

              {/* Review Content (Expanded) */}
              {expandedReview === review.id && (
                <div className="px-3 py-3 border-t border-[#BF9B53]/30 bg-gradient-to-b from-[#BF9B53]/5 to-transparent">
                  <p className="text-[#8B7043] text-xs leading-relaxed font-semibold">
                    {review.comment}
                  </p>

                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {reviews.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm text-[#8B7043] font-bold">No reviews yet</p>
          <p className="text-xs text-[#A88A47] mt-1">
            Complete a shipment to leave a review
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerReviews;
