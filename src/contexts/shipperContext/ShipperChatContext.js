import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { API_BASE_URL } from "../../config/api";

const ShipperChatContext = createContext();
export const ShipperChatProvider = ({ children }) => {
  const { token } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/shipper/chat/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data?.data || []);
    } catch (err) {
      console.error("Fetch customers chat error:", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return (
    <ShipperChatContext.Provider
      value={{
        customers,
        loading,
        fetchCustomers,
      }}
    >
      {children}
    </ShipperChatContext.Provider>
  );
};

export const useShipperChat = () => useContext(ShipperChatContext);
