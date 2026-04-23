import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiTruck, FiFileText, FiArrowRight } from "react-icons/fi";
import { TbCalendarTime } from "react-icons/tb";

import { useShipperProfile } from "../../contexts/ShipperProfileContext";
import { useAuth } from "../../contexts/AuthContext";
import { useShipperQuote } from "../../contexts/shipperContext/ShipperQuoteContext";

import NewOpportunities from "./NewOpportunities";
import PageLoader from "../../components/common/PageLoader";

const Dashboard = () => {
  const { profile, loading } = useShipperProfile();
  const { user } = useAuth();
  const { quotes, getMyQuotes } = useShipperQuote();
  const navigate = useNavigate();

  useEffect(() => {
    getMyQuotes();
  }, [getMyQuotes]);

  const submittedQuotesCount = quotes.length;
  const upcomingShipmentsCount = quotes.length;

  const formatCount = (count) => String(count).padStart(2, "0");

  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const fullDate = now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getGreeting = () => {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return <PageLoader text="" fullScreen={false} size={28} color="#BF9B53" />;
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6 font-montserrat">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
            {getGreeting()}, {profile?.name || user?.name || "Shipper"}
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#BF9B53] mt-2 p-2">
            Track your shipments and manage opportunities
          </p>
        </div>

        {/* DATE */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 sm:px-4 py-2">
          <TbCalendarTime className="text-system-primary text-base sm:text-lg" />
          <div>
            <p className="text-system-primary font-semibold text-xs sm:text-sm">
              {dayName}
            </p>
            <p className="text-gray-500 text-[11px] sm:text-xs">{fullDate}</p>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* UPCOMING SHIPMENTS */}
        <div
          onClick={() => navigate("/shipper/shipments")}
          className="group bg-white border border-gray-200 p-4 sm:p-5 md:p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300"
        >
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            {/* ICON */}
            <div className="p-2 bg-gray-50 border border-gray-100">
              <FiTruck className="text-system-primary text-lg sm:text-xl md:text-2xl" />
            </div>

            {/* ARROW */}
            <FiArrowRight
              className="text-gray-300 text-sm transition-all duration-200 
              group-hover:text-gray-600 group-hover:translate-x-1"
            />
          </div>

          <p className="text-gray-600 text-[11px] sm:text-xs font-semibold uppercase tracking-wide mb-1 sm:mb-2">
            Upcoming Shipments
          </p>

          <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-system-primary">
            {formatCount(upcomingShipmentsCount)}
          </p>
        </div>

        {/* SUBMITTED QUOTES */}
        <div
          onClick={() => navigate("/shipper/quotes")}
          className="group bg-white border border-gray-200 p-4 sm:p-5 md:p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300"
        >
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            {/* ICON */}
            <div className="p-2 bg-gray-50 border border-gray-100">
              <FiFileText className="text-system-primary text-lg sm:text-xl md:text-2xl" />
            </div>

            {/* ARROW */}
            <FiArrowRight
              className="text-gray-300 text-sm transition-all duration-200 
              group-hover:text-gray-600 group-hover:translate-x-1"
            />
          </div>

          <p className="text-gray-600 text-[11px] sm:text-xs font-semibold uppercase tracking-wide mb-1 sm:mb-2">
            Submitted Quotes
          </p>

          <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-system-primary">
            {formatCount(submittedQuotesCount)}
          </p>
        </div>
      </div>

      {/* OPPORTUNITIES */}
      <NewOpportunities />
    </div>
  );
};

export default Dashboard;
