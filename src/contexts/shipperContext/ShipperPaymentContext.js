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
  const [error, setError] = useState(null);

  // ================= FETCH STRIPE STATUS =================

  const fetchStripeStatus = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE_URL}/shipper/stripe/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data.success) {
        setStripeStatus(null);
        setError(res.data.message);
        return;
      }

      setStripeStatus(res.data);

      // check onboarding state
      if (!res.data.onboardingCompleted) {
        setNeedsOnboarding(true);
      } else {
        setNeedsOnboarding(false);
      }
    } catch (err) {
      setStripeStatus(null);
      setNeedsOnboarding(false);

      setError(err?.response?.data?.message || "Stripe account not created");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ================= ENABLE PAYMENTS / COMPLETE VERIFICATION =================

  const enablePayments = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // create account if not exists
      await axios.post(
        `${API_BASE_URL}/shipper/stripe/create-account`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // generate onboarding link
      const res = await axios.post(
        `${API_BASE_URL}/shipper/stripe/onboarding`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.onboardingUrl) {
        window.location.href = res.data.onboardingUrl;
      }
    } catch (err) {
      console.error("Enable payments error:", err);

      setError(
        err?.response?.data?.message || "Failed to connect Stripe account"
      );
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
        error,
        fetchStripeStatus,
        enablePayments,
      }}
    >
      {children}
    </ShipperPaymentContext.Provider>
  );
};

export const useShipperPayments = () => useContext(ShipperPaymentContext);
