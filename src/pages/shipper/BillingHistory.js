import React, { useState, useEffect } from "react";
import { useSubscription } from "../../contexts/shipperContext/SubscriptionContext";
import {
  Download,
  Eye,
  Filter,
  Calendar,
  Clock,
  Crown,
  AlertCircle,
  CheckCircle2,
  Zap,
  XCircle,
  Globe,
  X,
} from "lucide-react";
import PageLoader from "../../components/common/PageLoader";
import Toast from "../../components/common/Toast";
import Checkbox from "../../components/common/Checkbox";

const CANCELLATION_REASONS = [
  { value: "too_expensive", label: "Too expensive", icon: "" },
  { value: "not_using", label: "Not using the service", icon: "" },
  { value: "poor_quality", label: "Poor quality or performance", icon: "" },
  {
    value: "found_alternative",
    label: "Found a better alternative",
    icon: "",
  },
  { value: "technical_issues", label: "Technical issues", icon: "" },
  { value: "customer_service", label: "Poor customer service", icon: "" },
  { value: "other", label: "Other reason", icon: "" },
];

// Cancellation Reason Modal Component
const CancellationModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  planName,
}) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [agreedToConfirm, setAgreedToConfirm] = useState(false);

  const handleSubmit = () => {
    if (!selectedReason) {
      Toast.error("Please select a reason", 3000);
      return;
    }
    if (selectedReason === "other" && !otherReason.trim()) {
      Toast.error("Please describe your reason", 3000);
      return;
    }

    const finalReason =
      selectedReason === "other"
        ? `Other: ${otherReason}`
        : CANCELLATION_REASONS.find((r) => r.value === selectedReason)?.label ||
          selectedReason;

    onSubmit(finalReason);
    setSelectedReason("");
    setOtherReason("");
    setAgreedToConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50  flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-md shadow-2xl border-2 border-[#BF9B53] animate-in fade-in slide-in-from-bottom-4 duration-300 mt-6 sm:mt-10 mb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-[#BF9B53] flex items-start justify-between">
          <div className="flex items-start gap-3 sm:gap-4 flex-1">
            <div className="p-2 sm:p-3 bg-gray-200 rounded-lg mt-0.5">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#BF9B53]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900">
                We're sorry to see you go
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Please help us understand why you're canceling your subscription
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600 hover:text-slate-900 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Plan Info */}
          <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-3 sm:p-4">
            <p className="text-sm font-semibold text-gray-900">
              Canceling {planName} Plan
            </p>
            <p className="text-xs text-gray-800 mt-1">
              You'll lose access at the end of your current billing period
            </p>
          </div>

          {/* Reason Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-900">
              Why are you canceling? <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CANCELLATION_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => {
                    setSelectedReason(reason.value);
                    if (reason.value !== "other") setOtherReason("");
                  }}
                  className={`p-3 rounded-md border-2 transition-all duration-200 text-left flex items-start gap-3 ${
                    selectedReason === reason.value
                      ? "border-[#BF9B53] bg-gray-100 shadow-sm"
                      : "border-slate-200 bg-white hover:border-[#BF9B53] hover:bg-[#BF9B53]/20"
                  }`}
                >
                  <div className="text-xl sm:text-2xl">{reason.icon}</div>

                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base text-slate-900">
                      {reason.label}
                    </p>
                  </div>

                  {selectedReason === reason.value && (
                    <div className="w-5 h-5 rounded-full bg-[#BF9B53] flex items-center justify-center mt-1">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Other Reason */}
          {selectedReason === "other" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                Please tell us more <span className="text-red-500">*</span>
              </label>

              <textarea
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="w-full border-2 border-slate-300 rounded-lg p-3 text-sm focus:border-[#BF9B53] focus:outline-none resize-none"
                rows={4}
                maxLength={500}
              />

              <div className="flex justify-between text-xs text-slate-500">
                <span>Help us improve</span>
                <span>{otherReason.length}/500</span>
              </div>
            </div>
          )}

          {/* Checkbox */}
          <div className="p-3 sm:p-4 bg-white">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={agreedToConfirm}
                onChange={(e) => setAgreedToConfirm(e.target.checked)}
                className="border-2 border-[#BF9B53]"
              />

              <label className="text-sm text-slate-700 flex-1">
                I understand that my subscription will be canceled and I will
                lose access at the end of my billing period
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-200">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg"
            >
              Keep Subscription
            </button>

            <button
              onClick={handleSubmit}
              disabled={!agreedToConfirm || isLoading}
              className={`w-full px-6 py-3 font-semibold rounded-lg flex items-center justify-center gap-2 ${
                agreedToConfirm && !isLoading
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-200 text-red-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Canceling..." : "Cancel Subscription"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BillingHistory = () => {
  const {
    billingHistory,
    billingLoading,
    subscription,
    plan,
    loading: subscriptionLoading,
    planLoading,
    cancelSubscription,
  } = useSubscription();

  const [filter, setFilter] = useState("all");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [trialCountdown, setTrialCountdown] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [timezoneFormat, setTimezoneFormat] = useState("local");
  const [userTimezone, setUserTimezone] = useState("");

  // ─── Detect User Timezone ────────────────────────────────────────────────
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(tz);
  }, []);

  // ─── Normalize a date value ───────────────────────────────────────────────
  const normalizeDateStr = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value.iso || value.us || null;
    }
    return null;
  };

  // ─── Timezone Formatting Utilities ───────────────────────────────────────
  const formatDateWithTimezone = (dateInput, timezone = "local") => {
    const dateStr = normalizeDateStr(dateInput);
    if (!dateStr) return "—";

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";

    const options = { year: "numeric", month: "short", day: "numeric" };

    if (timezone === "india") {
      return new Intl.DateTimeFormat("en-IN", {
        ...options,
        timeZone: "Asia/Kolkata",
      }).format(date);
    }
    return new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: userTimezone || "UTC",
    }).format(date);
  };

  const formatTimeWithTimezone = (dateInput, timezone = "local") => {
    const dateStr = normalizeDateStr(dateInput);
    if (!dateStr) return "";

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";

    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };

    if (timezone === "india") {
      return new Intl.DateTimeFormat("en-IN", {
        ...options,
        timeZone: "Asia/Kolkata",
      }).format(date);
    }
    return new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: userTimezone || "UTC",
    }).format(date);
  };

  const getTimezoneLabel = () => {
    if (timezoneFormat === "india") return "IST (India)";
    const parts = userTimezone?.split("/") || [];
    return parts[parts.length - 1]?.replace(/_/g, " ") || "Local";
  };

  const getTimezoneOffset = (timezone = "local") => {
    const now = new Date();
    const targetTz =
      timezone === "india" ? "Asia/Kolkata" : userTimezone || "UTC";
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: targetTz,
        timeZoneName: "shortOffset",
      });
      const parts = formatter.formatToParts(now);
      const offsetPart = parts.find((p) => p.type === "timeZoneName");
      return offsetPart?.value || "UTC";
    } catch {
      return "UTC";
    }
  };

  // ─── Live Trial Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    const trialEnd = normalizeDateStr(subscription?.trialEnd);
    if (!trialEnd || subscription?.status !== "trialing") return;

    const updateTimer = () => {
      const diffMs = new Date(trialEnd) - new Date();
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

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const getStatusColor = (status) => {
    if (status === "paid" || status === "succeeded")
      return "bg-green-100 text-green-800 border-green-200";
    if (status === "failed" || status === "open")
      return "bg-red-100 text-red-800 border-red-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  const getStatusStyle = (status) => {
    const map = {
      trialing: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        dot: "bg-blue-500",
      },
      active: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        dot: "bg-green-500",
      },
      canceled: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        dot: "bg-red-500",
      },
      past_due: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-200",
        dot: "bg-orange-500",
      },
    };
    return (
      map[status] || {
        bg: "bg-slate-100",
        text: "text-slate-800",
        border: "border-slate-200",
        dot: "bg-slate-400",
      }
    );
  };

  // Shorthand formatters
  const formatDate = (dateInput) =>
    formatDateWithTimezone(dateInput, timezoneFormat);
  const formatTime = (dateInput) =>
    formatTimeWithTimezone(dateInput, timezoneFormat);

  // ─── Plan price label ──────────────────────────────────────────────────────
  const getPlanPriceLabel = () => {
    if (!plan) return null;
    const planType = subscription?.planType || plan?.subscriptionStatus;

    if (plan.daily && (!planType || planType === "daily")) {
      const amt = plan.daily.amount;
      const cur = (plan.daily.currency || plan.currency || "usd").toUpperCase();
      return `$${amt}/${plan.daily.interval || "day"} ${cur}`;
    }
    if (plan.weekly) {
      return `$${plan.weekly.amount}/${plan.weekly.interval || "week"} ${(
        plan.currency || "usd"
      ).toUpperCase()}`;
    }
    if (plan.monthly) {
      return `$${plan.monthly.amount}/${plan.monthly.interval || "month"} ${(
        plan.currency || "usd"
      ).toUpperCase()}`;
    }
    return null;
  };

  // ─── Next billing / end date ───────────────────────────────────────────────
  const rawNextBilling =
    plan?.nextBillingDate || subscription?.currentPeriodEnd || null;
  const nextBillingDate = normalizeDateStr(rawNextBilling);

  const cancelAtPeriodEnd =
    subscription?.cancelAtPeriodEnd ?? plan?.cancelAtPeriodEnd ?? false;

  const rawEndDate = plan?.subscriptionEndDate || null;
  const subscriptionEndDate = normalizeDateStr(rawEndDate);

  // ─── Cancel handler - Open Modal ────────────────────────────────────────
  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  // ─── Cancel handler - Submit with Reason ─────────────────────────────────
  const handleCancelSubmit = async (reason) => {
    try {
      setCancelLoading(true);
      await cancelSubscription(reason);
      Toast.success("Subscription canceled successfully", 3000);
      setShowCancelModal(false);
    } catch (err) {
      console.error("Cancel failed:", err);
      Toast.error(
        err?.response?.data?.message || "Failed to cancel subscription",
        3000
      );
    } finally {
      setCancelLoading(false);
    }
  };

  // ─── Merged + filtered billing data ───────────────────────────────────────
  const mergedData = [
    ...(billingHistory?.subscriptions || []).map((i) => ({
      ...i,
      type: "subscription",
    })),
    ...(billingHistory?.payments || []).map((i) => ({ ...i, type: "payment" })),
    ...(billingHistory?.payouts || []).map((i) => ({ ...i, type: "payout" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredData =
    filter === "all"
      ? mergedData
      : mergedData.filter((item) => item.type === filter);

  const filterOptions = [
    { value: "all", label: "All", count: mergedData.length },
    {
      value: "subscription",
      label: "Invoices",
      count: billingHistory?.subscriptions?.length || 0,
    },
    {
      value: "payment",
      label: "Payments",
      count: billingHistory?.payments?.length || 0,
    },
    {
      value: "payout",
      label: "Payouts",
      count: billingHistory?.payouts?.length || 0,
    },
  ];

  // ─── Subscription state flags ──────────────────────────────────────────────
  const subStatus = subscription?.status || plan?.subscriptionStatus;
  const hasActiveSubscription =
    subscription?.hasSubscription ||
    ["active", "trialing", "past_due"].includes(subStatus);

  const isTrialing = subStatus === "trialing";
  const isActive = subStatus === "active";
  const isCanceled = subStatus === "canceled";
  const lessThanOneDay = subscription?.remainingTrialDays <= 1;
  const showTrialWarning = isTrialing && lessThanOneDay;
  const canCancel = hasActiveSubscription && !isCanceled && !cancelAtPeriodEnd;

  const statusStyle = getStatusStyle(subStatus);

  const planName = subscription?.planType
    ? subscription.planType.charAt(0).toUpperCase() +
      subscription.planType.slice(1)
    : plan?.daily?.label || "Premium";

  if (billingLoading || subscriptionLoading || planLoading) {
    return (
      <PageLoader
        text="Loading billing information..."
        fullScreen={false}
        size={20}
        color="#BF9B53"
      />
    );
  }

  return (
    <div className="min-h-screen font-montserrat animate-slide-fade-in">
      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onSubmit={handleCancelSubmit}
        isLoading={cancelLoading}
        planName={planName}
      />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 mb-4">
        <div className="max-w-full mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Billing & History
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                View your subscription, invoices, and transactions
              </p>
            </div>

            {/* Timezone Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setTimezoneFormat(
                    timezoneFormat === "local" ? "india" : "local"
                  )
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-all duration-200 ${
                  timezoneFormat === "india"
                    ? "bg-[#BF9B53] text-white border-[#BF9B53]"
                    : "bg-white text-slate-700 border-slate-300 hover:border-[#BF9B53]"
                }`}
                title={`Current: ${getTimezoneLabel()} ${getTimezoneOffset(
                  timezoneFormat
                )}`}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{getTimezoneLabel()}</span>
                <span className="sm:hidden text-xs">
                  {timezoneFormat === "india" ? "IST" : "Local"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto space-y-4">
        {/* ── Subscription Status Card ───────────────────────────────────── */}
        {hasActiveSubscription && (
          <div className="bg-white rounded-md border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            {/* Card header */}
            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 px-6 py-5 border-b border-[#BF9B53]">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-3 bg-white rounded-lg border-2 border-[#BF9B53] flex-shrink-0">
                    <Crown className="w-6 h-6 text-[#BF9B53]" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-slate-900">
                      Subscription Status
                    </h2>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Your current plan and billing details
                    </p>
                  </div>
                </div>

                {/* Cancel Button */}
                {canCancel && (
                  <button
                    onClick={handleCancelClick}
                    disabled={cancelLoading}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${
                      cancelLoading
                        ? "bg-slate-300 text-slate-600 border-slate-300 cursor-not-allowed"
                        : "bg-white text-red-600 border-red-300 hover:border-red-600 hover:bg-red-50 active:scale-95"
                    }`}
                  >
                    {cancelLoading ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Cancel Plan
                  </button>
                )}
              </div>
            </div>

            {/* Card body */}
            <div className="px-6 py-8">
              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
                {subStatus && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${statusStyle.dot}`}
                    />
                    {subStatus.charAt(0).toUpperCase() + subStatus.slice(1)}
                  </span>
                )}

                {(subscription?.trialActive || isTrialing) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    <Zap className="w-4 h-4" />
                    Trial Active
                  </span>
                )}

                {(subscription?.planType || plan?.daily) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                    <Crown className="w-4 h-4" />
                    {planName} Plan
                  </span>
                )}

                {/* Show "Cancels at period end" badge */}
                {cancelAtPeriodEnd && !isCanceled && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                    <AlertCircle className="w-4 h-4" />
                    Cancels at Period End
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Trial Countdown */}
                {isTrialing &&
                  subscription?.remainingTrialDays !== undefined && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Trial Ending In
                        </p>
                      </div>
                      {trialCountdown &&
                        (trialCountdown.days > 0 ? (
                          <p className="text-2xl font-black text-slate-900 font-mono">
                            {String(trialCountdown.days).padStart(2, "0")}
                            <span className="text-xs font-medium text-slate-500 ml-1">
                              d
                            </span>{" "}
                            {String(trialCountdown.hours).padStart(2, "0")}
                            <span className="text-xs font-medium text-slate-500 ml-1">
                              h
                            </span>
                          </p>
                        ) : (
                          <p className="text-3xl font-black text-[#BF9B53] font-mono tabular-nums">
                            {String(trialCountdown.hours).padStart(2, "0")}
                            <span className="text-sm font-medium text-red-500 mx-1">
                              :
                            </span>
                            {String(trialCountdown.minutes).padStart(2, "0")}
                            <span className="text-sm font-medium text-red-500 mx-1">
                              :
                            </span>
                            {String(trialCountdown.seconds).padStart(2, "0")}
                          </p>
                        ))}
                    </div>
                  )}

                {/* Plan & Price */}
                {(subscription?.planType || plan?.daily) && (
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-slate-600" />
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Plan
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {planName}
                    </p>
                    {getPlanPriceLabel() && (
                      <p className="text-xs text-slate-500 mt-1">
                        {getPlanPriceLabel()}
                      </p>
                    )}
                  </div>
                )}

                {/* Trial End */}
                {subscription?.trialEnd && (
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Trial Ends
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {formatDate(subscription.trialEnd)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatTime(subscription.trialEnd)} {getTimezoneLabel()}
                    </p>
                  </div>
                )}

                {/* Next Billing Date (not trialing) */}
                {nextBillingDate && !isTrialing && !cancelAtPeriodEnd && (
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Next Billing
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {formatDate(nextBillingDate)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatTime(nextBillingDate)} {getTimezoneLabel()}
                    </p>
                  </div>
                )}

                {/* Subscription End Date (when cancelAtPeriodEnd = true) */}
                {cancelAtPeriodEnd &&
                  (subscriptionEndDate || nextBillingDate) && (
                    <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-red-500" />
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                          Access Ends
                        </p>
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {formatDate(subscriptionEndDate || nextBillingDate)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatTime(subscriptionEndDate || nextBillingDate)}{" "}
                        {getTimezoneLabel()}
                      </p>
                    </div>
                  )}

                {/* Trial: billing starts after trial */}
                {nextBillingDate && isTrialing && (
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Billing Starts
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {formatDate(nextBillingDate)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatTime(nextBillingDate)} {getTimezoneLabel()}
                    </p>
                  </div>
                )}
              </div>

              {/* Alert Banners */}
              {showTrialWarning && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">
                      Trial ending soon!
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      Your free trial ends on{" "}
                      {formatDate(subscription.trialEnd)} at{" "}
                      {formatTime(subscription.trialEnd)} {getTimezoneLabel()}.
                      Add a payment method to continue.
                    </p>
                  </div>
                </div>
              )}

              {isActive && !cancelAtPeriodEnd && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-900">
                      Subscription Active
                    </p>
                    <p className="text-xs text-green-800 mt-1">
                      {getPlanPriceLabel() && nextBillingDate
                        ? `You will be charged ${getPlanPriceLabel()} on ${formatDate(
                            nextBillingDate
                          )} at ${formatTime(
                            nextBillingDate
                          )} ${getTimezoneLabel()}.`
                        : nextBillingDate
                        ? `Next charge on ${formatDate(
                            nextBillingDate
                          )} at ${formatTime(
                            nextBillingDate
                          )} ${getTimezoneLabel()}.`
                        : "Your subscription is active."}
                    </p>
                  </div>
                </div>
              )}

              {cancelAtPeriodEnd && !isCanceled && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-orange-900">
                      Scheduled for Cancellation
                    </p>
                    <p className="text-xs text-orange-800 mt-1">
                      Your subscription will not renew. You have access until{" "}
                      <strong>
                        {formatDate(subscriptionEndDate || nextBillingDate)}
                      </strong>{" "}
                      at {formatTime(subscriptionEndDate || nextBillingDate)}{" "}
                      {getTimezoneLabel()}.
                    </p>
                  </div>
                </div>
              )}

              {isCanceled && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-red-900">
                      Subscription Canceled
                    </p>
                    <p className="text-xs text-red-800 mt-1">
                      Your subscription has been canceled. You can resubscribe
                      anytime.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── No Subscription State ──────────────────────────────────────── */}
        {!hasActiveSubscription && !subscriptionLoading && !planLoading && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-full mb-4">
              <Crown className="w-7 h-7 text-[#BF9B53]" />
            </div>
            <p className="text-slate-900 font-semibold text-lg">
              No active subscription
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Subscribe to unlock all features.
            </p>
          </div>
        )}

        {/* ── Billing History Card ───────────────────────────────────────── */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 px-6 py-5 border-b border-[#BF9B53]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg border-2 border-[#BF9B53]">
                <Calendar className="w-6 h-6 text-[#BF9B53]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  Billing History
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  Invoices, payments, and transactions ({getTimezoneLabel()})
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8">
            {/* Filters */}
            <div className="mb-6">
              {/* Mobile */}
              <div className="md:hidden mb-4">
                <button
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200 font-semibold text-slate-900"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter Transactions</span>
                  </div>
                  <span
                    className={`transition-transform duration-200 ${
                      mobileFilterOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {mobileFilterOpen && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilter(option.value);
                          setMobileFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-between ${
                          filter === option.value
                            ? "bg-[#BF9B53] text-black shadow-md"
                            : "bg-white text-black hover:bg-slate-100"
                        }`}
                      >
                        <span className="capitalize">{option.label}</span>
                        <span className="text-xs font-semibold bg-gray-200 px-2 py-1 rounded">
                          {option.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop */}
              <div className="hidden md:flex gap-2 flex-wrap">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-all duration-200 flex items-center gap-2 ${
                      filter === option.value
                        ? "bg-[#BF9B53] text-white border-[#BF9B53]"
                        : "bg-white text-slate-700 border-slate-300 hover:border-[#BF9B53]"
                    }`}
                  >
                    <span className="capitalize">{option.label}</span>
                    <span className="text-xs font-bold opacity-75">
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {filteredData.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-full">
                  <Calendar className="w-7 h-7 text-slate-400" />
                </div>
                <div>
                  <p className="text-slate-900 font-semibold">
                    No {filter !== "all" ? filter : "billing"} records
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Transactions will appear here
                  </p>
                </div>
              </div>
            )}

            {/* Data */}
            {filteredData.length > 0 && (
              <>
                {/* Mobile List */}
                <div className="space-y-3 md:hidden">
                  {filteredData.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-[#BF9B53] transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 capitalize">
                            {item.type === "subscription" && "Invoice"}
                            {item.type === "payment" && "Payment"}
                            {item.type === "payout" && "Payout"}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {formatDate(item.createdAt)} •{" "}
                            {formatTime(item.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-semibold whitespace-nowrap flex-shrink-0 border ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status?.charAt(0).toUpperCase() +
                            item.status?.slice(1)}
                        </span>
                      </div>

                      {item.periodStart && item.periodEnd && (
                        <p className="text-xs text-slate-600 mb-2 pb-2 border-b border-slate-300">
                          {formatDate(item.periodStart)} →{" "}
                          {formatDate(item.periodEnd)}
                        </p>
                      )}
                      {item.type === "payment" && item.last4 && (
                        <p className="text-xs text-slate-600 mb-2 pb-2 border-b border-slate-300">
                          {item.cardBrand?.toUpperCase()} •••• {item.last4}
                        </p>
                      )}
                      {item.type === "payout" && item.arrivalDate && (
                        <p className="text-xs text-slate-600 mb-2 pb-2 border-b border-slate-300">
                          Arrives: {formatDate(item.arrivalDate)} •{" "}
                          {formatTime(item.arrivalDate)}
                        </p>
                      )}

                      <div className="flex items-end justify-between gap-2 pt-2">
                        <p className="font-bold text-slate-900">
                          ${item.amount} {item.currency?.toUpperCase()}
                        </p>
                        <div className="flex gap-2">
                          {item.type === "subscription" &&
                            item.hostedInvoiceUrl && (
                              <button
                                onClick={() =>
                                  window.open(item.hostedInvoiceUrl, "_blank")
                                }
                                className="p-1.5 bg-white hover:bg-blue-50 rounded-lg border border-slate-300 text-blue-600 transition-colors"
                                title="View Invoice"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          {item.type === "subscription" && item.invoicePdf && (
                            <a
                              href={item.invoicePdf}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-white hover:bg-green-50 rounded-lg border border-slate-300 text-green-600 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          {item.type === "payment" && item.receiptUrl && (
                            <button
                              onClick={() =>
                                window.open(item.receiptUrl, "_blank")
                              }
                              className="p-1.5 bg-white hover:bg-blue-50 rounded-lg border border-slate-300 text-blue-600 transition-colors"
                              title="View Receipt"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100">
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, idx) => (
                        <tr
                          key={item.id}
                          className={`border-b border-slate-200 transition-colors duration-150 ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                          } hover:bg-amber-50`}
                        >
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-900 capitalize">
                                {item.type === "subscription" && "Invoice"}
                                {item.type === "payment" && "Payment"}
                                {item.type === "payout" && "Payout"}
                              </p>
                              {item.periodStart && item.periodEnd && (
                                <p className="text-xs text-slate-600">
                                  {formatDate(item.periodStart)} →{" "}
                                  {formatDate(item.periodEnd)}
                                </p>
                              )}
                              {item.type === "payment" && item.last4 && (
                                <p className="text-xs text-slate-600">
                                  {item.cardBrand?.toUpperCase()} ••••{" "}
                                  {item.last4}
                                </p>
                              )}
                              {item.type === "payout" && item.arrivalDate && (
                                <p className="text-xs text-slate-600">
                                  Arrives: {formatDate(item.arrivalDate)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-slate-900">
                              {formatDate(item.createdAt)}
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">
                              {formatTime(item.createdAt)} {getTimezoneLabel()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">
                              ${item.amount}{" "}
                              <span className="text-sm text-slate-600">
                                {item.currency?.toUpperCase()}
                              </span>
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {item.status?.charAt(0).toUpperCase() +
                                item.status?.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {item.type === "subscription" &&
                                item.hostedInvoiceUrl && (
                                  <button
                                    onClick={() =>
                                      window.open(
                                        item.hostedInvoiceUrl,
                                        "_blank"
                                      )
                                    }
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-blue-600"
                                    title="View Invoice"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                              {item.type === "subscription" &&
                                item.invoicePdf && (
                                  <a
                                    href={item.invoicePdf}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-green-600"
                                    title="Download PDF"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                )}
                              {item.type === "payment" && item.receiptUrl && (
                                <button
                                  onClick={() =>
                                    window.open(item.receiptUrl, "_blank")
                                  }
                                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-blue-600"
                                  title="View Receipt"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingHistory;
