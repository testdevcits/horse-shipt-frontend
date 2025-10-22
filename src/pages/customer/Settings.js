import React, { useState } from "react";
import Profile from "./Profile";

const CustomerSettings = () => {
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "notification", label: "Notifications" },
    { id: "payment", label: "Payments" },
  ];

  const [activeTab, setActiveTab] = useState("profile");

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "payment":
        return (
          <p className="text-sm sm:text-base md:text-lg lg:text-xl">
            Payment settings content goes here.
          </p>
        );
      case "notification":
        return (
          <p className="text-sm sm:text-base md:text-lg lg:text-xl">
            Notification settings content goes here.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Tabs */}
      <div className="w-full mb-6 mt-6 overflow-x-auto">
        <div className="flex flex-nowrap gap-2 sm:gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 transition-colors duration-200 font-montserrat font-semibold text-sm sm:text-base md:text-lg
                ${
                  activeTab === tab.id
                    ? "text-system-primary border-b-[1px] border-system-primary"
                    : "text-gray-600 border-b-[1px] border-gray-300 hover:text-gray-900"
                }`}
              style={{
                minWidth: "100px", // minimum width per tab
                padding: "0 16px",
                height: "36px",
                opacity: 1,
                transform: "rotate(0deg)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-sm min-h-[200px] text-sm sm:text-base md:text-lg lg:text-xl">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CustomerSettings;
