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
  process.env.REACT_APP_API_BASE_URL ||
  "https://horse-shipt.vercel.app/api/shipper";

export const VehicleProvider = ({ children }) => {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVehicles = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.error("Fetch Vehicles Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addVehicle = async (formData) => {
    if (!token) return { success: false, message: "Unauthorized" };
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/vehicles`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
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

  const updateVehicle = async (id, formData) => {
    if (!token) return { success: false, message: "Unauthorized" };
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/vehicles/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
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

  const deleteVehicle = async (id) => {
    if (!token) return { success: false, message: "Unauthorized" };
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/vehicles/${id}`, {
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
