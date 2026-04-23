import React, { useState } from "react";
import { HiSearch } from "react-icons/hi";
import { MdFilterList } from "react-icons/md";
import { IoList } from "react-icons/io5";
import { CiMap } from "react-icons/ci";

import { useShipperShipment } from "../../contexts/shipperContext/ShipperShipmentContext";
import ShipmentCard from "./ShipmentCard";
import ShipmentMap from "./ShipmentMap";
import PageLoader from "../../components/common/PageLoader";

const AllShipments = () => {
  const { shipments, loading } = useShipperShipment();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    stallSize: "",
    minHorses: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const applyFilters = () => {
    setAppliedFilters(filters);
    setShowMobileFilters(false);
  };

  const resetFilters = () => {
    const empty = { stallSize: "", minHorses: "" };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  // 🔥 Filter logic
  const filteredShipments = (shipments || []).filter((s) => {
    const matchSearch = `${s.pickupLocation} ${s.deliveryLocation}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStall =
      !appliedFilters.stallSize ||
      s.horses?.[0]?.requestedStallSize === appliedFilters.stallSize;

    const matchHorses =
      !appliedFilters.minHorses ||
      s.numberOfHorses >= Number(appliedFilters.minHorses);

    return matchSearch && matchStall && matchHorses;
  });

  return (
    <div className="flex flex-col gap-5 font-montserrat">
      {/* 🔥 HEADER */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark">
          All Shipments
        </h1>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-80">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>

          {/* List / Map Toggle */}
          <div className="flex bg-gray-100 border rounded-lg p-1">
            {[
              { id: "list", icon: IoList },
              { id: "map", icon: CiMap },
            ].map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-3 py-2 rounded-md ${
                  activeTab === id ? "bg-[#BF9B53] text-white" : "text-gray-600"
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>

          {/* Mobile filter */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden px-3 py-2 border rounded-lg"
          >
            <MdFilterList size={16} />
          </button>
        </div>
      </div>

      {/* 🔥 FILTERS */}
      <div className="hidden md:flex gap-3 bg-gray-50 p-3 rounded-lg border">
        <select
          name="stallSize"
          value={filters.stallSize}
          onChange={handleFilterChange}
          className="border px-3 py-2 rounded"
        >
          <option value="">Stall size</option>
          <option value="Box">Box</option>
          <option value="Single">Single</option>
        </select>

        <input
          type="number"
          name="minHorses"
          placeholder="Min horses"
          value={filters.minHorses}
          onChange={handleFilterChange}
          className="border px-3 py-2 rounded"
        />

        <button
          onClick={applyFilters}
          className="bg-[#BF9B53] text-white px-4 py-2 rounded"
        >
          Apply
        </button>

        <button onClick={resetFilters} className="border px-4 py-2 rounded">
          Reset
        </button>
      </div>

      {/* 🔥 CONTENT */}
      <div className="w-full min-h-[300px]">
        {loading && (
          <div className="flex justify-center py-16">
            <PageLoader />
          </div>
        )}

        {/* LIST */}
        {!loading && activeTab === "list" && (
          <div className="flex flex-col gap-3">
            {filteredShipments.map((shipment) => (
              <ShipmentCard key={shipment._id} shipment={shipment} />
            ))}
          </div>
        )}

        {/* MAP */}
        {!loading && activeTab === "map" && (
          <ShipmentMap shipments={filteredShipments} />
        )}
      </div>
    </div>
  );
};

export default AllShipments;
