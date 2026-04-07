import React, { useEffect, useState } from "react";
import { useSubscription } from "../../../contexts/shipperContext/SubscriptionContext";
import { useShipperPayments } from "../../../contexts/shipperContext/ShipperPaymentContext";
import { useNavigate } from "react-router-dom";
import { Check, Zap, Lock } from "lucide-react";
import Toast from "../../../components/common/Toast";

const SubscriptionPopup = () => {
  const navigate = useNavigate();

  const {
    subscription,
    loading,
    createSubscription,
    cancelSubscription,
    plan,
  } = useSubscription();

  const { needsOnboarding, hasCard, fetchPaymentStatus } = useShipperPayments();

  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  /* ================= FETCH CARD ================= */
  useEffect(() => {
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  /* ================= CHECK SUBSCRIPTION ================= */
  useEffect(() => {
    if (!loading && !needsOnboarding) {
      const isSubscribed =
        subscription &&
        (subscription.trialActive || subscription.status === "active");

      if (!isSubscribed) {
        setIsOpen(true);
      }
    }
  }, [subscription, loading, needsOnboarding]);

  /* ================= SUBSCRIBE ================= */
  const handleSubscribe = async () => {
    try {
      if (!hasCard) {
        Toast.warning("Please add a card first");
        navigate("/shipper/settings?tab=payment");
        return;
      }

      setProcessing(true);
      await createSubscription(true);

      Toast.success("Subscription Activated!");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      Toast.error("Subscription failed. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  /* ================= CANCEL ================= */
  const handleCancel = async () => {
    try {
      setProcessing(true);
      await cancelSubscription(false);

      Toast.info("Subscription will cancel at period end");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      Toast.error("Cancel failed");
    } finally {
      setProcessing(false);
    }
  };

  /* ================= FORMAT PRICE ================= */
  const formatPrice = () => {
    if (!plan) return "Loading...";

    const symbol = plan.currency === "inr" ? "₹" : "$";
    return `${symbol}${plan.amount}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-montserrat">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* ===================== HEADER ===================== */}
        <div className="bg-gradient-to-br from-[#BF9B53] via-[#BF9B53]/60 to-[#BF9B53]/70 px-6 sm:px-4 py-4 sm:py-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#BF9B53]/60 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#BF9B53]/60 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative space-y-3">
            <div className="flex items-center gap-2 text-blue-100">
              <Zap size={20} />
              <span className="text-xs text-black font-semibold uppercase tracking-wider">
                Premium Plan
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Unlock Premium Features
            </h2>

            <p className="text-black text-sm sm:text-base font-medium">
              {subscription?.trialActive
                ? `Your trial is active. ${
                    subscription.remainingTrialDays
                  } day${
                    subscription.remainingTrialDays > 1 ? "s" : ""
                  } remaining`
                : "Get started with 30 days free, then continue at a premium price."}
            </p>
          </div>
        </div>

        {/* ===================== CONTENT ===================== */}
        <div className="px-6 sm:px-4 py-4 space-y-4">
          {/* Plan Card */}
          <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-[#BF9B53] rounded-md p-6 overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 bg-[#BF9B53] text-white text-xs font-bold uppercase rounded-full">
              Best Value
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900">
                {plan?.productName || "Premium Plan"}
              </h3>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">
                  {formatPrice()}
                </span>
                <span className="text-slate-600 font-semibold">
                  /{plan?.interval || "month"}
                </span>
              </div>

              <p className="text-[#BF9B53] font-bold text-sm flex items-center gap-1">
                <Check size={16} />
                30 days free trial • Cancel anytime
              </p>
            </div>
          </div>

          {/* Card Status */}
          <div className="p-4 rounded-md border-2 flex items-center gap-3">
            {hasCard ? (
              <>
                <div className="p-2 rounded-full bg-emerald-100">
                  <Check size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    Payment Method Ready
                  </p>
                  <p className="text-xs text-slate-600">
                    Your card is saved and ready
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-full bg-red-100">
                  <Lock size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Add Payment Method</p>
                  <p className="text-xs text-slate-600">
                    You need to add a card to subscribe
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===================== FOOTER ===================== */}
        <div className="px-6 sm:px-4 py-4 border-t border-[#BF9B53] space-y-3 bg-slate-50">
          {/* Subscribe Button */}
          {!subscription?.trialActive && subscription?.status !== "active" && (
            <button
              onClick={handleSubscribe}
              disabled={processing || !hasCard}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#BF9B53] to-[#BF9B53]/60 hover:bg-[#BF9B53] disabled:from-slate-300 disabled:to-slate-300 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Start 30-Day Free Trial
                </>
              )}
            </button>
          )}

          {/* Cancel Button */}
          {subscription?.trialActive ||
          ["active"].includes(subscription?.status) ? (
            <button
              onClick={handleCancel}
              disabled={processing}
              className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 font-bold rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : "Cancel Subscription"}
            </button>
          ) : null}

          {/* Maybe Later Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-3 px-4 text-slate-600 font-semibold hover:text-slate-900 hover:bg-gray-300 rounded-xl transition-colors duration-200"
          >
            Maybe Later
          </button>

          <p className="text-center text-xs text-slate-500 font-medium">
            No hidden fees • Full access for 30 days • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPopup;
