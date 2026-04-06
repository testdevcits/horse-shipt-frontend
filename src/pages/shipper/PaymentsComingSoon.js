import React, { useEffect } from "react";
import { useShipperPayments } from "../../contexts/shipperContext/ShipperPaymentContext";
import PageLoader from "../../components/common/PageLoader";
import comingSoonImg from "../../assets/images/defultlogo.png";

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const StatusStep = ({ done, active, label, isLast, isFirst }) => (
  <div className="flex flex-col items-center gap-1 flex-1">
    <div className="flex items-center w-full">
      <div
        className={`flex-1 h-px ${
          isFirst ? "opacity-0" : done ? "bg-[#BF9B53]" : "bg-gray-200"
        }`}
      />

      {/* Step circle */}
      <div
        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border-2 z-10
          ${
            done
              ? "bg-[#BF9B53] border-[#BF9B53] text-white"
              : active
              ? "bg-[#FDF4E3] border-[#BF9B53] text-[#BF9B53]"
              : "bg-white border-gray-300 text-gray-400"
          }`}
      >
        {done ? (
          <CheckIcon />
        ) : (
          <span className="text-[9px] font-bold leading-none">
            {active ? "●" : "○"}
          </span>
        )}
      </div>

      {/* Right connector line */}
      <div
        className={`flex-1 h-px ${
          isLast ? "opacity-0" : done ? "bg-[#BF9B53]" : "bg-gray-200"
        }`}
      />
    </div>

    {/* Label */}
    <span
      className={`text-[10px] sm:text-[11px] text-center leading-tight mt-0.5 px-0.5
        ${
          done
            ? "text-gray-700 font-medium"
            : active
            ? "text-[#92701E] font-medium"
            : "text-gray-400"
        }`}
    >
      {label}
    </span>
  </div>
);

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
  const onboardingDone = stripeStatus?.onboardingCompleted === true;
  const isFullyActive =
    stripeStatus && onboardingDone && isVerified && !needsVerification;

  const step1Done = !!stripeStatus;
  const step2Done = onboardingDone;
  const step3Done = isVerified && !needsVerification;

  let ctaLabel = null;
  let ctaAction = null;
  let statusMessage = null;
  let statusType = null;

  if (!stripeStatus) {
    ctaLabel = "Set up payout account";
    ctaAction = enablePayments;
    statusMessage =
      "Connect your payout account to start receiving payments for your horse shipments.";
    statusType = "idle";
  } else if (!onboardingDone) {
    ctaLabel = "Continue setup";
    ctaAction = enablePayments;
    statusMessage =
      "You're almost there — complete your account setup to activate payouts.";
    statusType = "progress";
  } else if (needsVerification) {
    ctaLabel = "Complete verification";
    ctaAction = enablePayments;
    statusMessage =
      "Your account needs additional verification before payouts can be enabled.";
    statusType = "warning";
  } else if (isFullyActive) {
    statusMessage =
      "Your payout account is connected and ready to receive payments for your shipments.";
    statusType = "success";
  }

  return (
    <div className="w-full max-w-full mx-auto font-[Montserrat] animate-slide-fade-in">
      {/* ── Page Header ── */}
      <div className="mb-5 sm:mb-7">
        <h2 className="text-[18px] sm:text-[20px] font-semibold text-gray-900 tracking-tight">
          Payment Settings
        </h2>
        <p className="text-[13px] sm:text-[14px] text-gray-500 mt-1.5 leading-relaxed">
          Set up your payout account to securely receive payments for completed
          horse shipments.
        </p>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3 mb-4">
          <span className="flex-shrink-0 mt-0.5">
            <AlertIcon />
          </span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Main Card ── */}
      <div className="bg-white border border-[#E8D5A3] rounded-md overflow-hidden shadow-[0_1px_4px_0_rgba(191,155,83,0.08)]">
        {/* Card Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-[#FFFDF7] border-b border-[#F0E4C0]">
          <div className="flex items-center justify-between gap-2">
            {/* Logo + Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-white border border-[#F0D98A] flex items-center justify-center flex-shrink-0 p-1.5">
                <img
                  src={comingSoonImg}
                  alt="Horse Shipper"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] sm:text-[14px] font-semibold text-gray-800 leading-tight truncate">
                  Horse Shipper Payout Account
                </p>
                <p className="text-[11px] sm:text-[12px] text-gray-400 mt-0.5 leading-tight">
                  Receive payments for completed shipments
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0">
              {isFullyActive && (
                <span className="text-[10px] sm:text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 sm:px-2.5 py-1 whitespace-nowrap">
                  ● Active
                </span>
              )}
              {statusType === "warning" && (
                <span className="text-[10px] sm:text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 sm:px-2.5 py-1 whitespace-nowrap">
                  ⚠ Needed
                </span>
              )}
              {(statusType === "progress" || statusType === "idle") && (
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#92701E] bg-[#FDF6E7] border border-[#F0D98A] rounded-full px-2 sm:px-2.5 py-1 whitespace-nowrap">
                  Not connected
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-6 pt-4 pb-3 border-b border-[#F5F0E8]">
          <div className="flex items-start w-full">
            <StatusStep
              done={step1Done}
              active={!step1Done}
              label="Create account"
              isFirst={true}
              isLast={false}
            />

            <StatusStep
              done={step2Done}
              active={step1Done && !step2Done}
              label="Complete setup"
              isFirst={false}
              isLast={false}
            />

            <StatusStep
              done={step3Done}
              active={step2Done && !step3Done}
              label="Verify identity"
              isFirst={false}
              isLast={true}
            />
          </div>
        </div>

        {/* ── Status Body ── */}
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          {/* Success */}
          {statusType === "success" && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-md px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 flex-shrink-0">
                <CheckIcon />
              </div>
              <div>
                <p className="text-[13px] sm:text-[14px] font-semibold text-green-700 m-0 leading-tight">
                  Payout account active
                </p>
                <p className="text-[12px] sm:text-[13px] text-green-600 mt-1 leading-relaxed">
                  {statusMessage}
                </p>
              </div>
            </div>
          )}

          {/* Warning */}
          {statusType === "warning" && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                <AlertIcon />
              </div>
              <div>
                <p className="text-[13px] sm:text-[14px] font-semibold text-amber-700 m-0 leading-tight">
                  Verification required
                </p>
                <p className="text-[12px] sm:text-[13px] text-amber-600 mt-1 leading-relaxed">
                  {statusMessage}
                </p>
              </div>
            </div>
          )}

          {/* Idle / Progress */}
          {(statusType === "idle" || statusType === "progress") && (
            <p className="text-[13px] sm:text-[14px] text-gray-500 leading-relaxed mb-4">
              {statusMessage}
            </p>
          )}

          {/* CTA — full width on mobile */}
          {ctaLabel && (
            <button
              onClick={ctaAction}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#BF9B53] hover:opacity-90 active:opacity-80 transition-opacity text-white text-[13px] sm:text-[14px] font-semibold rounded-xl px-5 py-3 sm:py-2.5 cursor-pointer border-none"
            >
              {ctaLabel}
              <ArrowIcon />
            </button>
          )}
        </div>

        {/* ── Card Footer ── */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-3 bg-[#FFFDF7] border-t border-[#F0E4C0]">
          <span className="text-[#BF9B53] flex flex-shrink-0">
            <ShieldIcon />
          </span>
          <p className="text-[11px] sm:text-[12px] text-[#a78542] m-0 leading-relaxed">
            All transactions are encrypted and securely processed through your
            payout account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentsSettings;
