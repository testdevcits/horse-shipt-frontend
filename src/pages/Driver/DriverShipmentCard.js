import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDriverAuth } from "../../contexts/DriverAuthContext";
import {
  FiArrowLeft,
  FiMapPin,
  FiRefreshCw,
  FiChevronRight,
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi";
import { FaHorse, FaTruck } from "react-icons/fa6";
import Toast from "../../components/common/Toast";

/* ─── Shimmer ─── */
const Shimmer = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-header rounded-md ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
  </div>
);

const CardSkeleton = () => (
  <div className="bg-white rounded-md border border-[#BF9B53] p-4 mb-3 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <Shimmer className="w-2 h-2 rounded-full" />
      <Shimmer className="h-3 w-20" />
    </div>
    <Shimmer className="h-3.5 w-3/4 mb-2" />
    <Shimmer className="h-3.5 w-2/3 mb-3" />
    <div className="flex gap-4">
      <Shimmer className="h-2.5 w-16" />
      <Shimmer className="h-2.5 w-16" />
    </div>
  </div>
);

/* ─── Status config ─── */
const S = {
  pending: {
    bg: "bg-white",
    border: "border-[#BF9B53]",
    dot: "bg-[#BF9B53]",
    text: "text-tabActive",
    badge: "bg-header text-tabActive border-[#BF9B53]",
    label: "Pending",
    emoji: "⏳",
  },
  started: {
    bg: "bg-header",
    border: "border-[#BF9B53]",
    dot: "bg-[#BF9B53]",
    text: "text-tabActive",
    badge: "bg-header text-tabActive border-[#BF9B53]",
    label: "In Progress",
    emoji: "🚚",
  },
  delivered: {
    bg: "bg-white",
    border: "border-[#BF9B53]",
    dot: "bg-success",
    text: "text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Delivered",
    emoji: "✅",
  },
};

const fmtDate = (ds) =>
  ds
    ? new Date(ds).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "2-digit",
      })
    : "N/A";

const getShipmentPayload = (item) => item?.shipment || item || {};

const getQuoteStatus = (item) => {
  const quoteTripStatus = String(item?.tripStatus || "").toLowerCase();
  const shipmentStatus = String(item?.shipment?.status || item?.status || "").toLowerCase();

  if (
    quoteTripStatus === "completed" ||
    shipmentStatus === "delivered" ||
    shipmentStatus === "completed"
  ) {
    return "delivered";
  }
  if (["started", "intransit", "in_transit"].includes(quoteTripStatus)) {
    return "started";
  }
  return "pending";
};

/* ─── Shipment Card ─── */
const ShipmentCard = ({ shipment, status, onPress }) => {
  const cfg = S[status] || S.pending;
  return (
    <button
      onClick={onPress}
      className={`w-full ${cfg.bg} border ${cfg.border} rounded-md p-4 mb-3 text-left transition-all hover:shadow-md active:scale-[0.98] shadow-sm`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot} ${
              status === "started" ? "animate-pulse" : ""
            }`}
          />
          <span
            className={`text-[11px] font-black uppercase tracking-wider ${cfg.text}`}
          >
            {cfg.emoji} {cfg.label}
          </span>
        </div>
        <FiChevronRight size={14} className="text-tabActive/45" />
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-start gap-2">
          <FiMapPin size={12} className="text-[#BF9B53] shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-systemText line-clamp-1 leading-snug flex-1">
            {shipment.pickupLocation || "Unknown pickup"}
          </p>
        </div>
        <div className="flex gap-0.5 ml-1.5">
          {[0, 1].map((i) => (
            <div key={i} className="w-0.5 h-1 bg-[#BF9B53]/30 rounded-full" />
          ))}
        </div>
        <div className="flex items-start gap-2">
          <FiMapPin size={12} className="text-success shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-systemText line-clamp-1 leading-snug flex-1">
            {shipment.deliveryLocation || "Unknown delivery"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-tabActive/70">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <FiCalendar size={9} />
            {fmtDate(shipment.pickupDate || shipment.pickupDateRange?.start)}
          </span>
        </div>
        <span className="flex items-center gap-1 font-semibold">
          <FaHorse size={9} />
          {shipment.numberOfHorses || shipment.horses?.length || 0}h
        </span>
      </div>

      {status === "started" && (
        <div className="mt-3 flex items-center gap-2 bg-[#BF9B53] rounded-md px-3 py-2 border border-[#BF9B53]">
          <FaTruck size={11} className="text-white" />
          <span className="text-xs font-black text-white">
            Tap to complete delivery
          </span>
        </div>
      )}
      {status === "delivered" && (
        <div className="mt-3 flex items-center gap-2 bg-header rounded-md px-3 py-2 border border-[#BF9B53]">
          <FiCheckCircle size={11} className="text-tabActive" />
          <span className="text-xs font-black text-tabActive">
            Delivery completed
          </span>
        </div>
      )}
    </button>
  );
};

/* ─── Main Page ─── */
const DriverShipmentsPage = () => {
  const navigate = useNavigate();
  const { allShipments, loading, fetchAssignedShipments } = useDriverAuth();
  const [filter, setFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAssignedShipments();
  }, [fetchAssignedShipments]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAssignedShipments();
      Toast.success("Updated!");
    } catch {
      Toast.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatus = (s) => {
    return getQuoteStatus(s);
  };

  const counts = {
    all: allShipments.length,
    pending: allShipments.filter((s) => getStatus(s) === "pending").length,
    started: allShipments.filter((s) => getStatus(s) === "started").length,
    delivered: allShipments.filter((s) => getStatus(s) === "delivered").length,
  };

  const filtered =
    filter === "all"
      ? allShipments
      : allShipments.filter((s) => getStatus(s) === filter);

  const filterTabs = [
    { key: "all", label: "All", emoji: "📦" },
    { key: "pending", label: "Pending", emoji: "⏳" },
    { key: "started", label: "Active", emoji: "🚚" },
    { key: "delivered", label: "Delivered", emoji: "✅" },
  ];

  return (
    <>
      <style>{`@keyframes shimmer { to { transform: translateX(200%); } }`}</style>
      <div className="min-h-screen bg-system-background font-[Montserrat] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[#BF9B53] shadow-sm sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-4 pt-10 pb-0 md:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 bg-header rounded-md border border-[#BF9B53] flex items-center justify-center hover:bg-[#BF9B53]/15 active:scale-95 transition-all"
              >
                <FiArrowLeft size={17} className="text-tabActive" />
              </button>
              <div className="flex-1">
                <h1 className="font-black text-systemText text-base">
                  My Shipments
                </h1>
                <p className="text-[10px] text-tabActive/70 font-semibold">
                  {filtered.length} shipment{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-9 h-9 bg-header rounded-md border border-[#BF9B53] flex items-center justify-center hover:bg-[#BF9B53]/15 active:scale-95 transition-all disabled:opacity-50"
              >
                <FiRefreshCw
                  size={15}
                  className={`text-tabActive ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4"
              style={{ scrollbarWidth: "none" }}
            >
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md border font-black text-xs whitespace-nowrap shrink-0 transition-all ${
                    filter === tab.key
                      ? "bg-[#BF9B53] border-[#BF9B53] text-white"
                      : "bg-white border-[#BF9B53] text-tabActive hover:bg-header"
                  }`}
                >
                  {tab.emoji} {tab.label}
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      filter === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-white text-tabActive/70"
                    }`}
                  >
                    {counts[tab.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mx-auto flex-1 w-full max-w-6xl px-4 pt-4 pb-8 md:px-6 lg:px-8">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-header rounded-md border border-[#BF9B53] flex items-center justify-center mb-4 text-3xl">
                📭
              </div>
              <p className="font-black text-systemText text-sm mb-1">
                {filter === "all"
                  ? "No shipments yet"
                  : `No ${S[filter]?.label.toLowerCase() || filter} shipments`}
              </p>
              <p className="text-tabActive/70 text-xs max-w-xs leading-relaxed">
                {filter === "all"
                  ? "When you're assigned shipments, they'll appear here"
                  : `You don't have any ${
                      S[filter]?.label.toLowerCase() || filter
                    } shipments right now`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((shipment) => {
              const status = getStatus(shipment);
              const rawShipment = getShipmentPayload(shipment);
              return (
                <ShipmentCard
                  key={shipment._id}
                  shipment={rawShipment}
                  status={status}
                  onPress={() => {
                    if (status === "started") {
                      navigate(
                        `/driver/delivery/${rawShipment._id || shipment._id}`
                      );
                    } else if (status === "pending") {
                      navigate("/driver/dashboard");
                      Toast.info(
                        "Start this shipment from the dashboard first"
                      );
                    } else {
                      Toast.info("This shipment has been completed");
                    }
                  }}
                />
              );
            })}
            </div>
          )}
        </div>

        {/* Footer summary */}
        {allShipments.length > 0 && (
          <div className="border-t border-[#BF9B53] bg-white md:sticky md:bottom-0">
            <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2 px-4 py-3 md:px-6 lg:px-8">
              {[
                {
                  key: "pending",
                  label: "Pending",
                  color: "text-tabActive",
                  bg: "bg-header",
                },
                {
                  key: "started",
                  label: "Active",
                  color: "text-tabActive",
                  bg: "bg-header",
                },
                {
                  key: "delivered",
                  label: "Delivered",
                  color: "text-success-700",
                  bg: "bg-success-50",
                },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className={`${
                    item.bg
                  } rounded-md border border-[#BF9B53] p-2 text-center transition-all active:scale-95 md:p-3 ${
                    filter === item.key
                      ? "ring-2 ring-[#BF9B53] ring-offset-1"
                      : ""
                  }`}
                >
                  <p className="text-[9px] font-black text-tabActive/70 uppercase mb-0.5">
                    {item.label}
                  </p>
                  <p className={`text-lg font-black ${item.color}`}>
                    {counts[item.key]}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DriverShipmentsPage;
