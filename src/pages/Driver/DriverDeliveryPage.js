import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDriverAuth } from "../../contexts/DriverAuthContext";

const DriverDeliveryPage = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();

  const { sendDeliveryOtp, verifyDeliveryOtp, actionLoading } = useDriverAuth();

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // SEND OTP
  const handleSendOtp = async () => {
    const res = await sendDeliveryOtp(shipmentId);

    if (res?.success) {
      setOtpSent(true);
      alert("OTP sent to customer");
    } else {
      alert(res?.message || "Failed to send OTP");
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    const res = await verifyDeliveryOtp(shipmentId, otp);

    if (res?.success) {
      alert("Shipment Delivered Successfully ✅");
      navigate("/driver/dashboard");
    } else {
      alert(res?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center text-[#BF9B53]">
          Delivery Verification
        </h2>

        {/* SEND OTP */}
        {!otpSent && (
          <button
            onClick={handleSendOtp}
            disabled={actionLoading}
            className="w-full bg-[#BF9B53] text-white py-2 rounded mb-4"
          >
            {actionLoading ? "Sending..." : "Send OTP"}
          </button>
        )}

        {/* OTP INPUT */}
        {otpSent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-2 rounded mb-3 text-center text-lg tracking-widest"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={actionLoading}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              {actionLoading ? "Verifying..." : "Verify & Deliver"}
            </button>
          </>
        )}

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-gray-500 underline w-full"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default DriverDeliveryPage;
