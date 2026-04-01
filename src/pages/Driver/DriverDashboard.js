import React, { useEffect, useState, useMemo, useCallback } from "react";
import { FaTruck, FaMapLocationDot, FaLocationDot } from "react-icons/fa6";
import { FiX, FiLogOut, FiPhone, FiMail, FiFileText } from "react-icons/fi";
import PageLoader from "../../components/common/PageLoader";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useDriverAuth } from "../../contexts/DriverAuthContext";
import RouteMapModal from "./Routemapmodal";

const DriverDashboard = () => {
  const {
    driver,
    vehicle,
    shipment: currentShipment,
    loading: contextLoading,
    fetchDriver,
    logout,
  } = useDriverAuth();

  const [selectedImage, setSelectedImage] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);

  // Fetch driver data on mount
  useEffect(() => {
    fetchDriver();
  }, [fetchDriver]);

  // Get driver current location
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
          (position) => {
            setDriverLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setLocationError(false);
          },
          () => {
            setLocationError(true);
            console.warn("Geolocation permission denied");
          }
        );
      }
    };

    updateLocation();

    // Update location every 30 seconds
    const interval = setInterval(updateLocation, 30000);
    return () => clearInterval(interval);
  }, [driver]);

  // Handlers
  const handleLogout = () => setConfirmLogout(true);
  const confirmLogoutAction = () => logout();

  const assignedVehicles = useMemo(() => {
    return (
      driver?.assignedVehicles
        ?.map((vehicleId) => (vehicleId === vehicle?._id ? vehicle : null))
        .filter(Boolean) || []
    );
  }, [driver, vehicle]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const formatTime = useCallback((timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    } catch {
      return timeString;
    }
  }, []);

  if (contextLoading || !driver) {
    return <PageLoader text="Loading driver dashboard..." fullScreen />;
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen  font-montserrat">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-lg shadow-lg z-50 border-b border-slate-200/50">
        <div className="mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-3 border-gradient-to-r from-blue-400 to-cyan-400 cursor-pointer shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center bg-slate-200">
                {driver.profileImage?.url ? (
                  <img
                    src={driver.profileImage.url}
                    alt={driver.name || "Driver"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#BF9B53] font-bold text-lg">
                    {driver.name?.[0]?.toUpperCase() || "D"}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm sm:text-base truncate">
                {driver.name || "N/A"}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 truncate">
                {driver.role || "Driver"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium text-sm"
            title="Logout"
          >
            <FiLogOut size={20} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="h-20 sm:h-24"></div>

      <div className=" md:px-4 mt-6 space-y-6 max-w-full mx-auto">
        {/* DRIVER INFO CARD */}
        <div className="bg-white rounded-md shadow-md p-6 border border-2 border-[#BF9B53] hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold mb-5  flex items-center gap-3 text-[#BF9B53]">
            Driver Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {/* Email */}
            <div className="flex items-start gap-3">
              <FiMail className="text-blue-500 mt-1 flex-shrink-0" size={18} />
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                  Email
                </p>
                <p className="font-medium text-slate-900">
                  {driver.email || "N/A"}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <FiPhone
                className="text-green-500 mt-1 flex-shrink-0"
                size={18}
              />
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                  Phone
                </p>
                <p className="font-medium text-slate-900">
                  {driver.phone || "N/A"}
                </p>
              </div>
            </div>

            {/* License */}
            <div className="flex items-start gap-3">
              <FiFileText
                className="text-amber-500 mt-1 flex-shrink-0"
                size={18}
              />
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                  License
                </p>
                <p className="font-medium text-slate-900">
                  {driver.licenseNumber || "N/A"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                Status
              </p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                  driver.driverStatus === "available"
                    ? "bg-green-100 text-green-700"
                    : driver.driverStatus === "on_trip"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {(driver.driverStatus || "N/A").toUpperCase()}
              </span>
            </div>

            {/* Active Status */}
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                Active
              </p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                  driver.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {driver.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            {/* Current Location */}
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">
                Location
              </p>
              {driverLocation ? (
                <p className="font-medium text-slate-900 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {driverLocation.lat.toFixed(4)},{" "}
                    {driverLocation.lng.toFixed(4)}
                  </span>
                </p>
              ) : (
                <p className="text-slate-500 font-medium">
                  {locationError ? "Permission Denied" : "Loading..."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CURRENT SHIPMENT SECTION */}
        {currentShipment && (
          <div className="bg-gradient-to-br from-yellow-50 to-cyan-50 rounded-md p-6 border-2 border-[#BF9B53] shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-[#BF9B53]">
                  Current Shipment
                </h3>
                <p className="text-sm text-blue-700 font-medium">
                  Status:{" "}
                  <span className="font-bold">
                    {(currentShipment.tripStatus || "N/A").toUpperCase()}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* PICKUP INFO */}
              <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-[#BF9B53]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#BF9B53] rounded-lg flex items-center justify-center">
                    <FaLocationDot className="text-white text-sm" />
                  </div>
                  <h4 className="font-bold text-slate-900">Pickup</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">
                      Location
                    </p>
                    <p className="text-slate-900 font-medium">
                      {currentShipment.shipment?.pickupAddress || "N/A"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">
                        Date
                      </p>
                      <p className="text-slate-900 font-medium">
                        {formatDate(currentShipment.shipment?.pickupDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">
                        Time
                      </p>
                      <p className="text-slate-900 font-medium">
                        {formatTime(currentShipment.pickupTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DELIVERY INFO */}
              <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-[#BF9B53]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#BF9B53] rounded-lg flex items-center justify-center">
                    <FaMapLocationDot className="text-white text-sm" />
                  </div>
                  <h4 className="font-bold text-slate-900">Delivery</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">
                      Location
                    </p>
                    <p className="text-slate-900 font-medium">
                      {currentShipment.shipment?.deliveryAddress || "N/A"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">
                        Date
                      </p>
                      <p className="text-slate-900 font-medium">
                        {formatDate(currentShipment.shipment?.deliveryDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">
                        Horses
                      </p>
                      <p className="text-slate-900 font-medium">
                        {currentShipment.shipment?.numberOfHorses || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SHIPMENT DETAILS */}
            {currentShipment.shipment?.notes && (
              <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-blue-200/50 mb-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Special Notes
                </p>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {currentShipment.shipment.notes}
                </p>
              </div>
            )}

            {/* VIEW ROUTE BUTTON */}
            <div className="flex justify-end pt-4 border-t border-blue-200/50">
              <button
                onClick={() => setMapModalOpen(true)}
                disabled={!driverLocation}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#BF9B53] to-cyan-600 text-white font-bold rounded-lg hover:shadow-lg hover:from-cyan-600 hover:to-[#BF9B53] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaMapLocationDot size={18} />
                View Route on Map
              </button>
            </div>
          </div>
        )}

        {!currentShipment && (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/50">
            <FaTruck className="text-slate-300 text-5xl mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              No active shipment assigned
            </p>
          </div>
        )}

        {/* ASSIGNED VEHICLES */}
        <div>
          {assignedVehicles.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#BF9B53]">
              <FaTruck className="text-slate-300 text-4xl mx-auto mb-3" />
              <p className="text-slate-500 font-medium">
                No vehicle assigned yet
              </p>
            </div>
          ) : (
            <div className=" gap-5 mb-6">
              {assignedVehicles.map((veh) => (
                <div
                  key={veh._id}
                  className="bg-white rounded-md p-5 border  border-2 border-[#BF9B53] hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <h3 className="text-2xl font-bold text-[#BF9B53]">
                    Assigned Vehicle{assignedVehicles.length !== 1 ? "s" : ""} (
                    {assignedVehicles.length})
                  </h3>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">
                        {veh.vehicleNumber || "N/A"}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {veh.vehicleType} • {veh.transportType}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <FaTruck className="text-amber-600 text-lg" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4 pb-4 border-b border-slate-200/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Trailer Type:</span>
                      <span className="font-semibold text-slate-900">
                        {veh.trailerType || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Stalls:</span>
                      <span className="font-semibold text-slate-900">
                        {veh.numberOfStalls} ({veh.stallSize})
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {veh.notes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200/50">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {veh.notes}
                      </p>
                    </div>
                  )}

                  {/* Images */}
                  {veh.images && veh.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                      {veh.images.map((img) => (
                        <img
                          key={img._id}
                          src={img.url}
                          alt={`${veh.vehicleNumber}`}
                          onClick={() => setSelectedImage(img.url)}
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 flex-shrink-0 cursor-pointer hover:shadow-md hover:scale-110 transition-transform"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ROUTE MAP MODAL */}
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
          pickupAddress={currentShipment.shipment?.pickupAddress}
          deliveryAddress={currentShipment.shipment?.deliveryAddress}
        />
      )}

      {/* FULL SCREEN IMAGE MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] animate-fade-in">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              title="Close"
            >
              <FiX size={32} />
            </button>
            <img
              src={selectedImage}
              alt="Full view"
              className="w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRM MODAL */}
      <ConfirmModal
        show={confirmLogout}
        title="Logout"
        message="Are you sure you want to log out? You'll need to login again to access your dashboard."
        onConfirm={confirmLogoutAction}
        onCancel={() => setConfirmLogout(false)}
        confirmText="Logout"
        confirmColor="red"
      />

      {/* CUSTOM SCROLLBAR STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DriverDashboard;
