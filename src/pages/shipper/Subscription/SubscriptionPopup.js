import React, { useEffect, useState } from "react";
import { useSubscription } from "../../../contexts/shipperContext/SubscriptionContext";
import { useShipperPayments } from "../../../contexts/shipperContext/ShipperPaymentContext";
import {
  Check,
  Zap,
  Lock,
  CreditCard,
  AlertCircle,
  Loader,
  X,
} from "lucide-react";
import Toast from "../../../components/common/Toast";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const SubscriptionPopup = () => {
  const stripe = useStripe();
  const elements = useElements();

  // ================= CONTEXTS =================
  const {
    subscription,
    loading: subLoading,
    createSubscription,
    cancelSubscription,
    plan,
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

  // ================= STATE =================
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [activeStep, setActiveStep] = useState("review");

  // ================= EFFECTS =================
  useEffect(() => {
    if (isOpen) {
      fetchPaymentStatus();
      if (needsOnboarding) setActiveStep("payment");
    }
  }, [isOpen, fetchPaymentStatus, needsOnboarding]);

  useEffect(() => {
    if (!subLoading && !needsOnboarding) {
      const isSubscribed =
        subscription && ["active", "trialing"].includes(subscription.status);
      if (!isSubscribed) setIsOpen(true);
    }
  }, [subscription, subLoading, needsOnboarding]);

  // ================= ADD CARD =================
  const handleAddCard = async () => {
    if (!stripe || !elements) return;
    try {
      setCardError(null);
      setProcessing(true);

      const clientSecret = await createSetupIntent();
      if (!clientSecret) {
        setCardError("Failed to initialize card setup");
        setProcessing(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret,
        { payment_method: { card: cardElement, billing_details: {} } }
      );

      if (error) {
        setCardError(error.message);
        setProcessing(false);
        return;
      }

      if (setupIntent.status === "succeeded") {
        await savePaymentMethod(setupIntent.payment_method);
        Toast.success("Card added successfully!");
        setShowCardForm(false);
        setActiveStep("review");
        await fetchPaymentStatus();
      }
    } catch (err) {
      setCardError(err.message || "Failed to add card");
    } finally {
      setProcessing(false);
    }
  };

  // ================= SUBSCRIBE =================
  const handleSubscribe = async () => {
    try {
      if (!hasCard) {
        setShowCardForm(true);
        Toast.warning("Please add a payment method first");
        return;
      }
      setProcessing(true);
      await createCustomer();
      await createSubscription(true);
      Toast.success("Subscription Activated!");
      setIsOpen(false);
      setActiveStep("review");
    } catch (err) {
      Toast.error(
        err?.response?.data?.message || "Subscription failed. Try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  // ================= CANCEL =================
  const handleCancel = async () => {
    try {
      setProcessing(true);
      await cancelSubscription(false);
      Toast.info("Subscription will cancel at period end");
      setIsOpen(false);
      setActiveStep("review");
    } catch (err) {
      Toast.error("Cancel failed");
    } finally {
      setProcessing(false);
    }
  };

  // ================= FORMAT PRICE =================
  const formatPrice = () => {
    if (!plan || !plan.monthly) return "Loading...";
    const symbol = plan.currency === "inr" ? "₹" : "$";
    return `${symbol}${plan.monthly.amount}`;
  };

  const isSubscribed =
    subscription && ["active", "trialing"].includes(subscription.status);

  const handleClose = () => {
    setIsOpen(false);
    setShowCardForm(false);
    setActiveStep("review");
    setCardError(null);
  };

  if (!isOpen) return null;

  const FEATURES = [
    "Full shipment management system",
    "Quote handling & real-time tracking",
    "Instant notifications & updates",
    "Priority customer support",
    "Advanced analytics & reporting",
    "Unlimited shipments & quotes",
  ];

  return (
    <div className="fixed inset-0 z-50 font-montserrat flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* ── Sheet: bottom on mobile, centered on sm+ ── */}
      <div className="relative z-10 w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90vh] overflow-hidden border border-slate-200">
        {/* ===================== HEADER ===================== */}
        <div className="bg-gradient-to-br from-[#BF9B53] via-[#BF9B53]/80 to-[#8B7138] px-5 py-5 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors z-10"
          >
            <X size={14} />
          </button>

          <div className="relative space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur">
                <Zap size={14} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                Premium Access
              </span>
            </div>

            {/* Price pill — compact on mobile */}
            <div className="flex items-end justify-between">
              <h2 className="text-xl font-black leading-tight">
                {isSubscribed ? "Your Subscription" : "Unlock Full Access"}
              </h2>
              {!isSubscribed && (
                <div className="text-right shrink-0 ml-3">
                  <p className="text-2xl font-black leading-none">
                    {formatPrice()}
                  </p>
                  <p className="text-xs opacity-80">/month</p>
                </div>
              )}
            </div>

            <p className="text-xs font-medium opacity-90">
              {isSubscribed
                ? "Manage your subscription and billing"
                : "30-day free trial • Cancel anytime"}
            </p>
          </div>
        </div>

        {/* ===================== SCROLLABLE BODY ===================== */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
          {/* ── STEP: REVIEW ── */}
          {activeStep === "review" && (
            <div className="space-y-3">
              {/* Features — compact grid on mobile */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  What's Included
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
                  {FEATURES.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                        <Check size={11} className="text-green-600" />
                      </div>
                      <span className="text-xs text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Status */}
              {!isSubscribed && (
                <div
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 ${
                    hasCard
                      ? "border-green-200 bg-green-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-full shrink-0 ${
                      hasCard ? "bg-green-100" : "bg-amber-100"
                    }`}
                  >
                    {hasCard ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <AlertCircle size={16} className="text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs">
                      {hasCard
                        ? "Payment Method Ready"
                        : "Payment Method Required"}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 truncate">
                      {hasCard
                        ? paymentCard?.cardBrand && paymentCard?.cardLast4
                          ? `${paymentCard.cardBrand.toUpperCase()} •••• ${
                              paymentCard.cardLast4
                            }`
                          : "Card saved"
                        : "Add a card to activate your subscription"}
                    </p>
                  </div>
                </div>
              )}

              {/* Active Subscription Info */}
              {isSubscribed && (
                <div className="p-3 rounded-xl bg-blue-50 border-2 border-blue-200 space-y-1">
                  <p className="font-bold text-blue-900 text-sm">
                    Subscription Active
                  </p>
                  <p className="text-xs text-blue-800">
                    Status:{" "}
                    <span className="font-semibold capitalize">
                      {subscription?.status}
                    </span>
                  </p>
                  {subscription?.currentPeriodEnd && (
                    <p className="text-xs text-blue-800">
                      Renewal:{" "}
                      <span className="font-semibold">
                        {new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: ADD CARD ── */}
          {(activeStep === "card" || showCardForm) && (
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <CreditCard size={16} />
                  Add Your Card
                </h3>
                <p className="text-xs text-slate-500">
                  Secured with Stripe encryption
                </p>
              </div>

              <div className="border-2 border-slate-300 rounded-xl p-3 bg-white focus-within:border-[#BF9B53] focus-within:ring-2 focus-within:ring-[#BF9B53]/20 transition-all">
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

              {cardError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                  <AlertCircle size={15} className="text-red-600 shrink-0" />
                  <p className="text-xs text-red-700">{cardError}</p>
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-slate-50 flex items-center gap-2">
                <Lock size={14} className="text-slate-400 shrink-0" />
                <p className="text-xs text-slate-500">
                  We never store full card numbers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ===================== FOOTER ===================== */}
        <div className="shrink-0 border-t bg-white px-5 py-4 space-y-2">
          {!isSubscribed ? (
            <>
              {showCardForm ? (
                <>
                  <button
                    onClick={handleAddCard}
                    disabled={processing || !stripe || !elements}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={15} className="animate-spin" />
                        Saving Card...
                      </>
                    ) : (
                      "Save Card & Continue"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowCardForm(false);
                      setCardError(null);
                    }}
                    disabled={processing}
                    className="w-full py-2 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors"
                  >
                    Back
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (!hasCard) setShowCardForm(true);
                      else handleSubscribe();
                    }}
                    disabled={processing || subLoading}
                    className="w-full py-3 bg-gradient-to-r from-[#BF9B53] to-[#a8863e] text-white font-bold rounded-xl disabled:opacity-50 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader size={15} className="animate-spin" />
                        Processing...
                      </>
                    ) : hasCard ? (
                      <>
                        <Zap size={15} />
                        Start Free Trial
                      </>
                    ) : (
                      <>
                        <CreditCard size={15} />
                        Add Payment Method
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleClose}
                    disabled={processing}
                    className="w-full py-2 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors disabled:opacity-50"
                  >
                    Maybe Later
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                disabled={processing}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl disabled:opacity-50 transition-all text-sm"
              >
                {processing ? "Processing..." : "Cancel Subscription"}
              </button>
              <button
                onClick={handleClose}
                disabled={processing}
                className="w-full py-2 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors"
              >
                Close
              </button>
            </>
          )}

          <p className="text-center text-xs text-slate-400 pt-1">
            Monthly billing • No hidden charges • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPopup;
