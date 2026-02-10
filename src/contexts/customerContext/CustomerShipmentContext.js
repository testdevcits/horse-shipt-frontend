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
  // GET MY HORSES
  // =====================================================
  const getMyHorses = useCallback(async () => {
    if (!token || user?.role !== "customer") return;

    setHorseLoading(true);
    setHorseError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/customer/horses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const horsesList = res.data.data?.horses || res.data.horses || [];
        setMyHorses(horsesList);
        return horsesList;
      } else {
        setHorseError(res.data.message || "Failed to fetch horses");
      }
    } catch (err) {
      console.error("Get my horses error:", err);
      setHorseError(err.response?.data?.message || err.message);
    } finally {
      setHorseLoading(false);
    }
  }, [token, user]);

  // =====================================================
  // CREATE HORSE
  // =====================================================
  const createHorse = async (formData) => {
    if (!token) return null;

    setHorseLoading(true);
    setHorseError(null);

    try {
      let axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
      let dataToSend;
      const hasFile = Object.values(formData).some(
        (val) => val instanceof File
      );

      if (hasFile) {
        dataToSend = new FormData();
        for (const key in formData) {
          if (formData[key] !== undefined && formData[key] !== null) {
            dataToSend.append(key, formData[key]);
          }
        }
      } else {
        dataToSend = formData;
        axiosConfig.headers["Content-Type"] = "application/json";
      }

      const res = await axios.post(
        `${API_BASE_URL}/customer/horses`,
        dataToSend,
        axiosConfig
      );

      if (res?.data?.success && res?.data?.horse) {
        const horse = res.data.horse;
        setMyHorses((prev) => [horse, ...prev]);
        return horse;
      }

      setHorseError(res?.data?.message || "Failed to save horse");
      return null;
    } catch (err) {
      console.error("Create horse error:", err);
      setHorseError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setHorseLoading(false);
    }
  };

  // =====================================================
  // UPDATE HORSE
  // =====================================================
  const updateHorse = async (horseId, formData) => {
    if (!token || !horseId) return null;

    setHorseLoading(true);
    setHorseError(null);

    try {
      let axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
      let dataToSend;
      const hasFile = Object.values(formData).some(
        (val) => val instanceof File
      );

      if (hasFile) {
        dataToSend = new FormData();
        for (const key in formData) {
          if (formData[key] !== undefined && formData[key] !== null) {
            dataToSend.append(key, formData[key]);
          }
        }
      } else {
        dataToSend = formData;
        axiosConfig.headers["Content-Type"] = "application/json";
      }

      const res = await axios.put(
        `${API_BASE_URL}/customer/horses/${horseId}`,
        dataToSend,
        axiosConfig
      );

      if (res?.data?.success && res?.data?.horse) {
        const updatedHorse = res.data.horse;
        setMyHorses((prev) =>
          prev.map((h) => (h._id === updatedHorse._id ? updatedHorse : h))
        );
        return updatedHorse;
      }

      setHorseError(res?.data?.message || "Failed to update horse");
      return null;
    } catch (err) {
      console.error("Update horse error:", err);
      setHorseError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setHorseLoading(false);
    }
  };

  // =====================================================
  // DELETE HORSE
  // =====================================================
  const deleteHorse = async (horseId) => {
    if (!token || !horseId) return false;

    setHorseLoading(true);
    setHorseError(null);

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/customer/horses/${horseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res?.data?.success) {
        setMyHorses((prev) => prev.filter((h) => h._id !== horseId));
        return true;
      }

      setHorseError(res?.data?.message || "Failed to delete horse");
      return false;
    } catch (err) {
      console.error("Delete horse error:", err);
      setHorseError(err.response?.data?.message || err.message);
      return false;
    } finally {
      setHorseLoading(false);
    }
  };

  // =====================================================
  // AUTO FETCH SHIPMENTS
  // =====================================================
  useEffect(() => {
    if (user && token && user.role === "customer" && shipments.length === 0) {
      fetchShipments();
    }
  }, [user, token, fetchShipments, shipments.length]);

  // =====================================================
  // PROVIDER
  // =====================================================
  return (
    <CustomerShipmentContext.Provider
      value={{
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
        createHorse,
        updateHorse,
        deleteHorse,
      }}
    >
      {children}
    </CustomerShipmentContext.Provider>
  );
};

// ---------------- Custom Hook ----------------
export const useCustomerShipments = () => useContext(CustomerShipmentContext);
