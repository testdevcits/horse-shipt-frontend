import React, { useState } from "react";
import { GrNext } from "react-icons/gr";
import { FaTruck } from "react-icons/fa";
import { MdPlace } from "react-icons/md";
import { FiX } from "react-icons/fi";
import VehiclesAndCapacity from "./VehiclesAndCapacity";
import PreferredAreas from "./PreferredAreasPage";

const ShipmentSettings = () => {
  const subTabs = [
    {
      id: "vehicles",
      label: "Vehicles & Capacity",
      description: "Manage your shipment capacity and vehicle information.",
      icon: <FaTruck size={22} />,
    },
    {
      id: "preferredAreas",
      label: "Preferred Areas",
      description:
        "Manage your preferred areas and routes to receive personalized opportunities.",
      icon: <MdPlace size={22} />,
    },
    {
      id: "availability",
      label: "Availability",
      description: "Manage your availability by dates.",
      icon: <MdPlace size={22} />,
    },
  ];

  const [activeSubTab, setActiveSubTab] = useState(null);
  const [gpsTrackingEnabled, setGpsTrackingEnabled] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  const handleOpenTab = (id) => setActiveSubTab(id);
  const handleBack = () => setActiveSubTab(null);
  const handleOpenModal = () => setShowCredentialsModal(true);
  const handleCloseModal = () => setShowCredentialsModal(false);

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "vehicles":
        return <VehiclesAndCapacity handleBack={handleBack} />;
      case "preferredAreas":
        return <PreferredAreas handleBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto space-y-4 animate-slide-fade-in">
      {/* ---------- Breadcrumb Header ---------- */}
      <div className="flex items-center flex-wrap gap-2 text-gray-700 text-[16px] font-semibold leading-[24px]">
        <span
          className={`text-systemText cursor-pointer ${
            activeSubTab
              ? "hover:text-system-primary transition-colors duration-200"
              : ""
          }`}
          onClick={() => handleBack()}
        >
          Shipment Settings
        </span>

        {activeSubTab && <GrNext />}

        <span className="text-system-primary">
          {activeSubTab
            ? subTabs.find((tab) => tab.id === activeSubTab)?.label
            : "Overview"}
        </span>
      </div>

      {/* ---------- Main Content ---------- */}
      {activeSubTab ? (
        renderSubTabContent()
      ) : (
        <div className="flex flex-col gap-6 w-full">
          {/* ---- GPS Tracking Card ---- */}
          <div className="w-full flex items-center justify-between px-4 sm:px-6 py-4 border border-gray-300 rounded-[14px] bg-white transition-all duration-200">
            {/* Left Side Content */}
            <div className="flex flex-col gap-1">
              <h3 className="font-[Montserrat] font-medium text-[16px] sm:text-[17px] text-gray-800 leading-[24px]">
                GPS Tracking
              </h3>
              <p className="font-[Montserrat] font-normal text-[14px] text-gray-600 leading-[20px]">
                With GPS location tracking, buyers will know how their shipment
                is progressing in real time.
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center">
              <button
                onClick={() => setGpsTrackingEnabled(!gpsTrackingEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  gpsTrackingEnabled ? "bg-system-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    gpsTrackingEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ---- Credentials Card ---- */}
          <div className="w-full flex items-center justify-between px-4 sm:px-6 py-4 border border-gray-300 rounded-[14px] bg-white transition-all duration-200">
            {/* Left Side Content */}
            <div className="flex flex-col gap-1">
              <h3 className="font-[Montserrat] font-medium text-[16px] sm:text-[17px] text-gray-800 leading-[24px]">
                Credentials
              </h3>
              <p className="font-[Montserrat] font-normal text-[14px] text-gray-600 leading-[20px]">
                Manage your certificates, registrations and insurance.
              </p>
            </div>

            {/* Right Side Button */}
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 bg-gray-200 text-[#333333] border rounded-lg text-sm font-medium hover:bg-opacity-50 transition"
            >
              See Credentials
            </button>
          </div>

          {/* ---- Dynamic SubTabs ---- */}
          {subTabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => handleOpenTab(tab.id)}
              className="w-full flex items-center justify-between px-4 sm:px-6 py-4 border border-gray-300 rounded-[14px] bg-white cursor-pointer hover:shadow-lg hover:border-system-primary transition-all duration-200"
            >
              <div className="flex flex-col gap-1">
                <h3 className="font-[Montserrat] font-medium text-[16px] sm:text-[17px] text-gray-800 leading-[24px]">
                  {tab.label}
                </h3>
                <p className="font-[Montserrat] font-normal text-[14px] text-gray-600 leading-[20px]">
                  {tab.description}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-system-primary">
                <GrNext size={16} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Credentials Modal ---------- */}
      {showCredentialsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="
        bg-white 
        rounded-[12px] 
        shadow-lg 
        w-[480px] 
        h-[364px] 
        p-[24px] 
        flex 
        flex-col 
        gap-[24px] 
        border border-gray-200 
        relative
      "
          >
            {/* ---------- Header Row ---------- */}
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-gray-800">
                Credentials
              </h2>

              <button
                onClick={() => setShowCredentialsModal(false)}
                className="text-gray-500 hover:text-system-primary transition"
              >
                ✕
              </button>
            </div>

            {/* ---------- Modal Description ---------- */}
            <p className="text-gray-600 text-[14px] leading-[20px]">
              Lorem ipsum dolor sit amet consectetur. Nulla varius risus est
              congue sit aliquet.
            </p>

            {/* ---------- Example Credential Cards ---------- */}
            <div className="flex flex-col gap-[12px]">
              <div className="border-b border-gray-300 pb-2">
                <h3 className="font-medium text-gray-800 text-[15px]">
                  DOT Number
                </h3>
                <p className="text-gray-600 text-[13px]">123456789</p>
              </div>

              <div className="">
                <h3 className="font-medium text-gray-800 text-[15px]">
                  MC Number
                </h3>
                <p className="text-gray-600 text-[13px]">ABC12345</p>
              </div>
            </div>

            {/* ---------- Upload Button ---------- */}
            <button
              className="
          mt-auto 
          bg-system-primary 
          text-white 
          font-medium 
          py-2 
          rounded-lg 
          hover:opacity-90 
          transition
        "
            >
              Upload New Credential
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentSettings;
