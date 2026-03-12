import React, { useState, useRef, useEffect } from "react";
import { FiX } from "react-icons/fi";
import SignatureCanvas from "react-signature-canvas";
import Toast from "../../components/common/Toast";
import Button from "../../components/common/Button";
import { useCustomerQuote } from "../../contexts/customerContext/CustomerQuoteContext";
import Checkbox from "../../components/common/Checkbox";

// React PDF Viewer
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Stripe
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const AcceptQuoteModal = ({ quote, onClose }) => {
  const { acceptQuote } = useCustomerQuote();
  const stripe = useStripe();
  const elements = useElements();

  const [sigPad, setSigPad] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [showPDF, setShowPDF] = useState(false);

  // RESPONSIVE SIGNATURE ONLY
  const sigWrapperRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (sigWrapperRef.current)
        setCanvasWidth(sigWrapperRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: "", type: "", visible: false }), 3000);
  };

  const handleSubmit = async () => {
    if (!agreed) return showToast("Please agree to the terms", "error");
    if (!sigPad || sigPad.isEmpty())
      return showToast("Please provide signature", "error");

    setSubmitting(true);
    const customerSignature = sigPad.toDataURL("image/png");

    try {
      // ---------------- CARD PAYMENT ----------------
      if (quote.paymentMethod === "card" && quote.paymentStatus !== "paid") {
        if (!stripe || !elements) {
          showToast("Stripe is not loaded", "error");
          setSubmitting(false);
          return;
        }

        // Correct endpoint
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
          showToast("Failed to create payment intent", "error");
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
          showToast(result.error.message, "error");
          setSubmitting(false);
          return;
        }

        if (result.paymentIntent.status !== "succeeded") {
          showToast("Payment failed", "error");
          setSubmitting(false);
          return;
        }

        showToast("Payment successful", "success");
      }

      // ---------------- ACCEPT QUOTE ----------------
      const resAccept = await acceptQuote(quote._id, customerSignature);

      if (resAccept.success) {
        showToast("Quote accepted successfully", "success");
        sigPad.clear();
        onClose();
      } else {
        showToast(resAccept.message || "Failed to accept quote", "error");
      }
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message || "Failed to accept quote",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const strongLabelClass = "text-gray-600";

  return (
    <>
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "", visible: false })}
        />
      )}

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
            <h2 className="text-2xl font-semibold">Accept Quote</h2>
            <p className="text-gray-600 mt-1">
              Review the quote details and sign digitally to accept.
            </p>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="space-y-4">
              <div className="border rounded-md p-4 bg-gray-50 space-y-2">
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
                  <strong className={strongLabelClass}>
                    Estimated Arrival:
                  </strong>{" "}
                  {quote.estimatedArrivalTime || "N/A"}
                </p>
                <p>
                  <strong className={strongLabelClass}>Transport Type:</strong>{" "}
                  {quote.transportType}
                </p>
                <p>
                  <strong className={strongLabelClass}>Stalls Required:</strong>{" "}
                  {quote.stallsRequired}
                </p>
                <p>
                  <strong className={strongLabelClass}>Status:</strong>{" "}
                  {quote.status}
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
                    <strong className={strongLabelClass}>
                      Vehicle Number:
                    </strong>{" "}
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

              {/* TERMS + SIGNATURE + CARD */}
              <div className="border rounded-md p-4 space-y-3">
                <Checkbox
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  label="I agree to accept this quote and terms"
                />

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

              {/* ACTIONS */}
              <div className="flex gap-3 mt-auto">
                <Button variant="secondary" fullWidth onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? "Submitting..." : "Accept Quote"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AcceptQuoteModal;
