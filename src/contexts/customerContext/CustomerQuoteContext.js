import React, { createContext, useContext, useState, useCallback } from "react";
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

  /* =========================================================
     GET QUOTES BY SHIPMENT ID (CUSTOMER) - ONE TIME CALL
  ========================================================= */
  const getQuotesByShipment = useCallback(
    async (shipmentId, force = false) => {
      if (!token || !shipmentId) return;

      // Only skip if not forced
      if (!force && quotes.length > 0) return;

      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/customer/quotes/${shipmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuotes(res.data.success ? res.data.quotes || [] : []);
        if (!res.data.success)
          showToast(res.data.message || "No quotes found", "info");
      } catch (error) {
        console.error(error);
        setQuotes([]);
        showToast(
          error.response?.data?.message || "Failed to fetch quotes",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [token, quotes.length]
  );

  /* =========================================================
     ACCEPT QUOTE WITH SIGNATURE (CUSTOMER)
     customerSignature = base64 string
  ========================================================= */
  const acceptQuote = async (quoteId, customerSignature) => {
    if (!token) {
      showToast("Unauthorized. Please login again.", "error");
      return { success: false };
    }

    if (!customerSignature) {
      showToast("Customer signature is required", "error");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/customer/quotes/${quoteId}/accept`,
        { customerSignature },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showToast(res.data.message || "Quote accepted successfully", "success");

      // Update local quotes state
      setQuotes((prevQuotes) =>
        prevQuotes.map((q) =>
          q._id === quoteId
            ? { ...q, status: "accepted", contractAccepted: true }
            : { ...q, status: "rejected" }
        )
      );

      return { success: true };
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to accept quote",
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
