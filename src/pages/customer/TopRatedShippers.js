// src/pages/customer/TopRatedShippers.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { MdNavigateNext } from "react-icons/md";

import ShipperReviewCard from "../../components/common/ShipperReviewCard";
import { useReview } from "../../contexts/customerContext/ReviewContext";
import PageLoader from "../../components/common/PageLoader";

const TopRatedShippers = () => {
  const navigate = useNavigate();
  const { topRatedShippers, topShippersLoading, fetchTopRatedShippers } =
    useReview();

  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    fetchTopRatedShippers();
  }, [fetchTopRatedShippers]);

  const filteredShippers = topRatedShippers.filter((s) => {
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      s.rating >= minRating
    );
  });

  // Show only first 3 (after filtering)
  const shippersToShow = filteredShippers.slice(0, 3);

  const handleSeeAll = () => {
    navigate("/allshippers");
  };

  if (topShippersLoading) {
    return (
      <PageLoader text="Loading Top Rated Shippers..." fullScreen={false} />
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex flex-col gap-4">
        {/* Header + Filters Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 w-full">
          {/* Title */}
          <h2 className="font-montserrat font-semibold text-lg text-systemText whitespace-nowrap">
            Top Rated Shippers
          </h2>

          {/* Filters */}
          <div className="flex w-full lg:w-auto gap-3">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search shipper..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9B53]"
              />
            </div>

            {/* Rating Filter */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm min-w-[160px] focus:outline-none focus:ring-2 focus:ring-[#BF9B53]"
            >
              <option value={0}>All Ratings</option>
              <option value={4}>4+ Stars</option>
              <option value={3}>3+ Stars</option>
              <option value={2}>2+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shippersToShow.length > 0 ? (
          shippersToShow.map((shipper) => (
            <ShipperReviewCard
              key={shipper.id}
              shipper={{
                id: shipper.id,
                name: shipper.name,
                profileImage: shipper.profileImage || "/default-avatar.png",
                rating: shipper.rating,
                reviewText: shipper.reviewText,
                region: shipper.region,
              }}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            No shippers found.
          </div>
        )}
      </div>

      {/* See All Button */}
      {filteredShippers.length > shippersToShow.length && (
        <div className="flex gap-4 mt-2">
          <Button
            variant="custom"
            bgColor="transparent"
            borderColor="transparent"
            textColor="#BF9B53"
            rounded={false}
            className="px-6 py-2 font-montserrat flex items-center gap-2"
            onClick={handleSeeAll}
          >
            See All Shippers
            <MdNavigateNext color="#BF9B53" size={20} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TopRatedShippers;
