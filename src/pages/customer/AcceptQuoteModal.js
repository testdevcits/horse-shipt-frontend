import React, { useState, useRef, useEffect } from "react";
import { FiX } from "react-icons/fi";
import SignatureCanvas from "react-signature-canvas";
import Toast from "../../components/common/Toast";
import Button from "../../components/common/Button";
import { useCustomerQuote } from "../../contexts/customerContext/CustomerQuoteContext";
import Checkbox from "../../components/common/Checkbox";
import { MdCheckCircle } from "react-icons/md";

import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Stripe
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const AcceptQuoteModal = ({ quote, onClose }) => {
  const { acceptQuote, cancelQuote } = useCustomerQuote();
  const stripe = useStripe();
  const elements = useElements();

  const [sigPad, setSigPad] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // RESPONSIVE SIGNATURE ONLY
  const sigWrapperRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

  const isAccepted = quote.status === "accepted";

  const isCancellationExpired =
    quote.cancellationLastDate &&
    new Date(quote.cancellationLastDate) < new Date();

  const isCancelable =
    quote?.cancellationLastDate &&
    new Date() < new Date(quote.cancellationLastDate) &&
    !quote.isCancelled;

  useEffect(() => {
    const updateWidth = () => {
      if (sigWrapperRef.current)
        setCanvasWidth(sigWrapperRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleSubmit = async () => {
    if (!agreed) return Toast.error("Please agree to the terms");
    if (!sigPad || sigPad.isEmpty())
      return Toast.error("Please provide signature");

    setSubmitting(true);
    const customerSignature = sigPad.toDataURL("image/png");

    try {
      // ---------------- CARD PAYMENT ----------------
      if (quote.paymentMethod === "card" && quote.paymentStatus !== "paid") {
        if (!stripe || !elements) {
          Toast.error("Stripe is not loaded");
          setSubmitting(false);
          return;
        }

        const res = await fetch(
          `https://horse-shipt.vercel.app/api/customer/quotes/${quote._id}/pay`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const paymentData = await res.json();

        if (!paymentData.clientSecret) {
          Toast.error("Failed to create payment intent");
          setSubmitting(false);
          return;
        }

        const result = await stripe.confirmCardPayment(
          paymentData.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
            },
          }
        );

        if (result.error) {
          Toast.error(result.error.message);
          setSubmitting(false);
          return;
        }

        if (result.paymentIntent.status !== "succeeded") {
          Toast.error("Payment failed");
          setSubmitting(false);
          return;
        }

        Toast.success("Payment successful");
      }

      // ---------------- ACCEPT QUOTE ----------------
      const resAccept = await acceptQuote(quote._id, customerSignature);

      if (resAccept.success) {
        Toast.success("Quote accepted successfully");
        sigPad.clear();
        onClose();
      } else {
        Toast.error(resAccept.message || "Failed to accept quote");
      }
    } catch (error) {
      console.error(error);
      Toast.error(error?.response?.data?.message || "Failed to accept quote");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelQuote = async () => {
    try {
      if (!cancelReason.trim()) {
        return Toast.error("Please enter cancel reason");
      }

      const res = await cancelQuote(quote._id, cancelReason);

      if (res.success) {
        Toast.success("Quote cancelled successfully");
        setShowCancelModal(false);
        onClose();
      } else {
        Toast.error(res.message || "Cancel failed");
      }
    } catch (err) {
      Toast.error("Something went wrong");
    }
  };

  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const strongLabelClass = "text-gray-600";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto px-4 py-8">
      <div className="bg-white w-full max-w-[95%] xl:max-w-[1400px] rounded-[14px] flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="relative p-6 border-b">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-500 hover:text-black"
          >
            <FiX size={24} />
          </button>
          <h2 className="text-2xl font-semibold">
            {isAccepted ? "Quote Details" : "Accept Quote"}
          </h2>
          <p className="text-gray-600 mt-1">
            {isAccepted
              ? "This quote has already been accepted."
              : "Review the quote details and sign digitally to accept."}
          </p>
        </div>

        {quote.cancellationLastDate && (
          <p
            className={`border-b px-4 sm:px-6 py-1.5 sm:py-3 font-montserrat ${
              quote.isCancelled
                ? "bg-red-100 border-red-300 text-red-600"
                : isCancellationExpired
                ? "bg-gray-100 border-gray-300 text-gray-600"
                : "bg-yellow-100 border-yellow-300 text-yellow-800"
            }`}
          >
            {quote.isCancelled ? (
              "This shipment has already been cancelled."
            ) : isCancellationExpired ? (
              "Cancellation period has expired."
            ) : (
              <>
                You can cancel this shipment until{" "}
                <span className="font-medium">
                  {new Date(quote.cancellationLastDate).toLocaleString()}
                </span>
                . After this period, cancellation will not be allowed.
              </>
            )}
          </p>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* LEFT */}
          <div className="space-y-4">
            <div className="border border-[#BF9B53] rounded-md p-4 bg-gray-50 space-y-2">
              <p>
                <strong className={strongLabelClass}>Shipper:</strong>{" "}
                {quote.shipper?.companyName || quote.shipper?.name}
              </p>
              <p>
                <strong className={strongLabelClass}>Email:</strong>{" "}
                {quote.shipper?.email}
              </p>
              <p>
                <strong className={strongLabelClass}>Total Price:</strong> $
                {quote.totalPrice}
              </p>
              <p>
                <strong className={strongLabelClass}>Currency:</strong>{" "}
                {quote.currency}
              </p>
              <p>
                <strong className={strongLabelClass}>Payment Method:</strong>{" "}
                {quote.paymentMethod}
              </p>
              <p>
                <strong className={strongLabelClass}>Payment Due:</strong>{" "}
                {quote.paymentDue}
              </p>
              <p>
                <strong className={strongLabelClass}>Pickup Time:</strong>{" "}
                {quote.pickupTime || "N/A"}
              </p>
              <p>
                <strong className={strongLabelClass}>Estimated Arrival:</strong>{" "}
                {quote.estimatedArrivalTime || "N/A"}
              </p>
              <p>
                <strong className={strongLabelClass}>Transport Type:</strong>{" "}
                {quote.transportType || "N/A"}
              </p>
              <p>
                <strong className={strongLabelClass}>Stalls Required:</strong>{" "}
                {quote.stallsRequired || "N/A"}
              </p>
              <p>
                <strong className={strongLabelClass}>Status:</strong>{" "}
                <span className="capitalize font-medium text-emerald-600">
                  {quote.status}
                </span>
              </p>
              {quote.notes && (
                <p>
                  <strong className={strongLabelClass}>Notes:</strong>{" "}
                  {quote.notes}
                </p>
              )}
            </div>

            {quote.vehicle && (
              <div className="border rounded-md p-4 bg-gray-50 space-y-2">
                <h3 className="font-medium text-lg">Vehicle Info</h3>
                <p>
                  <strong className={strongLabelClass}>Vehicle Number:</strong>{" "}
                  {quote.vehicle.vehicleNumber}
                </p>
                <p>
                  <strong className={strongLabelClass}>Vehicle Type:</strong>{" "}
                  {quote.vehicle.vehicleType}
                </p>
                <p>
                  <strong className={strongLabelClass}>Stalls:</strong>{" "}
                  {quote.vehicle.numberOfStalls} - {quote.vehicle.stallSize}
                </p>
                {quote.vehicle.notes && (
                  <p>
                    <strong className={strongLabelClass}>Notes:</strong>{" "}
                    {quote.vehicle.notes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-6">
            {quote.contract?.url && !showPDF && (
              <Button
                variant="primary"
                fullWidth
                onClick={() => setShowPDF(true)}
              >
                View Contract
              </Button>
            )}

            {showPDF && quote.contract?.url && (
              <>
                <div className="border rounded-md p-2 h-[400px] overflow-auto">
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer
                      fileUrl={quote.contract.url}
                      plugins={[defaultLayoutPluginInstance]}
                    />
                  </Worker>
                </div>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowPDF(false)}
                >
                  Hide Contract
                </Button>
              </>
            )}

            {showCancelModal && (
              <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4">
                <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="absolute right-4 top-4 text-gray-500 hover:text-black"
                  >
                    <FiX size={20} />
                  </button>
                  <h2 className="text-xl font-semibold mb-2">Cancel Quote</h2>
                  <p className="text-gray-600 mb-4">
                    Please provide a reason for cancellation.
                  </p>
                  <textarea
                    className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    rows={4}
                    placeholder="Enter cancel reason..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <div className="flex gap-3 mt-5">
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => setShowCancelModal(false)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="danger"
                      fullWidth
                      onClick={handleCancelQuote}
                    >
                      Confirm Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isAccepted ? (
              <div className="border border-emerald-300 bg-emerald-50 rounded-md p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <MdCheckCircle className="text-emerald-600 w-6 h-6" />
                  <h3 className="text-emerald-700 font-semibold text-lg">
                    Quote Already Accepted
                  </h3>
                </div>
                <p className="text-sm text-emerald-700">
                  This quote was accepted on{" "}
                  <span className="font-medium">
                    {new Date(quote.contractAcceptedAt).toLocaleString()}
                  </span>
                  .
                </p>
                {quote.paymentStatus === "paid" && (
                  <p className="text-sm text-emerald-700">
                    Payment Status:{" "}
                    <span className="font-semibold capitalize">
                      {quote.paymentStatus}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <div className="border border-[#BF9B53] rounded-md p-4 space-y-3">
                <Checkbox
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  label="I agree to accept this quote and terms"
                />
                {!isCancellationExpired && (
                  <p className="text-[11px] text-gray-500">
                    Note: Cancellation is only allowed within the specified time
                    window.
                  </p>
                )}

                {quote.paymentMethod === "card" &&
                  quote.paymentStatus !== "paid" && (
                    <div className="border rounded-md p-2 mt-2">
                      <label className="block mb-1 font-medium text-gray-700">
                        Card Details
                      </label>
                      <CardElement options={{ hidePostalCode: true }} />
                    </div>
                  )}

                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Your Signature
                  </label>
                  <div
                    ref={sigWrapperRef}
                    className="w-full border rounded-md overflow-hidden"
                  >
                    {canvasWidth > 0 && (
                      <SignatureCanvas
                        ref={(ref) => setSigPad(ref)}
                        penColor="#22c55e"
                        backgroundColor="transparent"
                        canvasProps={{
                          width: canvasWidth,
                          height: 150,
                          className: "w-full",
                        }}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => sigPad.clear()}
                    className="mt-2 text-sm text-system-primary hover:text-[#22c55e]"
                  >
                    Clear Signature
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-auto">
              <Button variant="google" fullWidth onClick={onClose}>
                {isAccepted ? "Close" : "Cancel"}
              </Button>
              {isCancelable && (
                <Button
                  variant="google"
                  fullWidth
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Quote
                </Button>
              )}
              {!isAccepted && (
                <Button
                  variant="primary"
                  fullWidth
                  disabled={submitting || isCancellationExpired}
                  onClick={handleSubmit}
                >
                  {submitting ? "Submitting..." : "Accept Quote"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptQuoteModal;
