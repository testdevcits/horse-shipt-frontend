import React, { useState, useRef } from "react";
import { useDriverAuth } from "../../contexts/DriverAuthContext";
import { FaTruck, FaRoute } from "react-icons/fa";
import { FiX, FiTrash2 } from "react-icons/fi";
import PageLoader from "../../components/common/PageLoader";
import ConfirmModal from "../../components/common/ConfirmModal";
import Button from "../../components/common/Button";

const DriverDashboard = () => {
  const { driver, fetchDriver, uploadProfileImage, deleteProfileImage } =
    useDriverAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const profileInputRef = useRef(null);

  if (!driver) {
    return <PageLoader text="Loading driver dashboard..." fullScreen />;
  }

  const assignedVehicles = driver.assignedVehicles || [];

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingModal(true);
    await uploadProfileImage(file);
    await fetchDriver();
    setLoadingModal(false);
    setModalOpen(false); // Close modal after update
  };

  const handleDeleteProfile = async () => {
    setConfirmDelete(true);
  };

  const confirmDeleteProfile = async () => {
    setLoadingModal(true);
    await deleteProfileImage();
    await fetchDriver();
    setLoadingModal(false);
    setConfirmDelete(false);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 font-[Montserrat]">
      {/* ================= Header ================= */}
      <div className="bg-white rounded-xl shadow p-5 mb-6 flex items-center gap-4">
        <div
          className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer border"
          onClick={() => setModalOpen(true)}
        >
          <img
            src={driver.profileImage?.url || "/default-profile.png"}
            alt="Driver"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold">{driver.name}</h2>
        </div>
      </div>

      {/* ================= Route Status ================= */}
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-xl p-5 mb-6 flex items-center gap-4">
        <FaRoute size={26} />
        <div>
          <h3 className="text-lg font-semibold">Your Route Coming Soon 🚧</h3>
          <p className="text-sm">
            Shipment route will be assigned once the shipper schedules your
            trip.
          </p>
        </div>
      </div>

      {/* ================= Driver Info ================= */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
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

      {/* ================= Assigned Vehicles ================= */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Assigned Truck(s)</h3>

        {assignedVehicles.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-5 text-center text-gray-500">
            No truck assigned yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedVehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FaTruck className="text-blue-600" />
                  <h4 className="font-bold">
                    {vehicle.vehicleType} ({vehicle.transportType})
                  </h4>
                </div>

                <p className="text-sm">
                  <strong>Trailer:</strong> {vehicle.trailerType}
                </p>
                <p className="text-sm">
                  <strong>Stalls:</strong> {vehicle.numberOfStalls} (
                  {vehicle.stallSize})
                </p>

                {/* Images */}
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {(vehicle.images || []).map((img) => (
                    <img
                      key={img._id}
                      src={img.url}
                      alt="Truck"
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= Profile Modal ================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setModalOpen(false)}
            >
              <FiX size={20} />
            </button>

            <h3 className="text-lg font-semibold mb-4">Profile Image</h3>

            <div className="flex flex-col items-center gap-4">
              <img
                src={driver.profileImage?.url || "/default-profile.png"}
                alt="Driver"
                className="w-24 h-24 rounded-full object-cover border"
              />

              {loadingModal && <PageLoader text="Uploading..." size={18} />}

              <div className="flex gap-3">
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

      {/* ================= Confirm Delete Modal ================= */}
      <ConfirmModal
        show={confirmDelete}
        title="Delete Profile Image"
        message="Are you sure you want to delete your profile image?"
        onConfirm={confirmDeleteProfile}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

export default DriverDashboard;
