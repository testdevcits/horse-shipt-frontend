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
  const [toast, setToast] = useState(null);
  const [confirmData, setConfirmData] = useState({ show: false, id: null });

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

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
    const res = await deleteVehicle(confirmData.id);
    setToast({
      message: res.message,
      type: res.success ? "success" : "error",
    });
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

    let res;
    if (editingVehicle) {
      res = await updateVehicle(editingVehicle._id, formData);
    } else {
      res = await addVehicle(formData);
    }

    setToast({ message: res.message, type: res.success ? "success" : "error" });
    if (res.success) {
      resetForm();
      closeModal();
    }
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
        <h2 className="font-semibold text-[20px] sm:text-[22px] text-[#333333]">
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
                <p className="flex text-[16px] font-normal text-systemText leading-[24px]">
                  <span className="font-medium">Transport: </span>
                  {vehicle.transportType}
                </p>
                <p className="flex text-[16px] font-normal text-systemText leading-[24px]">
                  <span className="font-medium">Vehicle: </span>
                  {vehicle.vehicleType}
                </p>
              </div>

              {/* ---------- Number of Stalls & Stall Size ---------- */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full px-2 gap-2">
                <p className="flex text-[16px] font-normal text-systemText leading-[24px]">
                  <span className="font-medium">Stalls: </span>
                  {vehicle.numberOfStalls}
                </p>
                <p className="flex text-[16px] font-normal text-systemText leading-[24px]">
                  <span className="font-medium">Size: </span>
                  {vehicle.stallSize}
                </p>
              </div>

              {/* ---------- Image Gallery ---------- */}
              <div className="flex flex-wrap gap-2 px-2">
                <span className="flex text-[16px] font-medium text-systemText leading-[24px]">
                  Images:
                </span>
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

              {/* ---------- Notes Section ---------- */}
              <div className="px-2">
                <p className="flex text-[16px] leading-[24px] text-systemText">
                  <span className="font-medium">Notes: </span>
                  <span className="font-normal">{vehicle.notes || "N/A"}</span>
                </p>
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
                  {/* Form fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transport Type
                    </label>
                    <Field
                      type="text"
                      name="transportType"
                      readOnly
                      className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 cursor-not-allowed text-gray-700 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Type
                    </label>
                    <Field
                      as="select"
                      name="vehicleType"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#007bff] outline-none text-sm sm:text-base"
                    >
                      <option value="">Select Vehicle Type</option>
                      <option value="Truck">Truck</option>
                      <option value="Trailer">Trailer</option>
                      <option value="Other">Other</option>
                    </Field>
                    <ErrorMessage
                      name="vehicleType"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Stalls
                    </label>
                    <Field
                      type="number"
                      name="numberOfStalls"
                      placeholder="Enter number"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#007bff] outline-none text-sm sm:text-base"
                    />
                    <ErrorMessage
                      name="numberOfStalls"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stall Type
                    </label>
                    <Field
                      as="select"
                      name="trailerType"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#007bff] outline-none text-sm sm:text-base"
                    >
                      {[
                        "Stock Trailer",
                        "Slant Load",
                        "Head to Head",
                        "Semi",
                        "Other",
                      ].map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="trailerType"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stall Size
                    </label>
                    <Field
                      as="select"
                      name="stallSize"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#007bff] outline-none text-sm sm:text-base"
                    >
                      {[
                        "Single Stall",
                        "Stall and a Half",
                        "Box Stall",
                        "Other",
                      ].map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="stallSize"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Vehicle Images
                    </label>
                    <div className="flex flex-wrap gap-3 mb-4 p-3 border border-gray-200 rounded-xl bg-white">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="relative w-20 h-20 sm:w-24 sm:h-24 border border-gray-300 border-dashed flex items-center justify-center hover:border-[#BF9B53] cursor-pointer overflow-hidden rounded-[16px] p-2 transition-all"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const updated = [...values.images];
                                updated[i] = file;
                                setFieldValue("images", updated);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {values.images[i] ? (
                            <img
                              src={
                                values.images[i]?.url ||
                                URL.createObjectURL(values.images[i])
                              }
                              alt="preview"
                              className="w-full h-full object-cover rounded-[16px]"
                            />
                          ) : (
                            <span className="text-gray-400 text-2xl select-none">
                              <RiImageAddLine />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <Field
                      as="textarea"
                      name="notes"
                      rows="3"
                      placeholder="Enter notes (optional)"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#007bff] outline-none resize-none text-sm sm:text-base"
                    />
                  </div>

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
