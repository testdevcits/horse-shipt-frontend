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
      <div className="w-full  text-sm sm:text-base md:text-lg lg:text-xl">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CustomerSettings;
