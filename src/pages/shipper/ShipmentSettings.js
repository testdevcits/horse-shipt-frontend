import React, { useState, useEffect, useRef } from "react";
import { GrNext } from "react-icons/gr";
import { FaTruck } from "react-icons/fa";
import { MdPlace, MdOutlineNavigateNext } from "react-icons/md";
import { FiArrowLeft } from "react-icons/fi";

import VehiclesAndCapacity from "./VehiclesAndCapacity";
import ShipperPreferredAreaPage from "./ShipperPreferredAreaPage";

const ShipmentSettings = () => {
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  const locationIntervalRef = useRef(null);

  const stopTracking = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopTracking();
  }, []);

  const subTabs = [
    {
      id: "vehicles",
      label: "Vehicles & Capacity",
      description: "Manage your shipment capacity and vehicle information.",
      icon: <FaTruck size={20} />,
    },
    {
      id: "preferredAreas",
      label: "Preferred Areas",
      description: "Set your working areas to get better shipment matches.",
      icon: <MdPlace size={20} />,
    },
  ];

  const handleOpenTab = (id) => setActiveSubTab(id);
  const handleBack = () => setActiveSubTab(null);

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "vehicles":
        return <VehiclesAndCapacity handleBack={handleBack} />;
      case "preferredAreas":
        return <ShipperPreferredAreaPage />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto space-y-4 font-montserrat">
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span
          className={`cursor-pointer ${
            activeSubTab ? "hover:text-[#BF9B53]" : ""
          }`}
          onClick={handleBack}
        >
          Shipment Settings
        </span>

        {activeSubTab && (
          <MdOutlineNavigateNext size={18} className="text-gray-400" />
        )}

        <span className="text-[#BF9B53]">
          {activeSubTab
            ? subTabs.find((tab) => tab.id === activeSubTab)?.label
            : "Overview"}
        </span>
      </div>

      {/* ================= BACK BUTTON ================= */}
      {activeSubTab && (
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#BF9B53] transition"
        >
          <FiArrowLeft size={14} />
          Back to settings
        </button>
      )}

      {/* ================= CONTENT ================= */}
      {activeSubTab ? (
        <div className="">{renderSubTabContent()}</div>
      ) : (
        <div className="grid gap-4">
          {subTabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => handleOpenTab(tab.id)}
              className="group flex items-center justify-between p-4 border border-gray-200 rounded-sm bg-white cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[#BF9B53]"
            >
              {/* LEFT */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#BF9B53]/10 text-[#BF9B53] flex items-center justify-center">
                  {tab.icon}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#BF9B53] transition">
                    {tab.label}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {tab.description}
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <GrNext
                size={16}
                className="text-gray-400 group-hover:text-[#BF9B53] transition"
              />
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {showCredentialsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-[400px] p-5 border relative">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-gray-800">Credentials</h2>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="text-gray-500 hover:text-[#BF9B53]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Manage your certificates and documents.
            </p>

            <button className="w-full bg-[#BF9B53] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#a8863e] transition">
              Upload New Credential
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentSettings;
