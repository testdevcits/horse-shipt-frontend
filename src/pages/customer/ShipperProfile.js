// src/pages/customer/ShipperProfile.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReview } from "../../contexts/customerContext/ReviewContext";
import PageLoader from "../../components/common/PageLoader";
import { GoStar } from "react-icons/go";
import { IoArrowBack, IoLocationOutline } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import defaultAvatar from "../../assets/images/default-avatar.jpg";

const ShipperProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { shipperProfile, shipperProfileLoading, fetchShipperProfile } =
    useReview();

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    if (id) {
      fetchShipperProfile(id);
    }
  }, [id, fetchShipperProfile]);

  if (shipperProfileLoading) {
    return <PageLoader text="Loading Shipper Profile..." />;
  }

  const profile = shipperProfile?.data || shipperProfile;

  if (!profile) {
    return (
      <div className="text-center py-10 text-gray-500">Shipper not found</div>
    );
  }

  const renderStars = (rating = 0) => {
    const stars = [];
    const full = Math.floor(rating);

    for (let i = 0; i < full; i++) {
      stars.push(<GoStar key={i} className="text-yellow-500 w-4 h-4" />);
    }

    while (stars.length < 5) {
      stars.push(
        <GoStar key={`e-${stars.length}`} className="text-gray-300 w-4 h-4" />
      );
    }

    return stars;
  };

  // Pagination
  const reviews = profile.reviews || [];
  const indexOfLast = currentPage * reviewsPerPage;
  const indexOfFirst = indexOfLast - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  return (
    <div className="w-full max-w-full mx-auto flex flex-col gap-6 font-montserrat">
      {/* Banner */}
      {profile.bannerImage && (
        <div className="w-full h-[180px] rounded-xl overflow-hidden">
          <img
            src={profile.bannerImage}
            alt="banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white shadow-md rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
        <div className="w-[90px] h-[90px] rounded-full overflow-hidden border">
          <img
            src={profile.profileImage || defaultAvatar}
            alt={profile.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = defaultAvatar;
            }}
          />
        </div>

        <div className="flex-1 flex flex-col gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            {profile.isActive && <FaCheckCircle className="text-green-500" />}
          </div>

          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <div className="flex">{renderStars(profile.rating)}</div>
            <span className="text-yellow-500 font-medium">
              {profile.rating || 0}/5
            </span>
            <span className="text-gray-500 text-sm">
              ({profile.totalReviews || 0} Reviews)
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-600 text-sm justify-center sm:justify-start">
            <IoLocationOutline />
            {profile.region || "Unknown"}
          </div>

          <div className="flex items-center gap-1 text-gray-600 text-sm justify-center sm:justify-start">
            <MdEmail />
            {profile.email}
          </div>

          <div className="text-gray-400 text-xs">
            Joined:{" "}
            {profile.createdAt
              ? new Date(profile.createdAt).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-gray-500 text-sm">Completed Shipments</p>
          <h3 className="text-lg font-semibold">
            {profile.completedShipments || 0}
          </h3>
        </div>

        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-gray-500 text-sm">Total Reviews</p>
          <h3 className="text-lg font-semibold">{profile.totalReviews || 0}</h3>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white p-5 rounded-xl shadow flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>

        {currentReviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews available</p>
        ) : (
          currentReviews.map((review) => (
            <div key={review._id} className="border-b pb-3 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <p className="font-medium">{review.customerName}</p>
                <div className="flex">{renderStars(review.rating)}</div>
              </div>

              <p className="text-gray-600 text-sm">
                {review.reviewText || "No comment"}
              </p>

              <p className="text-gray-400 text-xs">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-3">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Google Reviews */}
      {profile.googleReviewLink && (
        <a
          href={profile.googleReviewLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center font-medium text-gray-600  "
        >
          <span className="hover:text-[#BF9B53] transition duration-200 ease-in-out ">
            View Google Reviews
          </span>
        </a>
      )}

      <button
        onClick={() => navigate(-1)}
        className="fixed bottom-16 right-4 z-40 bg-gray-600 text-white p-3 rounded-full shadow-lg hover:bg-[#BF9B53] transition sm:bottom-20 sm:right-6"
        title="Back"
        aria-label="Back"
      >
        <IoArrowBack className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ShipperProfile;
