import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { FaTruck, FaHorse } from "react-icons/fa6";
import {
  FiX,
  FiLogOut,
  FiPhone,
  FiMail,
  FiFileText,
  FiMapPin,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiHome,
  FiUser,
  FiAlertCircle,
  FiList,
  FiPackage,
  FiCheckCircle,
  FiSend,
} from "react-icons/fi";
import { MdMyLocation } from "react-icons/md";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";
import { useDriverAuth } from "../../contexts/DriverAuthContext";
import RouteMapModal from "./Routemapmodal";
import UpdateLocation from "./Updatelocation";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/images/logo.png";
import fallbackHorseImage from "../../assets/images/horse1.jpg";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

/* ─── SHIMMER ─── */
const Shimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden bg-header rounded-md ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
  </div>
);

const HomeSkeleton = () => (
  <div className="px-4 pt-5 pb-28 space-y-4">
    <div className="bg-white rounded-md border border-[#BF9B53] overflow-hidden">
      <div className="px-4 py-3 bg-header border-b border-[#BF9B53]">
        <Shimmer className="h-3 w-32" />
      </div>
      <div className="p-4 space-y-3">
        <Shimmer className="h-20 w-full rounded-md" />
        <Shimmer className="h-3 w-6 mx-auto" />
        <Shimmer className="h-20 w-full rounded-md" />
        <div className="pt-2 space-y-2.5">
          <Shimmer className="h-12 w-full rounded-md" />
          <Shimmer className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  </div>
);

const ProfileSkeleton = () => (
  <div className="px-4 pt-5 pb-28 space-y-4">
    <div className="bg-white rounded-md border border-[#BF9B53] p-6 flex flex-col items-center gap-3">
      <Shimmer className="w-20 h-20 rounded-md" />
      <Shimmer className="h-4 w-32" />
      <Shimmer className="h-6 w-20 rounded-full" />
      <div className="grid grid-cols-2 gap-3 w-full mt-1">
        <Shimmer className="h-16 rounded-md" />
        <Shimmer className="h-16 rounded-md" />
      </div>
    </div>
    <div className="bg-white rounded-md border border-[#BF9B53] p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 items-start">
          <Shimmer className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Shimmer className="h-2 w-10" />
            <Shimmer className="h-3.5 w-44" />
          </div>
        </div>
      ))}
    </div>
    <Shimmer className="h-12 w-full rounded-md" />
  </div>
);

const normalizeDriverStatus = (status) => {
  if (!status) return "";
  const value = String(status).trim();
  const compact = value.replace(/[\s_-]/g, "").toLowerCase();

  if (compact === "ontrip") return "on_trip";
  if (compact === "available") return "available";
  if (compact === "offline") return "offline";

  return value.toLowerCase();
};

const normalizeTripStatus = (status) => {
  if (!status) return "pending";
  const value = String(status).trim();
  const compact = value.replace(/[\s_-]/g, "").toLowerCase();

  if (compact === "started" || compact === "intransit") return "started";
  if (compact === "completed" || compact === "delivered") return "completed";
  if (compact === "pending" || compact === "notstarted") return "pending";

  return value.toLowerCase();
};

const getShipmentTripStatus = (shipment) =>
  normalizeTripStatus(
    shipment?.tripStatus || shipment?.status || shipment?.shipment?.status
  );

/* ─── STATUS BADGE ─── */
const StatusBadge = ({ status }) => {
  const normalizedStatus = normalizeDriverStatus(status);
  const map = {
    available: {
      cls: "bg-success-50 text-success-700 border-success-100",
      dot: "bg-success",
    },
    on_trip: {
      cls: "bg-header text-tabActive border-[#BF9B53]",
      dot: "bg-[#BF9B53] animate-pulse",
    },
    offline: {
      cls: "bg-light text-gray-500 border-gray-200",
      dot: "bg-gray-400",
    },
  };
  const cfg = map[normalizedStatus] || {
    cls: "bg-header text-tabActive border-[#BF9B53]",
    dot: "bg-header0",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {normalizedStatus?.replace("_", " ") || "N/A"}
    </span>
  );
};

/* ─── SECTION CARD ─── */
const SectionCard = ({
  title,
  children,
  accent = false,
  collapsible = false,
  defaultOpen = true,
  badge,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={`bg-white rounded-md border overflow-hidden shadow-sm ${
        accent ? "border-[#BF9B53]" : "border-[#BF9B53]"
      }`}
    >
      {title && (
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${
            accent ? "bg-header border-[#BF9B53]" : "bg-header border-[#BF9B53]"
          } ${collapsible ? "cursor-pointer select-none" : ""}`}
          onClick={collapsible ? () => setOpen((v) => !v) : undefined}
        >
          <div className="flex items-center gap-2">
            <h3
              className={`font-black text-sm ${
                accent ? "text-tabActive" : "text-systemText"
              }`}
            >
              {title}
            </h3>
            {badge !== undefined && (
              <span className="bg-header text-tabActive border border-[#BF9B53] text-[9px] font-black px-1.5 py-0.5 rounded-md">
                {badge}
              </span>
            )}
          </div>
          {collapsible &&
            (open ? (
              <FiChevronUp size={15} className="text-tabActive/70" />
            ) : (
              <FiChevronDown size={15} className="text-tabActive/70" />
            ))}
        </div>
      )}
      {(!collapsible || open) && <div className="p-4">{children}</div>}
    </div>
  );
};

/* ─── INFO ROW ─── */
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-tabActive shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-tabActive/70 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-systemText break-all">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

const shortLocation = (value, fallback = "N/A") =>
  value?.split(",")?.[0]?.trim() || fallback;

const tripStatusLabel = (status) => {
  if (status === "started") return "In Transit";
  if (status === "completed") return "Completed";
  return "Not Started";
};

/* ─── PERMISSION ALERT ─── */
const PermissionAlert = ({ permission, onRequest }) => {
  if (permission === "granted") return null;
  return (
    <div className="flex flex-col gap-4 bg-white border border-[#f0eadf] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d8bb75] bg-[#fff8e7]">
          <FiAlertCircle size={16} className="text-[#BF9B53]" />
        </span>
        <div className="pt-0.5">
          <p className="font-black text-systemText text-sm">
            Location Permission Required
          </p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Enable location access to start trips and use live tracking.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onRequest}
          className="inline-flex items-center justify-center gap-2 bg-[#c09a4a] px-5 py-2.5 text-xs font-black text-white transition hover:bg-[#aa8439]"
        >
          <FiMapPin size={14} />
          Enable Location Access
        </button>
        <FiX size={16} className="hidden text-slate-500 md:block" />
      </div>
    </div>
  );
};

/* ─── HOME TAB ─── */
const HomeTab = ({
  currentShipment,
  driverLocation,
  assignedVehicles,
  formatDate,
  formatTime,
  setSelectedImage,
  setMapModalOpen,
  navigate,
  locationPermission,
  onRequestPermission,
  allShipments,
  loading,
}) => {
  if (loading) return <HomeSkeleton />;

  const normalizedTripStatus = getShipmentTripStatus(currentShipment);
  const shipmentNotes =
    currentShipment?.shipment?.notes || currentShipment?.notes || "";
  const horses = currentShipment?.shipment?.horses || [];
  const horseCount =
    currentShipment?.shipment?.numberOfHorses || horses.length || 0;
  const pickupLabel = shortLocation(
    currentShipment?.shipment?.pickupLocation,
    "Pickup"
  );
  const deliveryLabel = shortLocation(
    currentShipment?.shipment?.deliveryLocation,
    "Delivery"
  );

  return (
    <div className="w-full px-4 pt-4 pb-28 md:px-0 md:pb-8">
      <PermissionAlert
        permission={locationPermission}
        onRequest={onRequestPermission}
      />

      {currentShipment ? (
        <div className="mt-7 space-y-7">
          <div>
            <p className="mb-4 text-sm font-semibold text-slate-800">
              Current Shipment
            </p>
            <div className="bg-[#f4f6fa] px-5 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active Route
                  </span>
                  <p className="mt-3 text-base font-black text-slate-900">
                    {pickupLabel} &gt; {deliveryLabel}
                  </p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 bg-[#c09a4a] px-4 py-2 text-xs font-black text-white">
                  <FaHorse size={14} />
                  {horseCount} Horse Shipment
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between bg-white px-5 py-4">
              <span className="text-xs font-medium text-slate-700">
                Trip Status
              </span>
              <span className="border border-[#b98f38] px-5 py-2 text-[11px] font-medium text-[#7c5e24]">
                {tripStatusLabel(normalizedTripStatus)}
              </span>
            </div>
          </div>

          <div className="bg-white p-5">
            <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
              <div className="flex h-[220px] items-center justify-center overflow-hidden bg-[#f4f6fa] p-3 lg:h-[300px]">
                <img
                  src={horses[0]?.photo?.url || fallbackHorseImage}
                  alt={horses[0]?.registeredName || "Horse"}
                  onClick={() =>
                    horses[0]?.photo?.url && setSelectedImage(horses[0].photo.url)
                  }
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-black text-slate-900">
                  Horses ({horses.length || horseCount})
                </h2>
                <div className="mt-2 bg-[#f1f3f7] px-4 py-4">
                  <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[120px_1fr_120px]">
                    <div>
                      <p className="mb-2 text-[10px] text-slate-500">
                        <FiMapPin className="mr-1 inline" size={10} />
                        {shortLocation(currentShipment.shipment?.pickupLocation)}
                      </p>
                      <div className="border border-[#b98f38] bg-white px-4 py-2 text-center">
                        <p className="text-[9px] font-black uppercase text-[#7c5e24]">
                          Pickup Date
                        </p>
                        <p className="text-[11px] font-bold text-slate-700">
                          {formatDate(currentShipment.shipment?.pickupDate)}
                        </p>
                      </div>
                    </div>

                    <div className="relative hidden items-center justify-center md:flex">
                      <div className="h-px w-full bg-[#c09a4a]" />
                      <div className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#7c5e24] shadow-sm">
                        <FaTruck size={17} />
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-[10px] text-slate-500 md:text-right">
                        <FiMapPin className="mr-1 inline" size={10} />
                        {shortLocation(currentShipment.shipment?.deliveryLocation)}
                      </p>
                      <div className="border border-[#b98f38] bg-white px-4 py-2 text-center">
                        <p className="text-[9px] font-black uppercase text-[#7c5e24]">
                          Delivery Date
                        </p>
                        <p className="text-[11px] font-bold text-slate-700">
                          {formatDate(currentShipment.shipment?.deliveryDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
                    {[
                      ["Barn", horses[0]?.barnName || "Horse"],
                      ["Sex", horses[0]?.sex || "N/A"],
                      ["Breed", horses[0]?.breed || "N/A"],
                      ["Registered", horses[0]?.registeredName || "N/A"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center bg-white text-[#b98f38]">
                          <FaHorse size={13} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-500">{label}</p>
                          <p className="truncate text-xs font-semibold text-slate-800">
                            {value}
                          </p>
                        </div>
                      </div>
                    ))}
                    <span className="col-span-2 ml-auto self-center bg-slate-700 px-5 py-2 text-[10px] font-black uppercase text-white md:col-span-4">
                      Assigned
                    </span>
                  </div>
                </div>

                <div className="mt-4 border border-[#eee7d9] p-3">
                  <p className="text-[10px] font-black uppercase text-[#7c5e24]">
                    Notes
                  </p>
                  <p className="mt-1 text-xs text-slate-700">
                    {shipmentNotes || "No notes provided."}
                  </p>
                  <button
                    onClick={() => setMapModalOpen(true)}
                    disabled={!driverLocation}
                    className="mt-4 w-full bg-[#c09a4a] py-3 text-sm font-black uppercase text-white transition hover:bg-[#aa8439] disabled:opacity-40"
                  >
                    View Route on Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-7 bg-white border border-dashed border-[#e5dac7] px-6 py-14 text-center">
          <div className="w-14 h-14 bg-[#f8f3e8] flex items-center justify-center mx-auto mb-3">
            <FaTruck className="text-[#BF9B53] text-2xl" />
          </div>
          <p className="text-systemText font-bold text-sm">
            No active shipment assigned
          </p>
          <p className="text-tabActive/75 text-xs mt-1">
            You'll see your shipment details here once assigned
          </p>
          {(allShipments?.length || 0) > 0 && (
            <button
              onClick={() => navigate("/driver/shipments")}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#BF9B53] text-white font-black text-xs hover:brightness-110 active:scale-95 transition-all"
            >
              <FiList size={12} />
              View All Shipments
            </button>
          )}
        </div>
      )}

      {/* Vehicle */}
      {assignedVehicles.length > 0 && (
        <div className="mt-7 space-y-4">
            {assignedVehicles.map((veh) => (
              <div
                key={veh._id}
                className="overflow-hidden bg-white p-5"
              >
	                <div className="grid grid-cols-1 gap-5 md:grid-cols-[260px_1fr]">
	                  <div className="relative flex h-[220px] items-center justify-center overflow-hidden bg-[#f4f6fa] p-3">
	                    {veh.images?.[0]?.url ? (
	                      <img
	                        src={veh.images[0].url}
	                        alt={veh.vehicleNumber || "Vehicle"}
	                        className="h-full w-full object-contain"
	                      />
	                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-tabActive">
                        <FaTruck size={30} />
                        <p className="text-xs font-black">No vehicle image</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          Assigned Vehicle
                        </p>
                        <p className="mt-1 text-lg font-black text-systemText">
                          {veh.vehicleNumber || "N/A"}
                        </p>
                        <p className="text-xs text-slate-600">
                          {veh.transportType || "N/A"} ·{" "}
                          {veh.trailerType || "N/A"}
                        </p>
                      </div>
                      <span className="border border-[#d8bb75] px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#b98f38]">
                        Ready
                      </span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-4 border-b border-[#eee7d9] pb-4 text-xs sm:grid-cols-4">
                      {[
                        ["Trailer", veh.trailerType || "N/A"],
                        ["Stalls", veh.numberOfStalls || 0],
                        ["Stall Type", veh.stallSize || "N/A"],
                        ["Transport", veh.transportType || "N/A"],
                      ].map(([label, value]) => (
                        <div key={label} className="border-r border-[#eee7d9] last:border-r-0">
                          <p className="text-[10px] font-medium text-slate-500">
                            {label}
                          </p>
                          <p className="mt-1 font-semibold text-slate-800">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-[#f4f6fa] p-4">
                      <p className="text-[10px] font-black uppercase text-[#7c5e24]">
                        Vehicle Notes
                      </p>
                      <p className="mt-1 text-xs text-slate-700">
                        {veh.notes || "No vehicle notes."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

/* ─── PROFILE TAB ─── */
const ProfileTab = ({
  driver,
  allShipments,
  setConfirmLogout,
  navigate,
  loading,
}) => {
  if (loading) return <ProfileSkeleton />;

  const completed = (allShipments || []).filter(
    (s) =>
      getShipmentTripStatus(s) === "completed" ||
      String(s.status || "").toLowerCase() === "delivered"
  );
  const fmtDate = (ds) =>
    ds
      ? new Date(ds).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-28 space-y-4">
      {/* Hero */}
      <div className="bg-white rounded-md border border-[#BF9B53] p-5 flex flex-col items-center text-center shadow-sm">
	        <div className="w-20 h-20 rounded-md overflow-hidden border-2 border-[#BF9B53] flex items-center justify-center bg-header mb-3">
	          {driver.profileImage?.url ? (
	            <img
	              src={driver.profileImage.url}
	              alt={driver.name}
	              className="w-full h-full object-contain"
	            />
          ) : (
            <span className="text-[#BF9B53] font-black text-3xl">
              {driver.name?.[0]?.toUpperCase() || "D"}
            </span>
          )}
        </div>
        <p className="font-black text-systemText text-lg mb-1.5">
          {driver.name}
        </p>
        <StatusBadge status={driver.driverStatus} />
        <div className="grid grid-cols-2 gap-3 mt-4 w-full max-w-sm">
          <div className="bg-header rounded-md p-3 text-center border border-[#BF9B53]">
            <p className="text-[9px] font-black text-tabActive/70 uppercase mb-0.5">
              Completed
            </p>
            <p className="text-2xl font-black text-tabActive">
              {completed.length}
            </p>
          </div>
          <div
            className={`rounded-md p-3 text-center border ${
              driver.isActive ? "bg-success-50" : "bg-danger/10"
            }`}
          >
            <p className="text-[9px] font-black text-tabActive/70 uppercase mb-1">
              Account
            </p>
            <span
              className={`text-sm font-black ${
                driver.isActive ? "text-success-700" : "text-danger"
              }`}
            >
              {driver.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <SectionCard title="Personal Details" accent>
        <div className="space-y-4">
          <InfoRow
            icon={<FiMail size={14} />}
            label="Email"
            value={driver.email}
          />
          <InfoRow
            icon={<FiPhone size={14} />}
            label="Phone"
            value={driver.phone}
          />
          <InfoRow
            icon={<FiFileText size={14} />}
            label="License"
            value={driver.licenseNumber}
          />
        </div>
      </SectionCard>

      {/* Completed */}
      <SectionCard title="Completed Shipments" badge={completed.length}>
        {completed.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-light rounded-md flex items-center justify-center mx-auto mb-3 border border-[#BF9B53]">
              <FiPackage className="text-[#BF9B53]/60 text-2xl" />
            </div>
            <p className="text-tabActive/75 text-sm font-semibold">
              No completed shipments yet
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {completed.map((s, idx) => (
                <div key={s._id || idx} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-header rounded-md border border-[#BF9B53] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiCheckCircle size={14} className="text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-systemText leading-snug">
                        {s.shipment?.pickupLocation || "Unknown"}
                        <span className="text-[#BF9B53] mx-1">→</span>
                        {s.shipment?.deliveryLocation || "Unknown"}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-tabActive/70">
                        <span className="flex items-center gap-1">
                          <FiCalendar size={9} />
                          {fmtDate(s.shipment?.deliveryDate || s.updatedAt)}
                        </span>
                        {s.shipment?.horses?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <FaHorse size={9} />
                            {s.shipment.horses.length}h
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="bg-header text-tabActive border border-[#BF9B53] text-[9px] font-black px-2 py-1 rounded-md flex-shrink-0">
                      Done
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/driver/shipments")}
              className="w-full mt-3 py-2.5 border border-[#BF9B53] bg-[#BF9B53] text-white font-black text-xs rounded-md hover:brightness-110 active:scale-95 transition-all"
            >
              View All Shipments →
            </button>
          </>
        )}
      </SectionCard>

      {/* Logout */}
      <button
        onClick={() => setConfirmLogout(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#BF9B53] border border-[#BF9B53] text-white font-black rounded-md hover:brightness-110 active:scale-95 transition-all"
      >
        <FiLogOut size={16} />
        Logout
      </button>
    </div>
  );
};

const TripsTab = ({ allShipments, loading, formatDate, navigate }) => {
  const [filter, setFilter] = useState("all");
  const getItemStatus = (item) => {
    const status = getShipmentTripStatus(item);
    if (status === "completed") return "delivered";
    if (status === "started") return "active";
    return "pending";
  };
  const filters = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "active", label: "Active" },
    { id: "delivered", label: "Delivered" },
  ];
  const counts = filters.reduce((acc, item) => {
    acc[item.id] =
      item.id === "all"
        ? allShipments.length
        : allShipments.filter((shipment) => getItemStatus(shipment) === item.id)
            .length;
    return acc;
  }, {});
  const visibleShipments =
    filter === "all"
      ? allShipments
      : allShipments.filter((shipment) => getItemStatus(shipment) === filter);

  if (loading && allShipments.length === 0) {
    return (
      <div className="space-y-3 pb-28">
        <Shimmer className="h-16 w-full" />
        <Shimmer className="h-24 w-full" />
        <Shimmer className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 pt-4 pb-28 md:px-0 md:pb-8">
      <div className="grid gap-3 md:grid-cols-4">
        {filters.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`flex items-center justify-between border px-4 py-3 text-left transition ${
                active
                  ? "border-[#c09a4a] bg-[#c09a4a] text-white"
                  : "border-[#e6d7bb] bg-white text-slate-700 hover:bg-[#fbf7ef]"
              }`}
            >
              <span className="text-xs font-black uppercase tracking-wider">
                {item.label}
              </span>
              <span className={`text-sm font-black ${active ? "text-white" : "text-[#8a6a2c]"}`}>
                {counts[item.id] || 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {visibleShipments.length === 0 ? (
          <div className="bg-white px-6 py-12 text-center text-sm font-semibold text-slate-500">
            No trips found.
          </div>
        ) : (
          visibleShipments.map((item) => {
            const shipment = item?.shipment || item || {};
            const status = getItemStatus(item);
            const statusClass =
              status === "delivered"
                ? "bg-emerald-50 text-emerald-700"
                : status === "active"
                ? "bg-[#c09a4a] text-white"
                : "bg-[#fbf7ef] text-[#8a6a2c]";
            return (
              <button
                key={item?._id || shipment?._id}
                onClick={() =>
                  status === "active"
                    ? navigate(`/driver/delivery/${item?._id || shipment?._id}`)
                    : undefined
                }
                className="w-full border border-[#eadfca] bg-white p-4 text-left transition hover:border-[#c09a4a] hover:bg-[#fffdf8]"
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_170px_140px] lg:items-center">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Route
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                      <FiMapPin className="mr-1 inline text-[#BF9B53]" size={12} />
                      {shipment.pickupLocation || "Pickup"}
                      <span className="mx-2 text-[#c09a4a]">&gt;</span>
                      {shipment.deliveryLocation || "Delivery"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 lg:block lg:space-y-2">
                    <span className="inline-flex items-center gap-1">
                      <FiCalendar size={12} />
                      {formatDate(shipment.pickupDate || shipment.pickupDateRange?.start)}
                    </span>
                    <span className="inline-flex items-center gap-1 lg:ml-0">
                      <FaHorse size={12} />
                      {shipment.numberOfHorses || shipment.horses?.length || 0} horses
                    </span>
                  </div>
                  <div className="flex lg:justify-end">
                    <span className={`px-4 py-2 text-xs font-black ${statusClass}`}>
                      {status === "active"
                        ? "Complete Delivery"
                        : status === "delivered"
                        ? "Delivered"
                        : "Pending"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

const DriverChatTab = ({ token, driver, loading }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [fetchingChats, setFetchingChats] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const fetchDriverChats = useCallback(async () => {
    if (!token) return;
    setFetchingChats(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/driver/driver/chat/shipments`,
        authHeaders
      );
      const nextChats = res.data?.chats || [];
      setChats(nextChats);
      setSelectedChat((prev) => prev || nextChats[0] || null);
    } catch (error) {
      Toast.error(error.response?.data?.message || "Failed to load chats");
    } finally {
      setFetchingChats(false);
    }
  }, [authHeaders, token]);

  const fetchMessages = useCallback(
    async (nextRoomId, { silent = false } = {}) => {
      if (!nextRoomId || !token) return;
      if (!silent) setMessagesLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/driver/driver/chat/rooms/${nextRoomId}/messages`,
          authHeaders
        );
        setMessages(res.data?.messages || []);
      } catch (error) {
        if (!silent) {
          Toast.error(
            error.response?.data?.message || "Failed to load messages"
          );
        }
      } finally {
        if (!silent) setMessagesLoading(false);
      }
    },
    [authHeaders, token]
  );

  useEffect(() => {
    fetchDriverChats();
  }, [fetchDriverChats]);

  useEffect(() => {
    if (!selectedChat || !token) return;
    let cancelled = false;

    const openRoom = async () => {
      setMessages([]);
      setMessagesLoading(true);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/driver/driver/chat/room`,
          { shipmentId: selectedChat.shipmentId },
          authHeaders
        );
        const nextRoomId = res.data?.roomId || res.data?.room?._id;
        if (!nextRoomId || cancelled) return;
        setRoomId(nextRoomId);
        await fetchMessages(nextRoomId);
      } catch (error) {
        if (!cancelled) {
          Toast.error(error.response?.data?.message || "Failed to open chat");
        }
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    };

    openRoom();
    return () => {
      cancelled = true;
    };
  }, [authHeaders, fetchMessages, selectedChat, token]);

  useEffect(() => {
    if (!roomId || !token) return;
    const interval = setInterval(() => {
      fetchMessages(roomId, { silent: true });
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages, roomId, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const messageText = newMessage.trim();
    if (!messageText || !roomId || sending) return;

    setSending(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/driver/driver/chat/rooms/${roomId}/messages`,
        { message: messageText },
        authHeaders
      );
      const sentMessage = res.data?.data;
      if (sentMessage) {
        setMessages((prev) =>
          prev.some((item) => item._id === sentMessage._id)
            ? prev
            : [...prev, sentMessage]
        );
      }
      setNewMessage("");
    } catch (error) {
      Toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading || fetchingChats) return <HomeSkeleton />;

  return (
    <div className="w-full px-4 pt-4 pb-28 md:px-0 md:pb-8">
      <div className="grid min-h-[620px] overflow-hidden bg-white md:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-[#eee7d9] md:border-b-0 md:border-r">
          <div className="border-b border-[#eee7d9] p-4">
            <p className="text-sm font-black text-slate-900">Driver Chat</p>
            <p className="mt-1 text-xs text-slate-500">
              Message the shipper for assigned trips.
            </p>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No active shipment chats found.
              </div>
            ) : (
              chats.map((chat) => {
                const active = selectedChat?.shipmentId === chat.shipmentId;
                return (
                  <button
                    key={`${chat.shipmentId}-${chat._id}`}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full border-b border-[#f0eadf] p-4 text-left transition ${
                      active ? "bg-[#fbf7ef]" : "bg-white hover:bg-[#fbf7ef]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c09a4a] text-sm font-black text-white">
                        {chat.name?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          {chat.name || "Shipper"}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {chat.shipmentCode || "Shipment"}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs text-slate-500">
                      {chat.pickupLocation || "Pickup"} →{" "}
                      {chat.deliveryLocation || "Delivery"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex min-h-[620px] flex-col">
          {selectedChat ? (
            <>
              <div className="border-b border-[#eee7d9] p-4">
                <p className="text-sm font-black text-slate-900">
                  {selectedChat.name || "Shipper"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedChat.chatTitle}
                </p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-[#f8f6f1] p-4">
                {messagesLoading && (
                  <p className="text-center text-xs text-slate-500">
                    Loading messages...
                  </p>
                )}
                {!messagesLoading && messages.length === 0 && (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No messages yet.
                  </div>
                )}
                {messages.map((message) => {
                  const mine =
                    message.senderRole === "driver" &&
                    message.senderId?.toString() === driver?._id?.toString();
                  return (
                    <div
                      key={message._id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] px-4 py-3 text-sm ${
                          mine
                            ? "bg-[#c09a4a] text-white"
                            : "bg-white text-slate-800"
                        }`}
                      >
                        <p>{message.message}</p>
                        <p
                          className={`mt-1 text-[10px] ${
                            mine ? "text-white/75" : "text-slate-400"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              <form
                onSubmit={sendMessage}
                className="flex items-center gap-3 border-t border-[#eee7d9] bg-white p-4"
              >
                <input
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder="Type a message..."
                  className="min-w-0 flex-1 border border-[#e6e1d8] px-4 py-3 text-sm outline-none focus:border-[#c09a4a]"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="inline-flex h-11 w-11 items-center justify-center bg-[#c09a4a] text-white transition hover:bg-[#aa8439] disabled:opacity-40"
                  title="Send message"
                >
                  <FiSend size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-500">
              Select an assigned shipment chat.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

/* ─── BOTTOM TAB BAR ─── */
const TABS = [
  { id: "home", label: "Home", Icon: FiHome },
  { id: "trips", label: "Trips", Icon: FiList },
  { id: "location", label: "Location", Icon: MdMyLocation },
  { id: "profile", label: "Profile", Icon: FiUser },
];

const SidebarTabNav = ({ activeTab, setActiveTab, navigate, onLogout }) => (
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
        {TABS.map(({ id, label, Icon, path }) => {
          const active = activeTab === id;
          const subLabel =
            id === "home"
              ? "Shipment Overview"
              : id === "trips"
              ? "All Shipments"
              : id === "location"
              ? "Tracking"
              : "Account";
          return (
            <button
              key={id}
              onClick={() => (path ? navigate(path) : setActiveTab(id))}
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
                  <p className="mt-1 text-[10px] text-slate-400">
                    {subLabel}
                  </p>
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

const InlineTabNav = ({ activeTab, setActiveTab, navigate }) => (
  <div className="hidden md:flex lg:hidden mt-5 gap-2 overflow-x-auto pb-1">
    {TABS.map(({ id, label, Icon, path }) => {
      const active = activeTab === id;
      return (
        <button
          key={id}
          onClick={() => (path ? navigate(path) : setActiveTab(id))}
          className={`inline-flex shrink-0 items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-black transition-all ${
            active
              ? "border-[#BF9B53] bg-[#BF9B53] text-white"
              : "border-[#BF9B53] bg-white text-tabActive hover:bg-header"
          }`}
        >
          <Icon size={16} />
          {label}
        </button>
      );
    })}
  </div>
);

const BottomTabBar = ({ activeTab, setActiveTab, navigate }) => (
  <div className="fixed bottom-0 left-0 w-full bg-[#fffdf9] border-t border-[#BF9B53] z-40 shadow-[0_-8px_24px_rgba(17,24,39,0.08)] md:hidden">
    <div
      className="flex items-center justify-around max-w-3xl mx-auto px-2 py-2"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      {TABS.map(({ id, label, Icon, path }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => (path ? navigate(path) : setActiveTab(id))}
            className={`flex flex-col items-center gap-0.5 px-3 sm:px-5 py-2 rounded-md transition-all ${
              active
                ? "bg-header border border-[#BF9B53]"
                : "hover:bg-light border border-transparent"
            }`}
          >
            <Icon
              size={20}
              className={active ? "text-tabActive" : "text-tabActive/60"}
            />
            <span
              className={`text-[10px] font-black ${
                active ? "text-tabActive" : "text-tabActive/65"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

const TripActionPanel = ({
  currentShipment,
  locationPermission,
  isStartingTrip,
  onStartTrip,
  navigate,
  variant = "mobile",
}) => {
  const normalizedTripStatus = getShipmentTripStatus(currentShipment);
  const deliveryShipmentId =
    currentShipment?.shipment?._id || currentShipment?._id;
  const showStartTripButton = normalizedTripStatus === "pending";
  const showCompleteShipmentButton =
    normalizedTripStatus === "started" && deliveryShipmentId;
  const shipmentTitle = currentShipment?.shipment
    ? `${
        currentShipment.shipment?.pickupLocation?.split(",")?.[0] || "Pickup"
      } to ${
        currentShipment.shipment?.deliveryLocation?.split(",")?.[0] ||
        "Delivery"
      }`
    : "No active route";

  if (!showStartTripButton && !showCompleteShipmentButton) return null;

  const isDesktop = variant === "desktop";
  const isTabletInline = variant === "tablet-inline";

  return (
    <div
      className={
        isDesktop
          ? "hidden xl:block xl:sticky xl:top-[166px]"
          : isTabletInline
          ? "block"
          : "fixed bottom-[70px] left-0 w-full z-40  md:hidden"
      }
    >
      <div
        className={`mx-auto rounded-md ${
          isDesktop || isTabletInline ? "w-full max-w-none" : "w-full max-w-md"
        }`}
      >
        {(isDesktop || isTabletInline) && (
          <div className="mb-3 border border-[#eee7d9] bg-white p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Trip Actions
            </p>
            <p className="mt-4 text-sm font-black text-slate-900">
              {shipmentTitle}
            </p>
            <p className="mx-auto mt-2 max-w-[220px] text-xs leading-relaxed text-slate-500">
              {showStartTripButton
                ? "Start the assigned trip when your current location is ready."
                : "Finish this shipment after you reach the delivery point."}
            </p>
          </div>
        )}
        {showStartTripButton && (
          <button
            onClick={() => onStartTrip(currentShipment?._id)}
            disabled={isStartingTrip || locationPermission !== "granted"}
            className={`w-full flex items-center justify-center gap-2 py-3 bg-[#c09a4a] text-white font-black text-xs shadow-sm shadow-[#BF9B53]/20 hover:bg-[#aa8439] active:scale-95 transition-all disabled:opacity-40 ${
              showCompleteShipmentButton ? "mb-2.5" : ""
            }`}
          >
            {isStartingTrip ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <FaTruck size={15} />
                Start Trip
              </>
            )}
          </button>
        )}

        {showCompleteShipmentButton && (
          <button
            onClick={() => navigate(`/driver/delivery/${deliveryShipmentId}`)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#c09a4a] text-white font-black text-xs shadow-sm shadow-[#BF9B53]/20 hover:bg-[#aa8439] active:scale-95 transition-all"
          >
            <FiCheckCircle size={16} />
            Complete Shipment
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── MAIN ─── */
const DriverDashboard = () => {
  const {
    driver,
    vehicle,
    shipment: currentShipment,
    allShipments,
    loading: contextLoading,
    fetchDriver,
    logout,
    checkLocationPermission,
    locationPermission,
    startTrip,
    token,
  } = useDriverAuth();

  const [activeTab, setActiveTab] = useState("home");
  const [selectedImage, setSelectedImage] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [isStartingTrip, setIsStartingTrip] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    fetchDriver();
  }, [fetchDriver]);

  useEffect(() => {
    const grab = () => {
      if (
        driver?.currentLocation?.latitude &&
        driver?.currentLocation?.longitude
      ) {
        setDriverLocation({
          lat: driver.currentLocation.latitude,
          lng: driver.currentLocation.longitude,
        });
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            setDriverLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          () => {}
        );
      }
    };
    grab();
    const iv = setInterval(grab, 30000);
    return () => clearInterval(iv);
  }, [driver]);

  const handleStartTrip = async (quoteId) => {
    if (!quoteId) return Toast.error("Invalid shipment ID");
    setIsStartingTrip(true);
    try {
      let ok = locationPermission === "granted";
      if (!ok) ok = await checkLocationPermission();
      if (!ok) {
        Toast.error("Please enable location permission first");
        return;
      }
      const res = await startTrip(quoteId, driverLocation);
      if (res?.success) {
        Toast.success("Trip started! Live tracking active.");
        await fetchDriver();
        setTimeout(() => setMapModalOpen(true), 600);
      } else {
        Toast.error(res?.message || "Failed to start trip");
      }
    } catch (e) {
      Toast.error(e?.message || "Error starting trip");
    } finally {
      setIsStartingTrip(false);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const granted = await checkLocationPermission();
      if (granted) Toast.success("Location permission granted!");
    } catch {
      Toast.error("Permission denied. Enable it in browser settings.");
    }
  };

  const assignedVehicles = useMemo(
    () =>
      driver?.assignedVehicles
        ?.map((vid) => (vid === vehicle?._id ? vehicle : null))
        .filter(Boolean) || [],
    [driver, vehicle]
  );

  const formatDate = useCallback((ds) => {
    if (!ds) return "N/A";
    return new Date(ds).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  }, []);

  const formatTime = useCallback((ts) => {
    if (!ts) return "N/A";
    try {
      const [h, m] = ts.split(":");
      const hr = parseInt(h);
      return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
    } catch {
      return ts;
    }
  }, []);

  if (contextLoading && !driver) {
    return (
      <div className="min-h-screen bg-system-background font-[Montserrat]">
        <style>{`@keyframes shimmer { to { transform: translateX(200%); } }`}</style>
        <div className="fixed top-0 left-0 w-full h-16 bg-white border-b border-[#BF9B53] z-50 flex items-center px-4 gap-3">
          <Shimmer className="w-10 h-10 rounded-md" />
          <div className="space-y-2">
            <Shimmer className="h-3 w-28" />
            <Shimmer className="h-2.5 w-16 rounded-full" />
          </div>
        </div>
        <div className="pt-16">
          <HomeSkeleton />
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeTab
            currentShipment={currentShipment}
            driverLocation={driverLocation}
            assignedVehicles={assignedVehicles}
            formatDate={formatDate}
            formatTime={formatTime}
            setSelectedImage={setSelectedImage}
            setMapModalOpen={setMapModalOpen}
            navigate={navigate}
            locationPermission={locationPermission}
            onRequestPermission={handleRequestPermission}
            allShipments={allShipments || []}
            loading={contextLoading}
          />
        );
      case "location":
        return (
          <div className="pb-28">
            <UpdateLocation
              driver={driver}
              driverLocation={driverLocation}
              onLocationUpdated={(loc) => setDriverLocation(loc)}
              onOpenMap={() => setMapModalOpen(true)}
            />
          </div>
        );
      case "trips":
        return (
          <TripsTab
            allShipments={allShipments || []}
            loading={contextLoading}
            formatDate={formatDate}
            navigate={navigate}
          />
        );
      case "profile":
        return (
          <ProfileTab
            driver={driver}
            allShipments={allShipments || []}
            setConfirmLogout={setConfirmLogout}
            navigate={navigate}
            loading={contextLoading}
          />
        );
      case "chat":
        return (
          <DriverChatTab
            token={token}
            driver={driver}
            loading={contextLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`@keyframes shimmer { to { transform: translateX(200%); } }`}</style>
      <div className="w-full min-h-screen font-montserrat bg-[#f6f3ee]">
        <header className="fixed top-0 left-0 w-full bg-header border-b border-[#BF9B53] z-50 shadow-sm md:hidden">
          <div
            className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3"
            style={{
              paddingTop: "max(12px, env(safe-area-inset-top))",
              paddingBottom: "12px",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
	                <div className="w-11 h-11 rounded-md overflow-hidden border-2 border-[#BF9B53] flex items-center justify-center bg-white">
	                  {driver?.profileImage?.url ? (
	                    <img
	                      src={driver.profileImage.url}
	                      alt={driver.name}
	                      className="w-full h-full object-contain"
	                    />
                  ) : (
                    <span className="text-[#BF9B53] font-black text-base">
                      {driver?.name?.[0]?.toUpperCase() || "D"}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="font-black text-systemText text-sm leading-tight">
                  {driver?.name || "Driver"}
                </p>
                <StatusBadge status={driver?.driverStatus} />
              </div>
            </div>
            {(allShipments?.length || 0) > 0 && (
              <button
                onClick={() => navigate("/driver/shipments")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#BF9B53] text-white font-black text-[11px] rounded-md border border-[#BF9B53] hover:brightness-110 active:scale-95 transition-all"
              >
                <FiList size={12} />
                {allShipments.length} Trips
              </button>
            )}
          </div>
        </header>

        <div className="h-16 md:hidden" />
        <div className="flex min-h-screen w-full">
          <SidebarTabNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            navigate={navigate}
            onLogout={() => setConfirmLogout(true)}
          />

          <main className="min-w-0 flex-1">
            <div className="hidden md:block">
              <div className="fixed left-0 right-0 top-0 z-40 flex h-[58px] items-center justify-between border-b border-[#e6e1d8] bg-white px-8 lg:left-[220px]">
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
                      setActiveTab("profile");
                      setProfileMenuOpen(false);
                    }}
                    onLogout={() => {
                      setProfileMenuOpen(false);
                      setConfirmLogout(true);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="px-0 pt-4 md:px-8 md:pt-[106px] xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0">
                <div className="hidden md:mb-8 md:block">
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
                        Driver Dashboard
                      </p>
                      <h1 className="mt-3 text-3xl font-black leading-none text-slate-900">
	                        {activeTab === "home"
	                          ? "Trip Overview"
	                          : activeTab === "trips"
	                          ? "All Trips"
	                          : activeTab === "location"
	                          ? "Live Location"
	                          : activeTab === "chat"
                          ? "Driver Chat"
                          : "Profile"}
                      </h1>
                      <p className="mt-3 text-[11px] font-black uppercase tracking-[0.35em] text-[#b98f38]">
	                        {activeTab === "home"
	                          ? "Current shipment and trip actions."
	                          : activeTab === "trips"
	                          ? "Assigned shipments and delivery status."
	                          : activeTab === "location"
	                          ? "Tracking and location sync."
	                          : activeTab === "chat"
                          ? "Message shippers for assigned trips."
                          : "Driver account and history."}
                      </p>
                    </div>
                    <div className="hidden h-px flex-1 bg-[#c09a4a] lg:block">
                      <span className="ml-[45%] -mt-1 block h-2 w-2 rounded-full bg-[#c09a4a]" />
                    </div>
                    {(allShipments?.length || 0) > 0 && activeTab === "home" && (
                      <button
                        onClick={() => setActiveTab("trips")}
                        className="ml-auto inline-flex items-center gap-2 bg-[#c09a4a] px-5 py-3 text-xs font-black text-white transition hover:bg-[#aa8439]"
                      >
                        <FiList size={15} />
                        View All Trips
                      </button>
                    )}
                  </div>
                  <InlineTabNav
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    navigate={navigate}
                  />
                </div>
                {renderTab()}
                {activeTab === "home" && (
                  <div className="hidden md:block xl:hidden px-4 pb-6 md:px-0">
                    <TripActionPanel
                      currentShipment={currentShipment}
                      locationPermission={locationPermission}
                      isStartingTrip={isStartingTrip}
                      onStartTrip={handleStartTrip}
                      navigate={navigate}
                      variant="tablet-inline"
                    />
                  </div>
                )}
              </div>
              <div className="hidden xl:block">
                {activeTab === "home" ? (
                  <TripActionPanel
                    currentShipment={currentShipment}
                    locationPermission={locationPermission}
                    isStartingTrip={isStartingTrip}
                    onStartTrip={handleStartTrip}
                    navigate={navigate}
                    variant="desktop"
                  />
                ) : (
                  <div className="sticky top-[260px] space-y-4">
                    <div className="rounded-md border border-[#BF9B53] bg-white p-4 shadow-[0_18px_40px_rgba(17,24,39,0.06)]">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-tabActive/60">
                        Quick Summary
                      </p>
                      <div className="mt-3 space-y-3">
                        <div className="rounded-md border border-[#BF9B53] bg-header p-3.5">
                          <p className="text-[10px] font-black uppercase tracking-wider text-tabActive/70">
                            Driver Status
                          </p>
                          <div className="mt-1.5">
                            <StatusBadge status={driver?.driverStatus} />
                          </div>
                        </div>
                        <div className="rounded-md border border-[#BF9B53] bg-header p-3.5">
                          <p className="text-[10px] font-black uppercase tracking-wider text-tabActive/70">
                            Current Route
                          </p>
                          <p className="mt-1.5 text-sm font-black text-systemText">
                            {currentShipment
                              ? `${
                                  currentShipment.shipment?.pickupLocation?.split(
                                    ","
                                  )?.[0] || "Pickup"
                                } → ${
                                  currentShipment.shipment?.deliveryLocation?.split(
                                    ","
                                  )?.[0] || "Delivery"
                                }`
                              : "No active shipment"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
        {activeTab === "home" && (
          <TripActionPanel
            currentShipment={currentShipment}
            locationPermission={locationPermission}
            isStartingTrip={isStartingTrip}
            onStartTrip={handleStartTrip}
            navigate={navigate}
          />
        )}
        <BottomTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          navigate={navigate}
        />

        {mapModalOpen && currentShipment && (
          <RouteMapModal
            isOpen={mapModalOpen}
            onClose={() => setMapModalOpen(false)}
            driverLocation={driverLocation}
            pickupLocation={{
              lat: currentShipment.shipment?.pickupCoords?.latitude,
              lng: currentShipment.shipment?.pickupCoords?.longitude,
            }}
            deliveryLocation={{
              lat: currentShipment.shipment?.deliveryCoords?.latitude,
              lng: currentShipment.shipment?.deliveryCoords?.longitude,
            }}
            pickupAddress={currentShipment.shipment?.pickupLocation}
            deliveryAddress={currentShipment.shipment?.deliveryLocation}
          />
        )}

        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative w-full max-w-lg">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-white/70 hover:text-white"
              >
                <FiX size={24} />
              </button>
              <img
                src={selectedImage}
                alt="Full view"
                className="w-full max-h-[90vh] object-contain rounded-md"
              />
            </div>
          </div>
        )}

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

export default DriverDashboard;
