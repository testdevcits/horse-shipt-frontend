import React, { useEffect, useState } from "react";
import { useShipperPayments } from "../../contexts/shipperContext/ShipperPaymentContext";
import { useShipperDelivery } from "../../contexts/shipperContext/ShipperDeliveryContext";
import PageLoader from "../../components/common/PageLoader";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Toast from "../../components/common/Toast";
import {
  ChevronDown,
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  Lock,
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

  const [visibleIds, setVisibleIds] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [cardProcessing, setCardProcessing] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setGlobalLoading(true);
      try {
        await Promise.all([getPayoutHistory(), fetchPaymentStatus()]);
      } catch (err) {
        console.error("Error loading data:", err);
        Toast.error("Failed to load data");
      } finally {
        setGlobalLoading(false);
      }
    };
    fetchAll();
  }, [getPayoutHistory, fetchPaymentStatus]);

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

  if (globalLoading) {
    return (
      <PageLoader
        text="Loading payment information..."
        fullScreen={false}
        size={20}
        color="#BF9B53"
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 font-montserrat">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Payments & Payouts
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage payment methods and track earnings
          </p>
        </div>
      </div>

      <div className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
        {/* Payment Method Card */}
        <div className="bg-white rounded-lg border border-slate-200">
          {/* Header */}
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-[#BF9B53] rounded-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Payment Method
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {hasCard && !clientSecret
                    ? "Card ready for payouts"
                    : "Add a card for automatic payouts"}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-3 sm:px-4 py-3 sm:py-4">
            {!hasCard && !clientSecret && (
              <div className="space-y-3">
                {/* Security Info */}
                <div className="flex gap-2 p-3 bg-[#BF9B53]/10 border border-[#BF9B53]/20 rounded-lg">
                  <Lock className="w-4 h-4 text-[#BF9B53] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900">
                      Bank-level security
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Encrypted and secured by Stripe
                    </p>
                  </div>
                </div>

                {/* Add Card Button */}
                <button
                  onClick={handleAddCard}
                  disabled={cardProcessing || paymentLoading}
                  className="w-full px-4 py-2 sm:py-3 bg-[#BF9B53] hover:bg-[#a88a47] disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {cardProcessing ? "Setting up..." : "Add Card"}
                </button>
              </div>
            )}

            {clientSecret && (
              <form onSubmit={handleSaveCard} className="space-y-3">
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-900">
                    Card Details
                  </label>
                  <div className="p-3 border border-slate-300 rounded-lg bg-white focus-within:border-[#BF9B53] focus-within:ring-2 focus-within:ring-[#BF9B53]/20 transition-all">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: "14px",
                            fontFamily: "system-ui, -apple-system, sans-serif",
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
                  className="w-full px-4 py-2 sm:py-3 bg-[#BF9B53] hover:bg-[#a88a47] disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {cardProcessing ? "Saving..." : "Save Card"}
                </button>
              </form>
            )}

            {hasCard && !clientSecret && paymentCard && (
              <div className="space-y-3">
                {paymentError && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-xs text-red-700">{paymentError}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-[#BF9B53]/10 border border-[#BF9B53]/30 rounded-lg">
                  <CreditCard className="w-5 h-5 text-[#BF9B53] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600 font-semibold">
                      Active Card
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {paymentCard.cardBrand?.toUpperCase()} •••• {paymentCard.cardLast4}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                </div>
                <button
                  onClick={handleAddCard}
                  disabled={cardProcessing}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-200 text-slate-900 text-sm font-semibold rounded-lg transition-colors"
                >
                  {cardProcessing ? "Processing..." : "Update Card"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payout History Card */}
        <div className="bg-white rounded-lg border border-slate-200">
          {/* Header */}
          <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-[#BF9B53] rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Payout History
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {payoutHistory.length > 0
                    ? `${payoutHistory.length} transaction${payoutHistory.length !== 1 ? "s" : ""}`
                    : "No payouts yet"}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-3 sm:px-4 py-3 sm:py-4">
            {payoutLoading && payoutHistory.length === 0 && (
              <div className="flex justify-center py-8">
                <PageLoader text="Loading..." size={24} color="#0ea5e9" />
              </div>
            )}

            {!payoutLoading && payoutHistory.length === 0 && (
              <div className="text-center py-10">
                <ArrowUpRight className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900">No payouts yet</p>
                <p className="text-xs text-slate-600 mt-1">Earnings will appear here</p>
              </div>
            )}

            {payoutHistory.length > 0 && (
              <>
                {/* Mobile View */}
                <div className="space-y-2 md:hidden">
                  {payoutHistory.map((payout) => (
                    <div
                      key={payout.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#BF9B53] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-600">
                            ID
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <code className="text-xs font-mono text-slate-700 bg-white px-2 py-1 rounded truncate">
                              {visibleIds[payout.id] ? payout.id : maskId(payout.id)}
                            </code>
                            <button
                              onClick={() => toggleId(payout.id)}
                              className="p-1 hover:bg-white rounded text-slate-500 hover:text-[#BF9B53] transition-colors flex-shrink-0"
                              title={visibleIds[payout.id] ? "Hide" : "Show"}
                            >
                              {visibleIds[payout.id] ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <span
                          className={`inline-flex text-xs font-semibold px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ${
                            payout.status === "completed" ||
                            payout.status === "success"
                              ? "bg-green-100 text-green-800"
                              : payout.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-800"
                          }`}
                        >
                          {payout.status?.charAt(0).toUpperCase() +
                            payout.status?.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-2 pt-2 border-t border-slate-200">
                        <div>
                          <p className="text-xs text-slate-600 font-semibold">
                            Amount
                          </p>
                          <p className="text-base font-bold text-slate-900 mt-0.5">
                            {Number(payout.amount).toLocaleString(undefined, {
                              style: "currency",
                              currency: payout.currency || "USD",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-600 font-semibold">
                            Date
                          </p>
                          <p className="text-xs text-slate-900 font-semibold mt-0.5">
                            {formatDate(payout.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50">
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-900">
                          ID
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-900">
                          Amount
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-900">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-900">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {payoutHistory.map((payout, idx) => (
                        <tr
                          key={payout.id}
                          className={`border-b border-slate-200 ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                          } hover:bg-blue-50 transition-colors`}
                        >
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <code className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                {visibleIds[payout.id]
                                  ? payout.id
                                  : maskId(payout.id)}
                              </code>
                              <button
                                onClick={() => toggleId(payout.id)}
                                className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-[#BF9B53] transition-colors"
                                title={visibleIds[payout.id] ? "Hide" : "Show"}
                              >
                                {visibleIds[payout.id] ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span className="font-bold text-slate-900">
                              {Number(payout.amount).toLocaleString(undefined, {
                                style: "currency",
                                currency: payout.currency || "USD",
                              })}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-xs font-semibold text-slate-900">
                              {formatDate(payout.createdAt)}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {formatTime(payout.createdAt)}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex text-xs font-semibold px-2 py-1 rounded ${
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

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center mt-3 pt-3 border-t border-slate-200">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-200 text-slate-900 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <ChevronDown className="w-3 h-3" />
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
  );
};

export default PayoutAndCardPage;