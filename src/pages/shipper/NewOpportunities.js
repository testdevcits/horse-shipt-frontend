import React, { useEffect, useMemo, useRef, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { CiMap } from "react-icons/ci";
import { IoList } from "react-icons/io5";
import { MdFilterList } from "react-icons/md";

import { useShipperShipment } from "../../contexts/shipperContext/ShipperShipmentContext";
import { useShipperInvitations } from "../../contexts/shipperContext/ShipperInvitationContext";
import ShipmentCard from "./ShipmentCard";
import ShipmentMap from "./ShipmentMap";
import PageLoader from "../../components/common/PageLoader";

const NewOpportunities = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [location, setLocation] = useState(null);

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
  const {
    invitations,
    fetchInvitations,
    loading: invitationLoading,
  } = useShipperInvitations();

  const fetchedOnce = useRef(false);
  const lastFiltersRef = useRef("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  useEffect(() => {
    if (!location || fetchedOnce.current) return;
    getAvailableShipments({ lat: location.lat, lng: location.lng });
    getAvailableShipmentsForMap(1, 5);
    fetchedOnce.current = true;
  }, [location, getAvailableShipments, getAvailableShipmentsForMap]);

  const invitedShipments = useMemo(
    () =>
      (invitations || [])
        .filter((invite) => invite?.status === "pending")
        .map((invite) => {
          if (invite.shipment && typeof invite.shipment === "object") {
            return {
              ...invite.shipment,
              __invitation: invite,
              __isInvitedShipment: true,
            };
          }

          return {
            _id: invite.shipment,
            shipmentCode: invite.shipmentCode,
            pickupLocation: invite.pickupLocation,
            deliveryLocation: invite.deliveryLocation,
            status: "open_for_offers",
            horses: [],
            __invitation: invite,
            __isInvitedShipment: true,
          };
        })
        .filter((shipment) => shipment?._id),
    [invitations]
  );

  const combinedShipments = useMemo(() => {
    const seen = new Set();
    return [...invitedShipments, ...(shipments || [])].filter((shipment) => {
      const id = shipment?._id?.toString();
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [invitedShipments, shipments]);

  const filteredShipments = combinedShipments.filter((s) =>
    `${s.pickupLocation || ""} ${s.deliveryLocation || ""} ${
      s.shipmentCode || ""
    }`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const applyFilters = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== "")
    );
    const key = JSON.stringify(cleanFilters);
    if (lastFiltersRef.current === key) return;
    lastFiltersRef.current = key;
    getAvailableShipments({
      ...cleanFilters,
      lat: location?.lat,
      lng: location?.lng,
    });
    setShowMobileFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      pickupDistance: "",
      dropoffDistance: "",
      stallSize: "",
      minHorses: "",
    });
    lastFiltersRef.current = "";
    getAvailableShipments({ lat: location?.lat, lng: location?.lng });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");
  const isLoading = loading || invitationLoading;
  const noData = !isLoading && filteredShipments.length === 0;

  /* ── shared input class ─────────────────────────────────────── */
  const inputCls =
    "border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm text-dark placeholder-gray-400 focus:outline-none focus:border-system-primary focus:ring-2 focus:ring-system-primary/20 transition font-montserrat";

  return (
    <div className="flex flex-col gap-5 font-montserrat w-full">
      {/* ── TITLE ── */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark">
          New Opportunities
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Browse available horse shipments near you
        </p>
      </div>

      {/* ── SEARCH + TAB ROW ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <HiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pickup or delivery location..."
            className={`${inputCls} w-full pl-10 py-2.5`}
          />
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className={`md:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition
            ${
              showMobileFilters
                ? "bg-system-primary text-white border-system-primary"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
        >
          <MdFilterList size={18} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
          )}
        </button>

        {/* List / Map tabs */}
        <div className="flex bg-gray-100 border border-gray-200 rounded-lg p-1 flex-shrink-0">
          {[
            { id: "list", label: "List", Icon: IoList },
            { id: "map", label: "Map", Icon: CiMap },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200
                ${
                  activeTab === id
                    ? "bg-system-primary text-white shadow-sm"
                    : "text-gray-600 hover:text-dark"
                }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── DESKTOP FILTERS ── */}
      <div className="hidden md:flex items-center gap-3 flex-wrap bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
          Filter by:
        </span>

        <input
          type="number"
          name="pickupDistance"
          placeholder="Pickup distance (km)"
          value={filters.pickupDistance}
          onChange={handleFilterChange}
          className={`${inputCls} w-44`}
        />
        <input
          type="number"
          name="dropoffDistance"
          placeholder="Dropoff distance (km)"
          value={filters.dropoffDistance}
          onChange={handleFilterChange}
          className={`${inputCls} w-44`}
        />
        <input
          type="number"
          name="minHorses"
          placeholder="Min horses"
          value={filters.minHorses}
          onChange={handleFilterChange}
          className={`${inputCls} w-32`}
        />
        <select
          name="stallSize"
          value={filters.stallSize}
          onChange={handleFilterChange}
          className={`${inputCls} w-36`}
        >
          <option value="">Stall size</option>
          <option value="Box">Box</option>
          <option value="1/2 Box">1/2 Box</option>
          <option value="Single">Single</option>
        </select>

        <button
          onClick={applyFilters}
          className="px-5 py-2 bg-system-primary text-white rounded-lg text-sm font-bold hover:bg-tabActive transition"
        >
          Apply
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition font-semibold"
          >
            Reset
          </button>
        )}

        {/* Active filter count badge */}
        {hasActiveFilters && (
          <span className="ml-auto text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full font-semibold">
            {Object.values(filters).filter(Boolean).length} filter
            {Object.values(filters).filter(Boolean).length > 1 ? "s" : ""}{" "}
            active
          </span>
        )}
      </div>

      {/* ── MOBILE FILTERS PANEL ── */}
      {showMobileFilters && (
        <div className="md:hidden bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <input
            type="number"
            name="pickupDistance"
            placeholder="Pickup distance (km)"
            value={filters.pickupDistance}
            onChange={handleFilterChange}
            className={`${inputCls} w-full`}
          />
          <input
            type="number"
            name="dropoffDistance"
            placeholder="Dropoff distance (km)"
            value={filters.dropoffDistance}
            onChange={handleFilterChange}
            className={`${inputCls} w-full`}
          />
          <input
            type="number"
            name="minHorses"
            placeholder="Minimum horses"
            value={filters.minHorses}
            onChange={handleFilterChange}
            className={`${inputCls} w-full`}
          />
          <select
            name="stallSize"
            value={filters.stallSize}
            onChange={handleFilterChange}
            className={`${inputCls} w-full`}
          >
            <option value="">Stall size</option>
            <option value="Box">Box</option>
            <option value="1/2 Box">1/2 Box</option>
            <option value="Single">Single</option>
          </select>

          <div className="flex gap-2 pt-1">
            <button
              onClick={applyFilters}
              className="flex-1 py-2.5 bg-system-primary text-white rounded-lg font-bold text-sm hover:bg-tabActive transition"
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 border border-gray-200 bg-white rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── RESULTS COUNT ── */}
      {!isLoading && !noData && (
        <p className="text-xs sm:text-sm text-gray-500 font-medium -mt-1">
          Showing{" "}
          <span className="font-bold text-dark">
            {filteredShipments.length}
          </span>{" "}
          shipment{filteredShipments.length !== 1 ? "s" : ""}
          {invitedShipments.length > 0 && (
            <>
              {" "}
              including{" "}
              <span className="font-bold text-[#BF9B53]">
                {invitedShipments.length}
              </span>{" "}
              invite{invitedShipments.length !== 1 ? "s" : ""}
            </>
          )}
          {search && (
            <>
              {" "}
              matching "<span className="text-system-primary">{search}</span>"
            </>
          )}
        </p>
      )}

      {/* ── CONTENT ── */}
      <div className="w-full min-h-[300px]">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <PageLoader text="Loading opportunities..." />
          </div>
        )}

        {/* Empty */}
        {!isLoading && noData && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-base sm:text-lg font-bold text-dark">
                No Shipments Found
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your filters or search term.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-2 px-5 py-2 bg-system-primary text-white rounded-lg text-sm font-bold hover:bg-tabActive transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* List View */}
        {!isLoading && !noData && activeTab === "list" && (
          <div className="flex flex-col gap-3 sm:gap-4">
            {filteredShipments.map((shipment) => (
              <ShipmentCard
                key={shipment._id}
                shipment={shipment}
                invitation={shipment.__invitation}
              />
            ))}
          </div>
        )}

        {/* Map View */}
        {!isLoading && !noData && activeTab === "map" && (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <ShipmentMap shipments={mapShipments.slice(0, 5)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewOpportunities;
