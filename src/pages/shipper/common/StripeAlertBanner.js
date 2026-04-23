import React from "react";
import { useShipperPayments } from "../../../contexts/shipperContext/ShipperPaymentContext";

const StripeAlertBanner = ({ onOpenModal, hideButton }) => {
  const { needsOnboarding } = useShipperPayments();

  if (!needsOnboarding) return null;

  const isDisabled = hideButton;

  return (
    <div className="w-full bg-[#BF9B53]  shadow-sm px-2 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between font-montserrat">
      {/* Left Content */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-white">
          Please verify your Stripe account to receive payments.
        </span>
      </div>

      {/* Button */}
      <button
        onClick={!isDisabled ? onOpenModal : undefined}
        disabled={isDisabled}
        className={`px-2 py-1 text-xs sm:text-sm font-medium transition-all rounded-sm
          ${
            isDisabled
              ? "bg-white text-yellow-700 cursor-not-allowed opacity-90"
              : "bg-white text-[#BF9B53]  active:scale-[0.98]"
          }
        `}
      >
        {isDisabled ? "On Payment Page" : "Verify Now"}
      </button>
    </div>
  );
};

export default StripeAlertBanner;
