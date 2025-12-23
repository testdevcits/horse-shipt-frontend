import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Toast from "../../components/common/Toast";

const CustomerQuoteContext = createContext();

const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const CustomerQuoteProvider = ({ children }) => {
  const { token } = useAuth();

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------- TOAST ----------------
  const [toast, setToast] = useState({
    message: "",
    type: "",
    visible: false,
  });

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  // ---------------- GET QUOTES BY SHIPMENT (CUSTOMER) ----------------
  const getQuotesByShipment = async (shipmentId) => {
    if (!token || !shipmentId) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/customer/quotes/${shipmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuotes(res.data.quotes || []);
    } catch (err) {
      showToast("Failed to fetch quotes", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ACCEPT QUOTE (CUSTOMER) ----------------
  const acceptQuote = async (quoteId, contractFile, acceptedTerms) => {
    if (!token) {
      showToast("Unauthorized. Please login again.", "error");
      return { success: false };
    }

    if (!contractFile || !acceptedTerms) {
      showToast("Please accept terms and upload Contract.pdf", "error");
      return { success: false };
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("contractFile", contractFile);
      formData.append("acceptedTerms", acceptedTerms);

      const res = await axios.put(
        `${API_BASE_URL}/customer/quotes/${quoteId}/accept`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showToast(res.data.message || "Quote accepted successfully", "success");

      // Update local state
      setQuotes((prev) =>
        prev.map((q) => (q._id === quoteId ? { ...q, status: "accepted" } : q))
      );

      return { success: true };
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to accept quote",
        "error"
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerQuoteContext.Provider
      value={{
        quotes,
        loading,
        getQuotesByShipment,
        acceptQuote,
      }}
    >
      {children}

      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "", visible: false })}
        />
      )}
    </CustomerQuoteContext.Provider>
  );
};

// ---------------- HOOK ----------------
export const useCustomerQuote = () => useContext(CustomerQuoteContext);
