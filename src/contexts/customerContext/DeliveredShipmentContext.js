import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { API_BASE_URL } from "../../config/api";

const DeliveredShipmentContext = createContext();
export const DeliveredShipmentProvider = ({ children }) => {
  const { token } = useAuth();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch Completed Shipments
  const fetchCompletedShipments = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/customer/shipments/completed`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShipments(res.data?.shipments || []);
    } catch (err) {
      console.error("Fetch completed shipments error", err);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 🔹 Optional: Clear state (useful on logout / refresh)
  const clearShipments = () => {
    setShipments([]);
  };

  return (
    <DeliveredShipmentContext.Provider
      value={{
        shipments,
        loading,
        fetchCompletedShipments,
        clearShipments,
      }}
    >
      {children}
    </DeliveredShipmentContext.Provider>
  );
};

export const useDeliveredShipments = () => useContext(DeliveredShipmentContext);
