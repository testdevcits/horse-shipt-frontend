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

const NewOpportunities = ({ showMapView = true, title = "New Opportunities" }) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [location, setLocation] = useState(undefined);

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
    if (!navigator.geolocation) {
      setLocation(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocation(null);
      }
    );
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  useEffect(() => {
    if (location === undefined || fetchedOnce.current) return;
    getAvailableShipments({ lat: location?.lat, lng: location?.lng });
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
            pickupCoords: invite.pickupCoords,
            deliveryLocation: invite.deliveryLocation,
            deliveryCoords: invite.deliveryCoords,
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
  const isLoading = loading || invitationLoading || location === undefined;
  const noData = !isLoading && filteredShipments.length === 0;

  /* ── shared input class ─────────────────────────────────────── */
  const inputCls =
    "border-0 bg-[#FBFAF7] px-4 py-3 rounded text-[12px] text-[#4B5563] placeholder-[#4B5563] focus:outline-none focus:ring-1 focus:ring-system-primary/30 transition font-montserrat";

  return (
    <div className="flex w-full flex-col gap-5 font-montserrat">
      <div className="bg-white px-4 py-5 sm:px-5 md:px-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(180px,260px)_1fr_auto] lg:items-start">
          {/* ── TITLE ── */}
          <div className="min-w-0">
            <h2 className="text-[20px] font-semibold leading-[28px] text-[#111827] sm:text-[22px]">
              {title}
            </h2>
            <p className="mt-1 text-[9px] font-bold uppercase leading-[14px] tracking-[0.32em] text-[#BF9B53]">
              Browse available horse shipments near you
            </p>
          </div>

          {/* Search */}
          <div className="relative min-w-0">
            <HiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563]"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by pickup or delivery location..."
              className="h-[48px] w-full border-0 bg-[#F3F4F6] pl-12 pr-4 font-montserrat text-[13px] text-[#4B5563] placeholder-[#4B5563] outline-none transition focus:ring-1 focus:ring-system-primary/30"
            />
          </div>

          <div className="flex items-center gap-3 lg:justify-end">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`flex h-[44px] items-center justify-center gap-2 rounded border px-4 text-sm font-semibold transition md:hidden
                ${
                  showMobileFilters
                    ? "border-system-primary bg-system-primary text-white"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <MdFilterList size={18} />
              Filters
              {hasActiveFilters && (
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-400" />
              )}
            </button>

            {/* List / Map tabs */}
            {showMapView && (
              <div className="flex h-[48px] flex-shrink-0 items-center bg-[#F3F4F6] p-1">
                {[
                  { id: "list", label: "List", Icon: IoList },
                  { id: "map", label: "Map", Icon: CiMap },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex h-10 items-center gap-2 px-4 text-[12px] font-bold uppercase transition-all duration-200
                      ${
                        activeTab === id
                          ? "bg-system-primary text-white shadow-sm"
                          : "text-[#4B5563] hover:text-dark"
                      }`}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── DESKTOP FILTERS ── */}
        <div className="mt-7 hidden items-center gap-5 md:flex md:flex-wrap">
          <span className="text-[11px] font-medium text-[#4B5563]">
            Filter By:
          </span>

          <input
            type="number"
            name="pickupDistance"
            placeholder="Pickup Distance"
            value={filters.pickupDistance}
            onChange={handleFilterChange}
            className={`${inputCls} h-[40px] w-[135px]`}
          />
          <input
            type="number"
            name="dropoffDistance"
            placeholder="Dropoff Distance"
            value={filters.dropoffDistance}
            onChange={handleFilterChange}
            className={`${inputCls} h-[40px] w-[145px]`}
          />
          <select
            name="stallSize"
            value={filters.stallSize}
            onChange={handleFilterChange}
            className={`${inputCls} h-[40px] w-[130px]`}
          >
            <option value="">Stall Size</option>
            <option value="Box">Box</option>
            <option value="1/2 Box">1/2 Box</option>
            <option value="Single">Single</option>
          </select>

          <button
            onClick={applyFilters}
            className="h-[40px] min-w-[135px] rounded bg-system-primary px-8 text-[13px] font-bold uppercase text-white transition hover:bg-tabActive"
          >
            Apply
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="h-[40px] rounded border border-gray-200 bg-white px-5 text-[12px] font-semibold uppercase text-gray-600 transition hover:bg-gray-50 hover:border-gray-300"
            >
              Reset
            </button>
          )}
        </div>
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
              quote request{invitedShipments.length !== 1 ? "s" : ""}
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
            <ShipmentMap
              shipments={
                filteredShipments.length > 0
                  ? filteredShipments
                  : mapShipments.slice(0, 5)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewOpportunities;
