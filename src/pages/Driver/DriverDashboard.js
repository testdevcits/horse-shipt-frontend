import React, { useEffect, useState, useMemo, useCallback } from "react";
import { FaTruck, FaMapLocationDot, FaLocationDot } from "react-icons/fa6";
import { FiX, FiLogOut, FiPhone, FiMail, FiFileText } from "react-icons/fi";
import PageLoader from "../../components/common/PageLoader";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useDriverAuth } from "../../contexts/DriverAuthContext";
import RouteMapModal from "./Routemapmodal";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
    <div className="w-full min-h-screen font-montserrat bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-4 px-3 sm:px-4">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-lg shadow-lg z-50 border-b-2 border-[#BF9B53]/30">
        <div className="w-full px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 border-[#BF9B53] cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center bg-[#BF9B53]/10">
                {driver.profileImage?.url ? (
                  <img
                    src={driver.profileImage.url}
                    alt={driver.name || "Driver"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#BF9B53] font-bold text-base">
                    {driver.name?.[0]?.toUpperCase() || "D"}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm truncate">
                {driver.name || "N/A"}
              </span>
              <span className="text-xs text-slate-500 truncate">
                {driver.role || "Driver"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium text-xs sm:text-sm"
            title="Logout"
          >
            <FiLogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="h-16 sm:h-20"></div>

      <div className="w-full space-y-4 animate-fade-in px-0">
        {/* DRIVER INFO CARD */}
        <div className="bg-white rounded-xl shadow-md p-4 border-2 border-[#BF9B53] hover:shadow-lg transition-shadow mx-3 sm:mx-4">
          <h3 className="text-lg font-bold mb-4 text-[#BF9B53]">
            Driver Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {/* Email */}
            <div className="flex items-start gap-2">
              <FiMail
                className="text-blue-500 mt-0.5 flex-shrink-0"
                size={16}
              />
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase">
                  Email
                </p>
                <p className="font-medium text-slate-900 text-xs">
                  {driver.email || "N/A"}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-2">
              <FiPhone
                className="text-green-500 mt-0.5 flex-shrink-0"
                size={16}
              />
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase">
                  Phone
                </p>
                <p className="font-medium text-slate-900 text-xs">
                  {driver.phone || "N/A"}
                </p>
              </div>
            </div>

            {/* License */}
            <div className="flex items-start gap-2">
              <FiFileText
                className="text-amber-500 mt-0.5 flex-shrink-0"
                size={16}
              />
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase">
                  License
                </p>
                <p className="font-medium text-slate-900 text-xs">
                  {driver.licenseNumber || "N/A"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">
                Status
              </p>
              <span
                className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
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
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">
                Active
              </p>
              <span
                className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
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
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">
                Location
              </p>
              {driverLocation ? (
                <p className="font-medium text-slate-900 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {driverLocation.lat.toFixed(2)},{" "}
                    {driverLocation.lng.toFixed(2)}
                  </span>
                </p>
              ) : (
                <p className="text-slate-500 font-medium text-xs">
                  {locationError ? "Permission Denied" : "Loading..."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CURRENT SHIPMENT SECTION */}
        {currentShipment && (
          <div className="bg-gradient-to-br from-[#BF9B53]/5 to-yellow-100/30 rounded-xl p-4 border-2 border-[#BF9B53] shadow-lg mx-3 sm:mx-4">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-[#BF9B53]">
                Current Shipment
              </h3>
              <p className="text-xs sm:text-sm text-[#8B7043] font-bold mt-1">
                Status:{" "}
                <span className="text-[#BF9B53]">
                  {(currentShipment.tripStatus || "N/A").toUpperCase()}
                </span>
              </p>
            </div>

            {/* Pickup & Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* PICKUP INFO */}
              <div className="bg-white rounded-lg p-3 border border-[#BF9B53]/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-[#BF9B53] rounded flex items-center justify-center">
                    <FaLocationDot className="text-white text-xs" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Pickup</h4>
                </div>
                <div className="space-y-1 text-xs">
                  <div>
                    <p className="text-slate-500 font-bold">LOCATION</p>
                    <p className="text-slate-900 font-medium">
                      {currentShipment.shipment?.pickupLocation || "N/A"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-slate-500 font-bold">DATE</p>
                      <p className="text-slate-900 font-medium">
                        {formatDate(currentShipment.shipment?.pickupDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold">TIME</p>
                      <p className="text-slate-900 font-medium">
                        {formatTime(currentShipment.pickupTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DELIVERY INFO */}
              <div className="bg-white rounded-lg p-3 border border-[#BF9B53]/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-[#BF9B53] rounded flex items-center justify-center">
                    <FaMapLocationDot className="text-white text-xs" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Delivery</h4>
                </div>
                <div className="space-y-1 text-xs">
                  <div>
                    <p className="text-slate-500 font-bold">LOCATION</p>
                    <p className="text-slate-900 font-medium">
                      {currentShipment.shipment?.deliveryLocation || "N/A"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-slate-500 font-bold">DATE</p>
                      <p className="text-slate-900 font-medium">
                        {formatDate(currentShipment.shipment?.deliveryDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold">ETA</p>
                      <p className="text-slate-900 font-medium">
                        {formatTime(currentShipment.estimatedArrivalTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* HORSES DETAILS */}
            {currentShipment.shipment?.horses &&
              currentShipment.shipment.horses.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-[#BF9B53]/30 mb-4">
                  <h4 className="font-bold text-[#BF9B53] text-sm mb-3">
                    Horses ({currentShipment.shipment.horses.length})
                  </h4>

                  <div className="space-y-2">
                    {currentShipment.shipment.horses.map((horse, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-[#BF9B53]/10 to-yellow-100/30 rounded p-3 border border-[#BF9B53]/20"
                      >
                        {/* Horse Photo */}
                        {horse.photo?.url && (
                          <div className="mb-2">
                            <img
                              src={horse.photo.url}
                              alt={horse.registeredName}
                              onClick={() => setSelectedImage(horse.photo.url)}
                              className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          </div>
                        )}

                        {/* Horse Info Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {/* Registered Name */}
                          <div>
                            <p className="text-slate-500 font-bold">
                              REGISTERED
                            </p>
                            <p className="text-slate-900 font-medium">
                              {horse.registeredName || "N/A"}
                            </p>
                          </div>

                          {/* Barn Name */}
                          <div>
                            <p className="text-slate-500 font-bold">
                              BARN NAME
                            </p>
                            <p className="text-slate-900 font-medium">
                              {horse.barnName || "N/A"}
                            </p>
                          </div>

                          {/* Breed */}
                          <div>
                            <p className="text-slate-500 font-bold">BREED</p>
                            <p className="text-slate-900 font-medium">
                              {horse.breed || "N/A"}
                            </p>
                          </div>

                          {/* Sex */}
                          <div>
                            <p className="text-slate-500 font-bold">SEX</p>
                            <p className="text-slate-900 font-medium">
                              {horse.sex || "N/A"}
                            </p>
                          </div>

                          {/* Age */}
                          <div>
                            <p className="text-slate-500 font-bold">AGE</p>
                            <p className="text-slate-900 font-medium">
                              {horse.age || "N/A"}
                            </p>
                          </div>

                          {/* Colour */}
                          <div>
                            <p className="text-slate-500 font-bold">COLOUR</p>
                            <p className="text-slate-900 font-medium">
                              {horse.colour || "N/A"}
                            </p>
                          </div>

                          {/* Stall Size */}
                          <div className="sm:col-span-3">
                            <p className="text-slate-500 font-bold">
                              STALL SIZE
                            </p>
                            <p className="text-slate-900 font-medium">
                              {horse.requestedStallSize || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* General Info */}
                        {horse.generalInfo && (
                          <div className="mt-2 pt-2 border-t border-[#BF9B53]/20">
                            <p className="text-slate-500 font-bold text-xs">
                              INFO
                            </p>
                            <p className="text-slate-900 text-xs leading-tight">
                              {horse.generalInfo}
                            </p>
                          </div>
                        )}

                        {/* Documents */}
                        {(horse.documents?.coggins?.url ||
                          horse.documents?.healthCertificate?.url ||
                          horse.documents?.other?.url) && (
                          <div className="mt-2 pt-2 border-t border-[#BF9B53]/20">
                            <p className="text-slate-500 font-bold text-xs mb-1">
                              DOCUMENTS
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {horse.documents?.coggins?.url && (
                                <a
                                  href={horse.documents.coggins.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-[#BF9B53] text-white px-2 py-1 rounded text-xs font-bold hover:opacity-80"
                                >
                                  Coggins
                                </a>
                              )}
                              {horse.documents?.healthCertificate?.url && (
                                <a
                                  href={horse.documents.healthCertificate.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-[#BF9B53] text-white px-2 py-1 rounded text-xs font-bold hover:opacity-80"
                                >
                                  Health Cert
                                </a>
                              )}
                              {horse.documents?.other?.url && (
                                <a
                                  href={horse.documents.other.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-[#BF9B53] text-white px-2 py-1 rounded text-xs font-bold hover:opacity-80"
                                >
                                  Other
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* GENERAL NOTES */}
            {currentShipment.shipment?.notes && (
              <div className="bg-white rounded-lg p-3 border border-[#BF9B53]/30 mb-4">
                <p className="text-xs font-bold text-slate-500 mb-1">
                  SPECIAL NOTES
                </p>
                <p className="text-slate-700 text-xs leading-tight">
                  {currentShipment.shipment.notes}
                </p>
              </div>
            )}

            {/* SHIPMENT NOTES */}
            {currentShipment.notes && (
              <div className="bg-white rounded-lg p-3 border border-[#BF9B53]/30 mb-4">
                <p className="text-xs font-bold text-slate-500 mb-1">
                  SHIPMENT NOTES
                </p>
                <p className="text-slate-700 text-xs leading-tight">
                  {currentShipment.notes}
                </p>
              </div>
            )}

            {/* SHIPMENT STATS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <div className="bg-white rounded-lg p-2 border border-[#BF9B53]/30 text-center">
                <p className="text-slate-500 font-bold text-xs">PRICE</p>
                <p className="text-[#BF9B53] font-bold text-sm">
                  ${currentShipment.totalPrice || "0"}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 border border-[#BF9B53]/30 text-center">
                <p className="text-slate-500 font-bold text-xs">PAYMENT</p>
                <p className="text-[#BF9B53] font-bold text-xs">
                  {currentShipment.paymentStatus?.toUpperCase() || "N/A"}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 border border-[#BF9B53]/30 text-center">
                <p className="text-slate-500 font-bold text-xs">STALLS</p>
                <p className="text-[#BF9B53] font-bold text-sm">
                  {currentShipment.stallsRequired || "0"}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2 border border-[#BF9B53]/30 text-center">
                <p className="text-slate-500 font-bold text-xs">STATUS</p>
                <p className="text-[#BF9B53] font-bold text-xs">
                  {currentShipment.status?.toUpperCase() || "N/A"}
                </p>
              </div>
            </div>

            {/* VIEW ROUTE BUTTON */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMapModalOpen(true)}
                disabled={!driverLocation}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#BF9B53] to-orange-500 text-white font-bold text-sm rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaMapLocationDot size={16} />
                View Route
              </button>

              <button
                onClick={() =>
                  navigate(`/driver/delivery/${currentShipment.shipment?._id}`)
                }
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 transition"
              >
                Deliver
              </button>
            </div>
          </div>
        )}

        {!currentShipment && (
          <div className="bg-white rounded-lg p-6 text-center border border-[#BF9B53] mx-3 sm:mx-4">
            <FaTruck className="text-slate-300 text-4xl mx-auto mb-2" />
            <p className="text-slate-500 font-medium text-sm">
              No active shipment assigned
            </p>
          </div>
        )}

        {/* ASSIGNED VEHICLES */}
        {assignedVehicles.length > 0 && (
          <div className="mx-3 sm:mx-4">
            <h3 className="text-lg font-bold text-[#BF9B53] mb-3">
              Assigned Vehicle{assignedVehicles.length !== 1 ? "s" : ""} (
              {assignedVehicles.length})
            </h3>

            <div className="space-y-3">
              {assignedVehicles.map((veh) => (
                <div
                  key={veh._id}
                  className="bg-white rounded-lg p-4 border-2 border-[#BF9B53] hover:shadow-lg transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">
                        {veh.vehicleNumber || "N/A"}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {veh.vehicleType} • {veh.transportType}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-3 pb-3 border-b border-slate-200">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-bold">Trailer:</span>
                      <span className="font-semibold text-slate-900">
                        {veh.trailerType || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-bold">Stalls:</span>
                      <span className="font-semibold text-slate-900">
                        {veh.numberOfStalls} ({veh.stallSize})
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {veh.notes && (
                    <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-slate-600 leading-tight">
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
                          className="w-14 h-14 object-cover rounded border border-slate-200 flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {assignedVehicles.length === 0 && (
          <div className="bg-white rounded-lg p-6 text-center border border-[#BF9B53] mx-3 sm:mx-4">
            <FaTruck className="text-slate-300 text-4xl mx-auto mb-2" />
            <p className="text-slate-500 font-medium text-sm">
              No vehicle assigned yet
            </p>
          </div>
        )}
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
          pickupAddress={currentShipment.shipment?.pickupLocation}
          deliveryAddress={currentShipment.shipment?.deliveryLocation}
        />
      )}

      {/* FULL SCREEN IMAGE MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] animate-fade-in">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-8 right-0 text-white hover:text-gray-300 transition-colors"
              title="Close"
            >
              <FiX size={28} />
            </button>
            <img
              src={selectedImage}
              alt="Full view"
              className="w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRM MODAL */}
      <ConfirmModal
        show={confirmLogout}
        title="Logout"
        message="Are you sure you want to log out?"
        onConfirm={confirmLogoutAction}
        onCancel={() => setConfirmLogout(false)}
        confirmText="Logout"
        confirmColor="red"
      />

      {/* CUSTOM STYLES */}
      <style>{`
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
