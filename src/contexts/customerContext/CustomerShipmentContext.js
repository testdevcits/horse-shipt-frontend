// src/contexts/customerContext/CustomerShipmentContext.js
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

  const [shipments, setShipments] = useState([]);
  const [currentShipment, setCurrentShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ================= FETCH CUSTOMER SHIPMENTS =================
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

  // ================= FETCH SINGLE SHIPMENT =================
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

  // ================= CREATE SHIPMENT =================
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

  // ================= PUBLISH SHIPMENT =================
  const publishShipment = async (shipmentId) => {
    if (!token) return;

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
        return res.data.shipment;
      } else {
        setError(res.data.message || "Failed to publish shipment");
      }
    } catch (err) {
      console.error("Publish shipment error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE SHIPMENT =================
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

  // ================= AUTO FETCH =================
  // Only fetch if shipments array is empty to prevent re-fetching on navigation
  useEffect(() => {
    if (user && token && user.role === "customer" && shipments.length === 0) {
      fetchShipments();
    }
  }, [user, token, fetchShipments, shipments.length]);

  // ================= PROVIDER =================
  return (
    <CustomerShipmentContext.Provider
      value={{
        shipments,
        currentShipment,
        loading,
        error,
        fetchShipments,
        fetchShipmentById,
        createShipment,
        publishShipment,
        deleteShipment,
      }}
    >
      {children}
    </CustomerShipmentContext.Provider>
  );
};

// ---------------- Custom Hook ----------------
export const useCustomerShipments = () => useContext(CustomerShipmentContext);
