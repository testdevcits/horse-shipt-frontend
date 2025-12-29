import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import SignatureCanvas from "react-signature-canvas";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
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
    if (!agreed) {
      showToast("Please agree to the terms before submitting", "error");
      return;
    }

    if (!sigPad || sigPad.isEmpty()) {
      showToast("Please provide your digital signature", "error");
      return;
    }

    setSubmitting(true);
    const customerSignature = sigPad.toDataURL("image/png");
    const res = await acceptQuote(quote._id, customerSignature);

    if (res.success) {
      showToast("Quote accepted successfully", "success");
      sigPad.clear();
      onClose();
    }

    setSubmitting(false);
  };

  return (
    <>
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "", visible: false })}
        />
      )}

      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-3">
        <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[14px] flex flex-col overflow-hidden">
          <div className="relative p-5 border-b">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-500"
            >
              <FiX size={22} />
            </button>
            <h2 className="text-lg font-semibold">Accept Quote</h2>
            <p className="text-sm text-gray-500 mt-1">
              Please review the quote and sign digitally to accept.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Quote Details */}
            <div className="border rounded-md p-4 bg-gray-50 space-y-2 text-sm">
              <p>
                <strong>Shipper:</strong>{" "}
                {quote.shipper?.companyName || quote.shipper?.name}
              </p>
              <p>
                <strong>Total Price:</strong> ${quote.totalPrice}
              </p>
              <p>
                <strong>Payment Method:</strong> {quote.paymentMethod}
              </p>
              <p>
                <strong>Pickup Time:</strong> {quote.pickupTime || "N/A"}
              </p>
              <p>
                <strong>Estimated Arrival:</strong>{" "}
                {quote.estimatedArrivalTime || "N/A"}
              </p>
              {quote.notes && (
                <p>
                  <strong>Notes:</strong> {quote.notes}
                </p>
              )}
            </div>

            {/* Agree Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                id="agreeTerms"
              />
              <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                I agree to accept this quote and terms
              </label>
            </div>

            {/* Signature */}
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

            {/* Submit / Cancel */}
            <div className="p-4 border-t flex gap-3">
              <Button variant="secondary" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                disabled={submitting}
                onClick={handleSubmit}
              >
                Accept Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AcceptQuoteModal;
