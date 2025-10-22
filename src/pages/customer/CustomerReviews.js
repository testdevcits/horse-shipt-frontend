import React from "react";
import { FaStar } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

const CustomerReviews = () => {
  const { user } = useAuth();

  const reviews = [
    {
      id: 1,
      reviewerName: user?.name || "John Doe",
      reviewerPhoto: user?.photo || "https://via.placeholder.com/32",
      rating: 5,
      comment: `Always good to work with ${
        user?.name || "John"
      }, a great customer.`,
      createdAt: "2025-10-20T10:30:00Z",
    },
    {
      id: 2,
      reviewerName: "Alice Johnson",
      reviewerPhoto: "https://via.placeholder.com/32",
      rating: 4,
      comment: "Very good experience, would use again.",
      createdAt: "2025-10-18T12:45:00Z",
    },
    {
      id: 3,
      reviewerName: "Bob Smith",
      reviewerPhoto: "https://via.placeholder.com/32",
      rating: 5,
      comment: "Highly recommend! Great communication.",
      createdAt: "2025-10-15T08:20:00Z",
    },
    {
      id: 4,
      reviewerName: "Eve Adams",
      reviewerPhoto: "https://via.placeholder.com/32",
      rating: 3,
      comment: "Good, but could improve delivery time.",
      createdAt: "2025-10-10T09:10:00Z",
    },
    {
      id: 5,
      reviewerName: "Mark Lee",
      reviewerPhoto: "https://via.placeholder.com/32",
      rating: 4,
      comment: "Satisfied with the service.",
      createdAt: "2025-10-05T14:50:00Z",
    },
  ];

  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Reviews Received</h2>

      {/* Mobile: horizontal scroll | Tablet/Desktop: grid */}
      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-x-visible pb-2">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex-shrink-0 w-72 sm:w-auto bg-white p-4 rounded-lg border border-gray-300 shadow-sm"
          >
            {/* Stars */}
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: review.rating }).map((_, i) => (
                <FaStar key={i} className="text-yellow-500" />
              ))}
              {Array.from({ length: 5 - review.rating }).map((_, i) => (
                <FaStar key={i} className="text-gray-300" />
              ))}
            </div>

            {/* Review Message */}
            <p className="text-gray-700 text-sm sm:text-base mb-2">
              {review.comment}
            </p>

            {/* Reviewer Info */}
            <div className="flex items-center gap-2 mt-2">
              <img
                src={review.reviewerPhoto}
                alt={review.reviewerName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="font-medium text-sm sm:text-base">
                  {review.reviewerName}
                </span>
                <span className="text-gray-400 text-xs sm:text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerReviews;
