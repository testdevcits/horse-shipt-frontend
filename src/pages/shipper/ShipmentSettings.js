import React, { useState } from "react";
import { GrNext } from "react-icons/gr";
import VehiclesAndCapacity from "./VehiclesAndCapacity";

const ShipmentSettings = () => {
  const subTabs = [
    { id: "vehicles", label: "Vehicles & Capacity" },
    { id: "preferredAreas", label: "Preferred Areas" },
  ];

  const [activeSubTab, setActiveSubTab] = useState("vehicles");

  // -------- Vehicle Form States --------
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // -------- Handlers for Vehicles --------
  const handleAddNew = () => {
    setEditingVehicle(null);
    setShowForm(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  // -------- Render Tab Content --------
  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "vehicles":
        return (
          <VehiclesAndCapacity
            showForm={showForm}
            setShowForm={setShowForm}
            editingVehicle={editingVehicle}
            setEditingVehicle={setEditingVehicle}
            handleAddNew={handleAddNew}
            handleEdit={handleEdit}
            handleBack={handleBack}
          />
        );

      case "preferredAreas":
        return (
          <div className="text-gray-700 text-base sm:text-lg">
            Preferred areas setup will go here — for example, select regions,
            cities, or states where you prefer to operate.
          </div>
        );

      default:
        return null;
    }
  };

  const activeLabel =
    subTabs.find((tab) => tab.id === activeSubTab)?.label || "";

  return (
    <div className="space-y-4 animate-slide-fade-in">
      {/* -------- Breadcrumb Header -------- */}
      <div className="flex items-center flex-wrap gap-2 text-gray-700 font-semibold text-base sm:text-lg">
        <span className="text-systemText">Shipment Settings</span>
        <GrNext />
        <span className="text-system-primary">{activeLabel}</span>
      </div>

      {/* -------- Tabs -------- */}
      <div className="flex flex-wrap border-b border-gray-200 mb-4 sm:mb-6">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3 sm:px-5 py-2 text-sm sm:text-base font-montserrat font-semibold transition-all duration-200 border-b-2 
              ${
                activeSubTab === tab.id
                  ? "border-system-primary text-system-primary"
                  : "border-transparent text-gray-600 hover:text-dark"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* -------- Tab Content -------- */}
      <div className="bg-white p-4 sm:p-6 ">{renderSubTabContent()}</div>
    </div>
  );
};

export default ShipmentSettings;
