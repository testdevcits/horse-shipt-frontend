import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TbCalendarTime } from "react-icons/tb";

import { useAuth } from "../../contexts/AuthContext";
import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";
import MyUpcomingShipments from "./MyUpcomingShipments";
import TopRatedShippers from "./TopRatedShippers";
import Button from "../../components/common/Button";
import logo from "../../assets/images/mobileLogo.png";

const CustDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { shipments, fetchShipments, loading } = useCustomerShipments();

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

  const handleStartShipment = () => {
    navigate("/customer/new-shipment");
  };

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  return (
    <div className="flex flex-col font-[Montserrat] gap-6 md:gap-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
            {getGreeting()}, {user?.name || "Customer"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Here's what's happening with your shipments today
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto bg-[#BF9B53]/10 border border-[#BF9B53]/20 rounded-md px-4 py-2.5">
          <TbCalendarTime size={18} className="text-[#BF9B53]" />
          <div className="flex flex-row sm:flex-col items-center sm:items-start gap-1 sm:gap-0 leading-tight">
            <span className="text-[#BF9B53] font-bold text-sm">{dayName}</span>
            <span className="text-gray-500 text-xs">{fullDate}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full bg-gradient-to-br from-white via-gray-50 to-white border border-gray-100 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#BF9B53]/5 to-[#8B7D4A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-[#BF9B53]/10 to-[#8B7D4A]/10 rounded-3xl blur-xl animate-pulse" />
        <div className="absolute -bottom-6 left-8 w-16 h-16 bg-gradient-to-tr from-blue-100/50 to-indigo-100/30 rounded-2xl blur-xl animate-bounce [animation-delay:1s]" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center gap-6">
          {/* Logo */}
          <div className="relative group/logo">
            <div className="w-20 h-16 bg-gradient-to-br from-[#BF9B53] to-[#8B7D4A] rounded-2xl p-2 shadow-2xl group-hover/logo:scale-110 transition-all duration-300">
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#BF9B53] to-[#8B7D4A] rounded-2xl blur-xl opacity-30 group-hover/logo:opacity-50 transition-opacity duration-300 -z-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#BF9B53] via-[#8B7D4A] to-gray-700 bg-clip-text text-transparent drop-shadow-lg">
              Ready to ship something?
            </h2>
            <p className="text-sm text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
              Get started with your first shipment in just a few clicks
            </p>
          </div>

          <div className="relative">
            <Button
              variant="custom"
              bgColor="transparent"
              textColor="#1F2937"
              hoverBgColor="transparent"
              className="group/btn relative px-8 py-4 text-base font-semibold bg-white/80 backdrop-blur-xl border-2 border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl hover:border-[#BF9B53]/50 hover:bg-white/100 transition-all duration-300 overflow-hidden transform hover:-translate-y-1 hover:scale-[1.02]"
              onClick={handleStartShipment}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#BF9B53]/0 via-[#BF9B53]/20 to-[#8B7D4A]/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-[100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Start New Shipment
              </span>
            </Button>
            <div className="absolute -inset-2 bg-gradient-to-r from-[#BF9B53]/20 to-[#8B7D4A]/20 rounded-3xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 -z-10 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <MyUpcomingShipments shipments={shipments} loading={loading} />
        <div className="w-full border-2 border-t border-[#BF9B53]"></div>
        <TopRatedShippers />
      </div>
    </div>
  );
};

export default CustDashboard;
