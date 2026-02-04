import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Toast from "../../components/common/Toast";

const VehicleContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

export const VehicleProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  // ---------------- GET VEHICLES ----------------
  const fetchVehicles = async () => {
    if (!token || user?.role !== "shipper") return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.error("Fetch Vehicles Error:", err);
      showToast("Failed to fetch vehicles", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- AUTO FETCH ON LOGIN (ONLY ONCE) ----------------
  useEffect(() => {
    if (token && user?.role === "shipper" && vehicles.length === 0) {
      fetchVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]); // ignore fetchVehicles dependency to prevent loop

  // ---------------- ADD VEHICLE ----------------
  const addVehicle = async (formData) => {
    if (!token) return showToast("Unauthorized. Please log in again.", "error");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/vehicles`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setVehicles((prev) => [...prev, res.data.vehicle]);
      showToast("Vehicle added successfully", "success");
    } catch (err) {
      console.error("Add Vehicle Error:", err);
      showToast("Failed to add vehicle", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE VEHICLE ----------------
  const updateVehicle = async (id, formData) => {
    if (!token) return showToast("Unauthorized. Please log in again.", "error");
    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/vehicles/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setVehicles((prev) =>
        prev.map((v) => (v._id === id ? res.data.vehicle : v))
      );
      showToast("Vehicle updated successfully", "success");
    } catch (err) {
      console.error("Update Vehicle Error:", err);
      showToast("Failed to update vehicle", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DELETE VEHICLE ----------------
  const deleteVehicle = async (id) => {
    if (!token) return showToast("Unauthorized. Please log in again.", "error");
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles((prev) => prev.filter((v) => v._id !== id));
      showToast("Vehicle deleted successfully", "success");
    } catch (err) {
      console.error("Delete Vehicle Error:", err);
      showToast("Failed to delete vehicle", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        loading,
        fetchVehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
      }}
    >
      {children}

      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "", visible: false })}
        />
      )}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => useContext(VehicleContext);
