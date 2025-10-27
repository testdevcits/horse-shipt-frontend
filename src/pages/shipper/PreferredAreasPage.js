import React, { useState } from "react";
import { usePreferredAreas } from "../../contexts/PreferredAreasContext";
import Toast from "../../components/common/Toast";

const PreferredAreas = () => {
  const { areas, loading, addPreferredArea, deletePreferredArea } =
    usePreferredAreas();

  const [formData, setFormData] = useState({
    areaName: "",
    distanceRange: "",
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddArea = async (e) => {
    e.preventDefault();
    if (!formData.areaName || !formData.distanceRange) {
      setToast({
        show: true,
        message: "Please fill in all fields",
        type: "error",
      });
      return;
    }

    const res = await addPreferredArea(formData);
    setToast({
      show: true,
      message: res.message,
      type: res.success ? "success" : "error",
    });

    if (res.success) {
      setFormData({ areaName: "", distanceRange: "" });
    }
  };

  const handleDelete = async (id) => {
    const res = await deletePreferredArea(id);
    setToast({
      show: true,
      message: res.message,
      type: res.success ? "success" : "error",
    });
  };

  return (
    <div className="w-full space-y-4">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false })}
        />
      )}

      <p className="text-gray-700 text-base sm:text-lg">
        Select below your preferred areas and the distance range you want to
        receive personalized opportunities.
      </p>

      <form
        onSubmit={handleAddArea}
        className="bg-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row gap-3"
      >
        <input
          type="text"
          name="areaName"
          placeholder="Enter area name"
          value={formData.areaName}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-system-primary"
        />
        <input
          type="number"
          name="distanceRange"
          placeholder="Distance range (miles)"
          value={formData.distanceRange}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-system-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-system-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-system-primary-dark disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Area"}
        </button>
      </form>

      <div className="space-y-3">
        {areas.length === 0 && !loading && (
          <p className="text-gray-500">No preferred areas added yet.</p>
        )}

        {areas.map((area) => (
          <div
            key={area._id}
            className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm"
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {area.areaName}
              </p>
              <p className="text-xs text-gray-600">
                Distance: {area.distanceRange} miles
              </p>
            </div>
            <button
              onClick={() => handleDelete(area._id)}
              className="text-red-500 text-sm font-medium hover:text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreferredAreas;
