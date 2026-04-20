import React, { useEffect, useState, useMemo, useCallback } from "react";
import { FaTruck, FaMapLocationDot, FaLocationDot } from "react-icons/fa6";
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
  FiNavigation,
  FiHome,
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";
import { MdMyLocation, MdCheckCircle } from "react-icons/md";
import ConfirmModal from "../../components/common/ConfirmModal";
import Toast from "../../components/common/Toast";
import { useDriverAuth } from "../../contexts/DriverAuthContext";
import RouteMapModal from "./Routemapmodal";
import UpdateLocation from "./Updatelocation";
import { useNavigate } from "react-router-dom";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);
const DashboardSkeleton = () => (
  <div className="space-y-4 px-3 pt-4">
    <Skeleton className="h-28 w-full rounded-2xl" />
    <Skeleton className="h-48 w-full rounded-2xl" />
    <Skeleton className="h-36 w-full rounded-2xl" />
  </div>
);

const StatusBadge = ({ status }) => {
  const cfg =
    {
      available: "bg-emerald-100 text-emerald-700 border-emerald-200",
      on_trip: "bg-blue-100 text-blue-700 border-blue-200",
      offline: "bg-gray-100 text-gray-500 border-gray-200",
    }[status] || "bg-amber-100 text-amber-700 border-amber-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${cfg}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === "available"
            ? "bg-emerald-500"
            : status === "on_trip"
            ? "bg-blue-500"
            : "bg-gray-400"
        }`}
      />
      {status || "N/A"}
    </span>
  );
};

const SectionCard = ({
  title,
  children,
  accent = false,
  collapsible = false,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={`bg-white rounded-md shadow-sm border ${
        accent ? "border-[#BF9B53]" : "border-gray-100"
      } overflow-hidden`}
    >
      {title && (
        <div
          className={`flex items-center justify-between px-4 py-3 ${
            accent
              ? "bg-gradient-to-r from-[#BF9B53]/10 to-amber-50"
              : "bg-gray-50"
          } border-b ${accent ? "border-[#BF9B53]/20" : "border-gray-100"} ${
            collapsible ? "cursor-pointer" : ""
          }`}
          onClick={collapsible ? () => setOpen(!open) : undefined}
        >
          <h3
            className={`font-bold text-sm ${
              accent ? "text-[#BF9B53]" : "text-gray-700"
            }`}
          >
            {title}
          </h3>
          {collapsible &&
            (open ? (
              <FiChevronUp size={16} className="text-gray-400" />
            ) : (
              <FiChevronDown size={16} className="text-gray-400" />
            ))}
        </div>
      )}
      {(!collapsible || open) && <div className="p-4">{children}</div>}
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-[#BF9B53] shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800 truncate">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

const LocationCard = ({ type, location, date, time, icon, color }) => (
  <div
    className={`rounded-xl border ${
      color === "gold"
        ? "border-[#BF9B53]/30 bg-[#BF9B53]/5"
        : "border-green-200 bg-green-50"
    } p-3`}
  >
    <div className="flex items-center gap-2 mb-2">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          color === "gold" ? "bg-[#BF9B53]" : "bg-green-500"
        }`}
      >
        {icon}
      </div>
      <span className="font-bold text-xs text-gray-700 uppercase tracking-wide">
        {type}
      </span>
    </div>
    <p className="text-sm font-semibold text-gray-800 leading-tight mb-2">
      {location || "N/A"}
    </p>
    <div className="flex gap-3 text-xs text-gray-500">
      <span className="flex items-center gap-1">
        <FiCalendar size={10} />
        {date}
      </span>
      <span className="flex items-center gap-1">
        <FiClock size={10} />
        {time}
      </span>
    </div>
  </div>
);

const PermissionAlert = ({ permission, onRequestPermission }) => {
  if (permission === "granted") {
    return (
      <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-2 rounded-lg flex items-center gap-2">
        <MdCheckCircle size={20} className="text-emerald-600 flex-shrink-0" />

        <p className="font-bold text-sm text-gray-800">
          Location Permission Granted
        </p>
      </div>
    );
  }
  return (
    <div className="bg-amber-50 border border-[#BF9B53]/30 rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <FiAlertCircle
          size={20}
          className="text-[#BF9B53] flex-shrink-0 mt-0.5"
        />
        <div>
          <p className="font-bold text-amber-900 text-sm">
            Location Permission Required
          </p>
          <p className="text-xs text-amber-700 mt-1">
            We need your permission to enable live location tracking for
            shipments.
          </p>
        </div>
      </div>
      <button
        onClick={onRequestPermission}
        className="w-full py-2.5 bg-[#BF9B53] text-white font-bold text-xs rounded-xl hover:bg-amber-600 active:scale-95 transition-all"
      >
        Enable Location Access
      </button>
    </div>
  );
};

const getCurrentBrowserLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

/* ══ HOME TAB ══ */
const HomeTab = ({
  driver,
  currentShipment,
  driverLocation,
  locationError,
  assignedVehicles,
  formatDate,
  formatTime,
  setSelectedImage,
  setMapModalOpen,
  navigate,
  locationPermission,
  onRequestPermission,
  isTrackingEnabled,
  onStartTrip,
  isStartingTrip,
}) => (
  <div className="px-3 pt-4 space-y-3 pb-24">
    <PermissionAlert
      permission={locationPermission}
      onRequestPermission={onRequestPermission}
    />

    {/* <SectionCard title="Driver Information" accent>
      <div className="grid grid-cols-1 gap-3">
        <div className="grid grid-cols-2 gap-3">
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
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InfoRow
            icon={<FiFileText size={14} />}
            label="License"
            value={driver.licenseNumber}
          />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Location
            </p>
            {driverLocation ? (
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                {driverLocation.lat.toFixed(3)}, {driverLocation.lng.toFixed(3)}
              </p>
            ) : (
              <p className="text-sm text-gray-400 font-medium">
                {locationError ? "Permission Denied" : "Locating..."}
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Tracking Status
          </p>
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              isTrackingEnabled
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-gray-50 text-gray-600 border-gray-200"
            }`}
          >
            {isTrackingEnabled ? "🟢 TRACKING ACTIVE" : "⚫ TRACKING INACTIVE"}
          </span>
        </div>
      </div>
    </SectionCard> */}

    {currentShipment ? (
      <SectionCard title="Current Shipment" accent>
        {/* Trip Status */}
        <div className="mb-4 flex items-center justify-between bg-amber-50 border border-[#BF9B53]/30 rounded-xl px-3 py-2">
          <span className="text-xs text-gray-500 font-semibold">
            Trip Status
          </span>
          <span
            className={`text-xs font-black uppercase tracking-wider ${
              currentShipment.tripStatus === "started"
                ? "text-green-600"
                : currentShipment.tripStatus === "completed"
                ? "text-blue-600"
                : "text-[#BF9B53]"
            }`}
          >
            {currentShipment.tripStatus || "NOT STARTED"}
          </span>
        </div>

        {/* Route */}
        <div className="space-y-2 mb-4">
          <LocationCard
            type="Pickup"
            icon={<FaLocationDot className="text-white text-xs" />}
            color="gold"
            location={currentShipment.shipment?.pickupLocation}
            date={formatDate(currentShipment.shipment?.pickupDate)}
            time={formatTime(currentShipment.pickupTime)}
          />
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 h-1.5 bg-[#BF9B53]/40 rounded-full"
                />
              ))}
              <FiMapPin size={14} className="text-[#BF9B53]" />
            </div>
          </div>
          <LocationCard
            type="Delivery"
            icon={<FaMapLocationDot className="text-white text-xs" />}
            color="green"
            location={currentShipment.shipment?.deliveryLocation}
            date={formatDate(currentShipment.shipment?.deliveryDate)}
            time={formatTime(currentShipment.estimatedArrivalTime)}
          />
        </div>

        {/* Horses */}
        {currentShipment.shipment?.horses?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              Horses ({currentShipment.shipment.horses.length})
            </p>
            <div className="space-y-2">
              {currentShipment.shipment.horses.map((horse, idx) => (
                <div
                  key={idx}
                  className="bg-amber-50/60 border border-[#BF9B53]/20 rounded-xl p-3"
                >
                  {horse.photo?.url && (
                    <img
                      src={horse.photo.url}
                      alt={horse.registeredName}
                      onClick={() => setSelectedImage(horse.photo.url)}
                      className="w-full h-36 object-cover rounded-lg mb-3 cursor-pointer"
                    />
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      ["Registered", horse.registeredName],
                      ["Barn Name", horse.barnName],
                      ["Breed", horse.breed],
                      ["Sex", horse.sex],
                      ["Age", horse.age],
                      ["Colour", horse.colour],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-[9px] font-black text-gray-400 uppercase">
                          {label}
                        </p>
                        <p className="font-semibold text-gray-800">
                          {val || "N/A"}
                        </p>
                      </div>
                    ))}
                    <div className="col-span-2">
                      <p className="text-[9px] font-black text-gray-400 uppercase">
                        Stall Size
                      </p>
                      <p className="font-semibold text-gray-800">
                        {horse.requestedStallSize || "N/A"}
                      </p>
                    </div>
                  </div>
                  {horse.generalInfo && (
                    <p className="mt-2 pt-2 border-t border-[#BF9B53]/20 text-xs text-gray-600 leading-relaxed">
                      {horse.generalInfo}
                    </p>
                  )}
                  {(horse.documents?.coggins?.url ||
                    horse.documents?.healthCertificate?.url ||
                    horse.documents?.other?.url) && (
                    <div className="mt-2 pt-2 border-t border-[#BF9B53]/20 flex flex-wrap gap-2">
                      {horse.documents?.coggins?.url && (
                        <a
                          href={horse.documents.coggins.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#BF9B53] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold"
                        >
                          Coggins
                        </a>
                      )}
                      {horse.documents?.healthCertificate?.url && (
                        <a
                          href={horse.documents.healthCertificate.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#BF9B53] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold"
                        >
                          Health Cert
                        </a>
                      )}
                      {horse.documents?.other?.url && (
                        <a
                          href={horse.documents.other.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#BF9B53] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold"
                        >
                          Other
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentShipment.shipment?.notes && (
          <div className="mb-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-[10px] font-black text-blue-400 uppercase mb-1">
              Special Notes
            </p>
            <p className="text-xs text-blue-800 leading-relaxed">
              {currentShipment.shipment.notes}
            </p>
          </div>
        )}
        {currentShipment.notes && (
          <div className="mb-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
              Shipment Notes
            </p>
            <p className="text-xs text-gray-700 leading-relaxed">
              {currentShipment.notes}
            </p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="w-full flex flex-row gap-2 pt-2">
          {/* View Route */}
          <button
            onClick={() => setMapModalOpen(true)}
            disabled={!driverLocation}
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#BF9B53] text-white font-bold text-xs rounded-md shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
          >
            Map
          </button>

          {/* Start Trip */}
          <button
            onClick={() => onStartTrip(currentShipment?._id)}
            disabled={
              isStartingTrip ||
              currentShipment.tripStatus === "started" ||
              currentShipment.tripStatus === "completed"
            }
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-md shadow-md active:scale-95 transition-all disabled:opacity-40 ${
              currentShipment.tripStatus === "started" ||
              currentShipment.tripStatus === "completed"
                ? "bg-gray-100 text-gray-400 border border-gray-200"
                : "flex-1 flex items-center justify-center gap-1 py-2 bg-[#BF9B53] text-white font-bold text-xs rounded-md shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
            }`}
          >
            {isStartingTrip ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {currentShipment.tripStatus === "started"
                  ? "Started"
                  : currentShipment.tripStatus === "completed"
                  ? "Done"
                  : "Start Trip"}
              </>
            )}
          </button>

          {/* Deliver */}
          <button
            onClick={() =>
              navigate(`/driver/delivery/${currentShipment.shipment?._id}`)
            }
            disabled={currentShipment.tripStatus !== "started"}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-md shadow-md active:scale-95 transition-all disabled:opacity-40 ${
              currentShipment.tripStatus === "started"
                ? "bg-green-500 text-white hover:bg-green-600 hover:shadow-lg"
                : "bg-gray-100 text-gray-400 border border-gray-200"
            }`}
          >
            <FaTruck size={12} />
            Deliver
          </button>
        </div>
      </SectionCard>
    ) : (
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
        <FaTruck className="text-gray-200 text-5xl mx-auto mb-3" />
        <p className="text-gray-400 font-semibold text-sm">
          No active shipment assigned
        </p>
        <p className="text-gray-300 text-xs mt-1">
          You'll see your shipment details here once assigned
        </p>
      </div>
    )}

    {assignedVehicles.length > 0 && (
      <SectionCard
        title={`Assigned Vehicle${assignedVehicles.length !== 1 ? "s" : ""} (${
          assignedVehicles.length
        })`}
        collapsible
        defaultOpen={false}
      >
        <div className="space-y-3">
          {assignedVehicles.map((veh) => (
            <div
              key={veh._id}
              className="border border-amber-100 rounded-xl p-3 bg-amber-50/30"
            >
              <p className="font-black text-gray-900 text-sm">
                {veh.vehicleNumber || "N/A"}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                {veh.vehicleType} · {veh.transportType}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2 pb-2 border-b border-amber-100">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">
                    Trailer
                  </p>
                  <p className="font-semibold text-gray-800">
                    {veh.trailerType || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">
                    Stalls
                  </p>
                  <p className="font-semibold text-gray-800">
                    {veh.numberOfStalls} ({veh.stallSize})
                  </p>
                </div>
              </div>
              {veh.notes && (
                <p className="text-xs text-gray-500 mb-2">{veh.notes}</p>
              )}
              {veh.images?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {veh.images.map((img) => (
                    <img
                      key={img._id}
                      src={img.url}
                      alt={veh.vehicleNumber}
                      onClick={() => setSelectedImage(img.url)}
                      className="w-16 h-16 object-cover rounded-xl border border-amber-100 flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    )}
  </div>
);

/* ══ TABS ══ */
const tabs = [
  { id: "home", label: "Home", icon: FiHome },
  { id: "location", label: "Location", icon: MdMyLocation },
  { id: "profile", label: "Profile", icon: FiUser },
];

const BottomTabBar = ({ activeTab, setActiveTab }) => (
  <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-40 shadow-lg">
    <div className="flex items-center justify-around px-2 py-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${
              isActive
                ? "bg-[#BF9B53]/10 text-[#BF9B53]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon size={20} className={isActive ? "text-[#BF9B53]" : ""} />
            <span
              className={`text-[10px] font-bold ${
                isActive ? "text-[#BF9B53]" : "text-gray-400"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

const ProfileTab = ({ driver, setConfirmLogout }) => (
  <div className="px-3 pt-4 pb-24 space-y-3">
    <div className="bg-white rounded-2xl border border-[#BF9B53]/30 p-6 flex flex-col items-center text-center shadow-sm">
      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#BF9B53] shadow-md mb-3 flex items-center justify-center bg-amber-50">
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
      <p className="font-black text-gray-900 text-lg">{driver.name}</p>
      <StatusBadge status={driver.driverStatus} />
    </div>
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
          label="License Number"
          value={driver.licenseNumber}
        />
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-[#BF9B53] shrink-0">
            <FiNavigation size={14} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Active Status
            </p>
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border mt-1 ${
                driver.isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}
            >
              {driver.isActive ? "✓ ACTIVE" : "✗ INACTIVE"}
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
    <button
      onClick={() => setConfirmLogout(true)}
      className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-100 active:scale-95 transition-all"
    >
      <FiLogOut size={18} /> Logout
    </button>
  </div>
);

/* ══ MAIN ══ */
const DriverDashboard = () => {
  const {
    driver,
    vehicle,
    shipment: currentShipment,
    loading: contextLoading,
    fetchDriver,
    logout,
    checkLocationPermission,
    locationPermission,
    startTrip,
    isTrackingEnabled,
  } = useDriverAuth();

  const [activeTab, setActiveTab] = useState("home");
  const [selectedImage, setSelectedImage] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [isStartingTrip, setIsStartingTrip] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDriver();
  }, [fetchDriver]);

  useEffect(() => {
    const updateLocation = () => {
      if (
        driver?.currentLocation?.latitude &&
        driver?.currentLocation?.longitude
      ) {
        setDriverLocation({
          lat: driver.currentLocation.latitude,
          lng: driver.currentLocation.longitude,
        });
        setLocationError(false);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setDriverLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setLocationError(false);
          },
          () => setLocationError(true)
        );
      }
    };
    updateLocation();
    const interval = setInterval(updateLocation, 30000);
    return () => clearInterval(interval);
  }, [driver]);

  useEffect(() => {
    if (!isTrackingEnabled || locationPermission !== "granted") {
      return;
    }

    const syncLiveLocation = async () => {
      try {
        const latestLocation = await getCurrentBrowserLocation();
        setDriverLocation(latestLocation);
        setLocationError(false);
      } catch {
        setLocationError(true);
      }
    };

    syncLiveLocation();
    const interval = setInterval(syncLiveLocation, 5000);

    return () => clearInterval(interval);
  }, [isTrackingEnabled, locationPermission]);

  /* HANDLE START TRIP */
  const handleStartTrip = async (quoteId) => {
    if (!quoteId) {
      Toast.error("Invalid shipment ID");
      return;
    }

    setIsStartingTrip(true);

    try {
      let hasPermission = locationPermission === "granted";

      if (!hasPermission) {
        hasPermission = await checkLocationPermission();
      }

      if (!hasPermission) {
        Toast.error("Please enable location permission first");
        return;
      }

      const latestLocation = await getCurrentBrowserLocation();
      setDriverLocation(latestLocation);

      const res = await startTrip(quoteId, latestLocation);

      if (res?.success) {
        Toast.success("Trip started! Live location tracking is now active.");
        setMapModalOpen(true);
        await fetchDriver();
      } else {
        Toast.error(res?.message || "Failed to start trip");
      }
    } catch (error) {
      Toast.error(error?.message || "Error starting trip");
    } finally {
      setIsStartingTrip(false);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const granted = await checkLocationPermission();
      if (granted) Toast.success("Location permission granted!");
    } catch {
      Toast.error("Location permission denied. Please enable it in settings.");
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
      year: "numeric",
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

  if (contextLoading || !driver) {
    return (
      <div className="min-h-screen bg-amber-50 font-[Montserrat]">
        <div className="fixed top-0 left-0 w-full h-16 bg-white shadow-sm z-50 flex items-center px-4 gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
        <div className="pt-20">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeTab
            driver={driver}
            currentShipment={currentShipment}
            driverLocation={driverLocation}
            locationError={locationError}
            assignedVehicles={assignedVehicles}
            formatDate={formatDate}
            formatTime={formatTime}
            setSelectedImage={setSelectedImage}
            setMapModalOpen={setMapModalOpen}
            navigate={navigate}
            locationPermission={locationPermission}
            onRequestPermission={handleRequestPermission}
            isTrackingEnabled={isTrackingEnabled}
            onStartTrip={handleStartTrip}
            isStartingTrip={isStartingTrip}
          />
        );
      case "location":
        return (
          <div className="pb-24">
            <UpdateLocation
              driver={driver}
              driverLocation={driverLocation}
              onLocationUpdated={(loc) => setDriverLocation(loc)}
            />
          </div>
        );
      case "profile":
        return (
          <ProfileTab driver={driver} setConfirmLogout={setConfirmLogout} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen font-[Montserrat] bg-amber-50/60">
      <header className="fixed top-0 left-0 w-full bg-white/98 backdrop-blur-xl shadow-sm z-50 border-b border-amber-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-[#BF9B53] shadow-sm flex items-center justify-center bg-amber-50">
                {driver.profileImage?.url ? (
                  <img
                    src={driver.profileImage.url}
                    alt={driver.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#BF9B53] font-black text-base">
                    {driver.name?.[0]?.toUpperCase() || "D"}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">
                {driver.name || "Driver"}
              </p>
              <StatusBadge status={driver.driverStatus} />
            </div>
          </div>
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {tabs.find((t) => t.id === activeTab)?.label}
          </span>
        </div>
      </header>

      <div className="h-[68px]" />
      {renderTab()}
      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {mapModalOpen && currentShipment && driverLocation && (
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
              className="absolute -top-10 right-0 text-white/80"
            >
              <FiX size={28} />
            </button>
            <img
              src={selectedImage}
              alt="Full view"
              className="w-full max-h-[90vh] object-contain rounded-2xl"
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
  );
};

export default DriverDashboard;
