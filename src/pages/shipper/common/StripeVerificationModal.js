import React from "react";
import { useNavigate } from "react-router-dom";

const StripeVerificationModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = () => {
    onClose();
    navigate("/shipper/settings?tab=payment");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4 font-montserrat">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        {/* Title */}
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Complete Your Payment Setup
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">
          To start receiving payments from shipments, you need to complete your
          Stripe account verification. This ensures secure and seamless payouts
          directly to your bank account.
        </p>

        {/* Why Needed */}
        <div className="bg-gray-50 border rounded-md p-4 mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Why is this required?
          </h3>
          <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li>Receive shipment payments directly to your bank account</li>
            <li>Ensure secure and verified transactions</li>
            <li>Comply with financial and regulatory requirements</li>
            <li>Avoid delays in payout processing</li>
          </ul>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 mb-6">
          Your information is securely processed by Stripe. We do not store your
          banking details on our servers.
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100 transition"
          >
            Remind Me Later
          </button>

          <button
            onClick={handleNavigate}
            className="px-4 py-2 bg-system-primary text-white rounded-md text-sm hover:opacity-90 transition"
          >
            Set Up Payments
          </button>
        </div>
      </div>
    </div>
  );
};

export default StripeVerificationModal;
