import React, { useEffect, useRef, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { CiMap } from "react-icons/ci";
import { IoList } from "react-icons/io5";

import { useShipperShipment } from "../../contexts/shipperContext/ShipperShipmentContext";
import ShipmentCard from "./ShipmentCard";
import ShipmentMap from "./ShipmentMap";
import PageLoader from "../../components/common/PageLoader";

const NewOpportunities = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  const { shipments, mapShipments, getAvailableShipmentsForMap, loading } =
    useShipperShipment();

  const fetchedOnce = useRef(false);

  useEffect(() => {
    if (!fetchedOnce.current) {
      getAvailableShipmentsForMap(); // 🔥 fetch lightweight map shipments
      fetchedOnce.current = true;
    }
  }, [getAvailableShipmentsForMap]);

  const filteredShipments = (shipments || []).filter((shipment) => {
    const searchText = `${shipment.pickupLocation} ${shipment.deliveryLocation}`;
    return searchText.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col w-full h-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
        <h1 className="font-montserrat font-semibold text-3xl text-gray-800">
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
          <div className="flex w-full sm:w-auto border border-gray-400 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab("map")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold ${
                activeTab === "map"
                  ? "bg-system-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <CiMap size={18} />
              <span className="hidden xs:inline">Map</span>
            </button>

            <button
              onClick={() => setActiveTab("list")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold ${
                activeTab === "list"
                  ? "bg-system-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <IoList size={18} />
              <span className="hidden xs:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-4 w-full flex-1 min-h-[400px] relative overflow-auto">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <PageLoader
              text="Loading opportunities..."
              fullScreen={false}
              color="#BF9B53"
            />
          </div>
        )}

        {!loading && filteredShipments.length === 0 && (
          <p className="text-gray-500 text-center mt-10">
            No available shipments found
          </p>
        )}

        {/* LIST VIEW */}
        {activeTab === "list" && (
          <div className="space-y-4">
            {filteredShipments.map((shipment) => (
              <ShipmentCard key={shipment._id} shipment={shipment} />
            ))}
          </div>
        )}

        {/* MAP VIEW */}
        {activeTab === "map" && <ShipmentMap shipments={mapShipments} />}
      </div>
    </div>
  );
};

export default NewOpportunities;
