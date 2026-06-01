import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Profile from "./Profile";
import Payment from "./Payment";
import CustomerNotifications from "./CustomerNotifications";
import {
  MdCreditCard,
  MdOutlineNotificationsActive,
  MdPersonOutline,
} from "react-icons/md";

// Tabs
const tabs = [
  { id: "profile", label: "Profile", icon: MdPersonOutline },
  {
    id: "notification",
    label: "Notifications",
    icon: MdOutlineNotificationsActive,
  },
  { id: "payment", label: "Payments", icon: MdCreditCard },
];

const CustomerSettings = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tab = query.get("tab");
    if (tab && tabs.some((t) => t.id === tab)) setActiveTab(tab);
  }, [location.search]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "payment":
        return <Payment />;
      case "notification":
        return <CustomerNotifications />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col font-montserrat">
      {/* Tabs */}
      <div className="border-b border-[#D8C8A8] bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`relative flex min-h-[48px] items-center justify-center gap-2 border-b-2 px-3 py-2 text-[13px] font-semibold transition-all duration-200 sm:min-h-[56px] sm:text-[14px] lg:text-[15px] ${
                  isActive
                    ? "border-[#BF9B53] text-[#BF9B53]"
                    : "border-transparent text-[#344054] hover:border-[#E7D7B7] hover:text-[#111827]"
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-[#BF9B53]" : "text-[#667085]"}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4 text-sm sm:text-base md:text-lg lg:text-xl">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CustomerSettings;
