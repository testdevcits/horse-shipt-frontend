import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const ShipperDeliveryContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api/shipper";

export const ShipperDeliveryProvider = ({ children }) => {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  // Mark shipment as delivered
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
        return res.data;
      } catch (err) {
        console.error("Mark delivered error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Verify delivery OTP → wallet credit
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
        return res.data;
      } catch (err) {
        console.error("Verify OTP error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Shipper payout request
  const requestPayout = useCallback(async () => {
    if (!token) return null;
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/shipper/payout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (err) {
      console.error("Payout request error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Check shipment delivery status
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
        console.error("Get delivery status error:", err);
        throw err;
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
        markDelivered,
        verifyOtp,
        requestPayout,
        getDeliveryStatus,
      }}
    >
      {children}
    </ShipperDeliveryContext.Provider>
  );
};

export const useShipperDelivery = () => useContext(ShipperDeliveryContext);
