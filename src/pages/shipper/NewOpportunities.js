import React, { useEffect, useRef, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { CiMap } from "react-icons/ci";
import { IoList } from "react-icons/io5";
import { MdFilterList, MdClose } from "react-icons/md";

import { useShipperShipment } from "../../contexts/shipperContext/ShipperShipmentContext";
import ShipmentCard from "./ShipmentCard";
import ShipmentMap from "./ShipmentMap";
import PageLoader from "../../components/common/PageLoader";

const NewOpportunities = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [showFilters, setShowFilters] = useState(false);

  // 📍 Location state
  const [location, setLocation] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    pickupDistance: "",
    dropoffDistance: "",
    stallSize: "",
    minHorses: "",
  });

  const {
    shipments,
    mapShipments,
    getAvailableShipments,
    getAvailableShipmentsForMap,
    loading,
  } = useShipperShipment();

  const fetchedOnce = useRef(false);
  const lastFiltersRef = useRef("");

  /* ===============================
     GET USER LOCATION
  =================================*/
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.log("Location denied, fallback will be used");
      }
    );
  }, []);

  /* ===============================
     INITIAL LOAD (WITH LOCATION)
  =================================*/
  useEffect(() => {
    if (!location) return;

    if (!fetchedOnce.current) {
      getAvailableShipments({
        lat: location.lat,
        lng: location.lng,
      });

      getAvailableShipmentsForMap(1, 5);
      fetchedOnce.current = true;
    }
  }, [location, getAvailableShipments, getAvailableShipmentsForMap]);

  /* ===============================
     SEARCH FILTER (LOCAL)
  =================================*/
  const filteredShipments = (shipments || []).filter((shipment) => {
    const searchText = `${shipment.pickupLocation} ${shipment.deliveryLocation}`;
    return searchText.toLowerCase().includes(search.toLowerCase());
  });

  /* ===============================
     FILTER HANDLERS
  =================================*/
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== "" && value !== null && value !== undefined
      )
    );

    const filterKey = JSON.stringify(cleanFilters);

    if (lastFiltersRef.current === filterKey) {
      console.log("Same filters → skip API");
      return;
    }

    lastFiltersRef.current = filterKey;

    getAvailableShipments({
      ...cleanFilters,
      lat: location?.lat,
      lng: location?.lng,
    });

    setShowFilters(false);
  };

  const resetFilters = () => {
    const reset = {
      pickupDistance: "",
      dropoffDistance: "",
      stallSize: "",
      minHorses: "",
    };

    setFilters(reset);
    lastFiltersRef.current = "";

    getAvailableShipments({
      lat: location?.lat,
      lng: location?.lng,
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="flex flex-col w-full h-full gap-4">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="font-montserrat font-semibold text-2xl md:text-3xl text-gray-800 whitespace-nowrap">
          New Opportunities for you
        </h1>
      </div>

      {/* ================= TOOLBAR (SEARCH + FILTERS + TABS — ONE LINE) ================= */}
      <div className="flex flex-wrap items-center gap-2 w-full">
        {/* SEARCH */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <HiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            size={16}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunities"
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-system-primary/30 focus:border-system-primary
              bg-white placeholder-gray-400"
          />
        </div>

        {/* INLINE FILTER INPUTS (hidden on small, shown md+) */}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          <input
            type="number"
            name="pickupDistance"
            placeholder="Pickup km"
            value={filters.pickupDistance}
            onChange={handleFilterChange}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-28
              focus:outline-none focus:ring-2 focus:ring-system-primary/30 focus:border-system-primary"
          />
          <input
            type="number"
            name="dropoffDistance"
            placeholder="Dropoff km"
            value={filters.dropoffDistance}
            onChange={handleFilterChange}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-28
              focus:outline-none focus:ring-2 focus:ring-system-primary/30 focus:border-system-primary"
          />
          <input
            type="number"
            name="minHorses"
            placeholder="Min Horses"
            value={filters.minHorses}
            onChange={handleFilterChange}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-24
              focus:outline-none focus:ring-2 focus:ring-system-primary/30 focus:border-system-primary"
          />{" "}
          <select
            name="stallSize"
            value={filters.stallSize}
            onChange={handleFilterChange}
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-system-primary/30 focus:border-system-primary
            bg-white text-gray-700"
          >
            <option value="">All Stall Sizes</option>
            <option value="Box">Box</option>
            <option value="1/2 Box">1/2 Box</option>
            <option value="Single">Single</option>
          </select>
          <button
            onClick={applyFilters}
            className="bg-system-primary text-white px-4 py-2 rounded-lg text-sm font-semibold
              hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
          >
            Apply
          </button>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 border border-gray-300 text-gray-600 px-3 py-2
                rounded-lg text-sm hover:bg-gray-50 active:scale-95 transition-all whitespace-nowrap"
            >
              <MdClose size={14} />
              Reset
            </button>
          )}
        </div>

        {/* FILTER TOGGLE (mobile only) */}
        <button
          onClick={() => setShowFilters((p) => !p)}
          className={`md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all
            ${
              showFilters || hasActiveFilters
                ? "bg-system-primary text-white border-system-primary"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
        >
          <MdFilterList size={16} />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 bg-white text-system-primary rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">
              {Object.values(filters).filter((v) => v !== "").length}
            </span>
          )}
        </button>

        {/* SPACER */}
        <div className="flex-1 hidden sm:block" />

        {/* TAB SWITCH */}
        <div className="flex w-full sm:w-auto border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab("map")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors
      ${
        activeTab === "map"
          ? "bg-system-primary text-white"
          : "bg-white text-gray-600 hover:bg-gray-50"
      }`}
          >
            <CiMap size={17} />
            <span>Map</span>
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors
      ${
        activeTab === "list"
          ? "bg-system-primary text-white"
          : "bg-white text-gray-600 hover:bg-gray-50"
      }`}
          >
            <IoList size={17} />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* ================= MOBILE FILTER PANEL ================= */}
      {showFilters && (
        <div className="md:hidden flex flex-col gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="pickupDistance"
              placeholder="Pickup km"
              value={filters.pickupDistance}
              onChange={handleFilterChange}
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-system-primary/30 focus:border-system-primary"
            />

            <input
              type="number"
              name="dropoffDistance"
              placeholder="Dropoff km"
              value={filters.dropoffDistance}
              onChange={handleFilterChange}
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-system-primary/30 focus:border-system-primary"
            />

            <select
              name="stallSize"
              value={filters.stallSize}
              onChange={handleFilterChange}
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white text-gray-700
                focus:outline-none focus:ring-2 focus:ring-system-primary/30 focus:border-system-primary"
            >
              <option value="">All Stall Sizes</option>
              <option value="Box">Box</option>
              <option value="1/2 Box">1/2 Box</option>
              <option value="Single">Single</option>
            </select>

            <input
              type="number"
              name="minHorses"
              placeholder="Min Horses"
              value={filters.minHorses}
              onChange={handleFilterChange}
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-system-primary/30 focus:border-system-primary"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="flex-1 bg-system-primary text-white px-4 py-2 rounded-lg text-sm font-semibold
                hover:opacity-90 active:scale-95 transition-all"
            >
              Apply Filters
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 border border-gray-300 text-gray-600 px-3 py-2
                  rounded-lg text-sm hover:bg-gray-100 active:scale-95 transition-all"
              >
                <MdClose size={14} />
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= CONTENT ================= */}
      <div className="w-full flex-1 min-h-[400px] relative overflow-auto">
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
        {activeTab === "map" && (
          <ShipmentMap shipments={mapShipments.slice(0, 5)} />
        )}
      </div>
    </div>
  );
};

export default NewOpportunities;
