import React, { useState, useRef, useEffect } from "react";
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
  const tabRefs = useRef({});
  const containerRef = useRef(null);

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

  // 🔹 Auto-scroll active tab to START (left side)
  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    const container = containerRef.current;

    if (activeTabElement && container) {
      const offsetLeft = activeTabElement.offsetLeft;

      container.scrollTo({
        left: offsetLeft - 16, // small padding offset
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  return (
    <>
      <CommentBanner />
      <div className="flex flex-col items-center w-full px-2">
        {/* Tabs */}
        <div
          ref={containerRef}
          className="
            w-full 
            flex flex-nowrap sm:flex-wrap
            overflow-x-auto sm:overflow-visible
            justify-start
            items-start border-b border-gray-300 mb-6 mt-6
            scrollbar-hide
          "
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[tab.id] = el)}
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
