// src/contexts/VehicleContext.js
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const VehicleContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

export const VehicleProvider = ({ children }) => {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ----------------- Fetch All Vehicles -----------------
  const fetchVehicles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/vehicle/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(response.data.data || []);
    } catch (err) {
      console.error("Fetch Vehicles Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ----------------- Add Vehicle -----------------
  const addVehicle = async (vehicleData) => {
    if (!token) return { success: false, message: "Unauthorized" };
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/vehicle/add`, vehicleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchVehicles();
      return { success: true, message: "Vehicle added successfully" };
    } catch (err) {
      console.error("Add Vehicle Error:", err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to add vehicle",
      };
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Update Vehicle -----------------
  const updateVehicle = async (id, vehicleData) => {
    if (!token) return { success: false, message: "Unauthorized" };
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/vehicle/update/${id}`, vehicleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchVehicles();
      return { success: true, message: "Vehicle updated successfully" };
    } catch (err) {
      console.error("Update Vehicle Error:", err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update vehicle",
      };
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Delete Vehicle -----------------
  const deleteVehicle = async (id) => {
    if (!token) return { success: false, message: "Unauthorized" };
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/vehicle/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchVehicles();
      return { success: true, message: "Vehicle deleted successfully" };
    } catch (err) {
      console.error("Delete Vehicle Error:", err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete vehicle",
      };
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Fetch Vehicles on Mount -----------------
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

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
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => useContext(VehicleContext);
