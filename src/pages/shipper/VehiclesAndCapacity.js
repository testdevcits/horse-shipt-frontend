import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit } from "react-icons/fi";
import { useVehicle } from "../../contexts/VehicleContext";

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
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    number: "",
    color: "",
    fuelType: "",
    transmission: "",
    images: [],
  });

  // ---------------- Fetch Vehicles ----------------
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // ---------------- Open & Close Modal ----------------
  const openModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        name: vehicle.name || "",
        type: vehicle.type || "",
        number: vehicle.number || "",
        color: vehicle.color || "",
        fuelType: vehicle.fuelType || "",
        transmission: vehicle.transmission || "",
        images: vehicle.images || [],
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        name: "",
        type: "",
        number: "",
        color: "",
        fuelType: "",
        transmission: "",
        images: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
  };

  // ---------------- Handle Input ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- Handle Image Upload ----------------
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);

    setFormData((prev) => {
      const newImages = [...prev.images];
      newImages[index] = preview;
      return { ...prev, images: newImages };
    });
  };

  // ---------------- Submit Form ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingVehicle) {
      await updateVehicle(editingVehicle._id, formData);
    } else {
      await addVehicle(formData);
    }
    closeModal();
  };

  // ---------------- Delete Vehicle ----------------
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      await deleteVehicle(id);
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="font-montserrat font-semibold text-[18px] sm:text-[20px] md:text-[24px] text-[#333333]">
          My Registered Vehicles
        </h2>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#007bff] text-white px-4 py-2 rounded-lg hover:bg-[#005fcc] transition"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3 border border-gray-200 hover:shadow-md transition"
            >
              <img
                src={vehicle.images?.[0] || "https://via.placeholder.com/200"}
                alt={vehicle.name}
                className="w-full h-40 object-cover rounded-lg"
              />
              <h3 className="font-semibold text-[#333] text-lg">
                {vehicle.name}
              </h3>
              <p className="text-gray-600 text-sm">Type: {vehicle.type}</p>

              <div className="flex justify-between mt-2">
                <button
                  onClick={() => openModal(vehicle)}
                  className="flex items-center gap-1 bg-[#007bff] text-white px-3 py-1.5 rounded-lg hover:bg-[#005fcc] transition text-sm"
                >
                  <FiEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(vehicle._id)}
                  className="flex items-center gap-1 border border-red-500 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition text-sm"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          {/* ✅ Fullscreen Modal for all devices */}
          <div className="bg-white w-full h-full overflow-y-auto p-6 sm:p-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="font-montserrat font-semibold text-[22px] sm:text-[26px] text-[#333333]">
                {editingVehicle ? "Edit Vehicle" : "Add a New Vehicle"}
              </h2>

              <button
                onClick={closeModal}
                className="flex items-center gap-2 text-gray-600 hover:text-[#007bff] transition"
              >
                <FiArrowLeft className="text-lg" /> <span>Back</span>
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-6" // ✅ Always 2 columns
            >
              {[
                { label: "Vehicle Name", name: "name", type: "text" },
                { label: "Vehicle Type", name: "type", type: "text" },
                { label: "Number of Stalls", name: "number", type: "number" },
                {
                  label: "Stall Type",
                  name: "color",
                  type: "select",
                  options: ["Box Stall", "Open Stall", "Large Stall"],
                },
                {
                  label: "Fuel Type",
                  name: "fuelType",
                  type: "select",
                  options: ["Petrol", "Diesel", "Electric"],
                },
                {
                  label: "Transmission",
                  name: "transmission",
                  type: "select",
                  options: ["Manual", "Automatic"],
                },
              ].map((field, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#007bff] outline-none"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#007bff] outline-none"
                    />
                  )}
                </div>
              ))}

              {/* Upload Images */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Vehicle Images
                </label>
                <div className="flex flex-wrap gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 border border-gray-300 rounded-lg flex items-center justify-center hover:border-[#007bff] cursor-pointer overflow-hidden"
                    >
                      <input
                        type="file"
                        onChange={(e) => handleImageChange(e, i)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {formData.images[i] ? (
                        <img
                          src={formData.images[i]}
                          alt="preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">+</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="col-span-2 flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#007bff] text-white rounded-lg hover:bg-[#005fcc] transition"
                >
                  {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclePage;
