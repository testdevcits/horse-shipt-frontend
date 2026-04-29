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

  // ---------------- TOAST HANDLER ----------------
  const showToast = (message, type = "info") => {
    if (Toast[type]) {
      Toast[type](message);
    } else {
      Toast.info(message);
    }
  };

  // ====================================================
  // FETCH DRIVERS
  // ====================================================
  const fetchDrivers = useCallback(async () => {
    if (!token) {
      setDrivers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response?.data?.drivers)) {
        setDrivers(response.data.drivers);
      } else {
        setDrivers([]);
      }
    } catch (err) {
      setDrivers([]);
      showToast(
        err?.response?.data?.message || "Failed to fetch drivers",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ====================================================
  // ADD DRIVER
  // ====================================================
  const addDriver = async (driverData) => {
    if (!token) return { success: false };

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/drivers`, driverData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchDrivers();
      showToast("Driver added successfully", "success");

      return { success: true };
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to add driver",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // UPDATE DRIVER
  // ====================================================
  const updateDriver = async (id, driverData) => {
    if (!token) return { success: false };

    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/drivers/${id}`, driverData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchDrivers();
      showToast("Driver updated successfully", "success");

      return { success: true };
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to update driver",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // DELETE DRIVER
  // ====================================================
  const deleteDriver = async (id) => {
    if (!token) return { success: false };

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/drivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchDrivers();
      showToast("Driver deleted successfully", "success");

      return { success: true };
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to delete driver",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // ASSIGN VEHICLES
  // ====================================================
  const assignVehicles = async (driverId, vehicleIds) => {
    if (!token) return { success: false };

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/drivers/assign-vehicles`,
        { driverId, vehicleIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchDrivers();
      showToast("Vehicles assigned successfully", "success");

      return { success: true };
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to assign vehicles",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // TOGGLE DRIVER STATUS
  // ====================================================
  const toggleDriverStatus = async (driverId, isActive) => {
    if (!token) return { success: false };

    setLoading(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/drivers/${driverId}/toggle-status`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchDrivers();

      showToast(
        `Driver ${isActive ? "activated" : "deactivated"} successfully`,
        "success"
      );

      return { success: true };
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to update driver status",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // AUTO FETCH
  // ====================================================
  useEffect(() => {
    if (token && user?.role === "shipper") {
      fetchDrivers();
    } else {
      setDrivers([]);
    }
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
        toggleDriverStatus,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => useContext(DriverContext);
