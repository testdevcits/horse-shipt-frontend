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

const DriverContext = createContext();

const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

export const DriverProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  // ---------------- FETCH DRIVERS ----------------
  const fetchDrivers = useCallback(async () => {
    if (!token) {
      setDrivers([]);
      console.warn("No token, skipping fetchDrivers");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetch Drivers Response:", res.data); // debug log

      const data = res.data || {};
      if (Array.isArray(data.drivers)) {
        setDrivers(data.drivers);
      } else if (data.success && data.driver) {
        // fallback if backend returns single driver
        setDrivers([data.driver]);
      } else {
        setDrivers([]);
      }

      setFetched(true);
    } catch (err) {
      console.error("Fetch Drivers Error:", err.response?.data || err.message);
      setDrivers([]);
      showToast(
        err.response?.data?.message || "Failed to fetch drivers",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ---------------- ADD DRIVER ----------------
  const addDriver = async (driverData) => {
    if (!token) return { success: false };
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/drivers`, driverData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Add Driver Response:", res.data);

      setFetched(false);
      await fetchDrivers();
      showToast("Driver added successfully", "success");
      return { success: true };
    } catch (err) {
      console.error("Add Driver Error:", err.response?.data || err.message);
      showToast(err.response?.data?.message || "Failed to add driver", "error");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPDATE DRIVER ----------------
  const updateDriver = async (id, driverData) => {
    if (!token) return { success: false };
    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/drivers/${id}`, driverData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Update Driver Response:", res.data);

      setFetched(false);
      await fetchDrivers();
      showToast("Driver updated successfully", "success");
      return { success: true };
    } catch (err) {
      console.error("Update Driver Error:", err.response?.data || err.message);
      showToast(
        err.response?.data?.message || "Failed to update driver",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- DELETE DRIVER ----------------
  const deleteDriver = async (id) => {
    if (!token) return { success: false };
    setLoading(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/drivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Delete Driver Response:", res.data);

      setFetched(false);
      await fetchDrivers();
      showToast("Driver deleted successfully", "success");
      return { success: true };
    } catch (err) {
      console.error("Delete Driver Error:", err.response?.data || err.message);
      showToast(
        err.response?.data?.message || "Failed to delete driver",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ASSIGN VEHICLES ----------------
  const assignVehicles = async (driverId, vehicleIds) => {
    if (!token) return { success: false };
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/drivers/assign-vehicles`,
        { driverId, vehicleIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Assign Vehicles Response:", res.data);

      setFetched(false);
      await fetchDrivers();
      showToast("Vehicles assigned successfully", "success");
      return { success: true };
    } catch (err) {
      console.error(
        "Assign Vehicles Error:",
        err.response?.data || err.message
      );
      showToast(
        err.response?.data?.message || "Failed to assign vehicles",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EFFECT ----------------
  useEffect(() => {
    if (token && user?.role === "shipper") fetchDrivers();
    else setDrivers([]);
  }, [token, user, fetchDrivers]);

  return (
    <DriverContext.Provider
      value={{
        drivers,
        loading,
        fetchDrivers,
        addDriver,
        updateDriver,
        deleteDriver,
        assignVehicles,
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
    </DriverContext.Provider>
  );
};

export const useDriver = () => useContext(DriverContext);
