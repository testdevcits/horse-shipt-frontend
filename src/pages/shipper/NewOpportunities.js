import React, { useEffect, useRef, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { CiMap } from "react-icons/ci";
import { IoList } from "react-icons/io5";
import { MdFilterList, MdClose } from "react-icons/md";

import { useShipperShipment } from "../../contexts/shipperContext/ShipperShipmentContext";
import ShipmentCard from "./ShipmentCard";
import ShipmentMap from "./ShipmentMap";
import PageLoader from "../../components/common/PageLoader";
import NoData from "../../components/common/NoData";

const NewOpportunities = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [showFilters, setShowFilters] = useState(false);

  const [location, setLocation] = useState(null);

  const [filters, setFilters] = useState({
    pickupDistance: "",
    dropoffDistance: "",
    stallSize: "",
    minHorses: "",
    rating: 1,
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

  /* ================= LOCATION ================= */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  /* ================= INITIAL LOAD ================= */
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

  /* ================= SEARCH ================= */
  const filteredShipments = (shipments || []).filter((shipment) => {
    const text = `${shipment.pickupLocation} ${shipment.deliveryLocation}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  /* ================= FILTERS ================= */
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "")
    );

    const key = JSON.stringify(cleanFilters);

    if (lastFiltersRef.current === key) return;

    lastFiltersRef.current = key;

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
      rating: 3,
    };

    setFilters(reset);
    lastFiltersRef.current = "";

    getAvailableShipments({
      lat: location?.lat,
      lng: location?.lng,
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) =>
    key === "rating" ? value !== 3 : value !== ""
  );

  /* ================= CONDITIONS ================= */
  const noData = !loading && filteredShipments.length === 0;

  /* ================= UI ================= */
  return (
    <div className="flex flex-col w-full h-full gap-4">
      {/* ===== NO DATA SCREEN ===== */}
      {noData ? (
        <NoData
          title="No Opportunities Found"
          description="Currently there are no shipments available for you. Try adjusting filters or check back later."
        />
      ) : (
        <>
          {/* ================= HEADER ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="font-montserrat font-semibold text-2xl md:text-3xl text-gray-800">
              New Opportunities for you
            </h1>
          </div>

          {/* ================= TOOLBAR ================= */}
          <div className="flex flex-wrap items-center gap-2 w-full">
            {/* SEARCH */}
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <HiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={16}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search opportunities"
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-system-primary/30"
              />
            </div>

            {/* DESKTOP FILTERS */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              <input
                type="number"
                name="pickupDistance"
                placeholder="Pickup km"
                value={filters.pickupDistance}
                onChange={handleFilterChange}
                className="border px-3 py-2 rounded-lg text-sm w-28"
              />
              <input
                type="number"
                name="dropoffDistance"
                placeholder="Dropoff km"
                value={filters.dropoffDistance}
                onChange={handleFilterChange}
                className="border px-3 py-2 rounded-lg text-sm w-28"
              />
              <input
                type="number"
                name="minHorses"
                placeholder="Min Horses"
                value={filters.minHorses}
                onChange={handleFilterChange}
                className="border px-3 py-2 rounded-lg text-sm w-24"
              />
              <select
                name="stallSize"
                value={filters.stallSize}
                onChange={handleFilterChange}
                className="border px-3 py-2 rounded-lg text-sm"
              >
                <option value="">All Stall Sizes</option>
                <option value="Box">Box</option>
                <option value="1/2 Box">1/2 Box</option>
                <option value="Single">Single</option>
              </select>
              <div className="col-span-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  name="rating"
                  value={filters.rating}
                  onChange={(e) =>
                    setFilters({ ...filters, rating: Number(e.target.value) })
                  }
                  className="w-full accent-yellow-500 mt-1"
                />

                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
              <button
                onClick={applyFilters}
                className="bg-system-primary text-white px-4 py-2 rounded-lg text-sm"
              >
                Apply
              </button>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 border px-3 py-2 rounded-lg text-sm"
                >
                  <MdClose size={14} /> Reset
                </button>
              )}
            </div>

            {/* MOBILE FILTER BUTTON */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className="md:hidden flex items-center gap-1 px-3 py-2 border rounded-lg text-sm"
            >
              <MdFilterList size={16} /> Filters
            </button>

            <div className="flex-1 hidden sm:block" />

            {/* TABS */}
            <div className="flex w-full sm:w-auto border rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveTab("map")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 ${
                  activeTab === "map" ? "bg-system-primary text-white" : ""
                }`}
              >
                <CiMap /> Map
              </button>

              <button
                onClick={() => setActiveTab("list")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 ${
                  activeTab === "list" ? "bg-system-primary text-white" : ""
                }`}
              >
                <IoList /> List
              </button>
            </div>
          </div>

          {/* MOBILE FILTER PANEL */}
          {showFilters && (
            <div className="md:hidden p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="pickupDistance"
                  placeholder="Pickup km"
                  value={filters.pickupDistance}
                  onChange={handleFilterChange}
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  name="dropoffDistance"
                  placeholder="Dropoff km"
                  value={filters.dropoffDistance}
                  onChange={handleFilterChange}
                  className="border p-2 rounded"
                />
                <select
                  name="stallSize"
                  value={filters.stallSize}
                  onChange={handleFilterChange}
                  className="border p-2 rounded"
                >
                  <option value="">All Stall Sizes</option>
                  <option value="Box">Box</option>
                  <option value="1/2 Box">1/2 Box</option>
                  <option value="Single">Single</option>
                </select>

                <div className="col-span-2">
                  <label className="text-xs text-gray-500">
                    Shipper Rating: {filters.rating}
                  </label>

                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    name="rating"
                    value={filters.rating}
                    onChange={(e) =>
                      setFilters({ ...filters, rating: Number(e.target.value) })
                    }
                    className="w-full accent-yellow-500 mt-1"
                  />

                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                </div>
                <input
                  type="number"
                  name="minHorses"
                  placeholder="Min Horses"
                  value={filters.minHorses}
                  onChange={handleFilterChange}
                  className="border p-2 rounded"
                />
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-system-primary text-white py-2 rounded"
                >
                  Apply
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="border px-3 rounded"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {/* CONTENT */}
          <div className="w-full flex-1 min-h-[400px] relative overflow-auto">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                <PageLoader text="Loading opportunities..." />
              </div>
            )}

            {activeTab === "list" && (
              <div className="space-y-4">
                {filteredShipments.map((shipment) => (
                  <ShipmentCard key={shipment._id} shipment={shipment} />
                ))}
              </div>
            )}

            {activeTab === "map" && (
              <ShipmentMap shipments={mapShipments.slice(0, 5)} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NewOpportunities;
