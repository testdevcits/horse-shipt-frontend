import React, { useState } from "react";
import CommentBanner from "../../components/common/CommentBanner";
import Profile from "./Profile";
import ShipmentSettings from "./ShipmentSettings";
import PaymentsComingSoon from "./PaymentsComingSoon";
import ShipperNotifications from "./ShipperNotifications";

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
        return <PaymentsComingSoon />;
      case "notification":
        return <ShipperNotifications />;
      default:
        return null;
    }
  };

  return (
    <>
      <CommentBanner />
      <div className="flex flex-col items-center w-full px-2">
        {/* Tabs */}
        <div
          className="
            w-full max-w-[650px]
            flex flex-nowrap sm:flex-wrap
            overflow-x-auto sm:overflow-visible
            justify-between sm:justify-center
            items-center border-b border-gray-300 mb-6 mt-6
            scrollbar-hide
          "
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-shrink-0
                px-4 py-2 sm:py-3
                font-montserrat font-semibold text-[14px]
                border-b-2 transition-colors duration-200
                ${
                  activeTab === tab.id
                    ? "border-system-primary text-system-primary"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="w-full">{renderTabContent()}</div>
      </div>
    </>
  );
};

export default ShipperSettings;
