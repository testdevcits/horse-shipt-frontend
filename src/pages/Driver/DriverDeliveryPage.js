import React, { useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDriverAuth } from "../../contexts/DriverAuthContext";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiSend,
  FiAlertCircle,
  FiCheck,
  FiUser,
} from "react-icons/fi";
import { TbPasswordMobilePhone, TbRouteSquare, TbTruck } from "react-icons/tb";
import Toast from "../../components/common/Toast";

/* ─── Step Indicator ─── */
const Step = ({ number, label, active, done }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all ${
        done
          ? "bg-[#BF9B53] border-[#BF9B53] text-white"
          : active
          ? "bg-white border-[#BF9B53] text-[#BF9B53] shadow-sm"
          : "bg-gray-100 border-gray-200 text-gray-400"
      }`}
    >
      {done ? <FiCheck size={15} /> : number}
    </div>
    <span
      className={`text-[10px] font-black whitespace-nowrap ${
        active ? "text-[#BF9B53]" : done ? "text-gray-500" : "text-gray-300"
      }`}
    >
      {label}
    </span>
  </div>
);

/* ─── OTP Input ─── */
const OtpInput = ({ value, onChange }) => {
  const inputRefs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] || "");

  const setOtpValue = (nextDigits) => {
    onChange(nextDigits.join("").replace(/\D/g, "").slice(0, 6));
  };

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const handleChange = (index, rawValue) => {
    const cleanValue = rawValue.replace(/\D/g, "");
    if (!cleanValue) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setOtpValue(nextDigits);
      return;
    }

    const nextDigits = [...digits];
    cleanValue
      .slice(0, 6 - index)
      .split("")
      .forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });
    setOtpValue(nextDigits);
    focusInput(Math.min(index + cleanValue.length, 5));
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const nextDigits = [...digits];
      nextDigits[index - 1] = "";
      setOtpValue(nextDigits);
      focusInput(index - 1);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (index, event) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pastedDigits) return;

    const nextDigits = [...digits];
    pastedDigits
      .slice(0, 6 - index)
      .split("")
      .forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });
    setOtpValue(nextDigits);
    focusInput(Math.min(index + pastedDigits.length, 5));
  };

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          aria-label={`Delivery OTP digit ${index + 1}`}
          className="h-12 w-full rounded-xl border border-gray-300 bg-white text-center text-lg font-black text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#BF9B53] focus:ring-4 focus:ring-[#BF9B53]/15 sm:h-14 sm:text-xl"
        />
      ))}
    </div>
  );
};

/* ─── Error Alert ─── */
const ErrorAlert = ({ message }) =>
  message ? (
    <div className="w-full flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-3 py-3 mb-4">
      <FiAlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
      <p className="text-red-600 text-xs font-semibold leading-relaxed">
        {message}
      </p>
    </div>
  ) : null;

const ShipmentInfoCard = ({ shipmentDetails, compact = false }) => {
  if (!shipmentDetails) return null;

  const shipmentRoot = shipmentDetails.shipment || {};
  const quoteRoot = shipmentDetails;
  const horseName =
    shipmentRoot?.horses?.[0]?.registeredName ||
    shipmentRoot?.horses?.[0]?.barnName ||
    "Horse details unavailable";
  const customerName =
    shipmentRoot?.customer?.name ||
    shipmentDetails?.customer?.name ||
    quoteRoot?.customer?.name ||
    "Customer name not available";

  return (
    <div
      className={`w-full rounded-2xl border border-[#BF9B53]/20 bg-white ${
        compact ? "p-4 mb-5" : "p-5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BF9B53]">
            Shipment Details
          </p>
          <p className="mt-1 text-sm font-black text-gray-900">
            {horseName}
          </p>
        </div>
        <div className="rounded-full border border-[#BF9B53]/20 bg-[#BF9B53]/5 px-3 py-1 text-[11px] font-black text-[#BF9B53]">
          {shipmentRoot?.numberOfHorses || quoteRoot?.stallsRequired || 0} Horse
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-[#fffaf2] p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Pickup
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-800">
            {shipmentRoot?.pickupLocation || "N/A"}
          </p>
        </div>
        <div className="rounded-xl bg-[#fffaf2] p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Delivery
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-800">
            {shipmentRoot?.deliveryLocation || "N/A"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-2">
          <FiUser size={14} className="mt-0.5 text-[#BF9B53] shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Customer
            </p>
            <p className="text-xs font-semibold text-gray-700">{customerName}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <TbTruck size={15} className="mt-0.5 text-[#BF9B53] shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Vehicle
            </p>
            <p className="text-xs font-semibold text-gray-700">
              {quoteRoot?.vehicle?.vehicleNumber || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DesktopStepCard = ({ icon, title, subtitle, children, accent = false }) => (
  <div
    className={`hidden md:block rounded-[28px] border p-6 shadow-[0_20px_45px_rgba(17,24,39,0.06)] ${
      accent
        ? "border-[#BF9B53]/30 bg-gradient-to-br from-[#fffaf2] via-white to-[#fefaf3]"
        : "border-emerald-200 bg-white"
    }`}
  >
    <div className="flex items-start gap-4">
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
          accent ? "bg-[#BF9B53]/10 text-[#BF9B53]" : "bg-emerald-100 text-emerald-600"
        }`}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-[28px] font-black leading-tight text-gray-900">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          {subtitle}
        </p>
      </div>
    </div>
    <div className="mt-6">{children}</div>
  </div>
);

/* ─── Main ─── */
const DriverDeliveryPage = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const {
    shipment,
    allShipments,
    sendDeliveryOtp,
    verifyDeliveryOtp,
    markDelivered,
    actionLoading,
  } = useDriverAuth();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isMarkingDelivered, setIsMarkingDelivered] = useState(false);

  const currentShipmentDetails = useMemo(() => {
    if (shipment?._id === shipmentId) return shipment;
    return (allShipments || []).find((item) => item?._id === shipmentId) || shipment;
  }, [allShipments, shipment, shipmentId]);

  const renderStepActionButton = (mobile = false) => {
    const baseClass = mobile
      ? "w-full flex items-center justify-center gap-2 py-4 text-white font-black text-base rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      : "w-full flex items-center justify-center gap-2 py-4 text-white font-black text-base rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed";

    if (step === 1) {
      return (
        <button
          onClick={handleSendOtp}
          disabled={actionLoading}
          className={`${baseClass} bg-[#BF9B53] shadow-md shadow-[#BF9B53]/20 hover:brightness-105 active:scale-95 mt-4 `}
        >
          {actionLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending OTP...
            </>
          ) : (
            <>
              <FiSend size={17} />
              Send OTP to Customer
            </>
          )}
        </button>
      );
    }

    if (step === 2) {
      return (
        <button
          onClick={handleVerifyOtp}
          disabled={actionLoading || otp.length < 6}
          className={`${baseClass} bg-[#BF9B53] shadow-md shadow-[#BF9B53]/20 hover:brightness-105 active:scale-95`}
        >
          {actionLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <FiCheckCircle size={17} />
              Verify OTP
            </>
          )}
        </button>
      );
    }

    if (step === 3) {
      return (
        <button
          onClick={handleMarkDelivered}
          disabled={isMarkingDelivered || actionLoading}
          className={`${baseClass} bg-emerald-500 shadow-md shadow-emerald-500/25 hover:brightness-105 active:scale-95`}
        >
          {isMarkingDelivered || actionLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FiCheck size={19} />
              Mark as Delivered
            </>
          )}
        </button>
      );
    }

    return null;
  };

  const startCooldown = () => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    setError("");
    const res = await sendDeliveryOtp(shipmentId);
    if (res?.success) {
      setStep(2);
      startCooldown();
      Toast.success("OTP sent to customer!");
    } else {
      const msg = res?.message || "Failed to send OTP. Please try again.";
      setError(msg);
      Toast.error(msg);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtp("");
    setError("");
    const res = await sendDeliveryOtp(shipmentId);
    if (res?.success) {
      startCooldown();
      Toast.success("OTP resent!");
    } else {
      const msg = res?.message || "Failed to resend.";
      setError(msg);
      Toast.error(msg);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }
    setError("");
    const res = await verifyDeliveryOtp(shipmentId, otp);
    if (res?.success) {
      setSuccess(true);
      Toast.success("Shipment verified and delivered!");
      setTimeout(() => navigate("/driver/dashboard"), 2500);
    } else {
      const msg = res?.message || "Invalid OTP. Please try again.";
      setError(msg);
      setOtp("");
      Toast.error(msg);
    }
  };

  const handleMarkDelivered = async () => {
    setIsMarkingDelivered(true);
    setError("");
    try {
      const res = await markDelivered(shipmentId);
      if (res?.success) {
        setSuccess(true);
        Toast.success("Shipment marked as delivered!");
        setTimeout(() => navigate("/driver/dashboard"), 2500);
      } else {
        const msg = res?.message || "Failed to mark as delivered";
        setError(msg);
        Toast.error(msg);
      }
    } catch {
      setError("An error occurred. Please try again.");
      Toast.error("Failed to mark as delivered");
    } finally {
      setIsMarkingDelivered(false);
    }
  };

  /* ── Success Screen ── */
  if (success) {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center px-6 font-[Montserrat]">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
            <FiCheckCircle className="text-white" size={46} />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#BF9B53] rounded-full flex items-center justify-center shadow-md">
            <TbTruck className="text-white" size={16} />
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2 text-center">
          Delivered!
        </h1>
        <p className="text-gray-500 text-sm text-center leading-relaxed max-w-xs">
          Shipment has been successfully verified and marked as delivered.
        </p>
        <p className="text-[#BF9B53] text-xs font-black mt-4 animate-pulse">
          Redirecting to dashboard...
        </p>
        <div className="mt-5 w-28 h-1.5 bg-green-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ animation: "grow 2.5s linear forwards" }}
          />
        </div>
        <style>{`@keyframes grow { from { width: 0% } to { width: 100% } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[Montserrat] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 md:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition-all hover:bg-gray-200 active:scale-95"
          >
            <FiArrowLeft size={17} className="text-gray-600" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-black text-gray-900 text-base md:text-lg">
              Delivery Verification
            </h1>
            <p className="text-[10px] text-gray-400 font-semibold md:text-xs">
              Step {step} of 3
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-full border border-[#BF9B53]/20 bg-[#BF9B53]/5 px-4 py-2">
            <TbTruck className="text-[#BF9B53]" size={16} />
            <span className="text-xs font-black text-[#BF9B53]">
              Delivery Flow
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pt-8 pb-32 md:px-6 md:pb-10 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-10 flex items-center justify-center md:mb-8 md:justify-start">
          <Step
            number="1"
            label="Send OTP"
            active={step === 1}
            done={step > 1}
          />
          <div
            className={`flex-1 max-w-[56px] h-0.5 mx-1.5 rounded-full ${
              step > 1 ? "bg-[#BF9B53]" : "bg-gray-200"
            }`}
          />
          <Step
            number="2"
            label="Verify OTP"
            active={step === 2}
            done={step > 2}
          />
          <div
            className={`flex-1 max-w-[56px] h-0.5 mx-1.5 rounded-full ${
              step > 2 ? "bg-[#BF9B53]" : "bg-gray-200"
            }`}
          />
          <Step number="3" label="Mark Done" active={step === 3} done={false} />
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
            <DesktopStepCard
              accent
              icon={<TbRouteSquare size={34} strokeWidth={1.4} />}
              title="Ready to Deliver?"
              subtitle="Send an OTP to the horse owner to confirm you've arrived at the delivery location. Once the OTP is sent, continue to customer verification."
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="max-w-md">
                  <ShipmentInfoCard shipmentDetails={currentShipmentDetails} />
                  <ErrorAlert message={error} />
                  <div className="hidden md:flex w-full">{renderStepActionButton()}</div>
                </div>
                <div className="rounded-2xl border border-[#BF9B53]/15 bg-white p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BF9B53]">
                    Before Sending
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-gray-600">
                    <p>1. Confirm you are at the delivery location.</p>
                    <p>2. Ask the customer to keep their phone nearby.</p>
                    <p>3. Send OTP and wait for the 6-digit code.</p>
                  </div>
                </div>
              </div>
            </DesktopStepCard>
            <div className="flex flex-col items-center text-center md:hidden">
              <ShipmentInfoCard
                shipmentDetails={currentShipmentDetails}
                compact
              />
              <div
                className="w-22 h-22 bg-[#BF9B53]/10 rounded-3xl flex items-center justify-center mb-6 text-[#BF9B53]"
                style={{ width: 88, height: 88 }}
              >
                <TbRouteSquare size={42} strokeWidth={1.4} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                Ready to Deliver?
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs">
                Send an OTP to the horse owner to confirm you've arrived at the
                delivery location.
              </p>
              <ErrorAlert message={error} />
            </div>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <DesktopStepCard
              accent
              icon={<TbPasswordMobilePhone size={30} strokeWidth={1.4} />}
              title="Enter OTP"
              subtitle="Ask the horse owner for the 6-digit OTP sent to their phone. After successful verification, you can finish the delivery."
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="max-w-xl">
                  <ShipmentInfoCard shipmentDetails={currentShipmentDetails} />
                  <div className="mt-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 mb-5 w-full">
                    <FiCheckCircle size={14} className="text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-700 font-semibold">
                      OTP sent to customer successfully
                    </p>
                  </div>
                  <div className="w-full mb-2">
                    <OtpInput value={otp} onChange={setOtp} />
                    <p className="text-center text-[11px] text-gray-400 mt-2 font-semibold">
                      {otp.length}/6 digits
                    </p>
                  </div>
                  <ErrorAlert message={error} />
                  <div className="hidden md:flex w-full mb-4 max-w-sm">{renderStepActionButton()}</div>
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || actionLoading}
                    className="text-sm font-black text-[#BF9B53] disabled:text-gray-300 transition-colors py-2"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Didn't receive? Resend OTP"}
                  </button>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Verification Tips
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-gray-600">
                    <p>Make sure the customer reads the latest OTP only.</p>
                    <p>Enter all 6 digits exactly as received.</p>
                    <p>Use resend if the code has expired or not arrived.</p>
                  </div>
                </div>
              </div>
            </DesktopStepCard>
            <div className="flex flex-col items-center md:hidden">
              <ShipmentInfoCard
                shipmentDetails={currentShipmentDetails}
                compact
              />
              <div
                style={{ width: 80, height: 80 }}
                className="bg-[#BF9B53]/10 rounded-3xl flex items-center justify-center mb-5 text-[#BF9B53]"
              >
                <TbPasswordMobilePhone size={34} strokeWidth={1.4} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-1 text-center">
                Enter OTP
              </h2>
              <p className="text-gray-500 text-sm text-center leading-relaxed mb-5 max-w-xs">
                Ask the horse owner for the 6-digit OTP sent to their phone.
              </p>
              <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 mb-5 w-full">
                <FiCheckCircle size={14} className="text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700 font-semibold">
                  OTP sent to customer successfully
                </p>
              </div>
              <div className="w-full mb-2">
                <OtpInput value={otp} onChange={setOtp} />
                <p className="text-center text-[11px] text-gray-400 mt-2 font-semibold">
                  {otp.length}/6 digits
                </p>
              </div>
              <ErrorAlert message={error} />
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || actionLoading}
                className="text-sm font-black text-[#BF9B53] disabled:text-gray-300 transition-colors py-2"
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Didn't receive? Resend OTP"}
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <>
            <DesktopStepCard
              icon={<TbTruck size={34} strokeWidth={1.4} />}
              title="Final Step!"
              subtitle="Customer verification is complete. You can now mark this shipment as delivered and finish the process."
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div>
                  <ShipmentInfoCard shipmentDetails={currentShipmentDetails} />
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 w-full mb-6 text-left">
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider mb-3">
                      Verification Complete
                    </p>
                    <div className="space-y-2">
                      {["OTP sent to customer", "OTP verified by customer"].map(
                        (item) => (
                          <div key={item} className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                              <FiCheck size={9} className="text-white" />
                            </div>
                            <p className="text-xs text-emerald-700 font-semibold">
                              {item}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <ErrorAlert message={error} />
                  <div className="hidden md:flex w-full max-w-sm">{renderStepActionButton()}</div>
                  <p className="hidden md:block text-[11px] text-gray-400 mt-3 font-semibold">
                    This action cannot be undone
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Before Submit
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-gray-600">
                    <p>Confirm horses are unloaded safely.</p>
                    <p>Check customer acknowledgement is complete.</p>
                    <p>Submit only when delivery is fully done.</p>
                  </div>
                </div>
              </div>
            </DesktopStepCard>
            <div className="flex flex-col items-center text-center md:hidden">
              <ShipmentInfoCard
                shipmentDetails={currentShipmentDetails}
                compact
              />
              <div
                style={{ width: 88, height: 88 }}
                className="bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 text-emerald-600"
              >
                <TbTruck size={42} strokeWidth={1.4} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                Final Step!
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
                Customer has verified the OTP. Tap the button below to mark this
                shipment as delivered.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 w-full mb-6 text-left">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider mb-3">
                  Verification Complete
                </p>
                <div className="space-y-2">
                  {["OTP sent to customer", "OTP verified by customer"].map(
                    (item) => (
                      <div key={item} className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                          <FiCheck size={9} className="text-white" />
                        </div>
                        <p className="text-xs text-emerald-700 font-semibold">
                          {item}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
              <ErrorAlert message={error} />
              <p className="text-[11px] text-gray-400 mt-3 font-semibold">
                This action cannot be undone
              </p>
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_25px_rgba(17,24,39,0.08)] backdrop-blur-sm md:hidden">
        <div className="mx-auto w-full max-w-md">{renderStepActionButton(true)}</div>
      </div>
    </div>
  );
};

export default DriverDeliveryPage;
