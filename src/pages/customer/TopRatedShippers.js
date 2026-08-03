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

const TopRatedShippers = ({ dashboardMode = false }) => {
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
    const searchText = search.trim().toLowerCase();
    const areaText = (s.preferredAreas || [])
      .map((area) => `${area.locationName || ""} ${area.radiusKm || ""}`)
      .join(" ");
    const matchesSearch =
      !searchText ||
      [
        s.name,
        s.companyName,
        s.region,
        s.locale?.address,
        areaText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchText);

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
  const shippersToShow = sortedShippers.slice(0, dashboardMode ? 3 : 6);

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
      <div className="w-full font-montserrat">
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
    <section className="w-full min-w-0 overflow-hidden bg-[#F7F5F1] font-montserrat">
      {/* ===================== HEADER + FILTERS ===================== */}
      <div className="mb-5 bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6 md:px-6">
        <div className="grid items-center gap-5 lg:grid-cols-[320px_1fr_auto]">
          <div>
            <h1 className="text-[24px] font-semibold leading-[35px] text-[#111827] font-montserrat">
              Top Rated Shippers
            </h1>
            <p className="mt-3 max-w-[338px] font-montserrat text-[10px] font-bold uppercase leading-[20px] tracking-[0.2em] text-[#BF9B53]">
              Discover the most trusted and reliable shippers in our network
            </p>
          </div>

          <div className="relative">
            <HiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by shipper name, city, state, or coverage area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full border-0 bg-[#F0F1F4] pl-11 pr-4 text-[13px] font-medium text-[#111827] outline-none transition focus:ring-2 focus:ring-[#BF9B53]/30"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex h-10 items-center justify-center gap-2 px-4 text-[11px] font-bold uppercase tracking-wide transition sm:hidden ${showFilters || hasActiveFilters
                  ? "bg-[#BF9B53] text-white"
                  : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                }`}
              type="button"
            >
              <FiFilter size={16} />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 inline-flex h-5 w-5 items-center justify-center bg-white text-xs font-bold text-[#BF9B53]">
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

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 border-0 bg-[#F3F4F6] px-4 text-[10px] font-bold uppercase tracking-wide text-[#BF9B53] outline-none transition focus:ring-2 focus:ring-[#BF9B53]/30"
            >
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="name">Name (A-Z)</option>
            </select>

            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="h-10 border-0 bg-[#F3F4F6] px-4 text-[10px] font-bold uppercase tracking-wide text-[#374151] outline-none transition focus:ring-2 focus:ring-[#BF9B53]/30"
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
          <div className="mt-5 border-t border-gray-200 pt-4 sm:hidden space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Rating */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
                  Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300  text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#BF9B53]/30"
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
          <div className="mb-5">
            <p className="text-[14px] font-medium text-[#667085]">
              Showing{" "}
              <span className="font-bold text-[#344054]">
                {shippersToShow.length} of {filteredShippers.length} shippers
              </span>
            </p>
          </div>

          {/* ===================== SHIPPER CARDS GRID ===================== */}
          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
                  preferredAreas: shipper.preferredAreas,
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
    </section>
  );
};

export default TopRatedShippers;
