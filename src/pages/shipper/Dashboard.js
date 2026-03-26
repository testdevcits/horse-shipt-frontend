import React from "react";
import { useNavigate } from "react-router-dom";
import { FiTruck, FiFileText, FiZap } from "react-icons/fi";
import { TbCalendarTime } from "react-icons/tb";

import { useShipperProfile } from "../../contexts/ShipperProfileContext";
import { useAuth } from "../../contexts/AuthContext";

import Button from "../../components/common/Button";
import NewOpportunities from "./NewOpportunities";
import PageLoader from "../../components/common/PageLoader";

const Dashboard = () => {
  const { profile, loading } = useShipperProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  const upcomingShipmentsCount = 1;
  const submittedQuotesCount = 1;

  const formatCount = (count) => String(count).padStart(2, "0");

  // Date helpers
  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" }); // e.g. "Monday"
  const fullDate = now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }); // e.g. "25 March 2026"

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
    <div className="flex flex-col font-[Montserrat] gap-6 md:gap-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
            {getGreeting()}, {profile?.name || user?.name || "Shipper"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Here's what's happening with your shipments today
          </p>
        </div>

        {/* DATE BADGE */}
        <div className="flex items-center gap-2 w-full sm:w-auto bg-[#BF9B53]/10 border border-[#BF9B53]/20 rounded-md px-4 py-2.5">
          <TbCalendarTime size={18} className="text-[#BF9B53]" />

          <div className="flex flex-row sm:flex-col items-center sm:items-start gap-1 sm:gap-0 leading-tight">
            <span className="text-[#BF9B53] font-bold text-sm">{dayName}</span>
            <span className="text-gray-500 text-xs">{fullDate}</span>
          </div>
        </div>
      </div>

      {/* ================= CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* UPCOMING SHIPMENTS */}
        <div className="flex flex-col justify-between p-5 rounded-md border-2 border-[#BF9B53] shadow-sm hover:shadow-md  transition bg-white">
          <div className="flex justify-between items-center">
            <div className="p-2 bg-[#BF9B53]/10 rounded-lg text-[#BF9B53]">
              <TbCalendarTime size={20} />
            </div>
          </div>

          <h2 className="text-sm font-semibold text-gray-500 mt-4">
            UPCOMING SHIPMENTS
          </h2>

          <div className="flex justify-between items-end mt-3">
            <p className="text-4xl md:text-5xl font-bold text-[#BF9B53]">
              {formatCount(upcomingShipmentsCount)}
            </p>

            <Button
              variant="custom"
              borderColor="#BF9B53"
              textColor="#BF9B53"
              hoverBgColor="#BF9B53"
              hoverTextColor="#ffffff"
              icon={<FiTruck size={16} />}
              onClick={() => navigate("/shipper/shipments")}
              className="text-xs sm:text-sm"
            >
              View
            </Button>
          </div>
        </div>

        {/* SUBMITTED QUOTES */}
        <div className="flex flex-col justify-between p-5 rounded-md border-2 border-[#BF9B53] shadow-sm hover:shadow-md transition bg-white">
          <div className="flex justify-between items-center">
            <div className="p-2 bg-[#BF9B53]/10 rounded-lg text-[#BF9B53]">
              <FiZap size={20} />
            </div>
          </div>

          <h2 className="text-sm font-semibold text-gray-500 mt-4">
            SUBMITTED QUOTES
          </h2>

          <div className="flex justify-between items-end mt-3">
            <p className="text-4xl md:text-5xl font-bold text-[#BF9B53]">
              {formatCount(submittedQuotesCount)}
            </p>

            <Button
              variant="custom"
              borderColor="#BF9B53"
              textColor="#BF9B53"
              hoverBgColor="#BF9B53"
              hoverTextColor="#ffffff"
              icon={<FiFileText size={16} />}
              onClick={() => navigate("/shipper/quotes")}
            >
              View
            </Button>
          </div>
        </div>
      </div>

      {/* ================= NEW OPPORTUNITIES ================= */}
      <div className="w-full">
        <NewOpportunities />
      </div>
    </div>
  );
};

export default Dashboard;
