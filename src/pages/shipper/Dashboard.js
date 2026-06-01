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
    <div className="flex flex-col gap-5 font-montserrat sm:gap-6">
      {/* HEADER + STAT CARDS */}
      <div className=" grid gap-4 xl:grid-cols-[minmax(280px,1fr)_minmax(240px,350px)_minmax(240px,350px)] xl:items-start">
        {/* GREETING */}
        <div className="min-w-0 py-1">
          <div className="flex items-center gap-2">
            <TbCalendarTime className="text-[#735D32]" size={16} />
            <p className="whitespace-nowrap text-[11px] font-bold uppercase leading-[16px] text-[#4B5563]">
              {dayName}, {fullDate}
            </p>
            <span className="hidden h-px min-w-[70px] flex-1 bg-[#BF9B53] sm:block" />
            <span className="hidden h-[6px] w-[6px] rounded-full bg-[#BF9B53] sm:block" />
          </div>

          <h1 className="mt-2 text-[24px] font-semibold leading-[32px] text-[#111827] sm:text-[28px] sm:leading-[36px]">
            {getGreeting()}, {profile?.name || user?.name || "Shipper"}
          </h1>

          <p className="mt-2 text-[9px] font-bold uppercase leading-[14px] tracking-[0.32em] text-[#BF9B53]">
            Track your shipments and manage opportunities
          </p>
        </div>

        {/* UPCOMING SHIPMENTS */}
        <div
          onClick={() => navigate("/shipper/shipments")}
          className="group min-h-[80px] cursor-pointer bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md sm:min-h-[90px] sm:px-5"
        >
          <div className="mb-1 flex items-start justify-between">
            <p className="text-[10px] font-bold uppercase leading-[16px] text-[#4B5563]">
              Upcoming Shipments
            </p>
            <FiArrowRight className="text-gray-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#735D32]" />
          </div>

          <div className="flex items-end justify-between gap-4">
            <p className="text-[38px] font-bold leading-none text-system-primary sm:text-[42px]">
              {formatCount(upcomingShipmentsCount)}
            </p>
            <span className="flex h-[38px] w-[38px] items-center justify-center rounded border border-gray-100 bg-[#FBFAF7] text-[#735D32] sm:h-[40px] sm:w-[40px]">
              <FiTruck size={22} />
            </span>
          </div>
        </div>

        {/* SUBMITTED QUOTES */}
        <div
          onClick={() => navigate("/shipper/quotes")}
          className="group min-h-[80px] cursor-pointer bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md sm:min-h-[90px] sm:px-5"
        >
          <div className="mb-1 flex items-start justify-between">
          <p className="mb-1 text-[10px] font-bold uppercase leading-[16px] text-[#4B5563]">
            Submitted Quotes
          </p>
          <FiArrowRight className="text-gray-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#735D32]" />
          </div>

          <div className="flex items-end justify-between gap-4">
            <p className="text-[38px] font-bold leading-none text-system-primary sm:text-[42px]">
              {formatCount(submittedQuotesCount)}
            </p>
            <span className="flex h-[38px] w-[38px] items-center justify-center rounded border border-gray-100 bg-[#FBFAF7] text-[#735D32] sm:h-[40px] sm:w-[40px]">
              <FiFileText size={21} />
            </span>
          </div>
        </div>
      </div>

      {/* OPPORTUNITIES */}
      <NewOpportunities />
    </div>
  );
};

export default Dashboard;
