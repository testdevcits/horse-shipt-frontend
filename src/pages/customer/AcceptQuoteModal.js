import React, { useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { FiX } from "react-icons/fi";
import Toast from "../../components/common/Toast";
import Button from "../../components/common/Button";
import { useCustomerQuote } from "../../contexts/customerContext/CustomerQuoteContext";

const AcceptQuoteModal = ({ quote, onClose }) => {
  const { acceptQuote } = useCustomerQuote();
  const [sigPad, setSigPad] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

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
      const res = await acceptQuote(quote._id, customerSignature);
      if (res.success) {
        showToast("Quote accepted successfully", "success");
        sigPad.clear();
        onClose();
      } else {
        showToast(res.message || "Failed to accept quote", "error");
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

  return (
    <>
      {/* Toast */}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "", visible: false })}
        />
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto px-4 py-8">
        <div className="bg-white w-full max-w-[95%] xl:max-w-[1400px] rounded-[14px] flex flex-col overflow-hidden shadow-xl">
          {/* Header */}
          <div className="relative p-6 border-b bg-white sticky top-0 z-10">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-500 hover:text-black transition"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-2xl font-semibold">Accept Quote</h2>
            <p className="text-gray-600 mt-1">
              Review the quote details and sign digitally to accept.
            </p>
          </div>

          {/* Body (Scrollable only) */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left Column: Quote Details */}
            <div className="space-y-4">
              <div className="border rounded-md p-4 bg-gray-50 space-y-2">
                <p>
                  <strong>Shipper:</strong>{" "}
                  {quote.shipper?.companyName || quote.shipper?.name}
                </p>
                <p>
                  <strong>Email:</strong> {quote.shipper?.email}
                </p>
                <p>
                  <strong>Total Price:</strong> ${quote.totalPrice}
                </p>
                <p>
                  <strong>Currency:</strong> {quote.currency}
                </p>
                <p>
                  <strong>Payment Method:</strong> {quote.paymentMethod}
                </p>
                <p>
                  <strong>Payment Due:</strong> {quote.paymentDue}
                </p>
                <p>
                  <strong>Pickup Time:</strong> {quote.pickupTime || "N/A"}
                </p>
                <p>
                  <strong>Estimated Arrival:</strong>{" "}
                  {quote.estimatedArrivalTime || "N/A"}
                </p>
                <p>
                  <strong>Transport Type:</strong> {quote.transportType}
                </p>
                <p>
                  <strong>Stalls Required:</strong> {quote.stallsRequired}
                </p>
                <p>
                  <strong>Status:</strong> {quote.status}
                </p>
                {quote.notes && (
                  <p>
                    <strong>Notes:</strong> {quote.notes}
                  </p>
                )}
              </div>

              {quote.vehicle && (
                <div className="border rounded-md p-4 bg-gray-50 space-y-2">
                  <h3 className="font-medium text-lg">Vehicle Info</h3>
                  <p>
                    <strong>Vehicle Number:</strong>{" "}
                    {quote.vehicle.vehicleNumber}
                  </p>
                  <p>
                    <strong>Vehicle Type:</strong> {quote.vehicle.vehicleType}
                  </p>
                  <p>
                    <strong>Stalls:</strong> {quote.vehicle.numberOfStalls} -{" "}
                    {quote.vehicle.stallSize}
                  </p>
                  {quote.vehicle.notes && (
                    <p>
                      <strong>Notes:</strong> {quote.vehicle.notes}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Contract PDF & Signature */}
            <div className="flex flex-col gap-6">
              {quote.contract?.url && (
                <div className="border rounded-md p-4 h-[400px] overflow-hidden">
                  <h3 className="font-medium text-lg mb-2">Contract</h3>
                  {/* VIEW ONLY IFRAME - NO DOWNLOAD */}
                  <iframe
                    src={quote.contract.url}
                    title="Contract PDF"
                    className="w-full h-full"
                    frameBorder="0"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              )}

              {/* Terms & Signature */}
              <div className="border rounded-md p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    id="agreeTerms"
                  />
                  <label htmlFor="agreeTerms" className="text-gray-700">
                    I agree to accept this quote and terms
                  </label>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Your Signature
                  </label>
                  <SignatureCanvas
                    ref={(ref) => setSigPad(ref)}
                    penColor="#22c55e"
                    backgroundColor="#f8f8f8"
                    canvasProps={{
                      width: 500,
                      height: 150,
                      className: "border rounded-md w-full",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => sigPad.clear()}
                    className="mt-2 text-sm text-system-primary hover:text-[#22c55e]"
                  >
                    Clear Signature
                  </button>
                </div>
              </div>

              {/* Actions */}
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
