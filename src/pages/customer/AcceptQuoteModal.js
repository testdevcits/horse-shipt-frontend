import React, { useState, useRef, useEffect } from "react";
import { FiX } from "react-icons/fi";
import SignatureCanvas from "react-signature-canvas";
import Toast from "../../components/common/Toast";
import { useCustomerQuote } from "../../contexts/customerContext/CustomerQuoteContext";
import Checkbox from "../../components/common/Checkbox";
import { MdCheckCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const [sigPad, setSigPad] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // RESPONSIVE SIGNATURE
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
    if (submitting || showSuccessPopup) return;
    if (!agreed) return Toast.error("Please agree to the terms");
    if (!sigPad || sigPad.isEmpty())
      return Toast.error("Please provide signature");

    setSubmitting(true);
    const customerSignature = sigPad.toDataURL("image/png");

    try {
      // ────────────── CARD PAYMENT ──────────────
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

      // ────────────── ACCEPT QUOTE ──────────────
      const resAccept = await acceptQuote(quote._id, customerSignature, {
        showSuccessToast: false,
      });

      if (resAccept.success) {
        sigPad.clear();
        setShowSuccessPopup(true);
        setTimeout(() => {
          navigate("/customer/orders");
        }, 1800);
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
  const strongLabelClass = "text-gray-700 font-semibold";
  const shipperContractUrl = quote.shipperContract?.url;
  const shipperContractName =
    quote.shipperContract?.originalName || "Shipper Contract";
  const handleModalClose = () => {
    if (submitting || showSuccessPopup) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-y-auto px-2 sm:px-4 py-4 sm:py-8">
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-emerald-100 shadow-2xl p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
              <MdCheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Quote Accepted
            </h3>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Your quote has been accepted successfully. Redirecting to your
              orders page.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#BF9B53] animate-bounce" />
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#BF9B53] animate-bounce"
                style={{ animationDelay: "0.15s" }}
              />
              <div
                className="w-2.5 h-2.5 rounded-full bg-[#BF9B53] animate-bounce"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          </div>
        </div>
      )}

      {!showSuccessPopup && (
        <div className="bg-white w-full sm:max-w-2xl xl:max-w-7xl rounded-xl flex flex-col overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto">
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 z-10">
            <button
              onClick={handleModalClose}
              disabled={submitting}
              className="absolute right-4 top-4 text-gray-500 hover:text-black transition-colors"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pr-8">
              {isAccepted ? "Quote Details" : "Accept Quote"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isAccepted
                ? "This quote has already been accepted."
                : "Review the quote details and sign digitally to accept."}
            </p>
          </div>

          {/* ── Cancellation Notice ─────────────────────────────────────────── */}
          {quote.cancellationLastDate && (
            <div
              className={`border-b px-4 sm:px-6 py-2 sm:py-3 font-montserrat text-xs sm:text-sm ${
                quote.isCancelled
                  ? "bg-red-100 border-red-300 text-red-700"
                  : isCancellationExpired
                  ? "bg-gray-100 border-gray-300 text-gray-700"
                  : "bg-yellow-100 border-yellow-300 text-yellow-800"
              }`}
            >
              {quote.isCancelled ? (
                "This shipment has already been cancelled."
              ) : isCancellationExpired ? (
                "Cancellation period has expired."
              ) : (
                <>
                  You can cancel until{" "}
                  <span className="font-semibold">
                    {new Date(quote.cancellationLastDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </>
              )}
            </div>
          )}

          {/* ── Body ────────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 vehicle-scroll">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* ──────── LEFT: Quote Details ────────────────────────────── */}
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="border-2 border-[#BF9B53] rounded-lg p-4 bg-amber-50 space-y-2 text-xs sm:text-sm">
                  <div>
                    <p className={strongLabelClass}>Shipper</p>
                    <p className="text-gray-700">
                      {quote.shipper?.companyName ||
                        quote.shipper?.name ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className={strongLabelClass}>Email</p>
                    <p className="text-gray-700 break-all">
                      {quote.shipper?.email}
                    </p>
                  </div>
                  <hr className="border-amber-200 my-2" />
                  <div>
                    <p className={strongLabelClass}>Total Price</p>
                    <p className="text-lg text-[#BF9B53] font-bold">
                      ${quote.totalPrice}
                    </p>
                  </div>
                  <div>
                    <p className={strongLabelClass}>Payment Method</p>
                    <p className="text-gray-700 capitalize">
                      {quote.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <p className={strongLabelClass}>Payment Due</p>
                    <p className="text-gray-700">{quote.paymentDue || "N/A"}</p>
                  </div>
                  <div>
                    <p className={strongLabelClass}>Status</p>
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-semibold capitalize text-xs">
                      {quote.status}
                    </span>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="border rounded-lg p-4 bg-slate-50 space-y-2 text-xs sm:text-sm">
                  <h3 className="font-semibold text-slate-900">Trip Details</h3>
                  <div>
                    <p className={strongLabelClass}>Pickup Time</p>
                    <p className="text-gray-700">{quote.pickupTime || "N/A"}</p>
                  </div>
                  <div>
                    <p className={strongLabelClass}>Est. Arrival</p>
                    <p className="text-gray-700">
                      {quote.estimatedArrivalTime || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Vehicle Info */}
                {quote.vehicle && (
                  <div className="border rounded-lg p-4 bg-slate-50 space-y-2 text-xs sm:text-sm">
                    <h3 className="font-semibold text-slate-900">Vehicle</h3>
                    <div>
                      <p className={strongLabelClass}>Number</p>
                      <p className="text-gray-700">
                        {quote.vehicle.vehicleNumber}
                      </p>
                    </div>
                    <div>
                      <p className={strongLabelClass}>Type</p>
                      <p className="text-gray-700">
                        {quote.vehicle.vehicleType}
                      </p>
                    </div>
                    <div>
                      <p className={strongLabelClass}>Stalls</p>
                      <p className="text-gray-700">
                        {quote.vehicle.numberOfStalls} ×{" "}
                        {quote.vehicle.stallSize}
                      </p>
                    </div>
                  </div>
                )}

                {quote.notes && (
                  <div className="border rounded-lg p-4 bg-slate-50 text-xs sm:text-sm">
                    <p className={strongLabelClass}>Notes</p>
                    <p className="text-gray-700 mt-2">{quote.notes}</p>
                  </div>
                )}
              </div>

              {/* ──────── RIGHT: Actions ────────────────────────────────── */}
              <div className="flex flex-col gap-4">
                <div className="border rounded-lg p-4 bg-white space-y-3">
                  <h3 className="font-semibold text-slate-900">
                    Documents to Review
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Open and review all available documents before accepting
                    this quote.
                  </p>

                  <div className="space-y-2">
                    {quote.contract?.url && (
                      <button
                        type="button"
                        onClick={() => setShowPDF(true)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 border border-[#BF9B53] text-[#9d7d42] hover:bg-[#BF9B53]/10 font-semibold rounded-lg transition-colors text-sm"
                      >
                        <span>Generated Quote Contract</span>
                        <span className="text-xs">View</span>
                      </button>
                    )}

                    {shipperContractUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            shipperContractUrl,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 border border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold rounded-lg transition-colors text-sm"
                      >
                        <span className="truncate">{shipperContractName}</span>
                        <span className="text-xs">Open</span>
                      </button>
                    )}

                    {!quote.contract?.url && !shipperContractUrl && (
                      <p className="text-xs text-gray-500">
                        No supplemental quote documents were attached.
                      </p>
                    )}
                  </div>
                </div>

                {/* Acceptance Form */}
                {isAccepted ? (
                  <div className="border-2 border-emerald-300 bg-emerald-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <MdCheckCircle className="text-emerald-600 w-6 h-6 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-emerald-900">
                          Quote Accepted
                        </h3>
                        <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                          Accepted on{" "}
                          {new Date(
                            quote.contractAcceptedAt
                          ).toLocaleDateString()}
                        </p>
                        {quote.paymentStatus === "paid" && (
                          <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                            Payment Status:{" "}
                            <span className="font-semibold capitalize">
                              {quote.paymentStatus}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-[#BF9B53] rounded-lg p-4 space-y-4 bg-amber-50">
                    {/* Agreement Checkbox */}
                    <Checkbox
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      label={
                        <span className="text-xs sm:text-sm">
                          I agree to accept this quote and terms.
                        </span>
                      }
                    />{" "}
                    <span className="block text-[11px] text-gray-600 mt-1 font-normal">
                      By clicking "Accept Quote," you acknowledge and agree to
                      be bound by the quote details, payment terms, and all
                      supplemental documents, contracts, or addenda provided by
                      the Shipper and attached herein.
                    </span>
                    {/* Card Payment */}
                    {quote.paymentMethod === "card" &&
                      quote.paymentStatus !== "paid" && (
                        <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
                          <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                            Card Details
                          </label>
                          <CardElement options={{ hidePostalCode: true }} />
                        </div>
                      )}
                    {/* Signature */}
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-slate-900">
                        Your Signature <span className="text-red-500">*</span>
                      </label>
                      <div
                        ref={sigWrapperRef}
                        className="w-full border-2 border-slate-300 rounded-lg overflow-hidden bg-white"
                      >
                        {canvasWidth > 0 && (
                          <SignatureCanvas
                            ref={(ref) => setSigPad(ref)}
                            penColor="#22c55e"
                            backgroundColor="transparent"
                            canvasProps={{
                              width: canvasWidth,
                              height: 140,
                              className: "w-full",
                            }}
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => sigPad?.clear()}
                        className="text-xs text-[#BF9B53] hover:text-amber-700 font-semibold"
                      >
                        Clear Signature
                      </button>
                    </div>
                  </div>
                )}

                {showPDF && quote.contract?.url && (
                  <>
                    <div className="border rounded-lg overflow-hidden h-64 sm:h-96">
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer
                          fileUrl={quote.contract.url}
                          plugins={[defaultLayoutPluginInstance]}
                        />
                      </Worker>
                    </div>
                    <button
                      onClick={() => setShowPDF(false)}
                      className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors"
                    >
                      Hide Contract
                    </button>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-4">
                  {isCancelable && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="flex-1 px-4 py-2.5 border border-red-500 text-red-600 hover:bg-red-600 hover:text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      Cancel Quote
                    </button>
                  )}
                  {/* <button
                  onClick={handleModalClose}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors text-sm"
                >
                  {isAccepted ? "Close" : "Close"}
                </button> */}

                  {!isAccepted && (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#BF9B53] to-[#9d7d42] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all text-sm"
                    >
                      {submitting ? "Accepting Quote..." : "Accept Quote"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Modal ───────────────────────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center px-4 py-4">
          <div className="bg-white w-full border border-2 border-[#BF9B53] max-w-sm rounded-md shadow-lg p-6 relative">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-black"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Cancel Quote
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Please provide a reason for cancellation.
            </p>
            <textarea
              className="w-full border-2 border-slate-300 rounded-lg p-3 text-xs sm:text-sm focus:outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20 transition-all resize-none"
              rows={4}
              placeholder="Enter cancel reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg text-sm transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCancelQuote}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptQuoteModal;
