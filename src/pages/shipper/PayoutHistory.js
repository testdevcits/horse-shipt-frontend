import React, { useEffect, useState } from "react";
import { useShipperPayments } from "../../contexts/shipperContext/ShipperPaymentContext";
import { useShipperDelivery } from "../../contexts/shipperContext/ShipperDeliveryContext";
import { useSubscription } from "../../contexts/shipperContext/SubscriptionContext";
import PageLoader from "../../components/common/PageLoader";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Toast from "../../components/common/Toast";
import TrialAlertBanner from "../shipper/common/Trialalertbanner";
import {
  ChevronDown,
  CreditCard,
  TrendingUp,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  Crown,
  Calendar,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react";

const PayoutAndCardPage = () => {
  const stripe = useStripe();
  const elements = useElements();

  const {
    createCustomer,
    createSetupIntent,
    savePaymentMethod,
    fetchPaymentStatus,
    hasCard,
    paymentCard,
    clientSecret,
    loading: paymentLoading,
    error: paymentError,
  } = useShipperPayments();

  const {
    payoutHistory,
    getPayoutHistory,
    loading: payoutLoading,
    hasMore,
    nextCursor,
  } = useShipperDelivery();

  const {
    subscription,
    loading: subscriptionLoading,
    getMySubscription,
  } = useSubscription();

  const [visibleIds, setVisibleIds] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [cardProcessing, setCardProcessing] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [trialCountdown, setTrialCountdown] = useState(null);

  // Initial Load
  useEffect(() => {
    const fetchAll = async () => {
      setGlobalLoading(true);
      try {
        await Promise.all([
          getPayoutHistory(),
          fetchPaymentStatus(),
          getMySubscription(),
        ]);
      } catch (err) {
        console.error("Error loading data:", err);
        Toast.error("Failed to load data");
      } finally {
        setGlobalLoading(false);
      }
    };
    fetchAll();
  }, [getPayoutHistory, fetchPaymentStatus, getMySubscription]);

  // Live Timer Effect
  useEffect(() => {
    if (!subscription?.trialEnd || subscription.status !== "trialing") return;

    const updateTimer = () => {
      const now = new Date();
      const trialEndDate = new Date(subscription.trialEnd);
      const diffMs = trialEndDate - now;

      if (diffMs <= 0) {
        setTrialCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTrialCountdown({
        days: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diffMs % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [subscription?.trialEnd, subscription?.status]);

  const toggleId = (id) =>
    setVisibleIds((prev) => ({ ...prev, [id]: !prev[id] }));

  const maskId = (id) => (id ? id.slice(0, 4) + "••••••••" + id.slice(-4) : "");

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSubscriptionStatusStyle = (status) => {
    switch (status) {
      case "trialing":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-200",
          dot: "bg-blue-500",
        };
      case "active":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-200",
          dot: "bg-green-500",
        };
      case "canceled":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200",
          dot: "bg-red-500",
        };
      case "past_due":
        return {
          bg: "bg-orange-100",
          text: "text-orange-800",
          border: "border-orange-200",
          dot: "bg-orange-500",
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-800",
          border: "border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore) return;
    setLoadingMore(true);
    try {
      await getPayoutHistory(5, nextCursor);
    } catch (err) {
      console.error("Error loading more payouts:", err);
      Toast.error("Failed to load more payouts");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAddCard = async () => {
    setCardProcessing(true);
    try {
      await createCustomer();
      await createSetupIntent();
      Toast.info("Enter your card details");
    } catch (err) {
      console.error("Error adding card:", err);
      Toast.error("Failed to initialize card setup");
    } finally {
      setCardProcessing(false);
    }
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setCardProcessing(true);
    try {
      const cardElement = elements.getElement(CardElement);
      const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: { card: cardElement },
        }
      );

      if (error) {
        Toast.error(error.message);
        setCardProcessing(false);
        return;
      }

      await savePaymentMethod(setupIntent.payment_method);
      Toast.success("Card saved successfully!");
    } catch (err) {
      console.error("Error saving card:", err);
      Toast.error("Failed to save card");
    } finally {
      setCardProcessing(false);
    }
  };

  if (globalLoading) {
    return (
      <PageLoader
        text="Loading data..."
        fullScreen={false}
        size={20}
        color="#BF9B53"
      />
    );
  }

  const statusStyle = subscription
    ? getSubscriptionStatusStyle(subscription.status)
    : null;

  const isTrialing = subscription && subscription.status === "trialing";
  // FIX: changed < 1 to <= 1 to match banner condition
  const lessThanOneDay = subscription && subscription.remainingTrialDays <= 1;
  const showTrialBanner = isTrialing && lessThanOneDay;

  return (
    <div className="min-h-screen font-montserrat">
      {/* TRIAL ALERT BANNER — hideButton so it shows "On Payment Page" */}
      {showTrialBanner && <TrialAlertBanner hideButton />}

      {/* Header */}
      <div className="bg-white">
        <div className="max-w-full mx-auto px-3 sm:px-4 py-2">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-[#BF9B53] flex-shrink-0" />

            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Payouts & Payments
            </h1>
          </div>

          <p className="text-slate-600 text-xs sm:text-sm leading-snug">
            Manage your payment methods and view your payout history
          </p>
        </div>
      </div>

      <div className="max-w-full mx-auto mt-4 space-y-6 pb-4">
        {/* PAYMENT METHOD CARD */}
        <div className="group">
          <div className="bg-white rounded-md shadow-sm border  hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 border-b border-[#BF9B53]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-lg border border-[#BF9B53]">
                  <CreditCard className="w-5 h-5 text-[#BF9B53]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Payment Method
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {hasCard && !clientSecret
                      ? "Card on file"
                      : "Add a card to enable payouts"}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-8">
              {!hasCard && !clientSecret && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-[#BF9B53]/10 border border-[#BF9B53]">
                    <div className="p-2 bg-white rounded border border-[#BF9B53] mt-0.5">
                      <Lock className="w-4 h-4 text-[#BF9B53]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Secure Payment Processing
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Your card details are encrypted and secured by Stripe
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleAddCard}
                    disabled={cardProcessing || paymentLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-[#BF9B53]/90 hover:bg-[#BF9B53] text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    {cardProcessing ? "Processing..." : "Add Payment Card"}
                  </button>
                </div>
              )}

              {clientSecret && (
                <form onSubmit={handleSaveCard} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-900">
                      Card Details
                    </label>
                    <div className="p-4 border border-slate-300 rounded-lg focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              fontFamily: "system-ui, -apple-system",
                              color: "#1e293b",
                              "::placeholder": { color: "#cbd5e1" },
                            },
                            invalid: { color: "#ef4444" },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={cardProcessing || !stripe}
                    className="w-full px-6 py-3 bg-gray-600 hover:bg-[#BF9B53] disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {cardProcessing ? "Saving..." : "Save Card"}
                  </button>
                </form>
              )}

              {hasCard && !clientSecret && paymentCard && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 rounded-lg border ">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Current Card
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg border border-[#BF9B53]">
                            <CreditCard className="w-5 h-5 text-[#BF9B53]" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {paymentCard.cardBrand?.toUpperCase()} ••••{" "}
                              {paymentCard.cardLast4}
                            </p>
                          </div>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    </div>
                  </div>
                  <button
                    onClick={handleAddCard}
                    disabled={cardProcessing}
                    className="w-xl px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-300 text-slate-900 font-medium rounded-lg transition-colors duration-200"
                  >
                    {cardProcessing ? "Processing..." : "Update Card"}
                  </button>
                </div>
              )}

              {paymentError && (
                <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-2 mt-4">
                  <p className="text-sm text-red-700 font-medium">
                    {paymentError}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUBSCRIPTION STATUS CARD — id added for scroll target */}
        <div
          id="subscription-section"
          className="bg-white rounded-md shadow-sm border hover:shadow-md transition-shadow duration-300 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-50 px-4 py-2 border-b border-[#BF9B53]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-[#BF9B53]">
                <Crown className="w-5 h-5 text-[#BF9B53]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Subscription Status
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your current plan and billing details
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8">
            {subscriptionLoading && !subscription ? (
              <div className="flex justify-center py-8">
                <PageLoader
                  text="Loading subscription..."
                  size={24}
                  color="#7c3aed"
                />
              </div>
            ) : !subscription || !subscription.hasSubscription ? (
              <div className="space-y-4">
                <div className="text-center py-8 space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-full mb-3">
                    <AlertCircle className="w-7 h-7 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      No Active Subscription
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      You don't currently have an active or trial subscription
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-gray-100 rounded-md border border-[#BF9B53] space-y-3">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-[#BF9B53] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#BF9B53]">
                        Upgrade to Premium
                      </p>
                      <p className="text-xs text-[#BF9B53] mt-1">
                        Start your free 1-day trial and unlock unlimited offers,
                        advanced analytics, and priority support.
                      </p>
                    </div>
                  </div>
                  <button className="w-md px-4 py-2.5 bg-[#BF9B53]/90 hover:bg-[#BF9B53] text-white font-semibold rounded-lg transition-colors duration-200 text-sm">
                    Start Free Trial
                  </button>
                </div>
                <div className="mt-4">
                  <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-2">
                    <span className="text-lg font-bold text-amber-900">
                      Full Access Unlocked After Subscription
                    </span>
                    <p className="text-xs text-amber-900 mt-1">
                      Subscribe to unlock all features, unlimited offers,
                      analytics, and priority support.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${statusStyle.dot}`}
                    />
                    <span className="truncate max-w-[100px] sm:max-w-none">
                      {subscription.status?.charAt(0).toUpperCase() +
                        subscription.status?.slice(1)}
                    </span>
                  </span>

                  {subscription.trialActive && (
                    <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="whitespace-nowrap">Trial</span>
                    </span>
                  )}

                  {subscription.planType && (
                    <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="truncate max-w-[100px] sm:max-w-none">
                        {subscription.planType.charAt(0).toUpperCase() +
                          subscription.planType.slice(1)}{" "}
                        Plan
                      </span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subscription.status === "trialing" &&
                    subscription.remainingTrialDays !== undefined && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Trial Ending In
                          </p>
                        </div>
                        {trialCountdown && (
                          <div className="space-y-2">
                            {trialCountdown.days > 0 ? (
                              <p className="text-2xl font-black text-slate-900 font-mono">
                                {String(trialCountdown.days).padStart(2, "0")}
                                <span className="text-xs font-medium text-slate-500 ml-1">
                                  d
                                </span>{" "}
                                {String(trialCountdown.hours).padStart(2, "0")}
                                <span className="text-xs font-medium text-slate-500 ml-1">
                                  h
                                </span>{" "}
                                {String(trialCountdown.minutes).padStart(
                                  2,
                                  "0"
                                )}
                                <span className="text-xs font-medium text-slate-500 ml-1">
                                  m
                                </span>
                              </p>
                            ) : (
                              <div>
                                <p className="text-3xl font-black text-[#BF9B53] font-mono tabular-nums">
                                  {String(trialCountdown.hours).padStart(
                                    2,
                                    "0"
                                  )}
                                  <span className="text-sm font-medium text-red-500 mx-1">
                                    :
                                  </span>
                                  {String(trialCountdown.minutes).padStart(
                                    2,
                                    "0"
                                  )}
                                  <span className="text-sm font-medium text-red-500 mx-1">
                                    :
                                  </span>
                                  {String(trialCountdown.seconds).padStart(
                                    2,
                                    "0"
                                  )}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-slate-500 mt-2">
                              Ends: {formatDate(subscription.trialEnd)} at{" "}
                              {formatTime(subscription.trialEnd)}
                            </p>
                            <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#BF9B53]/90 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.max(
                                    0,
                                    (1 -
                                      subscription.remainingTrialDays /
                                        subscription.remainingTrialDays) *
                                      100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {subscription.planType && (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-4 h-4 text-slate-500" />
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Plan
                        </p>
                      </div>
                      <p className="text-base font-bold text-slate-900">
                        {subscription.planType.charAt(0).toUpperCase() +
                          subscription.planType.slice(1)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {subscription.planType === "daily"
                          ? "$0.99/day"
                          : subscription.planType === "monthly"
                          ? "$X.XX/month"
                          : "Custom Plan"}
                      </p>
                    </div>
                  )}

                  {subscription.trialEnd && (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Trial Ends
                        </p>
                      </div>
                      <p className="text-base font-bold text-slate-900">
                        {formatDate(subscription.trialEnd)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatTime(subscription.trialEnd)}
                      </p>
                    </div>
                  )}

                  {/* {subscription.currentPeriodStart && (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Period Start
                        </p>
                      </div>
                      <p className="text-base font-bold text-slate-900">
                        {formatDate(subscription.currentPeriodStart)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatTime(subscription.currentPeriodStart)}
                      </p>
                    </div>
                  )} */}

                  {subscription.currentPeriodEnd && (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Next Billing
                        </p>
                      </div>
                      <p className="text-base font-bold text-slate-900">
                        {formatDate(subscription.currentPeriodEnd)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatTime(subscription.currentPeriodEnd)}
                      </p>
                    </div>
                  )}
                </div>

                {/* FIX: changed <= 1 here too (was already correct in original) */}
                {subscription.status === "trialing" &&
                  subscription.remainingTrialDays <= 1 && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          Trial ending soon!
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Your free trial will end on{" "}
                          {formatDate(subscription.trialEnd)}. Make sure a
                          payment card is on file to avoid any interruption to
                          your service.
                        </p>
                      </div>
                    </div>
                  )}

                {subscription.status === "active" && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        Your subscription is active
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        You will be charged $0.99 daily starting{" "}
                        {formatDate(subscription.currentPeriodEnd)}.
                      </p>
                    </div>
                  </div>
                )}

                {subscription.cancelAtPeriodEnd && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        Scheduled for cancellation
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Your subscription will be canceled on{" "}
                        {formatDate(subscription.currentPeriodEnd)}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PAYOUT HISTORY CARD */}
        <div>
          <div className="bg-white rounded-md shadow-sm border  hover:shadow-md transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-50 px-4 py-2 border-b border-[#BF9B53]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-lg border border-[#BF9B53]">
                  <TrendingUp className="w-5 h-5 text-[#BF9B53]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Payout History
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {payoutHistory.length > 0
                      ? `${payoutHistory.length} transaction${
                          payoutHistory.length !== 1 ? "s" : ""
                        } available`
                      : "No payouts yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-8">
              {payoutLoading && payoutHistory.length === 0 && (
                <div className="flex justify-center py-12">
                  <PageLoader
                    text="Loading payouts..."
                    size={28}
                    color="#10b981"
                  />
                </div>
              )}

              {!payoutLoading && payoutHistory.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-4">
                    <TrendingUp className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    No payouts available yet
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Your future transactions will appear here
                  </p>
                </div>
              )}

              {payoutHistory.length > 0 && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-4 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                            Reference
                          </th>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {payoutHistory.map((payout) => (
                          <tr
                            key={payout.id}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded">
                                  {visibleIds[payout.id]
                                    ? payout.id
                                    : maskId(payout.id)}
                                </code>
                                <button
                                  onClick={() => toggleId(payout.id)}
                                  className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors duration-150 text-slate-500 hover:text-[#BF9B53]"
                                  title={
                                    visibleIds[payout.id] ? "Hide" : "View"
                                  }
                                >
                                  {visibleIds[payout.id] ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="font-semibold text-slate-900">
                                {Number(payout.amount).toLocaleString(
                                  undefined,
                                  {
                                    style: "currency",
                                    currency: payout.currency || "USD",
                                  }
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  payout.status === "completed" ||
                                  payout.status === "success"
                                    ? "bg-green-100 text-green-800"
                                    : payout.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-800"
                                }`}
                              >
                                {payout.status?.charAt(0).toUpperCase() +
                                  payout.status?.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {hasMore && (
                    <div className="flex justify-center mt-8 pt-6 border-t border-slate-200">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-200 disabled:cursor-not-allowed text-slate-900 font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <ChevronDown className="w-4 h-4" />
                        {loadingMore ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutAndCardPage;
