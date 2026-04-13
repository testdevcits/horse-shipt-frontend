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
  const [planLoading, setPlanLoading] = useState(false);

  const hasFetched = useRef(false);

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

      const raw = res.data;

      if (!raw || !raw.success) {
        setSubscription(null);
        return;
      }

      const data = { ...raw };

      // trial calculation
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

      // access flag
      data.hasAccess =
        data.hasAccess ?? ["active", "trialing"].includes(data.status);

      // cancel message
      if (data.cancelAtPeriodEnd && data.currentPeriodEnd) {
        data.cancelMessage = `Your subscription will end on ${new Date(
          data.currentPeriodEnd
        ).toLocaleDateString()}`;
      } else {
        data.cancelMessage = null;
      }

      setSubscription(data);
    } catch (err) {
      console.error(
        "Get Subscription Error:",
        err?.response?.data || err.message
      );
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

    setPlanLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/shipper/stripe/subscription-plan`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data?.data;

      if (!data) {
        setPlan(null);
        return;
      }

      // IMPORTANT FIX: DO NOT FORCE monthly only
      const normalizedPlan = {
        currency: data.currency || "usd",
        trialDays: data.trialDays || 0,

        daily: data.daily || null,
        weekly: data.weekly || null,
        monthly: data.monthly || null,
      };

      setPlan(normalizedPlan);
    } catch (err) {
      console.error("Get Plan Error:", err?.response?.data || err.message);
      setPlan(null);
    } finally {
      setPlanLoading(false);
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
      console.error(
        "Create Subscription Error:",
        err?.response?.data || err.message
      );
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
      console.error(
        "Cancel Subscription Error:",
        err?.response?.data || err.message
      );
      throw err;
    }
  };

  /* ===============================
       AUTO LOAD (ONCE)
  =================================*/
  useEffect(() => {
    if (!token || !isShipper) return;

    if (hasFetched.current) return;

    hasFetched.current = true;

    getMySubscription();
    getSubscriptionPlan();
  }, [token, isShipper, getMySubscription, getSubscriptionPlan]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plan,

        loading,
        planLoading,

        hasAccess: subscription?.hasAccess,
        isTrial: subscription?.status === "trialing",
        isCanceled: subscription?.status === "canceled",
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd,
        cancelMessage: subscription?.cancelMessage,

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
