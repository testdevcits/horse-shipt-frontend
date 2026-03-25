import React, { useEffect, useState } from "react";
import { useShipperPayments } from "../../contexts/shipperContext/ShipperPaymentContext";
import { useShipperDelivery } from "../../contexts/shipperContext/ShipperDeliveryContext";
import PageLoader from "../../components/common/PageLoader";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Toast from "../../components/common/Toast";

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
  const [toasts, setToasts] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(true); // show loader while initial fetch

  // -----------------------------
  // Initial Load
  // -----------------------------
  useEffect(() => {
    const fetchAll = async () => {
      setGlobalLoading(true);
      try {
        await Promise.all([getPayoutHistory(), fetchPaymentStatus()]);
      } catch (err) {
        console.error("Initial load error:", err);
      } finally {
        setGlobalLoading(false);
      }
    };
    fetchAll();
  }, [getPayoutHistory, fetchPaymentStatus]);

  // -----------------------------
  // Toast Helper
  // -----------------------------
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const toggleId = (id) =>
    setVisibleIds((prev) => ({ ...prev, [id]: !prev[id] }));
  const maskId = (id) => (id ? id.slice(0, 4) + "********" + id.slice(-4) : "");

  // -----------------------------
  // Load more payouts
  // -----------------------------
  const handleLoadMore = async () => {
    if (!hasMore) return;
    setLoadingMore(true);
    try {
      await getPayoutHistory(5, nextCursor);
    } catch (err) {
      console.error("Load more error:", err);
      showToast("Failed to load more payouts", "error");
    } finally {
      setLoadingMore(false);
    }
  };

  // -----------------------------
  // Add / Update Card (Create Customer + Setup Intent)
  // -----------------------------
  const handleAddCard = async () => {
    setCardProcessing(true);
    try {
      await createCustomer();
      await createSetupIntent();
      showToast("Card setup initialized. Enter your card details.", "info");
    } catch (err) {
      console.error(err);
      showToast("Failed to initialize card setup", "error");
    } finally {
      setCardProcessing(false);
    }
  };

  // -----------------------------
  // Save Card
  // -----------------------------
  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setCardProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret,
        { payment_method: { card: cardElement } }
      );

      if (error) {
        console.error(error.message);
        showToast(error.message, "error");
        return;
      }

      await savePaymentMethod(setupIntent.payment_method);
      showToast("Card saved successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save card", "error");
    } finally {
      setCardProcessing(false);
    }
  };

  // -----------------------------
  // Global Loader
  // -----------------------------
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
    <div className="font-[Montserrat] w-full mx-auto space-y-8">
      {/* Toasts */}
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() =>
            setToasts((prev) => prev.filter((toast) => toast.id !== t.id))
          }
        />
      ))}
      <h1 className="font-montserrat font-semibold text-2xl text-gray-800 mb-6">
        Your Payouts & Payment Methods
      </h1>

      {/* CARD SECTION */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Payment Method
        </h2>

        {/* No Card + No SetupIntent yet */}
        {!hasCard && !clientSecret && (
          <div>
            <p className="text-gray-600 mb-4">
              No card on file. Add a credit card to enable automatic charges for
              penalties or fees.
            </p>
            <button
              onClick={handleAddCard}
              disabled={cardProcessing || paymentLoading}
              className="px-5 py-2 bg-[#BF9B53] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {cardProcessing ? "Processing..." : "Add Card"}
            </button>
          </div>
        )}

        {/* Setup Intent exists, show card form */}
        {clientSecret && (
          <form onSubmit={handleSaveCard} className="mt-4 space-y-4">
            <div className="p-3 border rounded-lg">
              <CardElement />
            </div>
            <button
              type="submit"
              disabled={cardProcessing || !stripe}
              className="px-5 py-2 bg-[#BF9B53] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {cardProcessing ? "Saving..." : "Save Card"}
            </button>
          </form>
        )}

        {/* Card already saved */}
        {hasCard && !clientSecret && paymentCard && (
          <div className="text-[#BF9B53] font-medium space-y-2">
            <div>
              Card on file: {paymentCard.cardBrand?.toUpperCase()} ****
              {paymentCard.cardLast4}
            </div>
            <div>You can update it by adding a new card.</div>
            <button
              onClick={handleAddCard}
              disabled={cardProcessing}
              className="px-5 py-2 bg-[#BF9B53] text-white rounded-lg mt-2"
            >
              Update Card
            </button>
          </div>
        )}

        {/* Payment errors */}
        {paymentError && <p className="text-red-500 mt-2">{paymentError}</p>}
      </div>

      {/* PAYOUT HISTORY */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Payout History
        </h2>

        {payoutLoading && payoutHistory.length === 0 && (
          <PageLoader
            text="Loading payouts..."
            fullScreen={false}
            size={28}
            color="#BF9B53"
          />
        )}

        {!payoutLoading && payoutHistory.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-lg font-medium">No payouts available yet</div>
            <p className="text-sm mt-2">
              Once shipments are completed and payments are processed, they will
              appear here.
            </p>
          </div>
        )}

        {payoutHistory.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Payout Reference</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Currency</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Transfer Type</th>
                    <th className="p-3 text-left">Arrival Date</th>
                    <th className="p-3 text-left">Processed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutHistory.map((payout) => (
                    <tr
                      key={payout.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-3 text-gray-700 flex items-center gap-2">
                        {visibleIds[payout.id] ? payout.id : maskId(payout.id)}
                        <button
                          onClick={() => toggleId(payout.id)}
                          className="text-[#BF9B53] text-xs font-medium hover:text-gray-700"
                        >
                          {visibleIds[payout.id] ? "Hide" : "View"}
                        </button>
                      </td>
                      <td className="p-3 font-semibold text-gray-900">
                        {Number(payout.amount).toLocaleString(undefined, {
                          style: "currency",
                          currency: payout.currency || "USD",
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-3 uppercase text-gray-600">
                        {payout.currency}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            payout.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : payout.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {payout.status}
                        </span>
                      </td>
                      <td className="p-3 capitalize text-gray-600">
                        {payout.method?.replace("_", " ") || "-"}
                      </td>
                      <td className="p-3 text-gray-600">
                        {payout.arrivalDate
                          ? new Date(payout.arrivalDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-3 text-gray-600">
                        {payout.createdAt
                          ? new Date(payout.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-5 py-2 bg-[#BF9B53] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PayoutAndCardPage;
