import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  FaTruck,
  FaMapLocationDot,
  FaLocationDot,
  FaHorse,
} from "react-icons/fa6";
import {
  FiX,
  FiLogOut,
  FiPhone,
  FiMail,
  FiFileText,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiHome,
  FiUser,
  FiAlertCircle,
  FiList,
  FiPackage,
  FiCheckCircle,
} from "react-icons/fi";
import { MdMyLocation } from "react-icons/md";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";
import { useDriverAuth } from "../../contexts/DriverAuthContext";
import RouteMapModal from "./Routemapmodal";
import UpdateLocation from "./Updatelocation";
import { useNavigate } from "react-router-dom";

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

/* ─── LOCATION CARD ─── */
const LocationCard = ({ type, location, date, time, icon, color }) => (
  <div
    className={`rounded-md border p-3 ${
      color === "gold"
        ? "border-[#BF9B53] bg-header"
        : "border-[#BF9B53] bg-white"
    }`}
  >
    <div className="flex items-center gap-2 mb-1.5">
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
          color === "gold" ? "bg-[#BF9B53]" : "bg-[#BF9B53]"
        }`}
      >
        {icon}
      </div>
      <span className="font-black text-[10px] text-tabActive/80 uppercase tracking-wider">
        {type}
      </span>
    </div>
    <p className="text-sm font-bold text-systemText leading-snug mb-1.5">
      {location || "N/A"}
    </p>
    <div className="flex gap-4 text-[11px] text-tabActive/70">
      <span className="flex items-center gap-1">
        <FiCalendar size={9} />
        {date}
      </span>
      <span className="flex items-center gap-1">
        <FiClock size={9} />
        {time}
      </span>
    </div>
  </div>
);

/* ─── PERMISSION ALERT ─── */
const PermissionAlert = ({ permission, onRequest }) => {
  if (permission === "granted") return null;
  return (
    <div className="bg-header border border-[#BF9B53] rounded-md p-4 space-y-3 shadow-sm">
      <div className="flex items-start gap-3">
        <FiAlertCircle size={16} className="text-[#BF9B53] shrink-0 mt-0.5" />
        <div>
          <p className="font-black text-systemText text-sm">
            Location Permission Required
          </p>
          <p className="text-xs text-tabActive mt-0.5 leading-relaxed">
            Enable location access to start trips and use live tracking.
          </p>
        </div>
      </div>
      <button
        onClick={onRequest}
        className="w-full py-2.5 bg-[#BF9B53] border border-[#BF9B53] text-white font-black text-xs rounded-md hover:brightness-110 active:scale-95 transition-all"
      >
        Enable Location Access
      </button>
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

  return (
    <div className="w-full px-4 pt-4 pb-28 md:px-0 md:pb-8 space-y-4">
      <PermissionAlert
        permission={locationPermission}
        onRequest={onRequestPermission}
      />

      {currentShipment ? (
        <SectionCard title="Current Shipment" accent>
          <div className="mb-4 rounded-md border border-[#BF9B53] bg-header p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-tabActive">
                  Active Route
                </p>
                <p className="mt-1 text-base md:text-lg font-black text-systemText">
                  {currentShipment.shipment?.pickupLocation?.split(",")?.[0] ||
                    "Pickup"}
                  <span className="mx-2 text-[#BF9B53]">→</span>
                  {currentShipment.shipment?.deliveryLocation?.split(
                    ","
                  )?.[0] || "Delivery"}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-md border border-[#BF9B53] bg-white px-3 py-2 shadow-sm">
                <FaTruck size={13} className="text-[#BF9B53]" />
                <span className="text-xs font-black text-tabActive">
                  {currentShipment.shipment?.numberOfHorses ||
                    currentShipment.shipment?.horses?.length ||
                    0}{" "}
                  Horse Shipment
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between bg-white border border-[#BF9B53] rounded-md px-3 py-2.5">
            <span className="text-xs font-semibold text-tabActive/80">
              Trip Status
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  normalizedTripStatus === "started"
                    ? "bg-success animate-pulse"
                    : normalizedTripStatus === "completed"
                    ? "bg-[#BF9B53]"
                    : "bg-header0"
                }`}
              />
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  normalizedTripStatus === "started"
                    ? "text-success-700"
                    : normalizedTripStatus === "completed"
                    ? "text-tabActive"
                    : "text-tabActive"
                }`}
              >
                {normalizedTripStatus === "started"
                  ? "IN TRANSIT"
                  : normalizedTripStatus === "completed"
                  ? "COMPLETED"
                  : "NOT STARTED"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-3 mb-4 items-center">
            <LocationCard
              type="Pickup"
              icon={<FaLocationDot className="text-white" size={11} />}
              color="gold"
              location={currentShipment.shipment?.pickupLocation}
              date={formatDate(currentShipment.shipment?.pickupDate)}
            />
            <div className="flex justify-center py-0.5 xl:py-0">
              <div className="flex flex-col items-center gap-0.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-0.5 h-1.5 bg-[#BF9B53] rounded-full"
                  />
                ))}
                <FiMapPin size={11} className="text-[#BF9B53] mt-0.5" />
              </div>
            </div>
            <LocationCard
              type="Delivery"
              icon={<FaMapLocationDot className="text-white" size={11} />}
              color="green"
              location={currentShipment.shipment?.deliveryLocation}
              date={formatDate(currentShipment.shipment?.deliveryDate)}
            />
          </div>

          {/* Horses */}
          {currentShipment.shipment?.horses?.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-black text-tabActive/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FaHorse size={10} className="text-[#BF9B53]" /> Horses (
                {currentShipment.shipment.horses.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentShipment.shipment.horses.map((horse, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-[#BF9B53] rounded-md p-3 shadow-sm"
                  >
                    {horse.photo?.url && (
                      <img
                        src={horse.photo.url}
                        alt={horse.registeredName}
                        onClick={() => setSelectedImage(horse.photo.url)}
                        className="w-full h-20 object-cover rounded-lg mb-2 cursor-pointer"
                      />
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        ["Registered", horse.registeredName],
                        ["Barn", horse.barnName],
                        ["Breed", horse.breed],
                        ["Sex", horse.sex],
                      ].map(([lbl, val]) => (
                        <div key={lbl}>
                          <p className="text-[9px] font-black text-tabActive/70 uppercase mb-0.5">
                            {lbl}
                          </p>
                          <p className="font-semibold text-systemText truncate">
                            {val || "N/A"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {shipmentNotes && (
            <div className="mb-4 bg-header border border-[#BF9B53] rounded-md p-3">
              <p className="text-[10px] font-black text-tabActive uppercase mb-1">
                Notes
              </p>
              <p className="text-xs text-systemText leading-relaxed">
                {shipmentNotes}
              </p>
            </div>
          )}
          <div className="pt-1">
            <button
              onClick={() => setMapModalOpen(true)}
              disabled={!driverLocation}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#BF9B53] border border-[#BF9B53] text-white font-black text-sm rounded-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
            >
              <FaMapLocationDot size={15} />
              View Route on Map
            </button>
          </div>
        </SectionCard>
      ) : (
        <div className="bg-white rounded-md border border-dashed border-[#BF9B53] px-6 py-14 text-center shadow-sm">
          <div className="w-14 h-14 bg-header rounded-md flex items-center justify-center mx-auto mb-3">
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
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#BF9B53] border border-[#BF9B53] text-white font-black text-xs rounded-md hover:brightness-110 active:scale-95 transition-all"
            >
              <FiList size={12} />
              View All Shipments
            </button>
          )}
        </div>
      )}

      {/* Vehicle */}
      {assignedVehicles.length > 0 && (
        <SectionCard title="Assigned Vehicle" collapsible defaultOpen={false}>
          <div className="space-y-4">
            {assignedVehicles.map((veh) => (
              <div
                key={veh._id}
                className="overflow-hidden rounded-md border border-[#BF9B53] bg-white shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-[230px_1fr]">
                  <div className="relative h-44 md:h-full bg-header">
                    {veh.images?.[0]?.url ? (
                      <img
                        src={veh.images[0].url}
                        alt={veh.vehicleNumber || "Vehicle"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-tabActive">
                        <FaTruck size={30} />
                        <p className="text-xs font-black">No vehicle image</p>
                      </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-md bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-tabActive shadow-sm border border-[#BF9B53]">
                      {veh.vehicleType || "Vehicle"}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-black text-systemText">
                          {veh.vehicleNumber || "N/A"}
                        </p>
                        <p className="text-sm text-tabActive/80">
                          {veh.transportType || "N/A"} ·{" "}
                          {veh.trailerType || "N/A"}
                        </p>
                      </div>
                      <span className="rounded-md bg-header border border-[#BF9B53] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-tabActive">
                        Ready
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="rounded-md bg-light border border-[#BF9B53] p-3">
                        <p className="text-[9px] font-black text-tabActive/70 uppercase mb-1">
                          Trailer
                        </p>
                        <p className="font-semibold text-systemText">
                          {veh.trailerType || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-md bg-light border border-[#BF9B53] p-3">
                        <p className="text-[9px] font-black text-tabActive/70 uppercase mb-1">
                          Stalls
                        </p>
                        <p className="font-semibold text-systemText">
                          {veh.numberOfStalls || 0}
                        </p>
                      </div>
                      <div className="rounded-md bg-light border border-[#BF9B53] p-3">
                        <p className="text-[9px] font-black text-tabActive/70 uppercase mb-1">
                          Stall Size
                        </p>
                        <p className="font-semibold text-systemText">
                          {veh.stallSize || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-md bg-light border border-[#BF9B53] p-3">
                        <p className="text-[9px] font-black text-tabActive/70 uppercase mb-1">
                          Transport
                        </p>
                        <p className="font-semibold text-systemText">
                          {veh.transportType || "N/A"}
                        </p>
                      </div>
                    </div>
                    {veh.notes && (
                      <div className="mt-4 rounded-md border border-[#BF9B53] bg-header p-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-tabActive">
                          Vehicle Notes
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-systemText">
                          {veh.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
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
              className="w-full h-full object-cover"
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

/* ─── BOTTOM TAB BAR ─── */
const TABS = [
  { id: "home", label: "Home", Icon: FiHome },
  { id: "location", label: "Location", Icon: MdMyLocation },
  { id: "profile", label: "Profile", Icon: FiUser },
];

const SidebarTabNav = ({ activeTab, setActiveTab, driver, allShipments }) => (
  <aside className="hidden lg:flex lg:w-[220px] xl:w-[240px] lg:flex-col lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-[#BF9B53] lg:bg-[#fffdf8]">
    <div className="flex-1 px-3 py-4 xl:px-4 xl:py-5">
      <div className="rounded-md border border-[#BF9B53] bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-md overflow-hidden border-2 border-[#BF9B53] flex items-center justify-center bg-white shadow-sm">
              {driver?.profileImage?.url ? (
                <img
                  src={driver.profileImage.url}
                  alt={driver?.name || "Driver"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#BF9B53] font-black text-base">
                  {driver?.name?.[0]?.toUpperCase() || "D"}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-tabActive/70">
              Driver Panel
            </p>
            <p className="mt-1 truncate text-sm font-black text-systemText">
              {driver?.name || "Driver"}
            </p>
            <div className="mt-1">
              <StatusBadge status={driver?.driverStatus} />
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-white border border-[#BF9B53] p-2.5">
            <p className="text-[9px] font-black uppercase tracking-wider text-tabActive/70">
              Trips
            </p>
            <p className="mt-1 text-base font-black text-tabActive">
              {allShipments?.length || 0}
            </p>
          </div>
          <div className="rounded-md bg-white border border-[#BF9B53] p-2.5">
            <p className="text-[9px] font-black uppercase tracking-wider text-tabActive/70">
              Status
            </p>
            <p className="mt-1 text-xs font-black text-systemText capitalize">
              {normalizeDriverStatus(driver?.driverStatus) || "n/a"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full rounded-md border px-3 py-2.5 text-left transition-all ${
                active
                  ? "border-[#BF9B53] bg-header text-tabActive shadow-sm"
                  : "border-[#BF9B53] bg-white text-systemText hover:bg-header"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-md ${
                    active
                      ? "bg-white shadow-sm border border-[#BF9B53]"
                      : "bg-header border border-[#BF9B53]"
                  }`}
                >
                  <Icon
                    size={18}
                    className={active ? "text-tabActive" : "text-tabActive/60"}
                  />
                </div>
                <div>
                  <p className="text-sm font-black leading-none">{label}</p>
                  <p className="text-[11px] text-tabActive/65">
                    {id === "home"
                      ? "Shipment overview"
                      : id === "location"
                      ? "Tracking and sync"
                      : "Driver account"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </aside>
);

const InlineTabNav = ({ activeTab, setActiveTab }) => (
  <div className="hidden md:flex lg:hidden mt-5 gap-2 overflow-x-auto pb-1">
    {TABS.map(({ id, label, Icon }) => {
      const active = activeTab === id;
      return (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
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

const BottomTabBar = ({ activeTab, setActiveTab }) => (
  <div className="fixed bottom-0 left-0 w-full bg-[#fffdf9] border-t border-[#BF9B53] z-40 shadow-[0_-8px_24px_rgba(17,24,39,0.08)] md:hidden">
    <div
      className="flex items-center justify-around max-w-3xl mx-auto px-2 py-2"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-0.5 px-6 sm:px-8 py-2 rounded-md transition-all ${
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
          ? "hidden xl:block xl:sticky xl:top-6"
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
          <div className="mb-3 rounded-md bg-header border border-[#BF9B53] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-tabActive/70">
              Trip Actions
            </p>
            <p className="mt-1 text-sm font-black text-systemText">
              {shipmentTitle}
            </p>
            <p className="mt-2 text-xs text-tabActive/75">
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
            className={`w-full flex items-center justify-center gap-2 py-3.5 bg-[#BF9B53] border border-[#BF9B53] text-white font-black text-sm rounded-md shadow-sm shadow-[#BF9B53]/20 hover:brightness-105 active:scale-95 transition-all disabled:opacity-40 ${
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
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#BF9B53]  text-white font-black text-sm rounded- shadow-sm shadow-[#BF9B53]/20 hover:brightness-105 active:scale-95 transition-all"
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
  } = useDriverAuth();

  const [activeTab, setActiveTab] = useState("home");
  const [selectedImage, setSelectedImage] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [isStartingTrip, setIsStartingTrip] = useState(false);
  const navigate = useNavigate();

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
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`@keyframes shimmer { to { transform: translateX(200%); } }`}</style>
      <div className="w-full min-h-screen font-montserrat bg-system-background md:bg-gradient-to-br md:from-[#fbf7ef] md:via-[#fffdf8] md:to-[#f1f8f2]">
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
                      className="w-full h-full object-cover"
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
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] lg:gap-6 xl:gap-8">
          <SidebarTabNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            driver={driver}
            allShipments={allShipments}
          />

          <main className="min-w-0 flex-1 md:px-5 md:py-4 lg:px-6 xl:px-8">
            <div className="hidden md:block">
              <div className="rounded-md border border-[#BF9B53] bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-tabActive/60">
                      Driver Dashboard
                    </p>
                    <h1 className="mt-1 text-xl font-black text-systemText lg:text-2xl">
                      {activeTab === "home"
                        ? "Trip overview"
                        : activeTab === "location"
                        ? "Live location"
                        : "Profile and history"}
                    </h1>
                    <p className="mt-1 text-sm text-tabActive/75">
                      {activeTab === "home"
                        ? "Current shipment and trip actions."
                        : activeTab === "location"
                        ? "Sync and manage live location."
                        : "Driver account summary."}
                    </p>
                  </div>
                  {(allShipments?.length || 0) > 0 && (
                    <button
                      onClick={() => navigate("/driver/shipments")}
                      className="flex shrink-0 items-center gap-2 rounded-md border border-[#BF9B53] bg-[#BF9B53] px-4 py-2 text-sm font-black text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
                    >
                      <FiList size={16} />
                      View All Trips
                    </button>
                  )}
                </div>

                <InlineTabNav
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
            </div>

            <div className="pt-4 md:pt-4 xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0">
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
        <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

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
