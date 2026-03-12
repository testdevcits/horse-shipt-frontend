import React, { useEffect } from "react";
import { useShipperPayments } from "../../contexts/shipperContext/ShipperPaymentContext";
import PageLoader from "../../components/common/PageLoader";

const PaymentsSettings = () => {
  const { stripeStatus, loading, error, fetchStripeStatus, enablePayments } =
    useShipperPayments();

  useEffect(() => {
    fetchStripeStatus();
  }, [fetchStripeStatus]);

  if (loading) {
    return <PageLoader text="" fullScreen={false} size={28} color="#BF9B53" />;
  }

  const isVerified = stripeStatus?.verified === true;
  const needsVerification = stripeStatus?.needsVerification === true;

  return (
    <div className="w-full max-w-3xl mx-auto font-[Montserrat] animate-slide-fade-in">
      {/* PAGE HEADER */}
      <div className="mb-6">
        <h2 className="text-[20px] font-semibold text-gray-800">
          Payment Settings
        </h2>

        <p className="text-gray-600 mt-2 text-[14px]">
          Connect your Stripe account to securely receive payments and payouts.
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white shadow-md border border-gray-200 rounded-xl p-6 space-y-6">
        {/* SECURITY BADGE */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
          <span className="text-green-600 text-lg">🔒</span>
          <p className="text-sm text-gray-600">
            All payments are securely processed via Stripe.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* ACCOUNT NOT CREATED */}
        {!stripeStatus && (
          <div className="space-y-4">
            <p className="text-gray-600">
              You have not connected a Stripe account yet.
            </p>

            <button
              onClick={enablePayments}
              className="bg-system-primary hover:opacity-90 transition text-white px-6 py-2 rounded-md"
            >
              Create Stripe Account
            </button>
          </div>
        )}

        {/* ONBOARDING NOT COMPLETE */}
        {stripeStatus && !stripeStatus?.onboardingCompleted && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Complete your Stripe onboarding to start receiving payments.
            </p>

            <button
              onClick={enablePayments}
              className="bg-system-primary hover:opacity-90 transition text-white px-6 py-2 rounded-md"
            >
              Continue Setup
            </button>
          </div>
        )}

        {/* VERIFICATION REQUIRED */}
        {stripeStatus?.onboardingCompleted && needsVerification && (
          <div className="space-y-4">
            <div className="bg-yellow-100 text-yellow-700 px-4 py-3 rounded-md">
              Your Stripe account requires additional verification to enable
              payouts.
            </div>

            <button
              onClick={enablePayments}
              className="bg-system-primary hover:opacity-90 transition text-white px-6 py-2 rounded-md"
            >
              Complete Verification
            </button>
          </div>
        )}

        {/* PAYMENTS ACTIVE */}
        {stripeStatus &&
          stripeStatus?.onboardingCompleted &&
          isVerified &&
          !needsVerification && (
            <div className="flex items-center justify-between bg-green-100 border border-green-200 rounded-md px-5 py-4">
              <div>
                <p className="text-green-700 font-medium">Payments Active</p>
                <p className="text-sm text-green-600">
                  Your Stripe account is connected and ready to receive payouts.
                </p>
              </div>

              {/* <span className="text-2xl">✅</span> */}
            </div>
          )}
      </div>
    </div>
  );
};

export default PaymentsSettings;
