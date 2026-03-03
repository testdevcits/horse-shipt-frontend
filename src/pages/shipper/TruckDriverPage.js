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

  /* ---------------- Validation ---------------- */

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

  /* ---------------- Submit ---------------- */

  const handleSubmit = async (values, { resetForm }) => {
    try {
      if (editingDriver) {
        await updateDriver(editingDriver._id, values);
      } else {
        await addDriver(values);
      }

      fetchDrivers?.();

      resetForm();
      setEditingDriver(null);
      setShowForm(false);
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------------- Delete ---------------- */

  const confirmDeleteDriver = async () => {
    await deleteDriver(confirmDelete.id);
    setConfirmDelete({ show: false, id: null });
    fetchDrivers?.();
  };

  /* ---------------- Assign Vehicles ---------------- */

  const handleAssignVehicles = async () => {
    if (!selectedDriver || !selectedVehicles.length) return;

    await assignVehicles(selectedDriver._id, {
      vehicleIds: selectedVehicles,
    });

    setSelectedDriver(null);
    setSelectedVehicles([]);
    fetchDrivers?.();
  };

  /* ---------------- Status Toggle ---------------- */

  const handleToggleStatus = async (driver) => {
    await toggleDriverStatus(driver._id, !driver.isActive);
    fetchDrivers?.();
  };

  return (
    <div className="w-full font-montserrat p-4">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h2 className="font-semibold text-lg">Truck Driver Management</h2>

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

      {/* Loader */}
      {loading && <PageLoader text="Loading drivers..." />}

      {/* Driver Form */}

      {showForm && (
        <div className="bg-white shadow rounded-xl p-6 mb-8">
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

      {/* Driver List */}

      {!showForm && !loading && (
        <div className="grid md:grid-cols-3 gap-5">
          {drivers.map((driver) => (
            <div
              key={driver._id}
              className="border rounded-xl p-4 bg-white shadow-sm relative"
            >
              <h3 className="font-semibold">{driver.name}</h3>

              <p className="text-sm">{driver.email}</p>
              <p className="text-sm">{driver.phone}</p>

              <span
                className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                  driver.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {driver.isActive ? "Active" : "Inactive"}
              </span>

              {/* Actions */}

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
                  variant="secondary"
                  onClick={() =>
                    setConfirmDelete({
                      show: true,
                      id: driver._id,
                    })
                  }
                >
                  <FiTrash2 /> Delete
                </Button>

                <Button size="sm" onClick={() => setSelectedDriver(driver)}>
                  Assign Vehicles
                </Button>

                <Button
                  size="sm"
                  variant={driver.isActive ? "secondary" : "primary"}
                  onClick={() => handleToggleStatus(driver)}
                >
                  {driver.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Assignment Modal */}

      {selectedDriver && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-xl p-4">
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
                  {v.vehicleNumber || v.vehicleType}
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

      {/* Delete Modal */}

      <ConfirmModal
        show={confirmDelete.show}
        title="Delete Driver"
        message="Are you sure?"
        onConfirm={confirmDeleteDriver}
        onCancel={() => setConfirmDelete({ show: false, id: null })}
      />
    </div>
  );
};

export default TruckDriverPage;
