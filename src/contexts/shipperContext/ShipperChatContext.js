import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const ShipperChatContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const ShipperChatProvider = ({ children }) => {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stable fetch function using useCallback
  const fetchCustomers = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/shipper/chat/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data?.data || []);
    } catch (err) {
      setCustomers([]);
      console.error("Fetch customers chat error", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Auto-fetch when token or fetchCustomers changes
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
