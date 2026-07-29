import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { API_BASE_URL } from "../../config/api";

const CustomerChatContext = createContext();
export const CustomerChatProvider = ({ children }) => {
  const { token } = useAuth();
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchShippers = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/customer/chat/shippers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShippers(res.data?.data || []);
    } catch (err) {
      console.error("Fetch shippers chat error", err);
      setShippers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

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
