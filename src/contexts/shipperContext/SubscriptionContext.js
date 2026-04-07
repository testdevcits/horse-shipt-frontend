import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

const SubscriptionContext = createContext();

const API_BASE_URL = "https://horse-shipt.vercel.app/api";

export const SubscriptionProvider = ({ children }) => {
  const { token, isShipper } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchedOnce = useRef(false);

  /* ===============================
       GET MY SUBSCRIPTION
    =================================*/
  const getMySubscription = useCallback(async () => {
    if (!token || !isShipper) return;

    setLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/shipper/stripe/subscription/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // API response shape: { success, trialActive, status, remainingTrialDays, trialEnd, ... }
      const raw = res.data;

      if (!raw || !raw.success) {
        setSubscription(null);
        return;
      }

      // Spread into new object so we don't mutate axios cache
      const data = { ...raw };

      // Compute remainingTrialDays locally as fallback if API doesn't send it
      if (
        data.status === "trialing" &&
        data.trialEnd &&
        data.remainingTrialDays == null
      ) {
        const now = new Date();
        const trialEndDate = new Date(data.trialEnd);
        const remainingDays = Math.ceil(
          (trialEndDate - now) / (1000 * 60 * 60 * 24)
        );
        data.remainingTrialDays = remainingDays > 0 ? remainingDays : 0;
      }

      setSubscription(data);
    } catch (err) {
      console.error("Get Subscription Error:", err);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [token, isShipper]);

  /* ===============================
       GET PLAN DETAILS
    =================================*/
  const getSubscriptionPlan = useCallback(async () => {
    if (!token || !isShipper) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/shipper/stripe/subscription-plan`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlan(res.data?.data || null);
    } catch (err) {
      console.error("Get Plan Error:", err);
      setPlan(null);
    }
  }, [token, isShipper]);

  /* ===============================
       CREATE SUBSCRIPTION
    =================================*/
  const createSubscription = async (withTrial = true) => {
    if (!token || !isShipper) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/shipper/stripe/subscription/create`,
        { withTrial },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await getMySubscription();
      return res.data;
    } catch (err) {
      console.error("Create Subscription Error:", err);
      throw err;
    }
  };

  /* ===============================
       CANCEL SUBSCRIPTION
    =================================*/
  const cancelSubscription = async (
    cancelImmediately = false,
    reason = "User requested"
  ) => {
    if (!token || !isShipper) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/shipper/stripe/subscription/cancel`,
        { cancelImmediately, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await getMySubscription();
      return res.data;
    } catch (err) {
      console.error("Cancel Subscription Error:", err);
      throw err;
    }
  };

  /* ===============================
       AUTO LOAD
    =================================*/
  useEffect(() => {
    if (!token || !isShipper) return;
    if (!fetchedOnce.current) {
      fetchedOnce.current = true;
      getMySubscription();
      getSubscriptionPlan();
    }
  }, [token, isShipper, getMySubscription, getSubscriptionPlan]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plan,
        loading,
        getMySubscription,
        getSubscriptionPlan,
        createSubscription,
        cancelSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
