import React, { useEffect, useState } from "react";
import { useDriver } from "../../contexts/shipperContext/DriverContext";
import { useVehicle } from "../../contexts/shipperContext/VehicleContext";
import { Formik } from "formik";
import * as Yup from "yup";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import PageLoader from "../../components/common/PageLoader";
import InputField from "../../components/common/InputField";
import { FiX } from "react-icons/fi";
import StatusBadge from "../../components/common/StatusBadge";

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
    name: Yup.string().required("Name is required"),
    email: Yup.string().email().required(),
    phone: Yup.string().required(),
    licenseNumber: Yup.string().required(),
    password: editingDriver
      ? Yup.string()
      : Yup.string().required("Password required"),
    notes: Yup.string(),
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
    if (editingDriver) {
      await updateDriver(editingDriver._id, values);
    } else {
      await addDriver(values);
    }

    fetchDrivers?.();
    resetForm();
    setEditingDriver(null);
    setShowForm(false);
  };

  /* ================= DELETE ================= */

  const confirmDeleteDriver = async () => {
    await deleteDriver(confirmDelete.id);
    setConfirmDelete({ show: false, id: null });
    fetchDrivers?.();
  };

  /* ================= ASSIGN ================= */

  const handleAssignVehicles = async () => {
    if (!selectedDriver || !selectedVehicles.length) return;

    await assignVehicles(selectedDriver._id, {
      vehicleIds: selectedVehicles,
    });

    setSelectedDriver(null);
    setSelectedVehicles([]);
    fetchDrivers?.();
  };

  /* ================= STATUS ================= */

  const handleToggleStatus = async (driver) => {
    await toggleDriverStatus(driver._id, !driver.isActive);
    fetchDrivers?.();
  };

  return (
    <div className="w-full mx-auto font-montserrat">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-semibold text-2xl text-gray-800">
          Truck Driver Management
        </h1>

        <Button
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
            "Add New Driver"
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
            {({ values, handleChange, handleSubmit }) => (
              <form
                onSubmit={handleSubmit}
                className="grid sm:grid-cols-2 gap-4"
              >
                <InputField
                  label="Name"
                  value={values.name}
                  onChange={handleChange("name")}
                />
                <InputField
                  label="Email"
                  value={values.email}
                  onChange={handleChange("email")}
                />
                <InputField
                  label="Phone"
                  value={values.phone}
                  onChange={handleChange("phone")}
                />
                <InputField
                  label="License Number"
                  value={values.licenseNumber}
                  onChange={handleChange("licenseNumber")}
                />
                <InputField
                  label="Password"
                  type="password"
                  value={values.password}
                  onChange={handleChange("password")}
                  placeholder={
                    editingDriver ? "Leave blank if not changing" : ""
                  }
                />
                <InputField
                  label="Notes"
                  value={values.notes}
                  onChange={handleChange("notes")}
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
                  <Button type="submit">
                    {editingDriver ? "Update" : "Save"}
                  </Button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      )}

      {/* DRIVER LIST */}
      {!showForm && !loading && (
        <div className="grid grid-cols-1 gap-6">
          {drivers.map((driver, index) => (
            <div
              key={driver._id}
              className="w-full bg-white border border-2 border-[#BF9B53] rounded-md p-5 shadow-sm hover:shadow-md transition-all"
            >
              {/* ================= HEADER ================= */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                {/* LEFT: IMAGE + NAME */}
                <div className="flex items-center gap-3">
                  {driver.profileImage?.url ? (
                    <img
                      src={driver.profileImage.url}
                      alt={driver.name}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#BF9B53]/20 text-[#BF9B53] flex items-center justify-center font-bold">
                      {driver.name?.charAt(0)?.toUpperCase() || "D"}
                    </div>
                  )}

                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {driver.name}
                    </h2>
                  </div>
                </div>

                {/* RIGHT: ACTIONS */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setEditingDriver(driver);
                      setShowForm(true);
                    }}
                    className="px-3 py-1.5 bg-[#BF9B53] text-white rounded-lg text-sm hover:opacity-90"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      setConfirmDelete({ show: true, id: driver._id })
                    }
                    className="px-3 py-1.5 border border-red-300 text-red-500 rounded-lg text-sm hover:bg-red-50"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => handleToggleStatus(driver)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      driver.isActive
                        ? "border text-gray-600 hover:bg-gray-50"
                        : "bg-[#BF9B53] text-white hover:opacity-90"
                    }`}
                  >
                    {driver.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>

              {/* ================= STATUS ================= */}
              <div className="mb-4">
                <div className="w-[80px]">
                  <StatusBadge
                    text={driver.isActive ? "Active" : "Inactive"}
                    type={driver.isActive ? "success" : "danger"}
                  />
                </div>
              </div>

              {/* ================= DETAILS ================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div className="flex gap-2">
                  <p>Name:</p>
                  <p className="font-semibold text-[#BF9B53]">
                    {driver.name || "N/A"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <p>Email:</p>
                  <p className="font-semibold text-[#BF9B53]">
                    {driver.email || "N/A"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <p>Phone:</p>
                  <p className="font-semibold text-[#BF9B53]">
                    {driver.phone || "N/A"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <p>License:</p>
                  <p className="font-semibold text-[#BF9B53]">
                    {driver.licenseNumber || "N/A"}
                  </p>
                </div>

                <div className="col-span-1 sm:col-span-2 lg:col-span-3 border-b border-[#BF9B53] my-2"></div>

                {driver.notes && (
                  <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
                    <p>Notes:</p>
                    <p className="font-semibold text-[#BF9B53]">
                      {driver.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
