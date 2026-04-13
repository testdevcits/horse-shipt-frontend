import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

// ---------------- Context Setup ----------------
const CustomerShipmentContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

// ---------------- Provider ----------------
export const CustomerShipmentProvider = ({ children }) => {
  const { token, user } = useAuth();

  // ================= SHIPMENTS STATE =================
  const [shipments, setShipments] = useState([]);
  const [currentShipment, setCurrentShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ================= HORSES STATE =================
  const [myHorses, setMyHorses] = useState([]);
  const [horseLoading, setHorseLoading] = useState(false);
  const [horseError, setHorseError] = useState(null);
  const [horsesFetched, setHorsesFetched] = useState(false);

  // =====================================================
  // FETCH CUSTOMER SHIPMENTS
  // =====================================================
  const fetchShipments = useCallback(async () => {
    if (!user || !token || user.role !== "customer") return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/customer/shipments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setShipments(res.data.shipments || []);
      } else {
        setError(res.data.message || "Failed to fetch shipments");
      }
    } catch (err) {
      console.error("Fetch shipments error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // =====================================================
  // FETCH SINGLE SHIPMENT
  // =====================================================
  const fetchShipmentById = useCallback(
    async (shipmentId) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          `${API_BASE_URL}/customer/shipments/${shipmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setCurrentShipment(res.data.shipment);
        } else {
          setError(res.data.message || "Failed to fetch shipment");
        }
      } catch (err) {
        console.error("Fetch shipment error:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // =====================================================
  // CREATE SHIPMENT
  // =====================================================
  const createShipment = async (formData) => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/customer/shipments`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        setShipments((prev) => [res.data.shipment, ...prev]);
        return res.data.shipment;
      } else {
        setError(res.data.message || "Failed to create shipment");
      }
    } catch (err) {
      console.error("Create shipment error:", err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PUBLISH SHIPMENT
  // =====================================================
  const publishShipment = async (shipmentId) => {
    if (!token) throw new Error("No authorization token");

    setLoading(true);
    setError(null);

    try {
      const res = await axios.patch(
        `${API_BASE_URL}/customer/shipments/${shipmentId}/publish`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setShipments((prev) =>
          prev.map((s) => (s._id === shipmentId ? res.data.shipment : s))
        );

        if (currentShipment && currentShipment._id === shipmentId) {
          setCurrentShipment(res.data.shipment);
        }

        return res.data.shipment;
      } else {
        throw new Error(res.data.message || "Failed to publish shipment");
      }
    } catch (err) {
      console.error("Publish shipment error:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to publish shipment";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE SHIPMENT
  // =====================================================
  const deleteShipment = async (shipmentId) => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/customer/shipments/${shipmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setShipments((prev) => prev.filter((s) => s._id !== shipmentId));
      } else {
        setError(res.data.message || "Failed to delete shipment");
      }
    } catch (err) {
      console.error("Delete shipment error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET MY HORSES (FETCH ONLY ONCE WITH CACHE)
  // =====================================================
  const getMyHorses = useCallback(async () => {
    if (!token || user?.role !== "customer") {
      console.warn("Not authorized to fetch horses");
      return [];
    }

    // CRITICAL: Only fetch if not already fetched
    if (horsesFetched) {
      console.log("Horses already fetched, returning cached list");
      return myHorses;
    }

    setHorseLoading(true);
    setHorseError(null);

    try {
      console.log("Fetching horses from API...");
      const res = await axios.get(`${API_BASE_URL}/customer/horses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const horsesList = res.data.data?.horses || res.data.horses || [];
        console.log("Horses fetched successfully:", horsesList.length);
        setMyHorses(horsesList);
        setHorsesFetched(true); // Mark as fetched
        setHorseError(null);
        return horsesList;
      } else {
        const errorMsg = res.data.message || "Failed to fetch horses";
        setHorseError(errorMsg);
        setHorsesFetched(true);
        return [];
      }
    } catch (err) {
      console.error("Get my horses error:", err);
      const errorMsg = err.response?.data?.message || err.message;
      setHorseError(errorMsg);
      setHorsesFetched(true);
      return [];
    } finally {
      setHorseLoading(false);
    }
  }, [token, user, horsesFetched, myHorses]);

  // =====================================================
  // REFRESH HORSES (Force refresh from API)
  // =====================================================
  const refreshHorses = useCallback(async () => {
    if (!token || user?.role !== "customer") {
      return [];
    }

    setHorseLoading(true);
    setHorseError(null);

    try {
      console.log("Force refreshing horses...");
      const res = await axios.get(`${API_BASE_URL}/customer/horses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const horsesList = res.data.data?.horses || res.data.horses || [];
        console.log("Horses refreshed successfully:", horsesList.length);
        setMyHorses(horsesList);
        setHorseError(null);
        return horsesList;
      } else {
        const errorMsg = res.data.message || "Failed to refresh horses";
        setHorseError(errorMsg);
        return [];
      }
    } catch (err) {
      console.error("Refresh horses error:", err);
      const errorMsg = err.response?.data?.message || err.message;
      setHorseError(errorMsg);
      return [];
    } finally {
      setHorseLoading(false);
    }
  }, [token, user]);

  // =====================================================
  // CREATE HORSE
  // =====================================================
  const createHorse = async (horseData) => {
    console.log("createHorse called with:", horseData);

    if (!token) {
      const errorMsg = "No authorization token";
      console.warn(errorMsg);
      setHorseError(errorMsg);
      return { success: false, message: errorMsg };
    }

    setHorseLoading(true);
    setHorseError(null);

    try {
      let axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
      let dataToSend;

      // Check if any value is a File
      const hasFile = Object.values(horseData).some(
        (val) => val instanceof File
      );

      if (hasFile) {
        // Use FormData for files
        dataToSend = new FormData();
        Object.keys(horseData).forEach((key) => {
          if (horseData[key] !== undefined && horseData[key] !== null) {
            dataToSend.append(key, horseData[key]);
          }
        });
        console.log("FormData prepared for horse with files");
      } else {
        // Send as JSON
        dataToSend = horseData;
        axiosConfig.headers["Content-Type"] = "application/json";
        console.log("JSON data prepared for horse");
      }

      const res = await axios.post(
        `${API_BASE_URL}/customer/horses`,
        dataToSend,
        axiosConfig
      );

      console.log("Horse creation response:", res.data);

      if (res?.data?.success && res?.data?.horse) {
        const newHorse = res.data.horse;
        console.log("Horse created successfully:", newHorse);

        // Add to state - only context manages this
        setMyHorses((prev) => [newHorse, ...prev]);
        setHorseError(null);

        return {
          success: true,
          horse: newHorse,
          message: res.data.message || "Horse created successfully",
        };
      }

      const errorMsg = res?.data?.message || "Failed to create horse";
      setHorseError(errorMsg);
      return { success: false, message: errorMsg };
    } catch (err) {
      console.error("Create horse error:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to create horse";
      setHorseError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setHorseLoading(false);
    }
  };

  // =====================================================
  // UPDATE HORSE
  // =====================================================
  const updateHorse = async (horseId, horseData) => {
    console.log("updateHorse called with:", horseId, horseData);

    if (!token || !horseId) {
      const errorMsg = "Missing token or horse ID";
      console.warn(errorMsg);
      setHorseError(errorMsg);
      return { success: false, message: errorMsg };
    }

    setHorseLoading(true);
    setHorseError(null);

    try {
      let axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
      let dataToSend;

      const hasFile = Object.values(horseData).some(
        (val) => val instanceof File
      );

      if (hasFile) {
        dataToSend = new FormData();
        Object.keys(horseData).forEach((key) => {
          if (horseData[key] !== undefined && horseData[key] !== null) {
            dataToSend.append(key, horseData[key]);
          }
        });
      } else {
        dataToSend = horseData;
        axiosConfig.headers["Content-Type"] = "application/json";
      }

      const res = await axios.put(
        `${API_BASE_URL}/customer/horses/${horseId}`,
        dataToSend,
        axiosConfig
      );

      console.log("Horse update response:", res.data);

      if (res?.data?.success && res?.data?.horse) {
        const updatedHorse = res.data.horse;
        console.log("Horse updated successfully:", updatedHorse);

        // Update in state
        setMyHorses((prev) =>
          prev.map((h) => (h._id === horseId ? updatedHorse : h))
        );
        setHorseError(null);

        return {
          success: true,
          horse: updatedHorse,
          message: res.data.message || "Horse updated successfully",
        };
      }

      const errorMsg = res?.data?.message || "Failed to update horse";
      setHorseError(errorMsg);
      return { success: false, message: errorMsg };
    } catch (err) {
      console.error("Update horse error:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to update horse";
      setHorseError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setHorseLoading(false);
    }
  };

  // =====================================================
  // DELETE HORSE
  // =====================================================
  const deleteHorse = async (horseId) => {
    console.log("deleteHorse called with:", horseId);

    if (!token || !horseId) {
      const errorMsg = "Missing token or horse ID";
      console.warn(errorMsg);
      setHorseError(errorMsg);
      return { success: false, message: errorMsg };
    }

    setHorseLoading(true);
    setHorseError(null);

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/customer/horses/${horseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Horse delete response:", res.data);

      if (res?.data?.success) {
        console.log("Horse deleted successfully");
        // Remove from state
        setMyHorses((prev) => prev.filter((h) => h._id !== horseId));
        setHorseError(null);

        return {
          success: true,
          message: res.data.message || "Horse deleted successfully",
        };
      }

      const errorMsg = res?.data?.message || "Failed to delete horse";
      setHorseError(errorMsg);
      return { success: false, message: errorMsg };
    } catch (err) {
      console.error("Delete horse error:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to delete horse";
      setHorseError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setHorseLoading(false);
    }
  };

  // =====================================================
  // AUTO FETCH SHIPMENTS ON MOUNT
  // =====================================================
  useEffect(() => {
    if (user && token && user.role === "customer" && shipments.length === 0) {
      fetchShipments();
    }
  }, [user, token, fetchShipments, shipments.length]);

  // =====================================================
  // PROVIDER VALUE
  // =====================================================
  const value = {
    // Shipments
    shipments,
    currentShipment,
    loading,
    error,
    fetchShipments,
    fetchShipmentById,
    createShipment,
    publishShipment,
    deleteShipment,

    // Horses
    myHorses,
    horseLoading,
    horseError,
    getMyHorses,
    refreshHorses,
    createHorse,
    updateHorse,
    deleteHorse,
  };

  return (
    <CustomerShipmentContext.Provider value={value}>
      {children}
    </CustomerShipmentContext.Provider>
  );
};

// ---------------- Custom Hook ----------------
export const useCustomerShipments = () => {
  const context = useContext(CustomerShipmentContext);
  if (!context) {
    throw new Error(
      "useCustomerShipments must be used within CustomerShipmentProvider"
    );
  }
  return context;
};
