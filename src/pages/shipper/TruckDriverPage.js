import React, { useEffect, useState } from "react";
import { useDriver } from "../../contexts/shipperContext/DriverContext";
import { useVehicle } from "../../contexts/shipperContext/VehicleContext";
import { Formik } from "formik";
import * as Yup from "yup";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import PageLoader from "../../components/common/PageLoader";
import InputField from "../../components/common/InputField";
import {
  FiFileText,
  FiPhone,
  FiPlus,
  FiPower,
  FiUser,
  FiX,
} from "react-icons/fi";
import { MdEditSquare } from "react-icons/md";
import { FaTrashCan } from "react-icons/fa6";
import { TfiEmail } from "react-icons/tfi";
import { FaRegAddressCard } from "react-icons/fa";

const DetailItem = ({ icon, label, value }) => (
  <div className="flex min-w-0 items-center gap-2 px-0 py-2 sm:px-5">

    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-gray-100 bg-white text-[#735D32] shadow-sm">
      {icon}
    </div>

    <div className="min-w-0">
      <p className="font-montserrat text-[10px] font-medium leading-[14px] tracking-[0%] text-[#4B5563]">
        {label}:
      </p>

      <p className="truncate font-montserrat text-[12px] font-semibold leading-[18px] tracking-[0%] text-[#BF9B53]">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

const DriverActionButton = ({ children, icon, tone = "gold", ...props }) => {
  const toneClasses = {
    gold: "border-[#BF9B53] text-gray-700 hover:bg-[#BF9B53]/10",
    red: "border-red-500 text-gray-700 hover:bg-red-50",
  };

  return (
    <button
      type="button"
      className={`inline-flex h-[24px] items-center justify-center gap-1.5 rounded border bg-white px-3 text-[10px] font-semibold uppercase leading-none transition ${toneClasses[tone]}`}
      {...props}
    >
      <span className={tone === "red" ? "text-red-500" : "text-[#735D32]"}>
        {icon}
      </span>
      {children}
    </button>
  );
};

const TruckDriverPage = () => {
  const {
    drivers = [],
    fetchDrivers,
    addDriver,
    updateDriver,
    deleteDriver,
    assignVehicles,
    toggleDriverStatus,
    loading,
  } = useDriver() || {};

  const { vehicles = [] } = useVehicle() || {};

  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: null,
  });

  useEffect(() => {
    fetchDrivers?.();
  }, [fetchDrivers]);

  /* ================= VALIDATION ================= */

  const validationSchema = Yup.object({
    name: Yup.string().trim().required("Driver name is required"),
    email: Yup.string()
      .trim()
      .email("Enter a valid email address")
      .required("Email is required"),
    phone: Yup.string()
      .trim()
      .matches(/^[0-9+\-\s()]{10,15}$/, "Enter a valid phone number")
      .required("Phone number is required"),
    licenseNumber: Yup.string().trim().required("License number is required"),
    password: editingDriver
      ? Yup.string()
      : Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    notes: Yup.string().trim(),
  });

  const initialValues = {
    name: editingDriver?.name || "",
    email: editingDriver?.email || "",
    phone: editingDriver?.phone || "",
    licenseNumber: editingDriver?.licenseNumber || "",
    password: "",
    notes: editingDriver?.notes || "",
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (values, { resetForm }) => {
    let result = { success: false };

    if (editingDriver) {
      result = await updateDriver(editingDriver._id, values);
    } else {
      result = await addDriver(values);
    }

    if (result?.success) {
      fetchDrivers?.();
      resetForm();
      setEditingDriver(null);
      setShowForm(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ================= DELETE ================= */

  const confirmDeleteDriver = async () => {
    const result = await deleteDriver(confirmDelete.id);
    setConfirmDelete({ show: false, id: null });

    if (result?.success) {
      fetchDrivers?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ================= ASSIGN ================= */

  const handleAssignVehicles = async () => {
    if (!selectedDriver || !selectedVehicles.length) return;

    const result = await assignVehicles(selectedDriver._id, {
      vehicleIds: selectedVehicles,
    });

    if (result?.success) {
      setSelectedDriver(null);
      setSelectedVehicles([]);
      fetchDrivers?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ================= STATUS ================= */

  const handleToggleStatus = async (driver) => {
    const result = await toggleDriverStatus(driver._id, !driver.isActive);

    if (result?.success) {
      fetchDrivers?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full mx-auto font-montserrat">
      {/* HEADER */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-montserrat text-[26px] font-semibold leading-[34px] text-[#111827] sm:text-[28px] sm:leading-[36px] lg:text-[28px] lg:leading-[38px]">
          Truck Driver Management
        </h1>

        <Button
          className="h-[30px] min-h-0 self-start rounded px-4 text-[11px] font-bold uppercase sm:self-auto"
          onClick={() => {
            setShowForm(!showForm);
            setEditingDriver(null);
          }}
        >
          {showForm ? (
            <span className="flex gap-1 items-center">
              <FiX /> Close
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FiPlus size={16} />
              Add New Driver
            </span>
          )}
        </Button>
      </div>

      {/* LOADER */}
      {loading && <PageLoader text="Loading drivers..." />}

      {/* FORM */}
      {showForm && (
        <div className="bg-white shadow rounded-md p-6 mb-8">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              submitCount,
              isSubmitting,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <form
                onSubmit={handleSubmit}
                className="grid sm:grid-cols-2 gap-4"
                noValidate
              >
                <InputField
                  label="Name"
                  name="name"
                  value={values.name}
                  onChange={handleChange("name")}
                  onBlur={handleBlur("name")}
                  error={errors.name}
                  touched={touched.name || submitCount > 0}
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange("email")}
                  onBlur={handleBlur("email")}
                  error={errors.email}
                  touched={touched.email || submitCount > 0}
                />
                <InputField
                  label="Phone"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                  error={errors.phone}
                  touched={touched.phone || submitCount > 0}
                />
                <InputField
                  label="License Number"
                  name="licenseNumber"
                  value={values.licenseNumber}
                  onChange={handleChange("licenseNumber")}
                  onBlur={handleBlur("licenseNumber")}
                  error={errors.licenseNumber}
                  touched={touched.licenseNumber || submitCount > 0}
                />
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange("password")}
                  onBlur={handleBlur("password")}
                  error={errors.password}
                  touched={touched.password || submitCount > 0}
                  placeholder={
                    editingDriver ? "Leave blank if not changing" : ""
                  }
                />
                <InputField
                  label="Notes"
                  name="notes"
                  value={values.notes}
                  onChange={handleChange("notes")}
                  onBlur={handleBlur("notes")}
                  error={errors.notes}
                  touched={touched.notes || submitCount > 0}
                  className="sm:col-span-2"
                />

                <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {editingDriver ? "Update" : "Save"}
                  </Button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      )}

      {/* DRIVER LIST */}
      {!showForm &&
        !loading &&
        (drivers.length === 0 ? (
          <div className="flex items-center justify-center min-h-[600px]  border border-dashed border-[#BF9B53] rounded-md">
            <div className="text-center text-sm text-gray-600">
              Driver not available. Please add new driver.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {drivers.map((driver) => (
              <div
                key={driver._id}
                className="w-full bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md sm:px-5"
              >
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {driver.profileImage?.url ? (
                      <img
                        src={driver.profileImage.url}
                        alt={driver.name}
                        className="h-[40px] w-[40px] rounded-full border border-[#F8EAC8] object-cover"
                      />
                    ) : (
                      <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#FFF1D5] text-[20px] font-bold leading-none text-gray-950">
                        {driver.name?.charAt(0)?.toUpperCase() || "D"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="truncate font-montserrat text-[14px] font-semibold leading-[20px] text-[#4B5563]">
                        {driver.name || "N/A"}
                      </h2>
                      <span
                        className={`mt-1 inline-flex h-[20px] items-center gap-1.5 rounded-full border px-2 text-[10px] font-medium ${driver.isActive
                            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                            : "border-red-500 bg-red-50 text-red-600"
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${driver.isActive ? "bg-emerald-600" : "bg-red-500"
                            }`}
                        />
                        {driver.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <DriverActionButton
                      icon={<MdEditSquare size={16} />}
                      onClick={() => {
                        setEditingDriver(driver);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </DriverActionButton>

                    <DriverActionButton
                      tone="red"
                      icon={<FaTrashCan size={16} />}
                      onClick={() =>
                        setConfirmDelete({ show: true, id: driver._id })
                      }
                    >
                      Delete
                    </DriverActionButton>

                    <DriverActionButton
                      icon={<FiPower size={16} />}
                      onClick={() => handleToggleStatus(driver)}
                    >
                      {driver.isActive ? "Deactivate" : "Activate"}
                    </DriverActionButton>
                  </div>
                </div>

                <div className="relative isolate grid grid-cols-1 bg-[#F7F7F7] px-3 sm:grid-cols-2 lg:grid-cols-4">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/4 top-1/2 z-10 hidden h-[28px] w-px -translate-x-1/2 -translate-y-1/2 bg-[#E5E7EB] lg:block"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-[28px] w-px -translate-x-1/2 -translate-y-1/2 bg-[#E5E7EB] lg:block"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3/4 top-1/2 z-10 hidden h-[28px] w-px -translate-x-1/2 -translate-y-1/2 bg-[#E5E7EB] lg:block"
                  />
                  <DetailItem
                    icon={<FiUser size={18} />}
                    label="Name"
                    value={driver.name}
                  />
                  <DetailItem
                    icon={<FaRegAddressCard size={18} />}
                    label="License"
                    value={driver.licenseNumber}
                  />
                  <DetailItem
                    icon={<TfiEmail size={17} />}
                    label="Email"
                    value={driver.email}
                  />
                  <DetailItem
                    icon={<FiPhone size={17} />}
                    label="Phone"
                    value={driver.phone}
                  />
                </div>

                <div className="mt-3 flex min-w-0 items-start gap-2 text-sm">
                  <FiFileText
                    size={14}
                    className="mt-0.5 shrink-0 text-[#735D32]"
                  />
                  <p className="min-w-0 break-words text-gray-600">
                    <span className="font-montserrat text-[11px] font-semibold leading-[16px] tracking-[0%] text-[#BF9B53]">
                      Notes:
                    </span>{" "}
                    <span className="font-montserrat text-[11px] font-semibold leading-[16px] tracking-[0%] text-[#4B5563]">
                      {driver.notes || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* ASSIGN VEHICLE MODAL */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl w-full max-w-md">
            <h3 className="font-semibold mb-3">
              Assign Vehicles – {selectedDriver.name}
            </h3>

            {vehicles.map((v) => (
              <label key={v._id} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedVehicles.includes(v._id)}
                  onChange={(e) =>
                    setSelectedVehicles((prev) =>
                      e.target.checked
                        ? [...prev, v._id]
                        : prev.filter((id) => id !== v._id)
                    )
                  }
                />
                {v.vehicleNumber}
              </label>
            ))}

            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={handleAssignVehicles}>Assign</Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedDriver(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <ConfirmModal
        show={confirmDelete.show}
        title="Delete Driver"
        message={
          <div className="space-y-3 text-sm text-gray-700">
            <p>Are you sure you want to delete this driver?</p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
              <p className="text-red-600 font-semibold">Important Notice</p>

              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Driver will be permanently removed</li>
                <li>Any assigned shipments may be affected</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] text-xs p-4">
              Please make sure this driver is not assigned to any active
              shipment before deleting.
            </div>
          </div>
        }
        onConfirm={confirmDeleteDriver}
        onCancel={() => setConfirmDelete({ show: false, id: null })}
      />
    </div>
  );
};

export default TruckDriverPage;
