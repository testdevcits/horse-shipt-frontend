import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Toast from "../../components/common/Toast";
import { SHIPPER_API_BASE_URL as API_BASE_URL } from "../../config/api";

const DriverContext = createContext();

export const DriverProvider = ({ children }) => {
  const { token, user } = useAuth();

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetchedDrivers, setHasFetchedDrivers] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });
  const listCacheRef = useRef(new Map());
  const inFlightRef = useRef(new Map());

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
  const fetchDrivers = useCallback(async (filters = {}) => {
    if (!token) {
      setDrivers([]);
      setHasFetchedDrivers(false);
      return;
    }

    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      search: filters.search || "",
      status: filters.status || "",
      sortBy: filters.sortBy || "createdAt",
      sortOrder: filters.sortOrder || "desc",
    };
    const cacheKey = JSON.stringify(params);
    const cached = listCacheRef.current.get(cacheKey);

    if (cached) {
      setDrivers(cached.data);
      setPagination(cached.pagination);
      setHasFetchedDrivers(true);
      return cached.response;
    }

    if (inFlightRef.current.has(cacheKey)) {
      return inFlightRef.current.get(cacheKey);
    }

    const request = (async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const nextDrivers = Array.isArray(response?.data?.data)
        ? response.data.data
        : response?.data?.drivers || [];
      const nextPagination = {
        page: response.data.pagination?.page || params.page,
        limit: response.data.pagination?.limit || params.limit,
        totalPages: response.data.pagination?.totalPages || 1,
        total: response.data.total || nextDrivers.length,
      };

      if (Array.isArray(nextDrivers)) {
        setDrivers(nextDrivers);
        setPagination(nextPagination);
        listCacheRef.current.set(cacheKey, {
          data: nextDrivers,
          pagination: nextPagination,
          response: response.data,
        });
      } else {
        setDrivers([]);
      }
      return response.data;
    } catch (err) {
      setDrivers([]);
      showToast(
        err?.response?.data?.message || "Failed to fetch drivers",
        "error"
      );
    } finally {
      setHasFetchedDrivers(true);
      setLoading(false);
      inFlightRef.current.delete(cacheKey);
    }
    })();

    inFlightRef.current.set(cacheKey, request);
    return request;
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

      listCacheRef.current.clear();
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

      listCacheRef.current.clear();
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

      listCacheRef.current.clear();
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

      listCacheRef.current.clear();
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

      listCacheRef.current.clear();
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
      setHasFetchedDrivers(false);
    }
  }, [token, user, fetchDrivers]);

  return (
    <DriverContext.Provider
      value={{
        drivers,
        loading,
        hasFetchedDrivers,
        pagination,
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
