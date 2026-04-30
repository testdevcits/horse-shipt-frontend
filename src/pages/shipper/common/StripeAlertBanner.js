import React from "react";
import { useShipperPayments } from "../../../contexts/shipperContext/ShipperPaymentContext";

const StripeAlertBanner = ({ onOpenModal, hideButton }) => {
  const { needsOnboarding } = useShipperPayments();

  if (!needsOnboarding) return null;

  const isDisabled = hideButton;

  return (
    <div className="w-full bg-[#BF9B53]  shadow-sm px-2 sm:px-4 py-2 sm:py-2 flex items-center justify-between font-montserrat">
      {/* Left Content */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-white">
          Please verify your Stripe account to receive payments.
        </span>
      </div>

      {/* Button */}
      {!isDisabled && (
        <button
          onClick={onOpenModal}
          className="px-2 py-1 text-xs sm:text-sm font-medium bg-white text-[#BF9B53] rounded-sm active:scale-[0.98] transition-all"
        >
          Verify Now
        </button>
      )}
    </div>
  );
};

export default StripeAlertBanner;
