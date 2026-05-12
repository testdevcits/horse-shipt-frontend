import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdNavigateNext, MdClose } from "react-icons/md";
import { HiSearch } from "react-icons/hi";
import { FiFilter } from "react-icons/fi";
import { LuTrendingUp } from "react-icons/lu";

import ShipperReviewCard from "../../components/common/ShipperReviewCard";
import { useReview } from "../../contexts/customerContext/ReviewContext";
import PageLoader from "../../components/common/PageLoader";

/**
 * ============================================================
 * TOP RATED SHIPPERS PAGE - MODERN VERSION
 * Advanced filters, responsive design, empty states
 * ============================================================
 */

const TopRatedShippers = () => {
  const navigate = useNavigate();
  const { topRatedShippers, topShippersLoading, fetchTopRatedShippers } =
    useReview();

  // ===================== STATE =====================
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("rating"); // rating, name, reviews
  const [showFilters, setShowFilters] = useState(false);
  const [transportType, setTransportType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [responseTime, setResponseTime] = useState("");
  const [priceRange, setPriceRange] = useState("");

  // ===================== LOAD DATA =====================
  useEffect(() => {
    fetchTopRatedShippers();
  }, [fetchTopRatedShippers]);

  // ===================== FILTER & SORT LOGIC =====================
  const filteredShippers = topRatedShippers.filter((s) => {
    // Search filter
    const matchesSearch = (s.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    // Rating filter
    const matchesRating = s.rating >= minRating;

    // Transport type filter
    const matchesTransport =
      !transportType || s.transportType === transportType;

    // Experience level filter
    const matchesExperience =
      !experienceLevel || s.experienceLevel === experienceLevel;

    // Response time filter
    const matchesResponseTime =
      !responseTime || s.responseTime === responseTime;

    // Price range filter
    const matchesPriceRange = !priceRange || s.priceRange === priceRange;

    return (
      matchesSearch &&
      matchesRating &&
      matchesTransport &&
      matchesExperience &&
      matchesResponseTime &&
      matchesPriceRange
    );
  });

  // ===================== SORT LOGIC =====================
  const sortedShippers = [...filteredShippers].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "reviews":
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      default:
        return 0;
    }
  });

  // Show first 6 after filtering
  const shippersToShow = sortedShippers.slice(0, 6);

  // ===================== HANDLERS =====================
  const handleSeeAll = () => {
    navigate("/customer/all-shippers");
  };

  const resetFilters = () => {
    setSearch("");
    setMinRating(0);
    setTransportType("");
    setExperienceLevel("");
    setResponseTime("");
    setPriceRange("");
    setSortBy("rating");
  };

  // Check if any filters are active
  const hasActiveFilters =
    search ||
    minRating > 0 ||
    transportType ||
    experienceLevel ||
    responseTime ||
    priceRange;

  // ===================== LOADING STATE =====================
  if (topShippersLoading) {
    return (
      <PageLoader
        text="Loading Top Rated Shippers..."
        fullScreen={false}
        color="#BF9B53"
      />
    );
  }

  // ===================== EMPTY STATE =====================
  if (topRatedShippers.length === 0) {
    return (
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="font-montserrat font-bold text-3xl md:text-4xl text-gray-900">
            Top Rated Shippers
          </h1>
          <p className="text-gray-600 text-base">
            Discover the most trusted and reliable shippers in our network
          </p>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-6">
              <LuTrendingUp size={40} className="text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-2">
              No Shippers Available
            </h3>
            <p className="text-gray-600 text-base max-w-md">
              There are no top-rated shippers available at the moment. Please
              check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===================== RENDER =====================
  return (
    <div className="w-full">
      {/* ===================== HEADER ===================== */}
      <div className="mb-8">
        <h1 className="font-montserrat font-bold text-3xl md:text-4xl text-gray-900 mb-2">
          Top Rated Shippers
        </h1>
        <p className="text-gray-600 text-base">
          Discover the most trusted and reliable shippers in our network
        </p>
      </div>

      {/* ===================== SEARCH & FILTERS BAR ===================== */}
      <div className="bg-white rounded-md border border-gray-200 p-4 md:p-6 mb-6 shadow-sm">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <HiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search shipper by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30 focus:border-[#BF9B53] transition-all"
            />
          </div>

          {/* Filter Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`sm:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
              showFilters || hasActiveFilters
                ? "bg-[#BF9B53] text-white border-[#BF9B53]"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            <FiFilter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 bg-white text-[#BF9B53] rounded-full text-xs font-bold">
                {
                  [
                    minRating > 0,
                    transportType,
                    experienceLevel,
                    responseTime,
                    priceRange,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>

          {/* Sort Dropdown (Desktop) */}
          <div className="hidden sm:flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30 focus:border-[#BF9B53] transition-all"
            >
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="name">Name (A-Z)</option>
            </select>

            {/* Rating Filter */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30 focus:border-[#BF9B53] transition-all"
            >
              <option value={0}>All Ratings</option>
              <option value={4}>4+ Stars</option>
              <option value={3}>3+ Stars</option>
              <option value={2}>2+ Stars</option>
            </select>
          </div>
        </div>

        {/* Mobile Filter Panel */}
        {showFilters && (
          <div className="sm:hidden border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Rating */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
                  Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30"
                >
                  <option value={0}>All</option>
                  <option value={4}>4+</option>
                  <option value={3}>3+</option>
                  <option value={2}>2+</option>
                </select>
              </div>

              {/* Transport Type */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
                  Transport
                </label>
                <select
                  value={transportType}
                  onChange={(e) => setTransportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30"
                >
                  <option value="">All Types</option>
                  <option value="Trucking">Trucking</option>
                  <option value="Hauling">Hauling</option>
                  <option value="Local">Local</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
                  Experience
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30"
                >
                  <option value="">All Levels</option>
                  <option value="Expert">Expert</option>
                  <option value="Professional">Professional</option>
                  <option value="Experienced">Experienced</option>
                </select>
              </div>

              {/* Response Time */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
                  Response
                </label>
                <select
                  value={responseTime}
                  onChange={(e) => setResponseTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30"
                >
                  <option value="">Any Time</option>
                  <option value="Very Fast">Very Fast</option>
                  <option value="Fast">Fast</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
                  Price
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30"
                >
                  <option value="">Any Price</option>
                  <option value="Budget">Budget</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                <MdClose size={16} />
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Desktop Filters (Hidden on Mobile) */}
        <div className="hidden sm:flex gap-3 pt-4 border-t border-gray-200 flex-wrap">
          {/* <select
            value={transportType}
            onChange={(e) => setTransportType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30"
          >
            <option value="">All Transport Types</option>
            <option value="Trucking">Trucking</option>
            <option value="Hauling">Hauling</option>
            <option value="Local">Local</option>
          </select>

          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30"
          >
            <option value="">All Experience Levels</option>
            <option value="Expert">Expert</option>
            <option value="Professional">Professional</option>
            <option value="Experienced">Experienced</option>
          </select>

          <select
            value={responseTime}
            onChange={(e) => setResponseTime(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30"
          >
            <option value="">Any Response Time</option>
            <option value="Very Fast">Very Fast</option>
            <option value="Fast">Fast</option>
            <option value="Standard">Standard</option>
          </select> */}

          {/* <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30"
          >
            <option value="">Any Price Range</option>
            <option value="Budget">Budget</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
          </select> */}

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              <MdClose size={16} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ===================== NO RESULTS STATE ===================== */}
      {filteredShippers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-6">
              <HiSearch size={40} className="text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-2">
              No Shippers Found
            </h3>
            <p className="text-gray-600 text-base max-w-md mb-6">
              {hasActiveFilters
                ? "No shippers match your current filters. Try adjusting your criteria."
                : "No shippers available at the moment."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#BF9B53] text-white rounded-lg hover:bg-[#9d7d42] transition-colors font-semibold"
              >
                <MdClose size={18} />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ===================== RESULTS INFO ===================== */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">
              Showing {shippersToShow.length} of {filteredShippers.length}{" "}
              shipper{filteredShippers.length !== 1 ? "s" : ""}
            </p>
            {/* Sort Dropdown (Mobile) */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sm:hidden px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30"
            >
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* ===================== SHIPPER CARDS GRID ===================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {shippersToShow.map((shipper) => (
              <ShipperReviewCard
                key={shipper.id}
                shipper={{
                  id: shipper.id,
                  name: shipper.name,
                  profileImage: shipper.profileImage || "/default-avatar.png",
                  rating: shipper.rating,
                  reviewCount: shipper.reviewCount || 0,
                  reviewText: shipper.reviewText,
                  region: shipper.region,
                  transportType: shipper.transportType,
                  experienceLevel: shipper.experienceLevel,
                  responseTime: shipper.responseTime,
                  priceRange: shipper.priceRange,
                  googleReviewLink: shipper.googleReviewLink,
                }}
              />
            ))}
          </div>

          {/* ===================== SEE ALL BUTTON ===================== */}
          {filteredShippers.length > shippersToShow.length && (
            <div className="flex justify-center pt-4 border-t border-gray-200">
              <button
                onClick={handleSeeAll}
                className="px-8 py-3 font-montserrat font-semibold text-[#BF9B53] hover:text-[#9d7d42] flex items-center gap-2 transition-colors group"
              >
                View All {filteredShippers.length} Shippers
                <MdNavigateNext
                  size={22}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TopRatedShippers;
