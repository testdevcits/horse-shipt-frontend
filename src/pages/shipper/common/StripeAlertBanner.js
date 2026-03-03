import React from "react";
import { useShipperPayments } from "../../../contexts/shipperContext/ShipperPaymentContext";

const StripeAlertBanner = ({ onOpenModal, hideButton }) => {
  const { needsOnboarding } = useShipperPayments();

  if (!needsOnboarding) return null;

  const isDisabled = hideButton; // Payment tab pe true hoga

  return (
    <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-800 px-4 sm:px-6 py-1.5 sm:py-3 flex justify-between items-center font-montserrat">
      <span className="text-xs sm:text-sm font-medium">
        ⚠ Please verify your Stripe account to receive payments.
      </span>

      <button
        onClick={!isDisabled ? onOpenModal : undefined}
        disabled={isDisabled}
        className={`px-3 sm:px-4 py-1 rounded text-xs sm:text-sm transition
          ${
            isDisabled
              ? "bg-yellow-300 text-white cursor-not-allowed opacity-70"
              : "bg-yellow-500 text-white hover:bg-yellow-600"
          }
        `}
      >
        {isDisabled ? "Already on Payment Page" : "Verify Now"}
      </button>
    </div>
  );
};

export default StripeAlertBanner;
