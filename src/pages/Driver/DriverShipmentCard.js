import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDriverAuth } from "../../contexts/DriverAuthContext";
import {
  FiArrowLeft,
  FiHome,
  FiUser,
  FiMapPin,
  FiRefreshCw,
  FiChevronRight,
  FiCalendar,
  FiCheckCircle,
  FiList,
  FiLogOut,
} from "react-icons/fi";
import { MdMyLocation } from "react-icons/md";
import { FaHorse, FaTruck } from "react-icons/fa6";
import Toast from "../../components/common/Toast";
import ConfirmModal from "../../components/common/ConfirmModal";
import logo from "../../assets/images/logo.png";

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
    border: "border-[#eadfca]",
    dot: "bg-[#BF9B53]",
    text: "text-[#8a6a2c]",
    badge: "bg-[#fbf7ef] text-[#8a6a2c] border-[#d8bb75]",
    label: "Pending",
  },
  started: {
    bg: "bg-white",
    border: "border-[#eadfca]",
    dot: "bg-[#BF9B53]",
    text: "text-[#8a6a2c]",
    badge: "bg-[#fbf7ef] text-[#8a6a2c] border-[#d8bb75]",
    label: "In Progress",
  },
  delivered: {
    bg: "bg-white",
    border: "border-[#eadfca]",
    dot: "bg-success",
    text: "text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Delivered",
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

const DRIVER_NAV = [
  { id: "home", label: "Home", helper: "Shipment Overview", Icon: FiHome, path: "/driver/dashboard" },
  { id: "trips", label: "Trips", helper: "All Shipments", Icon: FiList, path: "/driver/shipments" },
  { id: "location", label: "Location", helper: "Tracking", Icon: MdMyLocation, path: "/driver/dashboard" },
  { id: "profile", label: "Profile", helper: "Account", Icon: FiUser, path: "/driver/dashboard" },
];

const DriverSidebar = ({ navigate, onLogout }) => (
  <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[220px] lg:shrink-0 lg:flex-col lg:overflow-hidden lg:border-r lg:border-[#e6e1d8] lg:bg-white">
    <div className="flex h-[58px] items-center border-b border-[#e6e1d8] px-6">
      <img src={logo} alt="HorseShip" className="h-8 w-auto object-contain" />
    </div>
    <div className="flex flex-1 flex-col px-3 py-5">
      <div className="mb-5 flex items-center justify-between px-2">
        <p className="text-xs font-semibold text-slate-800">Dashboard</p>
        <span className="text-lg leading-none text-slate-500">‹|</span>
      </div>
      <div className="space-y-1">
        {DRIVER_NAV.map(({ id, label, helper, Icon, path }) => {
          const active = id === "trips";
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`w-full border-l-4 px-3 py-3 text-left transition-all ${
                active
                  ? "border-[#c09a4a] bg-[#fbf7ef] text-[#c09a4a]"
                  : "border-transparent bg-white text-slate-600 hover:bg-[#fbf7ef]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={15} />
                <div>
                  <p className="text-xs font-semibold leading-none">{label}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{helper}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-auto border-t border-[#eee7d9] pt-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 border-l-4 border-transparent px-3 py-3 text-left text-slate-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          <FiLogOut size={15} />
          <div>
            <p className="text-xs font-semibold leading-none">Logout</p>
            <p className="mt-1 text-[10px] text-slate-400">End Session</p>
          </div>
        </button>
      </div>
    </div>
  </aside>
);

const HeaderProfileMenu = ({ open, onToggle, driver, onProfile, onLogout }) => (
  <div className="relative">
    <button
      type="button"
      onClick={onToggle}
      className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#c09a4a] text-xs font-black text-white"
      title="Driver menu"
    >
      {driver?.profileImage?.url ? (
        <img
          src={driver.profileImage.url}
          alt={driver?.name || "Driver"}
          className="h-full w-full object-contain"
        />
      ) : (
        driver?.name?.[0]?.toUpperCase() || "D"
      )}
    </button>
    {open && (
      <div className="absolute right-0 top-11 z-50 w-44 border border-[#e6e1d8] bg-white py-2 shadow-[0_16px_35px_rgba(17,24,39,0.12)]">
        <button
          type="button"
          onClick={onProfile}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-[#fbf7ef]"
        >
          <FiUser size={14} />
          Profile
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          <FiLogOut size={14} />
          Logout
        </button>
      </div>
    )}
  </div>
);

/* ─── Shipment Card ─── */
const ShipmentCard = ({ shipment, status, onPress }) => {
  const cfg = S[status] || S.pending;
  return (
    <button
      onClick={onPress}
      className={`w-full ${cfg.bg} border ${cfg.border} p-4 text-left transition-all hover:border-[#c09a4a] hover:bg-[#fffdf8]`}
    >
      <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_180px_160px] lg:items-center">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${cfg.dot} ${
              status === "started" ? "animate-pulse" : ""
            }`}
          />
          <span className={`text-xs font-black uppercase tracking-wider ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>

        <div className="min-w-0">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] md:items-center">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Pickup
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                <FiMapPin className="mr-1 inline text-[#BF9B53]" size={12} />
                {shipment.pickupLocation || "Unknown pickup"}
              </p>
            </div>
            <FiChevronRight className="hidden text-[#c09a4a] md:block" size={18} />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Delivery
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                <FiMapPin className="mr-1 inline text-emerald-600" size={12} />
                {shipment.deliveryLocation || "Unknown delivery"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-slate-500 lg:block lg:space-y-2">
          <span className="inline-flex items-center gap-1">
            <FiCalendar size={12} />
            {fmtDate(shipment.pickupDate || shipment.pickupDateRange?.start)}
          </span>
          <span className="inline-flex items-center gap-1 lg:ml-0">
            <FaHorse size={12} />
            {shipment.numberOfHorses || shipment.horses?.length || 0} horses
          </span>
        </div>

        <div className="flex items-center justify-start lg:justify-end">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-black ${
              status === "started"
                ? "bg-[#c09a4a] text-white"
                : status === "delivered"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-[#fbf7ef] text-[#8a6a2c]"
            }`}
          >
            {status === "started" ? (
              <>
                <FaTruck size={13} />
                Complete Delivery
              </>
            ) : status === "delivered" ? (
              <>
                <FiCheckCircle size={13} />
                Completed
              </>
            ) : (
              "View"
            )}
          </span>
        </div>
      </div>
    </button>
  );
};

/* ─── Main Page ─── */
const DriverShipmentsPage = () => {
  const navigate = useNavigate();
  const { driver, allShipments, loading, fetchAssignedShipments, logout } = useDriverAuth();
  const [filter, setFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "started", label: "Active" },
    { key: "delivered", label: "Delivered" },
  ];

  return (
    <>
      <style>{`@keyframes shimmer { to { transform: translateX(200%); } }`}</style>
      <div className="min-h-screen bg-[#f6f3ee] font-[Montserrat] lg:flex">
        <DriverSidebar
          navigate={navigate}
          onLogout={() => setConfirmLogout(true)}
        />
        <main className="min-w-0 flex-1">
          <div className="fixed left-0 right-0 top-0 z-40 hidden h-[58px] items-center justify-between border-b border-[#e6e1d8] bg-white px-8 md:flex lg:left-[220px]">
            <div className="lg:hidden">
              <img src={logo} alt="HorseShip" className="h-8 w-auto" />
            </div>
            <div className="ml-auto flex items-center gap-5">
               
              <span className="rounded-full border border-emerald-400 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700">
                Test Driver
              </span>
              <HeaderProfileMenu
                open={profileMenuOpen}
                onToggle={() => setProfileMenuOpen((open) => !open)}
                driver={driver}
                onProfile={() => {
                  setProfileMenuOpen(false);
                  navigate("/driver/dashboard", { state: { activeTab: "profile" } });
                }}
                onLogout={() => {
                  setProfileMenuOpen(false);
                  setConfirmLogout(true);
                }}
              />
            </div>
          </div>

          <div className="flex min-h-screen flex-col md:pt-[58px]">
        {/* Header */}
        <div className="border-b border-[#e6e1d8]  ">
          <div className="w-full px-4 pb-0 pt-6 md:px-8 lg:px-10">
            <div className="mb-5 flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex h-9 w-9 items-center justify-center border border-[#c09a4a] bg-[#fbf7ef] text-[#8a6a2c] transition hover:bg-[#f2e8d4] active:scale-95"
              >
                <FiArrowLeft size={17} />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-black text-slate-900">
                  My Shipments
                </h1>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {filtered.length} shipment{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex h-9 w-9 items-center justify-center border border-[#c09a4a] bg-[#fbf7ef] text-[#8a6a2c] transition hover:bg-[#f2e8d4] active:scale-95 disabled:opacity-50"
              >
                <FiRefreshCw
                  size={15}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>
            </div>

            <div className="grid gap-3 pb-5 md:grid-cols-4">
              {filterTabs.map((tab) => {
                const active = filter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`flex items-center justify-between border px-4 py-3 text-left transition ${
                      active
                        ? "border-[#c09a4a] bg-[#c09a4a] text-white"
                        : "border-[#e6d7bb] bg-white text-slate-700 hover:bg-[#fbf7ef]"
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-wider">
                      {tab.label}
                    </span>
                    <span
                      className={`text-sm font-black ${
                        active ? "text-white" : "text-[#8a6a2c]"
                      }`}
                    >
                      {counts[tab.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="w-full flex-1 px-4 pt-5 pb-8 md:px-8 lg:px-10">
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
            <div className="space-y-3">
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

          </div>
        </main>
        <ConfirmModal
          show={confirmLogout}
          title="Logout"
          message="Are you sure you want to log out?"
          onConfirm={() => logout()}
          onCancel={() => setConfirmLogout(false)}
          confirmText="Logout"
          confirmColor="red"
        />
      </div>
    </>
  );
};

export default DriverShipmentsPage;
