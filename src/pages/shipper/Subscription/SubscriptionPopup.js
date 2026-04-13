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

  // ================= EFFECTS =================
  useEffect(() => {
    if (isOpen) {
      fetchPaymentStatus();
    }
  }, [isOpen, fetchPaymentStatus]);

  // Open modal for new users who haven't subscribed yet
  useEffect(() => {
    if (!subLoading && !needsOnboarding) {
      const isSubscribed =
        subscription && ["active", "trialing"].includes(subscription.status);
      if (!isSubscribed) {
        setIsOpen(true);
      }
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
      // Modal will close automatically when subscription updates
      setIsOpen(false);
    } catch (err) {
      Toast.error(
        err?.response?.data?.message || "Subscription failed. Try again."
      );
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

  // Don't show modal if already subscribed
  if (!isOpen || isSubscribed) return null;

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
      {/* Backdrop - No close on click */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* ── Sheet: bottom on mobile, centered on sm+ ── */}
      <div className="relative z-10 w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90vh] overflow-hidden border border-slate-200">
        {/* ===================== HEADER ===================== */}
        <div className="bg-gradient-to-br from-[#BF9B53] via-[#BF9B53]/80 to-[#8B7138] px-5 py-5 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />

          <div className="relative space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur">
                <Zap size={14} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                Get Started
              </span>
            </div>

            {/* Price pill — compact on mobile */}
            <div className="flex items-end justify-between">
              <h2 className="text-xl font-black leading-tight">
                Unlock Full Access
              </h2>
              <div className="text-right shrink-0 ml-3">
                <p className="text-2xl font-black leading-none">
                  {formatPrice()}
                </p>
                <p className="text-xs opacity-80">/month</p>
              </div>
            </div>

            <p className="text-xs font-medium opacity-90">
              30-day free trial • Cancel anytime • No hidden charges
            </p>
          </div>
        </div>

        {/* ===================== SCROLLABLE BODY ===================== */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
          {/* ── STEP 1: FEATURES & PAYMENT METHOD ── */}
          {!showCardForm && (
            <div className="space-y-3">
              {/* Features Grid */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Premium Features Included
                </p>
                <div className="grid grid-cols-1 gap-2">
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

              {/* Info Box */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-900 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>
                    Complete your setup to start managing shipments immediately
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: ADD CARD FORM ── */}
          {showCardForm && (
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <CreditCard size={16} />
                  Add Your Payment Method
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
                  We never store full card numbers. Your information is secure.
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-2 mt-4">
                <div className="h-1 flex-1 rounded-full bg-[#BF9B53]" />
                <div className="h-1 flex-1 rounded-full bg-slate-200" />
              </div>
            </div>
          )}
        </div>

        {/* ===================== FOOTER ===================== */}
        <div className="shrink-0 border-t bg-white px-5 py-4 space-y-2">
          {!showCardForm ? (
            <>
              {/* Step 1: Add Card or Start Trial */}
              <button
                onClick={() => {
                  if (!hasCard) {
                    setShowCardForm(true);
                  } else {
                    handleSubscribe();
                  }
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

              <p className="text-center text-xs text-slate-400 pt-1">
                Monthly billing • No hidden charges • Cancel anytime
              </p>
            </>
          ) : (
            <>
              {/* Step 2: Save Card & Continue */}
              <button
                onClick={handleAddCard}
                disabled={processing || !stripe || !elements}
                className="w-full py-3 bg-gradient-to-r from-[#BF9B53] to-[#a8863e] text-white font-bold rounded-xl disabled:opacity-50 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
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
                className="w-full py-2 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors disabled:opacity-50"
              >
                Back
              </button>

              <p className="text-center text-xs text-slate-400 pt-1">
                Secured by Stripe
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPopup;
