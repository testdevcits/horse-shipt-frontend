import React, { useEffect } from "react";
import { useShipperPayments } from "../../contexts/shipperContext/ShipperPaymentContext";

const PaymentsSettings = () => {
  const { stripeStatus, loading, fetchStripeStatus, enablePayments } =
    useShipperPayments();

  useEffect(() => {
    fetchStripeStatus();
  }, [fetchStripeStatus]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const isVerified = stripeStatus?.verified;

  return (
    <div className="w-full flex flex-col items-center py-10 text-center">
      <h2 className="text-xl font-semibold mb-6">Payment Settings</h2>

      {!stripeStatus?.onboardingCompleted && (
        <>
          <p className="mb-6 text-gray-600">
            Connect your Stripe account to receive payments.
          </p>

          <button
            onClick={enablePayments}
            className="bg-system-primary text-white px-6 py-3 rounded-md"
          >
            Enable Payments
          </button>
        </>
      )}

      {stripeStatus?.onboardingCompleted && !isVerified && (
        <p className="text-yellow-600">
          Your Stripe account is under verification.
        </p>
      )}

      {isVerified && (
        <div className="bg-green-100 text-green-700 px-6 py-3 rounded-md">
          ✅ Payments Active
        </div>
      )}
    </div>
  );
};

export default PaymentsSettings;
