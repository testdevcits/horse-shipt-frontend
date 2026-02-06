// src/pages/customer/Settings.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Profile from "./Profile";
import Payment from "./Payment";
import CustomerNotifications from "./CustomerNotifications";

// Move tabs array outside component to avoid useEffect dependency warning
const tabs = [
  { id: "profile", label: "Profile" },
  { id: "notification", label: "Notifications" },
  { id: "payment", label: "Payments" },
];

const CustomerSettings = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  // Open tab from URL query (like ?tab=notification)
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tab = query.get("tab");

    if (tab && tabs.some((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [location.search]); // ✅ no warning now

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
    <div className="flex flex-col w-full px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Tabs */}
      <div className="w-full mb-6 mt-6">
        <div className="flex justify-between border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-center py-2 sm:py-3 transition-colors duration-200 font-montserrat font-semibold
                ${
                  activeTab === tab.id
                    ? "border-b-[1px] border-system-primary text-system-primary"
                    : "border-b-[1px] border-gray-300 text-gray-600 hover:text-gray-900"
                }
              `}
            >
              <span className="text-sm sm:text-base md:text-lg lg:text-xl">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full text-sm sm:text-base md:text-lg lg:text-xl">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CustomerSettings;
