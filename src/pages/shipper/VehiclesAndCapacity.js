import React, { useState, useEffect } from "react";
import {
  FiCheckCircle,
  FiPlus,
  FiUserCheck,
  FiX,
} from "react-icons/fi";
import { MdEditSquare } from "react-icons/md";
import { FaTrashCan } from "react-icons/fa6";
import { RiImageAddLine } from "react-icons/ri";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import { useVehicle } from "../../contexts/shipperContext/VehicleContext";
import { useDriver } from "../../contexts/shipperContext/DriverContext";

import ConfirmModal from "../../components/common/ConfirmModal";
import PageLoader from "../../components/common/PageLoader";
import ImageSwiper from "../../components/common/ImageSwiper";
import { MAX_IMAGE_UPLOAD_SIZE_LABEL, validateImageUpload } from "../../utils/uploadValidation";

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

  const getVerificationStyle = (status = "PENDING") => {
    const normalized = status.toUpperCase();

    if (normalized === "VERIFIED") {
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    }

    if (normalized === "REJECTED") {
      return "border-red-300 bg-red-50 text-red-600";
    }

    return "border-[#D9AF57] bg-[#FFF9EC] text-[#BF9B53]";
  };

  // --------- Form submit handler ---------
  const handleSubmit = async (values, { setSubmitting, resetForm, setFieldError }) => {
    const oversizedImage = values.images.find((img) => img instanceof File && validateImageUpload(img));
    if (oversizedImage) {
      setFieldError("images", validateImageUpload(oversizedImage));
      setSubmitting(false);
      return;
    }

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
      <div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-montserrat text-[36px] font-semibold leading-[50px] tracking-[0%] text-[#111827]">
            My Registered Vehicles
          </h1>
          <p className="mt-3 font-montserrat text-[14px] font-medium leading-[24px] tracking-[0%] text-[#4B5563]">
            {vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"} added
            to your carrier profile
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex h-[40px] w-full items-center justify-center gap-2 rounded-[5px] bg-[#BF9B53] px-4 font-montserrat text-[12px] font-bold uppercase leading-[20px] tracking-[0%] text-white transition hover:bg-opacity-90 sm:w-[172px]"
        >
          <FiPlus size={16} />
          <span>Add Vehicle</span>
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
        <div className="grid grid-cols-1 gap-5 w-full">
          {vehicles.map((vehicle, index) => (
            <div
              key={vehicle._id}
              className="w-full bg-white px-3 py-3 shadow-sm transition hover:shadow-md sm:px-4 lg:py-2.5"
            >
              <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
                <div className="aspect-[1.12/1] w-full overflow-hidden rounded-[5px] bg-slate-100 sm:aspect-[1.45/1] lg:h-[270px] lg:w-[260px] lg:aspect-auto xl:h-[305px] xl:w-[280px]">

                  {vehicle.images?.length ? (
                    <ImageSwiper
                      images={vehicle.images}
                      altPrefix="vehicle"
                      fallbackText="No image"
                      className="aspect-[1.12/1] w-full rounded-[5px] sm:aspect-[1.45/1] lg:h-[270px] lg:w-[260px] lg:aspect-auto xl:h-[305px] xl:w-[280px]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                      <RiImageAddLine className="text-3xl" />
                      <span className="mt-1 text-xs">No image</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 py-0.5 lg:pr-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-montserrat text-[12px] font-semibold leading-[20px] tracking-[0%] text-[#4B5563]">
                        Vehicle {index + 1}
                      </p>
                      <h2 className="mt-1 font-montserrat text-[16px] leading-[28px] sm:text-[18px] sm:leading-[30px] lg:text-[20px] lg:leading-[35px] font-semibold uppercase tracking-[0%] text-[#4B5563]">
                        {vehicle.vehicleNumber || "Vehicle number N/A"}
                      </h2>
                      <p className="font-montserrat text-[11px] leading-[18px] sm:text-[12px] sm:leading-[20px] font-medium tracking-[0%] text-[#735D32]">
                        {vehicle.vehicleType || "N/A"} |{" "}
                        {vehicle.transportType || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`inline-flex h-[34px] w-fit items-center gap-1 rounded-[4px] border border-[#BF9B53] px-3 font-montserrat text-[10px] leading-none sm:text-[12px] sm:leading-[20px] font-semibold uppercase tracking-[0%] ${getVerificationStyle(
                        vehicle.verificationStatus
                      )}`}
                    >
                      <FiCheckCircle size={12} />
                      <span className="font-montserrat text-[10px] leading-[18px] sm:text-[12px] sm:leading-[20px] font-semibold uppercase tracking-[0%] text-[#BF9B53]">
                        {vehicle.verificationStatus || "PENDING"}
                      </span>
                    </span>
                  </div>

                  <div className="mt-5 grid w-full max-w-[460px] grid-cols-2 gap-y-3 overflow-hidden text-[11px] sm:inline-grid sm:w-fit sm:grid-cols-4 [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-gray-200 [&>*:nth-child(2)]:border-r-0 sm:[&>*:nth-child(2)]:border-r sm:[&>*:last-child]:border-r-0">
                    <p className="min-w-0 pr-4 sm:w-[120px] sm:pr-5">
                      <span className="block font-montserrat text-[10px] leading-[18px] sm:text-[10px] sm:leading-[20px] font-medium tracking-[0%] text-[#4B5563]">VIN:</span>
                      <span className="block truncate font-montserrat text-[11px] leading-[18px] sm:text-[12px] sm:leading-[20px] font-semibold tracking-[0%] text-[#4B5563]">
                        {vehicle.vinNumber || "N/A"}
                      </span>
                    </p>
                    <p className="min-w-0 px-4 sm:w-[80px] sm:px-5">
                      <span className="block font-montserrat text-[10px] leading-[18px] sm:text-[10px] sm:leading-[20px] font-medium tracking-[0%] text-[#4B5563]">Stalls:</span>
                      <span className="block truncate font-montserrat text-[11px] leading-[18px] sm:text-[12px] sm:leading-[20px] font-semibold tracking-[0%] text-[#4B5563]">
                        {vehicle.numberOfStalls || "N/A"}
                      </span>
                    </p>
                    <p className="min-w-0 pr-4 sm:w-[110px] sm:px-5">
                      <span className="block font-montserrat text-[10px] leading-[18px] sm:text-[10px] sm:leading-[20px] font-medium tracking-[0%] text-[#4B5563]">Stall Type:</span>
                      <span className="block truncate font-montserrat text-[11px] leading-[18px] sm:text-[12px] sm:leading-[20px] font-semibold tracking-[0%] text-[#4B5563]">
                        {vehicle.trailerType || "N/A"}
                      </span>
                    </p>
                    <p className="min-w-0 px-4 sm:w-[110px] sm:px-5">
                      <span className="block font-montserrat text-[10px] leading-[18px] sm:text-[10px] sm:leading-[20px] font-medium tracking-[0%] text-[#4B5563]">Size:</span>
                      <span className="block truncate font-montserrat text-[11px] leading-[18px] sm:text-[12px] sm:leading-[20px] font-semibold tracking-[0%] text-[#4B5563]">
                        {vehicle.stallSize || "N/A"}
                      </span>
                    </p>
                  </div>

                  {vehicle.driver && (
                    <p className="mt-4 font-montserrat text-[11px] leading-[18px] sm:text-[12px] sm:leading-[20px] font-semibold tracking-[0%] text-[#047857]">
                      Assigned Driver: {vehicle.driver.name}
                    </p>
                  )}

                  <p className="mt-4 max-w-full break-words border-l-4 border-[#BF9B53] bg-[#F3F4F6] px-3 py-3 font-montserrat text-[12px] leading-[20px] sm:text-[13px] sm:leading-[22px] lg:text-[14px] lg:leading-[24px] font-medium tracking-[0%] text-[#4B5563]">
                    {vehicle.notes ||
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                  </p>

                  <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="w-full lg:max-w-[560px]">
                      <label className="mb-2 block font-montserrat text-[11px] font-semibold uppercase tracking-wide text-[#4B5563]">
                        Assign Driver
                      </label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                          value={selectedDriver[vehicle._id] || ""}
                          onChange={(e) =>
                            setSelectedDriver((prev) => ({
                              ...prev,
                              [vehicle._id]: e.target.value,
                            }))
                          }
                          className="h-[42px] w-full rounded-[5px] border border-gray-200 bg-white px-3 font-montserrat text-[12px] leading-[20px] sm:text-[14px] sm:leading-[24px] font-normal tracking-[0%] text-[#4B5563] outline-none"
                          disabled={activeDrivers.length === 0}
                        >
                          <option
                            value=""
                            className="font-montserrat text-[14px] font-normal leading-[24px] tracking-[0%] text-[#4B5563]"
                          >
                            {activeDrivers.length === 0
                              ? "Driver not available"
                              : "Select Driver"}
                          </option>

                          {activeDrivers.map((driver) => (
                            <option
                              key={driver._id}
                              value={driver._id}
                              className="font-montserrat text-[14px] font-normal leading-[24px] tracking-[0%] text-[#4B5563]"
                            >
                              {driver.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleAssignDriver(vehicle._id)}
                          disabled={
                            activeDrivers.length === 0 ||
                            !selectedDriver[vehicle._id] ||
                            loading
                          }
                          className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[5px] bg-[#BF9B53] px-4 font-montserrat text-[12px] font-bold text-white transition hover:bg-[#A88A47] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 sm:w-auto sm:min-w-[140px]"
                          title="Save selected driver"
                        >
                          <FiUserCheck size={17} />
                          Save Driver
                        </button>
                      </div>

                      {activeDrivers.length === 0 && (
                        <p className="mt-2 text-xs font-medium text-red-500">
                          Driver not available. Please add new driver.
                        </p>
                      )}
                    </div>

                    <div className="flex w-full items-center justify-end gap-4 lg:w-auto">
                      <button
                        onClick={() => openModal(vehicle)}
                        className="flex h-10 w-10 items-center justify-center text-[#CE9F2D] transition hover:text-[#bd9027] sm:h-auto sm:w-auto"
                        title="Edit vehicle"
                      >
                        <MdEditSquare size={20} />
                      </button>

                      <button
                        onClick={() =>
                          setConfirmData({ show: true, id: vehicle._id })
                        }
                        className="flex h-10 w-10 items-center justify-center text-red-500 transition hover:text-red-600 sm:h-auto sm:w-auto"
                        title="Delete vehicle"
                      >
                        <FaTrashCan size={20} />
                      </button>
                    </div>
                  </div>
                </div>
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
                setFieldError,
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
                      className={`w-full rounded-sm px-2.5 py-1.5 ${(touched.vehicleType || submitCount > 0) &&
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
                      className={`w-full rounded-sm px-2.5 py-1.5 uppercase ${(touched.vehicleNumber || submitCount > 0) &&
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
                      className={`w-full rounded-sm px-2.5 py-1.5 uppercase ${(touched.vinNumber || submitCount > 0) &&
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
                      className={`w-full rounded-sm px-2.5 py-1.5 ${(touched.numberOfStalls || submitCount > 0) &&
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
                      className={`w-full rounded-sm px-2.5 py-1.5 ${(touched.trailerType || submitCount > 0) &&
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
                      className={`w-full rounded-sm px-2.5 py-1.5 ${(touched.stallSize || submitCount > 0) &&
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
                    <p className="mb-2 text-xs font-medium text-gray-500">
                      Images must be {MAX_IMAGE_UPLOAD_SIZE_LABEL} or less.
                    </p>
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
                              if (!file) return;
                              const validationError = validateImageUpload(file);
                              if (validationError) {
                                setFieldError("images", validationError);
                                e.target.value = "";
                                return;
                              }
                              const updated = [...values.images];
                              updated[i] = file;
                              setFieldValue("images", updated);
                              setFieldError("images", "");
                              e.target.value = "";
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
                    <ErrorMessage
                      name="images"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
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
                      className="min-h-[140px] w-full rounded-sm border border-gray-300 px-2.5 py-2"
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
