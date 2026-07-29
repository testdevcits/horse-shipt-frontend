import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { API_BASE_URL } from "../../config/api";

const ShipperPaymentContext = createContext();
export const ShipperPaymentProvider = ({ children }) => {
  const { token } = useAuth();

  const [stripeStatus, setStripeStatus] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const [hasCard, setHasCard] = useState(false);
  const [paymentCard, setPaymentCard] = useState(null);

  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ================= FETCH STRIPE STATUS =================
  const fetchStripeStatus = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/shipper/stripe/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStripeStatus(res.data);
      setNeedsOnboarding(!res.data.onboardingCompleted);
    } catch (err) {
      console.error("Stripe status error:", err);
      setNeedsOnboarding(true);
      setError(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ================= ENABLE PAYMENTS =================
  const enablePayments = useCallback(async () => {
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
      if (res.data?.onboardingUrl)
        window.location.href = res.data.onboardingUrl;
    } catch (err) {
      console.error("Enable payments error:", err);
      setError(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ================= CREATE CUSTOMER =================
  const createCustomer = useCallback(async () => {
    if (!token) return;
    try {
      await axios.post(
        `${API_BASE_URL}/shipper/create-customer`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Create customer error:", err);
    }
  }, [token]);

  // ================= CREATE SETUP INTENT =================
  const createSetupIntent = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/shipper/setup-intent`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClientSecret(res.data.clientSecret);
      return res.data.clientSecret;
    } catch (err) {
      console.error("Setup intent error:", err);
      setError("Failed to initialize card setup");
      throw err;
    }
  }, [token]);

  // ================= SAVE PAYMENT METHOD =================
  const savePaymentMethod = useCallback(
    async (paymentMethodId) => {
      if (!token) return;
      try {
        const res = await axios.post(
          `${API_BASE_URL}/shipper/save-payment-method`,
          { paymentMethodId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHasCard(true);
        if (res.data?.cardBrand && res.data?.cardLast4) {
          setPaymentCard({
            cardBrand: res.data.cardBrand,
            cardLast4: res.data.cardLast4,
          });
        }
        setClientSecret(null);
        return res.data;
      } catch (err) {
        console.error("Save payment method error:", err);
        setError(err.response?.data?.message || "Failed to save card");
        throw err;
      }
    },
    [token]
  );

  // ================= FETCH PAYMENT STATUS =================
  const fetchPaymentStatus = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/shipper/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHasCard(res.data.hasCard || false);
      if (res.data.hasCard && res.data.cardBrand && res.data.cardLast4) {
        setPaymentCard({
          cardBrand: res.data.cardBrand,
          cardLast4: res.data.cardLast4,
        });
      } else {
        setPaymentCard(null);
      }
    } catch (err) {
      console.error("Payment status error:", err);
    }
  }, [token]);

  return (
    <ShipperPaymentContext.Provider
      value={{
        stripeStatus,
        needsOnboarding,
        enablePayments,
        fetchStripeStatus,
        createCustomer,
        createSetupIntent,
        savePaymentMethod,
        fetchPaymentStatus,
        hasCard,
        paymentCard,
        clientSecret,
        loading,
        error,
      }}
    >
      {children}
    </ShipperPaymentContext.Provider>
  );
};

export const useShipperPayments = () => useContext(ShipperPaymentContext);
