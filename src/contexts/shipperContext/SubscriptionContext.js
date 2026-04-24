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

  const [billingHistory, setBillingHistory] = useState([]);
  const [billingLoading, setBillingLoading] = useState(false);

  const hasFetched = useRef(false);

  const normalizeSubscriptionData = useCallback((payload) => {
    if (!payload) return null;

    const data = payload.data ? { ...payload.data } : { ...payload };
    const status = data.status || data.subscriptionStatus || null;

    if (
      status === "trialing" &&
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

    data.status = status;
    data.hasAccess = data.hasAccess ?? ["active", "trialing"].includes(status);

    if (!data.currentPeriodEnd && data.nextBillingDate?.iso) {
      data.currentPeriodEnd = data.nextBillingDate.iso;
    }

    if (data.cancelAtPeriodEnd && data.currentPeriodEnd) {
      data.cancelMessage = `Your subscription will end on ${new Date(
        data.currentPeriodEnd
      ).toLocaleDateString()}`;
    } else {
      data.cancelMessage = null;
    }

    return data;
  }, []);

  const normalizePlanData = useCallback((data) => {
    if (!data) return null;

    return {
      currency: data.currency || "usd",
      trialDays: data.trialDays || 0,
      hasUsedTrial: data.hasUsedTrial === true,
      trialEligible: data.trialEligible ?? data.hasUsedTrial !== true,
      daily: data.daily || null,
      weekly: data.weekly || null,
      monthly: data.monthly || null,
      subscriptionStatus: data.subscriptionStatus || null,
      nextBillingDate: data.nextBillingDate || null,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      subscriptionEndDate: data.subscriptionEndDate || null,
    };
  }, []);

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

      setSubscription(normalizeSubscriptionData(raw));
    } catch (err) {
      console.error(
        "Get Subscription Error:",
        err?.response?.data || err.message
      );
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [token, isShipper, normalizeSubscriptionData]);

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

      setPlan(normalizePlanData(data));
    } catch (err) {
      console.error("Get Plan Error:", err?.response?.data || err.message);
      setPlan(null);
    } finally {
      setPlanLoading(false);
    }
  }, [token, isShipper, normalizePlanData]);

  /* ===============================
        NEW: GET BILLING HISTORY
  =================================*/
  const getBillingHistory = useCallback(async () => {
    if (!token || !isShipper) return;

    setBillingLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/shipper/stripe/subscription/billing/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        const {
          subscriptions = [],
          payments = [],
          payouts = [],
        } = res.data.data || {};

        // Store separated data
        setBillingHistory({
          subscriptions,
          payments,
          payouts,
        });
      } else {
        setBillingHistory({
          subscriptions: [],
          payments: [],
          payouts: [],
        });
      }
    } catch (err) {
      console.error(
        "Billing History Error:",
        err?.response?.data || err.message
      );

      setBillingHistory({
        subscriptions: [],
        payments: [],
        payouts: [],
      });
    } finally {
      setBillingLoading(false);
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

      // refresh state
      await getMySubscription();
      await getSubscriptionPlan();
      await getBillingHistory();

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
  const cancelSubscription = async (reason = "User requested") => {
    if (!token || !isShipper) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/shipper/stripe/subscription/cancel`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success && res.data?.data) {
        setPlan((prev) => ({
          ...(prev || {}),
          ...normalizePlanData(res.data.data),
        }));

        setSubscription((prev) => ({
          ...(prev || {}),
          ...normalizeSubscriptionData(res.data.data),
        }));
      }

      // refresh state
      await getMySubscription();
      await getSubscriptionPlan();
      await getBillingHistory();

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
    getBillingHistory();
  }, [
    token,
    isShipper,
    getMySubscription,
    getSubscriptionPlan,
    getBillingHistory,
  ]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plan,

        loading,
        planLoading,

        billingHistory,
        billingLoading,

        hasAccess: subscription?.hasAccess,
        isTrial: subscription?.status === "trialing",
        isCanceled: subscription?.status === "canceled",
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd,
        cancelMessage: subscription?.cancelMessage,

        getMySubscription,
        getSubscriptionPlan,
        getBillingHistory,

        createSubscription,
        cancelSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
