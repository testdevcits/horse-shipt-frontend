import React, { useState } from "react";
import CommentBanner from "../../components/common/CommentBanner";
import Profile from "./Profile";
import ShipmentSettings from "./ShipmentSettings";

const ShipperSettings = () => {
  const tabs = [
    { id: "profile", label: "Profile Settings" },
    { id: "shipment", label: "Shipment Settings" },
    { id: "payment", label: "Payments" },
    { id: "notification", label: "Notification Settings" },
  ];

  const [activeTab, setActiveTab] = useState("profile");

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "shipment":
        return <ShipmentSettings />;
      case "payment":
        return (
          <p>
            Stay tuned for the latest enhancements coming soon to the Payments
            page.
          </p>
        );
      case "notification":
        return <p>Notification settings content goes here.</p>;
      default:
        return null;
    }
  };

  return (
    <>
      <CommentBanner />
      <div className="flex flex-col items-center">
        <div className="w-full flex flex-wrap border-b border-gray-300 mb-6 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-9 px-4 mb-2 -mb-[1px] border-b-2 transition-colors duration-200
                font-montserrat font-semibold text-[14px]
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
        <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow-sm min-h-[200px]">
          {renderTabContent()}
        </div>
      </div>
    </>
  );
};

export default ShipperSettings;
