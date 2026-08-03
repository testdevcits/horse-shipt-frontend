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
import { API_BASE_URL } from "../../config/api";

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const { token, isShipper } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [plan, setPlan] = useState(null);

  const [loading, setLoading] = useState(false);
  const [subscriptionReady, setSubscriptionReady] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);

  // ✅ FIX: must be object (not array)
  const [billingHistory, setBillingHistory] = useState({
    subscriptions: [],
    payments: [],
    payouts: [],
  });

  const [billingLoading, setBillingLoading] = useState(false);

  const hasFetched = useRef(null);

  /* ===============================
       NORMALIZE SUBSCRIPTION
  =================================*/
  const normalizeSubscriptionData = useCallback((payload) => {
    if (!payload) return null;

    const data = payload.data ? { ...payload.data } : { ...payload };
    const status = data.status || data.subscriptionStatus || null;

    data.status = status;

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

    const currentPeriodEnd = data.currentPeriodEnd || data.nextBillingDate?.iso;
    const isStillInPeriod = currentPeriodEnd
      ? new Date(currentPeriodEnd) > new Date()
      : false;

    data.hasAccess =
      data.hasAccess ??
      (["active", "trialing", "past_due"].includes(status) ||
        (data.cancelAtPeriodEnd && isStillInPeriod));

    if (!data.currentPeriodEnd && currentPeriodEnd) {
      data.currentPeriodEnd = currentPeriodEnd;
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

  /* ===============================
       NORMALIZE PLAN
  =================================*/
  const normalizePlanData = useCallback((data) => {
    if (!data) return null;

    return {
      currency: data.currency || "usd",
      trialDays: data.trialDays || 0,
      hasUsedTrial: data.hasUsedTrial === true,
      trialEligible: data.trialEligible ?? data.hasUsedTrial !== true,
      trialActive: data.trialActive === true,
      remainingTrialDays: data.remainingTrialDays || 0,
      trialEndDate: data.trialEndDate || null,

      daily: data.daily || null,
      monthly: data.monthly || null,
      yearly: data.yearly || null,
      plans: data.plans || [data.daily, data.monthly, data.yearly].filter(Boolean),

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
    setSubscriptionReady(false);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/shipper/stripe/subscription/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.data?.success) {
        setSubscription(null);
        return;
      }

      setSubscription(normalizeSubscriptionData(res.data));
    } catch (err) {
      setSubscription(null);
    } finally {
      setLoading(false);
      setSubscriptionReady(true);
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.data?.data) {
        setPlan(null);
        return;
      }

      setPlan(normalizePlanData(res.data.data));
    } catch (err) {
      setPlan(null);
    } finally {
      setPlanLoading(false);
    }
  }, [token, isShipper, normalizePlanData]);

  /* ===============================
       GET BILLING HISTORY
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
  const createSubscription = async (
    withTrial = true,
    planType = "daily",
    priceId = null
  ) => {
    if (!token || !isShipper) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/shipper/stripe/subscription/create`,
        { withTrial, planType, priceId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        setSubscription(
          normalizeSubscriptionData({
            data: {
              ...res.data.data,
              status: res.data.data?.status,
              hasAccess: ["active", "trialing", "past_due"].includes(
                res.data.data?.status
              ),
            },
          })
        );
      }

      // refresh
      await getMySubscription();
      await getSubscriptionPlan();
      await getBillingHistory();

      return res.data;
    } catch (err) {
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // refresh only (no merge bugs)
      await getMySubscription();
      await getSubscriptionPlan();
      await getBillingHistory();

      return res.data;
    } catch (err) {
      throw err;
    }
  };

  /* ===============================
       AUTO LOAD (ONCE)
  =================================*/
  useEffect(() => {
    if (!token || !isShipper) {
      hasFetched.current = null;
      setSubscription(null);
      setPlan(null);
      setSubscriptionReady(false);
      return;
    }

    const fetchKey = `${token}:${isShipper}`;
    if (hasFetched.current === fetchKey) return;

    hasFetched.current = fetchKey;

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
        subscriptionReady,
        planLoading,

        billingHistory,
        billingLoading,

        hasAccess: subscription?.hasAccess === true,
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
