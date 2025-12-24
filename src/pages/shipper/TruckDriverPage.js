import React, { useEffect, useState } from "react";
import { useDriver } from "../../contexts/shipperContext/DriverContext";
import { useVehicle } from "../../contexts/shipperContext/VehicleContext";
import { Formik } from "formik";
import * as Yup from "yup";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import PageLoader from "../../components/common/PageLoader";
import InputField from "../../components/common/InputField";
import { FiTrash2, FiEdit, FiX } from "react-icons/fi";

const TruckDriverPage = () => {
  const {
    drivers = [],
    fetchDrivers,
    addDriver,
    updateDriver,
    deleteDriver,
    assignVehicles,
    loading,
  } = useDriver() || {};

  const { vehicles = [] } = useVehicle() || {};

  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  /* ---------------- Validation ---------------- */
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone is required"),
    licenseNumber: Yup.string().required("License number is required"),
    password: editingDriver
      ? Yup.string()
      : Yup.string().required("Password is required"),
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

  const handleSubmit = async (values, { resetForm }) => {
    if (editingDriver) {
      await updateDriver(editingDriver._id, values);
    } else {
      await addDriver(values);
    }
    resetForm();
    setEditingDriver(null);
    setShowForm(false);
  };

  const confirmDeleteDriver = async () => {
    await deleteDriver(confirmDelete.id);
    setConfirmDelete({ show: false, id: null });
  };

  const handleAssignVehicles = async () => {
    if (!selectedDriver || !selectedVehicles.length) return;
    await assignVehicles(selectedDriver._id, selectedVehicles);
    setSelectedDriver(null);
    setSelectedVehicles([]);
  };

  return (
    <div className="w-full font-montserrat">
      {/* ---------------- Header ---------------- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">
          Truck Driver Management
        </h1>

        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingDriver(null);
          }}
        >
          {showForm ? (
            <span className="flex items-center gap-1">
              <FiX /> Close
            </span>
          ) : (
            "Add New Driver"
          )}
        </Button>
      </div>

      {/* ---------------- Loader ---------------- */}
      {loading && (
        <div className="flex justify-center items-center h-60">
          <PageLoader text="Loading drivers..." />
        </div>
      )}

      {/* ---------------- FORM ---------------- */}
      {showForm && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, handleSubmit, errors, touched }) => (
            <form
              onSubmit={handleSubmit}
              className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10"
            >
              <InputField
                label="Name"
                value={values.name}
                onChange={handleChange("name")}
              />
              {touched.name && errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}

              <InputField
                label="Email"
                value={values.email}
                onChange={handleChange("email")}
              />
              {touched.email && errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}

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
                placeholder={
                  editingDriver ? "Leave blank to keep same password" : ""
                }
                value={values.password}
                onChange={handleChange("password")}
                className="sm:col-span-2"
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
                  {editingDriver ? "Update Driver" : "Save Driver"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      )}

      {/* ---------------- DRIVER LIST ---------------- */}
      {!showForm && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => (
            <div
              key={driver._id}
              className="border rounded-lg p-4 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold">{driver.name}</h3>
                <p className="text-sm">{driver.email}</p>
                <p className="text-sm">{driver.phone}</p>
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingDriver(driver);
                    setShowForm(true);
                  }}
                >
                  <FiEdit /> Edit
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    setConfirmDelete({ show: true, id: driver._id })
                  }
                >
                  <FiTrash2 /> Delete
                </Button>

                <Button size="sm" onClick={() => setSelectedDriver(driver)}>
                  Assign
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- ASSIGN VEHICLES ---------------- */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:w-96 rounded-t-xl sm:rounded-xl p-4">
            <h3 className="font-semibold mb-3">
              Assign Vehicles – {selectedDriver.name}
            </h3>

            <div className="max-h-48 overflow-auto space-y-2">
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
                  {v.vehicleType}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={handleAssignVehicles}>Assign</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedDriver(null);
                  setSelectedVehicles([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={confirmDelete.show}
        title="Delete Driver"
        message="Are you sure you want to delete this driver?"
        onConfirm={confirmDeleteDriver}
        onCancel={() => setConfirmDelete({ show: false, id: null })}
      />
    </div>
  );
};

export default TruckDriverPage;
