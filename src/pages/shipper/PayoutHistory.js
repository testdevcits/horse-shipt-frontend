import React, { useEffect, useState } from "react";
import { useShipperPayments } from "../../contexts/shipperContext/ShipperPaymentContext";
import { useShipperDelivery } from "../../contexts/shipperContext/ShipperDeliveryContext";
import PageLoader from "../../components/common/PageLoader";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Toast from "../../components/common/Toast";
import {
  ChevronDown,
  CreditCard,
  TrendingUp,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowUpRight,
  Shield,
  Plus,
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

  // Initial Load
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-montserrat">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-[#BF9B53]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Payments & Payouts
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Manage payment methods and track your earnings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Payment Method Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-6 py-5 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg border-2 border-[#BF9B53]">
                <CreditCard className="w-6 h-6 text-[#BF9B53]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  Payment Method
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  {hasCard && !clientSecret
                    ? "Your card is secure and ready"
                    : "Add a card to enable automatic payouts"}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 lg:py-10">
            {!hasCard && !clientSecret && (
              <div className="space-y-6">
                {/* Security Info Box */}
                <div className="flex gap-4 p-5 bg-gradient-to-br from-[#BF9B53]/5 to-transparent border border-[#BF9B53]/20 rounded-lg">
                  <div className="p-2.5 bg-white rounded-lg border border-[#BF9B53]/30 h-fit">
                    <Shield className="w-5 h-5 text-[#BF9B53]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">
                      Bank-level security
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Your payment information is encrypted and processed
                      securely by Stripe
                    </p>
                  </div>
                </div>

                {/* Add Card Button */}
                <button
                  onClick={handleAddCard}
                  disabled={cardProcessing || paymentLoading}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#BF9B53] to-orange-500 hover:from-[#a88a47] hover:to-orange-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  {cardProcessing ? "Setting up..." : "Add Payment Card"}
                </button>
              </div>
            )}

            {clientSecret && (
              <form onSubmit={handleSaveCard} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900">
                    Card Details
                  </label>
                  <div className="p-4 border-2 border-slate-300 rounded-lg bg-white focus-within:border-[#BF9B53] focus-within:ring-2 focus-within:ring-[#BF9B53]/10 transition-all">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
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
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#BF9B53] to-orange-500 hover:from-[#a88a47] hover:to-orange-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  {cardProcessing ? "Saving card..." : "Save Card"}
                </button>
              </form>
            )}

            {hasCard && !clientSecret && paymentCard && (
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                  <div className="p-3 bg-white rounded-lg border border-green-300">
                    <CreditCard className="w-6 h-6 text-[#BF9B53]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Active Card
                    </p>
                    <p className="font-bold text-slate-900 mt-1">
                      {paymentCard.cardBrand?.toUpperCase()} ••••{" "}
                      {paymentCard.cardLast4}
                    </p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                </div>

                <button
                  onClick={handleAddCard}
                  disabled={cardProcessing}
                  className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors duration-200"
                >
                  {cardProcessing ? "Processing..." : "Update Card"}
                </button>
              </div>
            )}

            {paymentError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <div className="text-red-600 mt-0.5">⚠️</div>
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Payment Error
                  </p>
                  <p className="text-xs text-red-700 mt-1">{paymentError}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payout History Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 px-6 py-5 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg border-2 border-blue-500">
                <ArrowUpRight className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  Payout History
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  {payoutHistory.length > 0
                    ? `${payoutHistory.length} transaction${
                        payoutHistory.length !== 1 ? "s" : ""
                      }`
                    : "No payouts yet"}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {payoutLoading && payoutHistory.length === 0 && (
              <div className="flex justify-center py-12">
                <PageLoader
                  text="Loading payouts..."
                  size={28}
                  color="#0ea5e9"
                />
              </div>
            )}

            {!payoutLoading && payoutHistory.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-full">
                  <ArrowUpRight className="w-7 h-7 text-slate-400" />
                </div>
                <div>
                  <p className="text-slate-900 font-semibold">No payouts yet</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Your earnings will appear here
                  </p>
                </div>
              </div>
            )}

            {payoutHistory.length > 0 && (
              <>
                {/* Mobile View */}
                <div className="space-y-3 md:hidden">
                  {payoutHistory.map((payout) => (
                    <div
                      key={payout.id}
                      className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Reference ID
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="text-sm font-mono text-slate-700 bg-white px-2.5 py-1.5 rounded truncate">
                              {visibleIds[payout.id]
                                ? payout.id
                                : maskId(payout.id)}
                            </code>
                            <button
                              onClick={() => toggleId(payout.id)}
                              className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-[#BF9B53] flex-shrink-0"
                              title={visibleIds[payout.id] ? "Hide" : "Show"}
                            >
                              {visibleIds[payout.id] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
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
                      <div className="flex items-end justify-between gap-2 pt-3 border-t border-slate-300">
                        <div>
                          <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
                            Amount
                          </p>
                          <p className="text-lg font-bold text-slate-900 mt-1">
                            {Number(payout.amount).toLocaleString(undefined, {
                              style: "currency",
                              currency: payout.currency || "USD",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
                            Date
                          </p>
                          <p className="text-sm text-slate-900 font-semibold mt-1">
                            {formatDate(payout.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100">
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Reference ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {payoutHistory.map((payout, idx) => (
                        <tr
                          key={payout.id}
                          className={`border-b border-slate-200 transition-colors duration-150 ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                          } hover:bg-blue-50`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded">
                                {visibleIds[payout.id]
                                  ? payout.id
                                  : maskId(payout.id)}
                              </code>
                              <button
                                onClick={() => toggleId(payout.id)}
                                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 hover:text-[#BF9B53]"
                                title={visibleIds[payout.id] ? "Hide" : "Show"}
                              >
                                {visibleIds[payout.id] ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900">
                              {Number(payout.amount).toLocaleString(undefined, {
                                style: "currency",
                                currency: payout.currency || "USD",
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-slate-900">
                              {formatDate(payout.createdAt)}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {formatTime(payout.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
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

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-8 pt-6 border-t border-slate-200">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-200 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      <ChevronDown className="w-4 h-4" />
                      {loadingMore ? "Loading..." : "Load More Payouts"}
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
