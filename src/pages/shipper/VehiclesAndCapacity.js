import React, { useState, useEffect } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { RiImageAddLine } from "react-icons/ri";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import { useVehicle } from "../../contexts/shipperContext/VehicleContext";
import { useDriver } from "../../contexts/shipperContext/DriverContext";

import ConfirmModal from "../../components/common/ConfirmModal";
import PageLoader from "../../components/common/PageLoader";

const VehiclePage = () => {
  // --------- Vehicle Context ---------
  const {
    vehicles = [],
    addVehicle,
    updateVehicle,
    deleteVehicle,
    fetchVehicles,
    assignDriverToVehicle,
    loading = false,
  } = useVehicle() || {};

  // --------- Driver Context ---------
  const { drivers = [] } = useDriver();

  // --------- State ---------
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [confirmData, setConfirmData] = useState({ show: false, id: null });
  const [fetched, setFetched] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState({});
  const activeDrivers = drivers.filter((driver) => driver.isActive);

  // --------- Fetch vehicles on mount ---------
  useEffect(() => {
    if (!fetched && fetchVehicles) {
      fetchVehicles();
      setFetched(true);
    }
  }, [fetched, fetchVehicles]);

  // --------- Assign Driver ---------
  const handleAssignDriver = async (vehicleId) => {
    const driverId = selectedDriver[vehicleId];

    if (!driverId) {
      alert("Please select a driver");
      return;
    }

    const result = await assignDriverToVehicle(vehicleId, driverId);

    if (result?.success) {
      setSelectedDriver((prev) => ({
        ...prev,
        [vehicleId]: "",
      }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // --------- Modal handlers ---------
  const openModal = (vehicle = null) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
  };

  // --------- Delete handlers ---------
  const confirmDelete = async () => {
    if (confirmData.id && deleteVehicle) {
      const result = await deleteVehicle(confirmData.id);
      setConfirmData({ show: false, id: null });

      if (result?.success) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const cancelDelete = () => setConfirmData({ show: false, id: null });

  // --------- Form validation schema ---------
  const validationSchema = Yup.object({
    vehicleType: Yup.string().trim().required("Vehicle type is required"),

    vehicleNumber: Yup.string()
      .trim()
      .required("Vehicle number is required")
      .max(20, "Vehicle number is too long"),

    vinNumber: Yup.string().trim().nullable(),

    trailerType: Yup.string().trim().required("Stall type is required"),

    numberOfStalls: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : value
      )
      .typeError("Number of stalls must be a number")
      .required("Number of stalls is required")
      .positive("Must be positive")
      .integer("Must be an integer"),

    stallSize: Yup.string().trim().required("Stall size is required"),
  });

  const getInitialValues = (vehicle) => ({
    transportType: "Trucking",
    vehicleType: vehicle?.vehicleType || "",
    vehicleNumber: vehicle?.vehicleNumber || "",
    vinNumber: vehicle?.vinNumber || "",
    trailerType: vehicle?.trailerType || "",
    numberOfStalls: vehicle?.numberOfStalls || "",
    stallSize: vehicle?.stallSize || "",
    notes: vehicle?.notes || "",
    images: vehicle?.images || [],
  });

  // --------- Form submit handler ---------
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

    let result = { success: false };

    if (editingVehicle && updateVehicle) {
      result = await updateVehicle(editingVehicle._id, formData);
    } else if (addVehicle) {
      result = await addVehicle(formData);
    }

    if (result?.success) {
      resetForm();
      closeModal();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setSubmitting(false);
  };

  // --------- Render ---------
  return (
    <div className="relative min-h-[calc(100vh-120px)] font-montserrat">
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 bg-white border border-slate-200 p-4">
        <div>
          <h1 className="font-montserrat font-semibold text-2xl text-gray-800">
            My Registered Vehicles
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"} added
            to your carrier profile
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-[#bf9b53] text-white px-4 py-2 hover:bg-opacity-90 transition w-full sm:w-auto"
        >
          <FiPlus className="text-lg" /> <span>Add Vehicle</span>
        </button>
      </div>

      {/* Vehicle List */}
      {loading ? (
        <PageLoader
          text="Loading vehicles..."
          fullScreen={false}
          color="#BF9B53"
        />
      ) : vehicles.length === 0 ? (
        <div className="flex items-center justify-center min-h-[360px] border border-dashed border-[#BF9B53] bg-white">
          <div className="text-center text-sm text-gray-600 w-fit px-4">
            <RiImageAddLine className="mx-auto text-4xl text-[#BF9B53] mb-3" />
            <p className="font-semibold text-slate-900">No vehicles added yet</p>
            <p className="mt-1">Add your first vehicle to start assigning it to shipments.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
          {vehicles.map((vehicle, index) => (
            <div
              key={vehicle._id}
              className="w-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <div className="grid sm:grid-cols-[150px_1fr] gap-4 p-4">
                <div className="h-36 bg-slate-100 border border-slate-200 overflow-hidden">
                  {vehicle.images?.[0]?.url ? (
                    <img
                      src={vehicle.images[0].url}
                      alt={vehicle.vehicleNumber || "vehicle"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <RiImageAddLine className="text-3xl" />
                      <span className="text-xs mt-1">No image</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        Vehicle {index + 1}
                      </p>
                      <h2 className="text-lg font-semibold text-slate-900 uppercase mt-1">
                        {vehicle.vehicleNumber || "Vehicle number N/A"}
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        {vehicle.vehicleType || "N/A"} |{" "}
                        {vehicle.transportType || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs font-semibold w-fit ${
                        vehicle.verificationStatus === "VERIFIED"
                          ? "bg-green-100 text-green-700"
                          : vehicle.verificationStatus === "REJECTED"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {vehicle.verificationStatus || "PENDING"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
                    <p>
                      <span className="text-slate-500">VIN:</span>{" "}
                      <span className="font-semibold text-[#BF9B53] uppercase">
                        {vehicle.vinNumber || "N/A"}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-500">Stalls:</span>{" "}
                      <span className="font-semibold text-[#BF9B53]">
                        {vehicle.numberOfStalls || "N/A"}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-500">Stall Type:</span>{" "}
                      <span className="font-semibold text-[#BF9B53]">
                        {vehicle.trailerType || "N/A"}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-500">Size:</span>{" "}
                      <span className="font-semibold text-[#BF9B53]">
                        {vehicle.stallSize || "N/A"}
                      </span>
                    </p>
                  </div>

                  {vehicle.driver && (
                    <p className="mt-3 text-sm font-semibold text-green-600">
                      Assigned Driver: {vehicle.driver.name}
                    </p>
                  )}

                  {vehicle.notes && (
                    <p className="mt-3 text-sm text-slate-600 border-l-4 border-[#BF9B53] pl-3">
                      {vehicle.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* DRIVER ASSIGNMENT */}
              <div className="border-t border-slate-200 p-4 bg-slate-50">
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <select
                    value={selectedDriver[vehicle._id] || ""}
                    onChange={(e) =>
                      setSelectedDriver((prev) => ({
                        ...prev,
                        [vehicle._id]: e.target.value,
                      }))
                    }
                    className="flex-1 border border-gray-300 px-2.5 py-2 text-sm bg-white"
                    disabled={activeDrivers.length === 0}
                  >
                    <option value="">
                      {activeDrivers.length === 0
                        ? "Driver not available"
                        : "Select Driver"}
                    </option>
                    {activeDrivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleAssignDriver(vehicle._id)}
                    disabled={activeDrivers.length === 0}
                    className="bg-[#BF9B53] text-white px-4 py-2 hover:bg-green-700 transition text-sm whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => openModal(vehicle)}
                    className="px-4 py-2 text-white bg-[#BF9B53] hover:opacity-90 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      setConfirmData({ show: true, id: vehicle._id })
                    }
                    className="px-4 py-2 border border-red-300 text-red-500 hover:bg-red-50 text-sm"
                  >
                    Delete
                  </button>
                </div>

                {activeDrivers.length === 0 && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    Driver not available. Please add new driver.
                  </p>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <div className="absolute inset-0 z-30 bg-white border border-slate-200 shadow-xl overflow-y-auto p-4 sm:p-6 md:p-8 vehicle-scroll">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 bg-white border border-gray-200 p-2 text-gray-600 hover:text-[#BF9B53] transition"
          >
            <FiX size={28} />
          </button>

          <div className="w-full max-w-6xl mx-auto pb-8">
            <h2 className="font-semibold text-[22px] sm:text-[24px] text-[#333333] mb-6 text-center sm:text-left">
              {editingVehicle ? "Edit Vehicle" : "Add a New Vehicle"}
            </h2>

            <Formik
              initialValues={getInitialValues(editingVehicle)}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({
                values,
                errors,
                touched,
                submitCount,
                setFieldValue,
                isSubmitting,
              }) => (
                <Form
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
                  noValidate
                >
                  {/* Transport Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transport Type
                    </label>
                    <Field
                      type="text"
                      name="transportType"
                      readOnly
                      className="w-full border border-gray-300 rounded-sm px-2.5 py-1.5 bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Type
                    </label>
                    <Field
                      as="select"
                      name="vehicleType"
                      className={`w-full rounded-sm px-2.5 py-1.5 ${
                        (touched.vehicleType || submitCount > 0) &&
                        errors.vehicleType
                          ? "border border-red-400"
                          : "border border-gray-300"
                      }`}
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

                  {/* Vehicle Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Number
                    </label>
                    <Field
                      type="text"
                      name="vehicleNumber"
                      placeholder="Enter vehicle number"
                      className={`w-full rounded-sm px-2.5 py-1.5 uppercase ${
                        (touched.vehicleNumber || submitCount > 0) &&
                        errors.vehicleNumber
                          ? "border border-red-400"
                          : "border border-gray-300"
                      }`}
                      onChange={(e) =>
                        setFieldValue(
                          "vehicleNumber",
                          e.target.value.toUpperCase()
                        )
                      }
                    />
                    <ErrorMessage
                      name="vehicleNumber"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* VIN Number (Optional Field) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VIN Number (Optional)
                    </label>

                    <Field
                      type="text"
                      name="vinNumber"
                      placeholder="Enter VIN number"
                      className={`w-full rounded-sm px-2.5 py-1.5 uppercase ${
                        (touched.vinNumber || submitCount > 0) &&
                        errors.vinNumber
                          ? "border border-red-400"
                          : "border border-gray-300"
                      }`}
                      onChange={(e) =>
                        setFieldValue("vinNumber", e.target.value.toUpperCase())
                      }
                    />

                    <ErrorMessage
                      name="vinNumber"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Number of Stalls */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Stalls
                    </label>
                    <Field
                      type="number"
                      name="numberOfStalls"
                      className={`w-full rounded-sm px-2.5 py-1.5 ${
                        (touched.numberOfStalls || submitCount > 0) &&
                        errors.numberOfStalls
                          ? "border border-red-400"
                          : "border border-gray-300"
                      }`}
                    />
                    <ErrorMessage
                      name="numberOfStalls"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Trailer Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stall Type
                    </label>
                    <Field
                      as="select"
                      name="trailerType"
                      className={`w-full rounded-sm px-2.5 py-1.5 ${
                        (touched.trailerType || submitCount > 0) &&
                        errors.trailerType
                          ? "border border-red-400"
                          : "border border-gray-300"
                      }`}
                    >
                      <option value="">Select Stall Type</option>
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

                  {/* Stall Size */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stall Size
                    </label>
                    <Field
                      as="select"
                      name="stallSize"
                      className={`w-full rounded-sm px-2.5 py-1.5 ${
                        (touched.stallSize || submitCount > 0) &&
                        errors.stallSize
                          ? "border border-red-400"
                          : "border border-gray-300"
                      }`}
                    >
                      <option value="">Select Stall Size</option>
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

                  {/* Images */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Vehicle Images
                    </label>
                    <div className="flex flex-wrap gap-3 p-3 border border-gray-200 rounded-xl">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="relative w-24 h-24 border border-dashed rounded-[16px] flex items-center justify-center"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const updated = [...values.images];
                                updated[i] = file;
                                setFieldValue("images", updated);
                              }
                            }}
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
                            <RiImageAddLine className="text-2xl text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <Field
                      as="textarea"
                      name="notes"
                      rows="3"
                      placeholder="Add any additional notes about this vehicle"
                      className="w-full border border-gray-300 rounded-sm px-2.5 py-1.5"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="sm:col-span-2 flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-5 py-2 border border-gray-400 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-[#bf9b53] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
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
