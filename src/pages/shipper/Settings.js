import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CommentBanner from "../../components/common/CommentBanner";
import Profile from "./Profile";
import ShipmentSettings from "./ShipmentSettings";
import PaymentsSettings from "./PaymentsComingSoon";
import ShipperNotifications from "./ShipperNotifications";

import BillingHistory from "./BillingHistory";

const ShipperSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: "profile", label: "Profile Settings" },
    { id: "shipment", label: "Shipment Settings" },
    { id: "payment", label: "Payments" },
    { id: "billing", label: "Subscription" },
    { id: "notification", label: "Notification Settings" },
  ];

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "profile";

  const [activeTab, setActiveTab] = useState(initialTab);

  const tabRefs = useRef({});
  const containerRef = useRef(null);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/shipper/settings?tab=${tabId}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "shipment":
        return <ShipmentSettings />;
      case "payment":
        return <PaymentsSettings />;
      case "billing":
        return <BillingHistory />;
      case "notification":
        return <ShipperNotifications />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    const container = containerRef.current;

    if (activeTabElement && container) {
      container.scrollTo({
        left: activeTabElement.offsetLeft - 16,
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  return (
    <>
      <CommentBanner />

      <div className="flex flex-col items-center w-full px-2 font-montserrat">
        <div
          ref={containerRef}
          className="w-full flex flex-nowrap sm:flex-wrap overflow-x-auto sm:overflow-visible border-b border-gray-300 mb-6 mt-6 scrollbar-hide"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[tab.id] = el)}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-shrink-0 px-4 py-2 sm:py-3 font-montserrat font-semibold text-[14px] border-b-2 transition-colors duration-200 ${
                activeTab === tab.id
                  ? "border-system-primary text-system-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full">{renderTabContent()}</div>
      </div>
    </>
  );
};

export default ShipperSettings;
