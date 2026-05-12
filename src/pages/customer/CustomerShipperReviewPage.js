// src/pages/customer/CustomerShipperReviewPage.js
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCustomerReview } from "../../contexts/customerContext/CustomerReviewContext";
import PageLoader from "../../components/common/PageLoader";
import ShipperReviewCard from "../../components/common/ShipperReviewCard";

const CustomerShipperReviewPage = () => {
  const { shipperId } = useParams();
  const { shipperReviews, fetchReviewsByShipper, loading } =
    useCustomerReview();

  useEffect(() => {
    if (shipperId) {
      fetchReviewsByShipper(shipperId);
    }
  }, [shipperId, fetchReviewsByShipper]);

  if (loading) {
    return <PageLoader text="Loading reviews..." />;
  }

  const reviewsArray = shipperReviews?.reviews || [];
  const shipperInfo = shipperReviews?.shipper || null;

  return (
    <div className="w-full font-montserrat">
      {/* ================= PAGE TITLE ================= */}
      <h2 className="text-[16px] font-semibold text-systemText leading-[24px]">
        Shipper Reviews
      </h2>

      {/* ================= GOOGLE REVIEW CARD ================= */}
      {shipperInfo?.googleReviewLink && (
        <div className="flex justify-start mb-8 mt-8">
          <div className="w-full max-w-xl border border-system-primary bg-system-primary/10 rounded-xl p-5 shadow-sm">
            {shipperInfo?.name && (
              <h3 className="font-semibold text-lg mb-2">
                <span className="text-system-primary">{shipperInfo.name}</span>{" "}
                Reviews
              </h3>
            )}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              You can check{" "}
              <span className="text-system-primary font-medium">
                {shipperInfo?.name || "shipper"}
              </span>{" "}
              reputation by reading Google reviews. If you want, you can also
              share your experience by writing a review.
            </p>
            <div className="flex justify-start sm:justify-end">
              <a
                href={shipperInfo.googleReviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-2 bg-system-primary text-white rounded-lg text-sm hover:opacity-90 transition"
              >
                View / Write Google Review
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= CUSTOMER REVIEWS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(reviewsArray) && reviewsArray.length > 0 ? (
          reviewsArray.map((review) => {
            const customer = review.customerId; // Use customerId from API

            return (
              <ShipperReviewCard
                key={review._id}
                shipper={{
                  id: review._id,
                  name: customer?.name || "Anonymous",
                  profileImage:
                    customer?.profileImage?.url || "/default-avatar.png",
                  rating: review.rating || 0,
                  reviewText: review.reviewText || "No review provided",
                  region: "Unknown", // API doesn’t provide region
                }}
              />
            );
          })
        ) : shipperInfo?.googleReviewLink ? (
          <ShipperReviewCard
            shipper={{
              id: shipperInfo._id || shipperId,
              name: shipperInfo.name || "Shipper",
              profileImage:
                shipperInfo.profileImage?.url ||
                shipperInfo.profilePicture ||
                "/default-avatar.png",
              rating: shipperInfo.averageRating || 0,
              reviewCount: 0,
              region: shipperInfo.locale?.address || "Available",
              googleReviewLink: shipperInfo.googleReviewLink,
            }}
          />
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            No customer reviews found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerShipperReviewPage;
