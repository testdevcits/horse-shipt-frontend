import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Toast from "../../components/common/Toast";

const ShipperDeliveryContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

export const ShipperDeliveryProvider = ({ children }) => {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  const [payoutHistory, setPayoutHistory] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  // ---------------- TOAST HANDLER ----------------
  const showToast = (message, type = "info") => {
    if (Toast[type]) {
      Toast[type](message);
    } else {
      Toast.info(message);
    }
  };

  // ====================================================
  // MARK DELIVERED
  // ====================================================
  const markDelivered = useCallback(
    async (shipmentId) => {
      if (!token) return null;

      setLoading(true);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/shipment/${shipmentId}/mark-delivered`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        showToast("Shipment marked as delivered", "success");
        return res.data;
      } catch (err) {
        console.error(
          "Mark delivered error:",
          err?.response?.data || err.message
        );

        showToast(
          err?.response?.data?.message || "Failed to mark delivered",
          "error"
        );

        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // ====================================================
  // VERIFY OTP
  // ====================================================
  const verifyOtp = useCallback(
    async (shipmentId, otp) => {
      if (!token) return null;

      setLoading(true);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/shipment/${shipmentId}/verify-delivery-otp`,
          { otp },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        showToast("OTP verified successfully", "success");
        return res.data;
      } catch (err) {
        console.error("Verify OTP error:", err?.response?.data || err.message);

        showToast(
          err?.response?.data?.message || "OTP verification failed",
          "error"
        );

        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // ====================================================
  // REQUEST PAYOUT
  // ====================================================
  const requestPayout = useCallback(async () => {
    if (!token) return null;

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/shipper/payout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("Payout requested successfully", "success");
      return res.data;
    } catch (err) {
      console.error(
        "Payout request error:",
        err?.response?.data || err.message
      );

      showToast(
        err?.response?.data?.message || "Failed to request payout",
        "error"
      );

      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ====================================================
  // GET DELIVERY STATUS
  // ====================================================
  const getDeliveryStatus = useCallback(
    async (shipmentId) => {
      if (!token) return null;

      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/shipment/${shipmentId}/delivery-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setDeliveryStatus(res.data);
        return res.data;
      } catch (err) {
        console.error(
          "Get delivery status error:",
          err?.response?.data || err.message
        );

        showToast(
          err?.response?.data?.message || "Failed to fetch delivery status",
          "error"
        );

        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // ====================================================
  // GET PAYOUT HISTORY
  // ====================================================
  const getPayoutHistory = useCallback(
    async (limit = 10, cursor = null) => {
      if (!token) return null;

      setLoading(true);
      try {
        let url = `${API_BASE_URL}/shipper/payout-history?limit=${limit}`;

        if (cursor) {
          url += `&starting_after=${cursor}`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newTransactions = res?.data?.transactions || [];

        setPayoutHistory((prev) =>
          cursor ? [...prev, ...newTransactions] : newTransactions
        );

        setHasMore(res?.data?.hasMore);
        setNextCursor(res?.data?.nextCursor);

        return res.data;
      } catch (err) {
        console.error(
          "Get payout history error:",
          err?.response?.data || err.message
        );

        showToast(
          err?.response?.data?.message || "Failed to fetch payout history",
          "error"
        );

        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return (
    <ShipperDeliveryContext.Provider
      value={{
        loading,
        deliveryStatus,
        payoutHistory,
        hasMore,
        nextCursor,
        markDelivered,
        verifyOtp,
        requestPayout,
        getDeliveryStatus,
        getPayoutHistory,
      }}
    >
      {children}
    </ShipperDeliveryContext.Provider>
  );
};

export const useShipperDelivery = () => useContext(ShipperDeliveryContext);
