import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

const CustomerPaymentContext = createContext();

// ---------------- Custom Hook ----------------
export const useCustomerPayment = () => useContext(CustomerPaymentContext);

// ---------------- Provider ----------------
export const CustomerPaymentProvider = ({ children }) => {
  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ===============================
     Fetch All Customer Payments
  ================================ */
  const fetchPayments = useCallback(async () => {
    if (!user?.token || user?.role !== "customer") {
      setPayments([]);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE_URL}/customer/payments`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (res.data?.payments) {
        setPayments(res.data.payments);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("[Fetch Payments] Error:", err.response || err.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /* ===============================
     Auto Fetch on Login / Change
  ================================ */
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  /* ===============================
     Provider Value
  ================================ */
  return (
    <CustomerPaymentContext.Provider
      value={{
        payments,
        loading,
        fetchPayments,
      }}
    >
      {children}
    </CustomerPaymentContext.Provider>
  );
};
