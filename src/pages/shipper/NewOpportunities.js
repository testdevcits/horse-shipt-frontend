import React, { useEffect, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { CiMap } from "react-icons/ci";
import { IoList } from "react-icons/io5";

import { useShipperShipment } from "../../contexts/shipperContext/ShipperShipmentContext";
import ShipmentCard from "./ShipmentCard";

const NewOpportunities = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  const { shipments, getAvailableShipments, loading } = useShipperShipment();

  // 🔹 Fetch once
  useEffect(() => {
    getAvailableShipments();
  }, []);

  // 🔹 Filter
  const filteredShipments = shipments.filter((shipment) =>
    `${shipment.pickupLocation} ${shipment.deliveryLocation}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
          New Opportunities for you
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <HiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search opportunities"
              className="w-full border border-gray-400 rounded-md pl-10 pr-3 py-2
              focus:outline-none focus:ring-1 focus:ring-system-primary"
            />
          </div>

          {/* Tabs */}
          <div className="flex border border-gray-400 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab("map")}
              className={`flex items-center gap-2 px-4 py-2 font-semibold ${
                activeTab === "map"
                  ? "bg-system-primary text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              <CiMap size={20} /> Map
            </button>

            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-2 px-4 py-2 font-semibold ${
                activeTab === "list"
                  ? "bg-system-primary text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              <IoList size={20} /> List
            </button>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="mt-4 border rounded-md p-4 w-full flex-1 min-h-[400px] bg-white overflow-auto">
        {/* MAP */}
        {activeTab === "map" && (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500 text-lg">Map view coming soon...</p>
          </div>
        )}

        {/* LIST */}
        {activeTab === "list" && (
          <>
            {loading && (
              <p className="text-gray-600 text-center">Loading shipments...</p>
            )}

            {!loading && filteredShipments.length === 0 && (
              <p className="text-gray-500 text-center">
                No available shipments found
              </p>
            )}

            <div className="space-y-4">
              {filteredShipments.map((shipment) => (
                <ShipmentCard key={shipment._id} shipment={shipment} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewOpportunities;
