import React, { useEffect, useState } from "react";
import { useSubscription } from "../../../contexts/shipperContext/SubscriptionContext";
import { useShipperPayments } from "../../../contexts/shipperContext/ShipperPaymentContext";
import {
  Check,
  Zap,
  CreditCard,
  AlertCircle,
  Loader,
  Shield,
} from "lucide-react";
import Toast from "../../../components/common/Toast";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// =====================================================
// FEATURES LIST
// =====================================================
const FEATURES = [
  "Full shipment management system",
  "Quote handling & real-time tracking",
  "Instant notifications & updates",
  "Priority customer support",
  "Unlimited shipments & quotes",
];

// =====================================================
// HELPER — format interval label
// e.g. "day" → "day", "month" → "month", "week" → "week"
// =====================================================
const formatInterval = (interval) => {
  if (!interval) return "month";
  return interval; // already human-readable from Stripe
};

const SubscriptionPopup = () => {
  const stripe = useStripe();
  const elements = useElements();

  // ── Contexts ──
  const {
    subscription,
    loading: subLoading,
    createSubscription,
    plan, // raw API response: { data: { daily: {...}, trialDays, currency } }
  } = useSubscription();

  const {
    needsOnboarding,
    hasCard,
    paymentCard,
    fetchPaymentStatus,
    createSetupIntent,
    savePaymentMethod,
    createCustomer,
  } = useShipperPayments();

  // ── Local state ──
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardError, setCardError] = useState(null);

  // ── Fetch payment status when popup opens ──
  useEffect(() => {
    if (isOpen) fetchPaymentStatus();
  }, [isOpen, fetchPaymentStatus]);

  // ── Auto-open for unsubscribed users ──
  useEffect(() => {
    if (!subLoading && !needsOnboarding) {
      const hasSubscriptionAccess =
        subscription?.hasAccess === true ||
        ["active", "trialing"].includes(subscription?.status);

      if (!hasSubscriptionAccess) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }
  }, [subscription, subLoading, needsOnboarding]);

  // =====================================================
  // DERIVE PLAN DETAILS from API response
  // API shape: plan.data.daily | plan.data.monthly | plan.data.weekly
  // =====================================================
  const planData = (() => {
    if (!plan) return null;
    // Support both { data: { daily } } and flat { daily }
    const root = plan?.data || plan;
    // Pick the first available plan key (daily, weekly, monthly)
    const planKey = ["daily", "weekly", "monthly"].find((k) => root?.[k]);
    return planKey ? root[planKey] : null;
  })();

  const trialDays = plan?.data?.trialDays ?? plan?.trialDays ?? 0;
  const trialActive =
    subscription?.status === "trialing" ||
    plan?.data?.trialActive ||
    plan?.trialActive;
  const planTrialEligible =
    plan?.data?.trialEligible ?? plan?.trialEligible ?? trialDays > 0;
  const trialEligible = trialActive || planTrialEligible;
  const subscriptionStatus =
    subscription?.status ||
    plan?.data?.subscriptionStatus ||
    plan?.subscriptionStatus ||
    null;
  const isCanceledSubscription = subscriptionStatus === "canceled";
  const showTrialOffer =
    !trialActive && trialEligible && trialDays > 0 && !isCanceledSubscription;

  const formatPrice = () => {
    if (!planData) return "Loading...";
    const symbol = planData.currency === "inr" ? "₹" : "$";
    return `${symbol}${planData.amount}`;
  };

  const intervalLabel = planData ? formatInterval(planData.interval) : "day";

  const badgeLabel = trialActive
    ? "Free trial active"
    : showTrialOffer
    ? `${trialDays}-day free trial`
    : "Paid subscription";

  // =====================================================
  // ADD CARD
  // =====================================================
  const handleAddCard = async () => {
    if (!stripe || !elements) return;
    try {
      setCardError(null);
      setProcessing(true);

      const clientSecret = await createSetupIntent();
      if (!clientSecret) {
        setCardError("Failed to initialize card setup");
        return;
      }

      const cardElement = elements.getElement(CardElement);
      const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret,
        { payment_method: { card: cardElement, billing_details: {} } }
      );

      if (error) {
        setCardError(error.message);
        return;
      }

      if (setupIntent.status === "succeeded") {
        await savePaymentMethod(setupIntent.payment_method);
        Toast.success("Card added successfully!");
        setShowCardForm(false);
        await fetchPaymentStatus();
      }
    } catch (err) {
      setCardError(err.message || "Failed to add card");
    } finally {
      setProcessing(false);
    }
  };

  // =====================================================
  // SUBSCRIBE
  // =====================================================
  const handleSubscribe = async () => {
    try {
      if (!hasCard) {
        setShowCardForm(true);
        Toast.warning("Please add a payment method first");
        return;
      }
      setProcessing(true);
      await createCustomer();
      await createSubscription(showTrialOffer);
      Toast.success(
        showTrialOffer ? "Free trial started!" : "Subscription activated!"
      );
      setIsOpen(false);
    } catch (err) {
      Toast.error(
        err?.response?.data?.message || "Subscription failed. Try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  // =====================================================
  // GUARD
  // =====================================================
  const isSubscribed =
    subscription?.hasAccess === true ||
    ["active", "trialing"].includes(subscription?.status);

  if (!isOpen || isSubscribed) return null;

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="fixed inset-0 z-50 font-montserrat flex items-end sm:items-center justify-center">
      {/* Backdrop — no close on click (forced flow) */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet: bottom on mobile, centered modal on sm+ */}
      <div className="relative z-10 w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90vh] overflow-hidden border border-slate-200">
        {/* ══════════════ HEADER ══════════════ */}
        <div className="bg-gradient-to-br from-[#BF9B53] via-[#c9a55e] to-[#8B7138] px-5 py-5 text-white relative overflow-hidden shrink-0">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 pointer-events-none" />

          <div className="relative space-y-2">
            {/* Badge */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur">
                <Zap size={13} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest opacity-90">
                Subscription Required
              </span>
            </div>

            {/* Title + Price */}
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-xl font-black leading-tight">
                Unlock Full Access
              </h2>

              {/* Price pill */}
              <div className="shrink-0 bg-white/20 backdrop-blur rounded-xl px-3 py-1.5 text-right">
                {planData ? (
                  <>
                    <p className="text-2xl font-black leading-none">
                      {formatPrice()}
                    </p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      /{intervalLabel}
                    </p>
                  </>
                ) : (
                  <Loader size={18} className="animate-spin opacity-70" />
                )}
              </div>
            </div>

            {/* Trial badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur rounded-full px-2.5 py-1 text-[11px] font-semibold">
                <Shield size={11} />
                {badgeLabel}
              </span>
              <span className="text-[11px] opacity-80">
                {showTrialOffer
                  ? "Cancel anytime • No hidden charges"
                  : `Starts billing immediately at ${formatPrice()}/${intervalLabel}`}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════ SCROLLABLE BODY ══════════════ */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
          {/* ── STEP 1: Features + Payment Status ── */}
          {!showCardForm && (
            <div className="space-y-3">
              {/* Features */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[11px] font-bold text-[#BF9B53] uppercase tracking-widest mb-3">
                  What's Included
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {FEATURES.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-[#BF9B53] flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                      <span className="text-xs text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment method status */}
              <div
                className={`p-3 rounded-md border-2 flex items-center gap-3 transition-colors ${
                  hasCard
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-[#BF9B53] bg-amber-50"
                }`}
              >
                <div
                  className={`p-1.5 rounded-full shrink-0 ${
                    hasCard ? "bg-emerald-100" : "bg-amber-100"
                  }`}
                >
                  {hasCard ? (
                    <Check size={15} className="text-emerald-600" />
                  ) : (
                    <AlertCircle size={15} className="text-[#BF9B53]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-800">
                    {hasCard
                      ? "Payment Method Ready"
                      : "Payment Method Required"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {hasCard
                      ? paymentCard?.cardBrand && paymentCard?.cardLast4
                        ? `${paymentCard.cardBrand.toUpperCase()} •••• ${
                            paymentCard.cardLast4
                          }`
                        : "Card saved"
                      : showTrialOffer
                      ? "Add a card to start your free trial"
                      : "Add a card to activate your subscription"}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-3 rounded-lg space-y-4">
                <p className="text-xs text-gray-800 leading-relaxed">
                  {showTrialOffer ? (
                    <>
                      You won't be charged during your{" "}
                      <span className="font-semibold">{badgeLabel}</span>. After
                      the trial, billing is {formatPrice()}/{intervalLabel}.
                    </>
                  ) : (
                    <>
                      Your free trial has already been used. Subscribe now to
                      continue full access at {formatPrice()}/{intervalLabel},
                      billed immediately after activation.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: Add Card Form ── */}
          {showCardForm && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-0.5">
                  <CreditCard size={15} className="text-[#BF9B53]" />
                  Add Payment Method
                </h3>
                <p className="text-xs text-slate-400">
                  {showTrialOffer
                    ? "You won't be charged until your trial ends"
                    : `Billing starts immediately at ${formatPrice()}/${intervalLabel}`}
                </p>
              </div>

              {/* Card input */}
              <div className="border-2 border-slate-200 rounded-xl p-3.5 bg-white focus-within:border-[#BF9B53] focus-within:ring-2 focus-within:ring-[#BF9B53]/20 transition-all">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "14px",
                        fontFamily: '"Montserrat", sans-serif',
                        color: "#1e293b",
                        "::placeholder": { color: "#cbd5e1" },
                      },
                      invalid: { color: "#dc2626" },
                    },
                  }}
                />
              </div>

              {/* Card error */}
              {cardError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-500 shrink-0" />
                  <p className="text-xs text-red-700">{cardError}</p>
                </div>
              )}

              {/* Security note */}
              <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] flex p-2 rounded-lg gap-2">
                <p className="text-xs text-slate-500">
                  We never store full card numbers. Secured by Stripe.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════ FOOTER ══════════════ */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 space-y-2">
          {!showCardForm ? (
            <>
              <button
                onClick={() => {
                  if (!hasCard) {
                    setShowCardForm(true);
                  } else {
                    handleSubscribe();
                  }
                }}
                disabled={processing || subLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#BF9B53] to-[#a8863e] text-white font-bold rounded-xl disabled:opacity-50 hover:shadow-lg hover:from-[#c9a55e] hover:to-[#BF9B53] transition-all text-sm flex items-center justify-center gap-2"
              >
                {processing || subLoading ? (
                  <>
                    <Loader size={15} className="animate-spin" />
                    Processing...
                  </>
                ) : hasCard ? (
                  <>
                    <Zap size={15} />
                    {showTrialOffer
                      ? `Start ${trialDays}-day free trial`
                      : "Subscribe Now"}
                  </>
                ) : (
                  <>
                    <CreditCard size={15} />
                    Add Payment Method
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-400 pt-0.5">
                {showTrialOffer
                  ? `${formatPrice()}/${intervalLabel} after trial • Cancel anytime`
                  : `${formatPrice()}/${intervalLabel} • Cancel anytime`}
              </p>
            </>
          ) : (
            <>
              <button
                onClick={handleAddCard}
                disabled={processing || !stripe || !elements}
                className="w-full py-3.5 bg-gradient-to-r from-[#BF9B53] to-[#a8863e] text-white font-bold rounded-xl disabled:opacity-50 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader size={15} className="animate-spin" />
                    Saving Card...
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    Save Card & Continue
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowCardForm(false);
                  setCardError(null);
                }}
                disabled={processing}
                className="w-full py-2 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors disabled:opacity-40"
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPopup;
