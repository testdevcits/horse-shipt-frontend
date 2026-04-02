import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Profile from "./Profile";
import Payment from "./Payment";
import CustomerNotifications from "./CustomerNotifications";

// Tabs
const tabs = [
  { id: "profile", label: "Profile" },
  { id: "notification", label: "Notifications" },
  { id: "payment", label: "Payments" },
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
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="border-b border-gray-300">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-center py-3 transition-colors duration-200 font-montserrat font-semibold
                ${
                  activeTab === tab.id
                    ? "text-system-primary border-b-2 border-system-primary"
                    : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"
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
      <div className="mt-4 text-sm sm:text-base md:text-lg lg:text-xl">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CustomerSettings;
