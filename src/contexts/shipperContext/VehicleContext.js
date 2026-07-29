import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Toast from "../../components/common/Toast";
import { SHIPPER_API_BASE_URL as API_BASE_URL } from "../../config/api";

const VehicleContext = createContext();
export const VehicleProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------- GET VEHICLES ----------------
  const fetchVehicles = useCallback(async () => {
    if (!token || user?.role !== "shipper") return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.error("Fetch Vehicles Error:", err);
      Toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  // ---------------- AUTO FETCH ----------------
  useEffect(() => {
    if (vehicles.length === 0) {
      fetchVehicles();
    }
  }, [fetchVehicles, vehicles.length]);

  // ---------------- ADD VEHICLE ----------------
  const addVehicle = async (formData) => {
    if (!token) {
      Toast.error("Unauthorized. Please log in again.");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/vehicles`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setVehicles((prev) => [...prev, res.data.vehicle]);
      Toast.success("Vehicle added successfully");
      return { success: true, vehicle: res.data.vehicle };
    } catch (err) {
      console.error("Add Vehicle Error:", err);
      Toast.error(err.response?.data?.message || "Failed to add vehicle");
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE VEHICLE ----------------
  const updateVehicle = async (id, formData) => {
    if (!token) {
      Toast.error("Unauthorized. Please log in again.");
      return { success: false };
    }

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

      Toast.success("Vehicle updated successfully");
      return { success: true, vehicle: res.data.vehicle };
    } catch (err) {
      console.error("Update Vehicle Error:", err);
      Toast.error(err.response?.data?.message || "Failed to update vehicle");
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DELETE VEHICLE ----------------
  const deleteVehicle = async (id) => {
    if (!token) {
      Toast.error("Unauthorized. Please log in again.");
      return { success: false };
    }

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVehicles((prev) => prev.filter((v) => v._id !== id));
      Toast.success("Vehicle deleted successfully");
      return { success: true };
    } catch (err) {
      console.error("Delete Vehicle Error:", err);
      Toast.error(err.response?.data?.message || "Failed to delete vehicle");
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ASSIGN DRIVER ----------------
  const assignDriverToVehicle = async (vehicleId, driverId) => {
    if (!token) {
      Toast.error("Unauthorized. Please log in again.");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/vehicles/assign-driver`,
        { vehicleId, driverId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVehicles((prev) =>
        prev.map((v) => (v._id === vehicleId ? res.data.vehicle : v))
      );

      Toast.success("Driver assigned successfully");
      return { success: true, vehicle: res.data.vehicle };
    } catch (err) {
      console.error("Assign Driver Error:", err);
      Toast.error(err.response?.data?.message || "Failed to assign driver");
      return { success: false, message: err.response?.data?.message };
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
        assignDriverToVehicle,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => useContext(VehicleContext);
