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
  Lock,
  CheckCircle2,
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
        Toast.error("Failed to load data");
      } finally {
        setGlobalLoading(false);
      }
    };
    fetchAll();
  }, [getPayoutHistory, fetchPaymentStatus]);

  // Helpers
  const toggleId = (id) =>
    setVisibleIds((prev) => ({ ...prev, [id]: !prev[id] }));

  const maskId = (id) => (id ? id.slice(0, 4) + "••••••••" + id.slice(-4) : "");

  // Load more payouts
  const handleLoadMore = async () => {
    if (!hasMore) return;
    setLoadingMore(true);
    try {
      await getPayoutHistory(5, nextCursor);
    } catch (err) {
      Toast.error("Failed to load more payouts");
    } finally {
      setLoadingMore(false);
    }
  };

  // Add Card
  const handleAddCard = async () => {
    setCardProcessing(true);
    try {
      await createCustomer();
      await createSetupIntent();
      Toast.info("Enter your card details");
    } catch (err) {
      Toast.error("Failed to initialize card setup");
    } finally {
      setCardProcessing(false);
    }
  };

  // Save Card
  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setCardProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        Toast.error(error.message);
        return;
      }

      await savePaymentMethod(setupIntent.payment_method);
      Toast.success("Card saved successfully!");
    } catch (err) {
      Toast.error("Failed to save card");
    } finally {
      setCardProcessing(false);
    }
  };

  // Loader
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

  return (
    <div className="min-h-screen font-[Montserrat]">
      {/* Header Section */}
      <div className="bg-white border-b border-[#BF9B53]">
        <div className="max-w-full mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Payouts & Payments
            </h1>
          </div>
          <p className="text-slate-600 text-sm">
            Manage your payment methods and view your payout history
          </p>
        </div>
      </div>

      <div className="max-w-full mx-auto mt-4 space-y-8">
        {/* PAYMENT METHOD CARD */}
        <div className="group">
          <div className="bg-white rounded-md shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-lg border border-amber-200">
                  <CreditCard className="w-5 h-5 text-amber-600" />
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

            {/* Card Content */}
            <div className="px-6 py-8">
              {!hasCard && !clientSecret && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="p-2 bg-white rounded border border-blue-300 mt-0.5">
                      <Lock className="w-4 h-4 text-blue-600" />
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
                    className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
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
                              "::placeholder": {
                                color: "#cbd5e1",
                              },
                            },
                            invalid: {
                              color: "#ef4444",
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={cardProcessing || !stripe}
                    className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {cardProcessing ? "Saving..." : "Save Card"}
                  </button>
                </form>
              )}

              {hasCard && !clientSecret && paymentCard && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Current Card
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg border border-amber-300">
                            <CreditCard className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {paymentCard.cardBrand?.toUpperCase()} ••••{" "}
                              {paymentCard.cardLast4}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Expires {paymentCard.cardExpMonth}/
                              {paymentCard.cardExpYear}
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
                    className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-300 text-slate-900 font-medium rounded-lg transition-colors duration-200"
                  >
                    {cardProcessing ? "Processing..." : "Update Card"}
                  </button>
                </div>
              )}

              {paymentError && (
                <div className="p-4 mt-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-medium">
                    {paymentError}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PAYOUT HISTORY CARD */}
        <div>
          <div className="bg-white rounded-md shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
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

            {/* Content */}
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
                        {payoutHistory.map((payout, idx) => (
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
                                  className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors duration-150 text-slate-500 hover:text-amber-600"
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
