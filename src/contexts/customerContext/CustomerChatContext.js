import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const CustomerChatContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const CustomerChatProvider = ({ children }) => {
  const { token } = useAuth();
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stable fetch function using useCallback
  const fetchShippers = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/customer/chat/shippers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShippers(res.data?.data || []);
    } catch (err) {
      setShippers([]);
      console.error("Fetch shippers chat error", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Auto-fetch when token or fetchShippers changes
  useEffect(() => {
    fetchShippers();
  }, [fetchShippers]);

  return (
    <CustomerChatContext.Provider
      value={{
        shippers,
        loading,
        fetchShippers,
      }}
    >
      {children}
    </CustomerChatContext.Provider>
  );
};

export const useCustomerChat = () => useContext(CustomerChatContext);
