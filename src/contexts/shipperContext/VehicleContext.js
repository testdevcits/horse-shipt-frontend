import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Toast from "../../components/common/Toast";

const VehicleContext = createContext();

const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

export const VehicleProvider = ({ children }) => {
  const { token, user } = useAuth();

  // 🔹 CACHE (GET data)
  const [vehicles, setVehicles] = useState([]);

  // 🔹 UI state
  const [loading, setLoading] = useState(false);

  // 🔹 Optional cache timestamp (5 min)
  const [lastFetch, setLastFetch] = useState(0);

  // ---------------- TOAST ----------------
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

  // ---------------- GET VEHICLES (CACHED) ----------------
  const fetchVehicles = useCallback(async () => {
    if (!token || user?.role !== "shipper") return;

    const now = Date.now();

    // ✅ CACHE CHECK (5 minutes)
    if (vehicles.length > 0 && now - lastFetch < 5 * 60 * 1000) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVehicles(res.data.vehicles || []);
      setLastFetch(now);
    } catch (err) {
      console.error("Fetch Vehicles Error:", err);
      showToast("Failed to fetch vehicles", "error");
    } finally {
      setLoading(false);
    }
  }, [token, user, vehicles.length, lastFetch]);

  // ---------------- ADD VEHICLE (POST) ----------------
  const addVehicle = async (formData) => {
    if (!token) {
      showToast("Unauthorized. Please log in again.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/vehicles`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // UPDATE CACHE (no refetch)
      setVehicles((prev) => [...prev, res.data.vehicle]);

      showToast("Vehicle added successfully", "success");
    } catch (err) {
      console.error("Add Vehicle Error:", err);
      showToast("Failed to add vehicle", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE VEHICLE (PUT) ----------------
  const updateVehicle = async (id, formData) => {
    if (!token) {
      showToast("Unauthorized. Please log in again.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/vehicles/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // ✅ UPDATE CACHE
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
    if (!token) {
      showToast("Unauthorized. Please log in again.", "error");
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ UPDATE CACHE
      setVehicles((prev) => prev.filter((v) => v._id !== id));

      showToast("Vehicle deleted successfully", "success");
    } catch (err) {
      console.error("Delete Vehicle Error:", err);
      showToast("Failed to delete vehicle", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- AUTO FETCH ON LOGIN ----------------
  useEffect(() => {
    if (token && user?.role === "shipper") {
      fetchVehicles();
    } else {
      // 🔐 CLEAR CACHE ON LOGOUT
      setVehicles([]);
      setLastFetch(0);
    }
  }, [token, user, fetchVehicles]);

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
