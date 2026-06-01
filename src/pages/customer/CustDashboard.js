import React from "react";
import { useNavigate } from "react-router-dom";
import { TbCalendarTime } from "react-icons/tb";

import { useAuth } from "../../contexts/AuthContext";
import MyUpcomingShipments from "./MyUpcomingShipments";
import TopRatedShippers from "./TopRatedShippers";
import Button from "../../components/common/Button";
import logo from "../../assets/images/mobileLogo.png";

const CustDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  // Get user display name from API response structure
  const getUserDisplayName = () => {
    if (!user) return "Customer";
    // API returns firstName and lastName separately
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    // Fallback to firstName only
    if (user.firstName) {
      return user.firstName;
    }
    // Fallback to name if it exists
    if (user.name) {
      return user.name;
    }
    return "Customer";
  };

  const handleStartShipment = () => {
    navigate("/customer/new-shipment");
  };

 return (
  <div className="mx-auto flex w-full max-w-[1540px] min-w-0 flex-col gap-5 overflow-hidden font-[Montserrat] sm:gap-6 lg:gap-7">
    <section className="grid w-full min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,640px)]">
      <div className="min-w-0 self-center">
        <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
          <TbCalendarTime size={16} className="shrink-0 text-[#BF9B53]" />

          <span className="whitespace-nowrap text-[10px] font-semibold uppercase leading-[18px] text-[#4B5563] sm:text-[11px] md:text-[12px]">
            {dayName}, {fullDate}
          </span>

          <div className="flex min-w-[80px] flex-1 items-center overflow-hidden sm:min-w-[120px]">
            <span className="h-px w-full bg-[#BF9B53]" />
            <span className="-ml-px h-[5px] w-[5px] shrink-0 rounded-full bg-[#BF9B53] sm:h-[6px] sm:w-[6px]" />
          </div>
        </div>

        <h1 className="break-words text-[24px] font-semibold leading-[34px] text-[#111827] xs:text-[26px] sm:text-[32px] sm:leading-[44px] md:text-[36px] md:leading-[50px]">
          {getGreeting()}, {getUserDisplayName()}
        </h1>

        <p className="mt-2 text-[9px] font-bold uppercase leading-[18px] tracking-[0.12em] text-[#BF9B53] sm:mt-3 sm:text-[10px] sm:leading-[20px] sm:tracking-[0.2em]">
          Track your shipments and manage opportunities
        </p>
      </div>

      <aside className="flex min-w-0 flex-col gap-4 bg-white px-4 py-5 shadow-sm sm:px-6 md:flex-row md:items-center md:justify-between md:gap-5 md:px-7">
        <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
          <div className="h-14 w-16 shrink-0 sm:h-16 sm:w-20">
            <img
              src={logo}
              alt="Logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="min-w-0 ">
            <h2 className="break-words text-[20px] font-bold leading-[28px] text-[#BF9B53] sm:text-[26px] sm:leading-[34px] lg:text-[30px] lg:leading-[40px]">
              Ready to ship something?
            </h2>

            <p className="mt-1 text-[9px] font-semibold uppercase leading-[16px] tracking-[0.08em] text-[#6B7280] sm:mt-2 sm:text-[10px] sm:leading-[18px] md:whitespace-nowrap md:tracking-[0.12em]">
              Get started with your first shipment in just a few clicks
            </p>
          </div>
        </div>

        <Button
          variant="custom"
          bgColor="#BF9B53"
          textColor="#ffffff"
          hoverBgColor="#A8843F"
          onClick={handleStartShipment}
          className="h-[42px] w-full shrink-0 rounded-[5px] px-4 text-[11px] font-bold uppercase tracking-normal sm:w-auto sm:min-w-[210px] md:h-[45px] md:min-w-[227px] md:text-[14px]"
        >
          <span className="flex items-center justify-center gap-2 whitespace-nowrap">
            <svg
              className="h-4 w-4 shrink-0 md:h-[18px] md:w-[18px]"
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

            <span>START NEW SHIPMENT</span>
          </span>
        </Button>
      </aside>
    </section>

    <MyUpcomingShipments />

    <TopRatedShippers dashboardMode />
  </div>
);
};

export default CustDashboard;
