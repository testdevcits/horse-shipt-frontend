import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import Toast from "../components/common/Toast"; // make sure this path is correct

const VehicleContext = createContext();

const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

export const VehicleProvider = ({ children }) => {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------- TOAST STATES ----------------
  const [toast, setToast] = useState({
    message: "",
    type: "",
    visible: false,
  });

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: "", type: "", visible: false });
    }, 3000);
  };

  // ---------------- FETCH VEHICLES ----------------
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
      showToast(
        err.response?.data?.message || "Failed to fetch vehicles",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ---------------- ADD VEHICLE ----------------
  const addVehicle = async (formData) => {
    if (!token) {
      showToast("Unauthorized. Please log in again.", "error");
      return { success: false };
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/vehicles`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchVehicles();
      showToast("Vehicle added successfully", "success");
      return { success: true };
    } catch (err) {
      console.error("Add Vehicle Error:", err.response?.data || err.message);
      showToast(
        err.response?.data?.message || "Failed to add vehicle",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE VEHICLE ----------------
  const updateVehicle = async (id, formData) => {
    if (!token) {
      showToast("Unauthorized. Please log in again.", "error");
      return { success: false };
    }

    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/vehicles/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchVehicles();
      showToast("Vehicle updated successfully", "success");
      return { success: true };
    } catch (err) {
      console.error("Update Vehicle Error:", err.response?.data || err.message);
      showToast(
        err.response?.data?.message || "Failed to update vehicle",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DELETE VEHICLE ----------------
  const deleteVehicle = async (id) => {
    if (!token) {
      showToast("Unauthorized. Please log in again.", "error");
      return { success: false };
    }

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchVehicles();
      showToast("Vehicle deleted successfully", "success");
      return { success: true };
    } catch (err) {
      console.error("Delete Vehicle Error:", err.response?.data || err.message);
      showToast(
        err.response?.data?.message || "Failed to delete vehicle",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- INITIAL FETCH ----------------
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

      {/* Toast Component */}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({
              message: "",
              type: "",
              visible: false,
            })
          }
        />
      )}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => useContext(VehicleContext);
