import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { RiImageAddLine, RiEdit2Line } from "react-icons/ri";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useVehicle } from "../../contexts/VehicleContext";
import ConfirmModal from "../../components/common/ConfirmModal";

const VehiclePage = () => {
  const {
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    fetchVehicles,
    loading,
  } = useVehicle();

  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [confirmData, setConfirmData] = useState({ show: false, id: null });

  // ✅ Fetch only once when mounted
  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (vehicle = null) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
  };

  const handleDelete = (id) => {
    setConfirmData({ show: true, id });
  };

  const confirmDelete = async () => {
    await deleteVehicle(confirmData.id);
    setConfirmData({ show: false, id: null });
  };

  const cancelDelete = () => setConfirmData({ show: false, id: null });

  const validationSchema = Yup.object({
    vehicleType: Yup.string().required("Vehicle type is required"),
    trailerType: Yup.string().required("Trailer type is required"),
    numberOfStalls: Yup.number()
      .required("Number of stalls is required")
      .positive("Must be positive")
      .integer("Must be an integer"),
    stallSize: Yup.string().required("Stall size is required"),
  });

  const getInitialValues = (vehicle) => ({
    transportType: "Trucking",
    vehicleType: vehicle?.vehicleType || "",
    trailerType: vehicle?.trailerType || "Stock Trailer",
    numberOfStalls: vehicle?.numberOfStalls || "",
    stallSize: vehicle?.stallSize || "",
    notes: vehicle?.notes || "",
    images: vehicle?.images || [],
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (key === "images") {
        values.images.forEach((img) => {
          if (img instanceof File) formData.append("images", img);
        });
      } else {
        formData.append(key, values[key]);
      }
    });

    if (editingVehicle) {
      await updateVehicle(editingVehicle._id, formData);
    } else {
      await addVehicle(formData);
    }

    resetForm();
    closeModal();
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={confirmData.show}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmColor="bg-red-500 hover:bg-red-600"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-[16px] font-semibold text-systemText leading-[24px]">
          My Registered Vehicles
        </h2>

        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-[#bf9b53] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition w-full sm:w-auto"
        >
          <FiPlus className="text-lg" /> <span>Add Vehicle</span>
        </button>
      </div>

      {/* Vehicle List */}
      {loading ? (
        <p className="text-gray-500 text-center mt-10">Loading...</p>
      ) : vehicles.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          No vehicles found. Add one to get started!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-montserrat">
          {vehicles.map((vehicle, index) => (
            <div
              key={vehicle._id}
              className="bg-white border border-gray-200 rounded-[14px] p-[10px] shadow-sm hover:shadow-md transition-all flex flex-col gap-4 w-full sm:max-w-[464px] h-auto min-h-[400px] mx-auto"
            >
              {/* ---------- Header ---------- */}
              <div className="flex justify-between items-center w-full h-9 px-3">
                <h2 className="text-[16px] font-semibold text-systemText leading-[24px]">
                  Vehicle {index + 1}
                </h2>
                <button
                  onClick={() => openModal(vehicle)}
                  className="flex items-center gap-1 text-[14px] font-medium bg-gray-100 text-systemText px-3 py-1 rounded-md hover:bg-gray-200 transition"
                >
                  <RiEdit2Line className="text-base" /> Edit
                </button>
              </div>

              {/* ---------- Transport & Vehicle Type ---------- */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full px-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-[16px] font-medium text-systemText leading-[24px]">
                    Transport:
                  </span>
                  <span className="text-sm font-semibold mb-1 text-gray-500">
                    {vehicle.transportType || "N/A"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[16px] font-medium text-systemText leading-[24px]">
                    Vehicle:
                  </span>
                  <span className="text-sm font-semibold mb-1 text-gray-500">
                    {vehicle.vehicleType || "N/A"}
                  </span>
                </div>
              </div>

              {/* ---------- Number of Stalls & Stall Size ---------- */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full px-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-[16px] font-medium text-systemText leading-[24px]">
                    Stalls:
                  </span>
                  <span className="text-sm font-semibold mb-1 text-gray-500">
                    {vehicle.numberOfStalls || "N/A"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[16px] font-medium text-systemText leading-[24px]">
                    Size:
                  </span>
                  <span className="text-sm font-semibold mb-1 text-gray-500">
                    {vehicle.stallSize || "N/A"}
                  </span>
                </div>
              </div>

              {/* ---------- Image Gallery ---------- */}
              <div className="px-2">
                <p className="text-[16px] font-medium text-systemText leading-[24px] mb-2">
                  Images:
                </p>
                <div className="flex flex-wrap gap-2">
                  {vehicle.images?.length > 0 ? (
                    vehicle.images.map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt={`Vehicle ${index + 1} - ${i}`}
                        className="w-[80px] h-[80px] object-cover rounded-[16px] border border-dashed border-gray-300 p-[2px]"
                      />
                    ))
                  ) : (
                    <img
                      src="https://via.placeholder.com/80"
                      alt="No image"
                      className="w-[80px] h-[80px] object-cover rounded-[16px] border border-dashed border-gray-300 p-[2px]"
                    />
                  )}
                </div>
              </div>

              {/* ---------- Notes ---------- */}
              <div className="px-2">
                <div className="flex flex-col">
                  <span className="text-[16px] font-medium text-systemText leading-[24px]">
                    Notes:
                  </span>
                  <span className="text-sm font-semibold mb-1 text-gray-500">
                    {vehicle.notes || "N/A"}
                  </span>
                </div>
              </div>

              {/* ---------- Delete Button ---------- */}
              <div className="flex justify-end mt-auto px-2">
                <button
                  onClick={() => handleDelete(vehicle._id)}
                  className="flex items-center gap-1 text-[14px] border border-red-500 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-2 sm:p-6 md:p-8">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-600 hover:text-[#007bff] transition"
          >
            <FiX size={28} />
          </button>

          <div className="max-w-full mx-auto">
            <h2 className="font-semibold text-[22px] sm:text-[24px] text-[#333333] mb-6 text-center sm:text-left">
              {editingVehicle ? "Edit Vehicle" : "Add a New Vehicle"}
            </h2>

            <Formik
              initialValues={getInitialValues(editingVehicle)}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Form Fields (unchanged) */}
                  {/* ... same as your version ... */}

                  <div className="col-span-2 flex flex-col sm:flex-row justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-full sm:w-auto px-5 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-200 bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-2 bg-[#007bff] text-white rounded-lg hover:bg-[#005fcc] transition disabled:opacity-50"
                    >
                      {editingVehicle ? "Update" : "Save"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclePage;
