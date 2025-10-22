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
          <p className="text-base sm:text-lg">
            Payment settings content goes here.
          </p>
        );
      case "notification":
        return (
          <p className="text-base sm:text-lg">
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
      <div className="w-full flex flex-wrap border-b border-gray-300 mb-6 mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-9 sm:h-10 px-2 sm:px-4 mb-2 sm:mb-0 -mb-[1px] border-b-2 transition-colors duration-200
              font-montserrat font-semibold text-sm sm:text-[15px] md:text-base leading-[20px] sm:leading-6
              ${
                activeTab === tab.id
                  ? "border-system-primary text-system-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="w-full bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-sm min-h-[200px] text-sm sm:text-base md:text-lg">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CustomerSettings;
