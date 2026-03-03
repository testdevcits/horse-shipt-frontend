import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const ShipperPaymentContext = createContext();
const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const ShipperPaymentProvider = ({ children }) => {
  const { token } = useAuth();

  const [stripeStatus, setStripeStatus] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= FETCH STRIPE STATUS =================
  const fetchStripeStatus = useCallback(async () => {
    if (!token) return;

    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE_URL}/shipper/stripe/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStripeStatus(res.data);
      setNeedsOnboarding(!res.data?.stripeVerified);
    } catch (err) {
      if (err.response?.status === 400) {
        setNeedsOnboarding(true); // 🔥 important
      } else {
        console.error("Stripe status error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ================= ENABLE PAYMENTS =================
  const enablePayments = async () => {
    if (!token) return;

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/shipper/stripe/create-account`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.post(
        `${API_BASE_URL}/shipper/stripe/onboarding`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.onboardingUrl) {
        window.location.href = res.data.onboardingUrl;
      }
    } catch (err) {
      console.error("Enable payments error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShipperPaymentContext.Provider
      value={{
        stripeStatus,
        needsOnboarding,
        loading,
        fetchStripeStatus,
        enablePayments,
      }}
    >
      {children}
    </ShipperPaymentContext.Provider>
  );
};

export const useShipperPayments = () => useContext(ShipperPaymentContext);
