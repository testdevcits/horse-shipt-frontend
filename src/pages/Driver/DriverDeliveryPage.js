import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDriverAuth } from "../../contexts/DriverAuthContext";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiSend,
  FiAlertCircle,
} from "react-icons/fi";
import { MdOutlineVerified } from "react-icons/md";
import { TbPasswordMobilePhone } from "react-icons/tb";
import { TbRouteSquare } from "react-icons/tb";

/* ── Step Indicator ── */
const Step = ({ number, label, active, done }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all
      ${
        done
          ? "bg-[#BF9B53] border-[#BF9B53] text-white"
          : active
          ? "bg-white border-[#BF9B53] text-[#BF9B53]"
          : "bg-gray-100 border-gray-200 text-gray-400"
      }`}
    >
      {done ? <FiCheckCircle size={18} /> : number}
    </div>
    <span
      className={`text-[10px] font-bold ${
        active ? "text-[#BF9B53]" : done ? "text-gray-600" : "text-gray-300"
      }`}
    >
      {label}
    </span>
  </div>
);

/* ── OTP Box (individual digit input) ── */
const OtpInput = ({ value, onChange }) => {
  const refs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleKey = (idx, e) => {
    if (e.key === "Backspace") {
      const newVal = value.slice(0, idx) + value.slice(idx + 1);
      onChange(newVal);
      if (idx > 0) refs.current[idx - 1]?.focus();
    }
  };

  const handleChange = (idx, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    if (!char) return;
    const arr = digits.map((d, i) => (i === idx ? char : d));
    const newVal = arr.join("").replace(/\s/g, "").slice(0, 6);
    onChange(newVal);
    if (idx < 5) refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted) {
      onChange(pasted);
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (refs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKey(idx, e)}
          className={`w-12 h-12 text-center text-xl font-black rounded-2xl border-2 outline-none transition-all
            ${
              digit
                ? "border-[#BF9B53] bg-[#BF9B53]/5 text-[#BF9B53]"
                : "border-gray-200 bg-gray-50 text-gray-800"
            }
            focus:border-[#BF9B53] focus:bg-[#BF9B53]/5 focus:ring-4 focus:ring-[#BF9B53]/10`}
        />
      ))}
    </div>
  );
};

const DriverDeliveryPage = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const { sendDeliveryOtp, verifyDeliveryOtp, actionLoading } = useDriverAuth();

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown for resend
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
      setOtpSent(true);
      startCooldown();
    } else {
      setError(res?.message || "Failed to send OTP. Please try again.");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtp("");
    setError("");
    const res = await sendDeliveryOtp(shipmentId);
    if (res?.success) {
      startCooldown();
    } else {
      setError(res?.message || "Failed to resend OTP.");
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
      setTimeout(() => navigate("/driver/dashboard"), 2500);
    } else {
      setError(res?.message || "Invalid OTP. Please try again.");
      setOtp("");
    }
  };

  /* ── SUCCESS SCREEN ── */
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex flex-col items-center justify-center px-6 font-[Montserrat]">
        <div className="relative mb-6">
          <div className="w-28 h-28 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
            <FiCheckCircle className="text-white" size={52} />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-lg">
              <MdOutlineVerified />
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2 text-center">
          Delivered!
        </h1>
        <p className="text-gray-500 text-sm text-center leading-relaxed">
          Shipment has been successfully delivered and verified.
        </p>
        <p className="text-[#BF9B53] text-xs font-bold mt-4">
          Redirecting to dashboard...
        </p>
        <div className="mt-4 w-32 h-1.5 bg-green-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full animate-[grow_2.5s_linear_forwards]"
            style={{ animation: "grow 2.5s linear forwards" }}
          />
        </div>
        <style>{`@keyframes grow { from { width: 0% } to { width: 100% } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white font-[Montserrat] flex flex-col">
      {/* ── Top Bar ── */}
      <div className="px-4 pt-safe pt-4 pb-3 flex items-center gap-3 bg-white border-b border-gray-100 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
        >
          <FiArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="font-black text-gray-900 text-base leading-tight">
            Delivery Verification
          </h1>
          <p className="text-[10px] text-gray-400 font-semibold">
            Confirm delivery with OTP
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col px-5 pt-8 pb-10 max-w-md mx-auto w-full">
        {/* Steps */}
        <div className="flex items-center justify-center gap-0 mb-10">
          <Step number="1" label="Send OTP" active={!otpSent} done={otpSent} />
          <div
            className={`flex-1 max-w-[60px] h-0.5 mx-1 rounded-full transition-colors ${
              otpSent ? "bg-[#BF9B53]" : "bg-gray-200"
            }`}
          />
          <Step number="2" label="Enter OTP" active={otpSent} done={false} />
          <div className="flex-1 max-w-[60px] h-0.5 mx-1 rounded-full bg-gray-200" />
          <Step number="3" label="Confirm" active={false} done={false} />
        </div>

        {/* ── STEP 1: Send OTP ── */}
        {!otpSent ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner text-[#BF9B53]">
              <TbRouteSquare size={30} />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">
              Ready to Deliver?
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs">
              Send an OTP to the horse owner to confirm you've arrived at the
              delivery location.
            </p>

            {error && (
              <div className="w-full mb-4 flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <FiAlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-red-600 text-xs font-semibold">{error}</p>
              </div>
            )}

            <button
              onClick={handleSendOtp}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#BF9B53]/100 to-[#BF9B53]/100 text-white font-black text-base rounded-2xl shadow-lg shadow-[#BF9B53]/50 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-4"
            >
              {actionLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <FiSend size={18} />
                  Send OTP to Customer
                </>
              )}
            </button>
          </div>
        ) : (
          /* ── STEP 2: Enter OTP ── */
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-5 shadow-inner">
              <span className="text-4xl text-[#BF9B53]">
                <TbPasswordMobilePhone color="[#BF9B53]" size={30} />
              </span>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-1 text-center">
              Enter OTP
            </h2>
            <p className="text-gray-500 text-sm text-center leading-relaxed mb-1 max-w-xs">
              Ask the horse owner for the 6-digit OTP sent to their phone/Email.
            </p>

            {/* OTP Input */}
            <div className="w-full mb-4">
              <OtpInput value={otp} onChange={setOtp} />
              <p className="text-center text-[11px] text-gray-400 mt-2.5 font-semibold">
                {otp.length}/6 digits
              </p>
            </div>
            {/* OTP Sent Toast */}
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-7">
              <FiCheckCircle size={13} className="text-green-500" />
              <p className="text-xs text-green-700 font-semibold">
                OTP sent to customer successfully
              </p>
            </div>
            {/* Error */}
            {error && (
              <div className="w-full mb-4 flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <FiAlertCircle size={15} className="text-red-500 shrink-0" />
                <p className="text-red-600 text-xs font-semibold">{error}</p>
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={actionLoading || otp.length < 6}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#BF9B53]/100 to-[#BF9B53]/100 text-white font-black text-base rounded-2xl shadow-lg shadow-[#BF9B53]/50 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-4"
            >
              {actionLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <FiCheckCircle size={18} />
                  Verify & Complete Delivery
                </>
              )}
            </button>

            {/* Resend */}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || actionLoading}
              className="text-sm font-bold text-[#BF9B53] disabled:text-gray-300 transition-colors py-2"
            >
              {resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : "Didn't receive? Resend OTP"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDeliveryPage;
