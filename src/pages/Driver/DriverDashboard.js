import React, { useState, useRef } from "react";
import { FaTruck } from "react-icons/fa";
import { FiX, FiTrash2, FiLogOut } from "react-icons/fi";
import PageLoader from "../../components/common/PageLoader";
import ConfirmModal from "../../components/common/ConfirmModal";
import Button from "../../components/common/Button";
import { useDriverAuth } from "../../contexts/DriverAuthContext";
import { useNavigate } from "react-router-dom";
import DriverShipmentCard from "./DriverShipmentCard";

const DriverDashboard = () => {
  const {
    driver,
    shipments,
    fetchDriver,
    uploadProfileImage,
    deleteProfileImage,
    logout,
  } = useDriverAuth();

  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const profileInputRef = useRef(null);

  if (!driver)
    return <PageLoader text="Loading driver dashboard..." fullScreen />;

  const assignedVehicles = driver.assignedVehicles || [];
  const hasShipments = shipments && shipments.length > 0;

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadingModal(true);
    await uploadProfileImage(file);
    await fetchDriver();
    setLoadingModal(false);
    setModalOpen(false);
  };

  const handleDeleteProfile = () => setConfirmDelete(true);

  const confirmDeleteProfile = async () => {
    setLoadingModal(true);
    await deleteProfileImage();
    await fetchDriver();
    setLoadingModal(false);
    setConfirmDelete(false);
    setModalOpen(false);
  };

  const handleLogout = () => setConfirmLogout(true);

  const confirmLogoutAction = () => {
    logout();
    navigate("/driver/login");
  };

  return (
    <div className="bg-light min-h-screen font-montserrat pb-6">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer"
              onClick={() => setModalOpen(true)}
            >
              <img
                src={driver.profileImage?.url || "/default-profile.png"}
                alt="Driver"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-sm sm:text-base truncate max-w-[180px]">
              <span className="font-semibold text-systemText truncate">
                {driver.name}
              </span>
              <span className="text-gray-500 truncate">{driver.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-800 transition p-2 rounded-md"
            title="Logout"
          >
            <FiLogOut size={24} />
          </button>
        </div>
      </header>

      <div className="h-20 sm:h-24"></div>

      <div className="px-4 sm:px-6 md:px-10 mt-6 space-y-6">
        {/* Driver Info */}
        <div className="bg-white rounded-md shadow p-5">
          <h3 className="text-lg font-semibold mb-3">Your Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <p>
              <strong>Email:</strong> {driver.email}
            </p>
            <p>
              <strong>Phone:</strong> {driver.phone}
            </p>
            <p>
              <strong>License No:</strong> {driver.licenseNumber}
            </p>
            <p>
              <strong>Notes:</strong> {driver.notes || "N/A"}
            </p>
          </div>
        </div>

        {/* Assigned Vehicles */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Assigned Truck</h3>
          {assignedVehicles.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-5 text-center text-gray-500">
              No truck assigned yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedVehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="bg-white rounded-md shadow p-4 hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FaTruck className="text-yellow-500" />
                    <h4 className="font-bold truncate">
                      {vehicle.vehicleType} ({vehicle.transportType})
                    </h4>
                  </div>

                  <p className="text-sm">
                    <strong>Vehicle No:</strong>{" "}
                    {vehicle.vehicleNumber || "N/A"}
                  </p>
                  <p className="text-sm">
                    <strong>Trailer:</strong> {vehicle.trailerType}
                  </p>
                  <p className="text-sm">
                    <strong>Stalls:</strong> {vehicle.numberOfStalls} (
                    {vehicle.stallSize})
                  </p>

                  <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
                    {(vehicle.images || []).map((img) => (
                      <img
                        key={img._id}
                        src={img.url}
                        alt={`Truck ${vehicle.vehicleNumber}`}
                        onClick={() => setSelectedImage(img.url)}
                        className="w-20 h-20 object-cover rounded-lg border flex-shrink-0 cursor-pointer hover:scale-105 transition"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shipments */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Assigned Shipments</h3>
          {!hasShipments ? (
            <div className="bg-white rounded-2xl shadow p-5 text-center text-gray-500">
              No shipments assigned.
            </div>
          ) : (
            <div className="space-y-4">
              {shipments.map((shipment) => (
                <DriverShipmentCard key={shipment._id} shipment={shipment} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/*  FULL SCREEN IMAGE MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
          <div className="relative w-full max-w-6xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <FiX size={32} />
            </button>

            <img
              src={selectedImage}
              alt="Full Truck"
              className="w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-md p-6 w-full max-w-xs relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setModalOpen(false)}
            >
              <FiX size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-center">
              Profile Image
            </h3>
            <div className="flex flex-col items-center gap-4">
              <img
                src={driver.profileImage?.url || "/default-profile.png"}
                alt="Driver"
                className="w-20 h-20 rounded-full object-cover border"
              />
              {loadingModal && <PageLoader text="Uploading..." size={18} />}
              <div className="flex gap-3 flex-wrap justify-center">
                <Button
                  onClick={() => profileInputRef.current.click()}
                  disabled={loadingModal}
                  variant="primary"
                >
                  {loadingModal ? "Uploading..." : "Update"}
                </Button>
                <Button
                  onClick={handleDeleteProfile}
                  disabled={loadingModal}
                  variant="custom"
                  bgColor="#ef4444"
                  textColor="#fff"
                  icon={<FiTrash2 />}
                >
                  Delete
                </Button>
              </div>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileChange}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={confirmDelete}
        title="Delete Profile Image"
        message="Are you sure you want to delete your profile image?"
        onConfirm={confirmDeleteProfile}
        onCancel={() => setConfirmDelete(false)}
        confirmText="Delete"
      />

      <ConfirmModal
        show={confirmLogout}
        title="Logout"
        message="Are you sure you want to log out?"
        onConfirm={confirmLogoutAction}
        onCancel={() => setConfirmLogout(false)}
        confirmText="Logout"
      />
    </div>
  );
};

export default DriverDashboard;
