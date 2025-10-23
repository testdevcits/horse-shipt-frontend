import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCustomerPayment } from "../../contexts/CustomerPaymentContext";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import stripeLogo from "../../assets/images/stripeLogo.png";

const Payment = () => {
  const { user } = useAuth();
  const {
    paymentData,
    fetchPayment,
    sendOtp,
    verifyOtp,
    loading,
    otpSent,
    otpCooldown,
    setOtpSent,
    setOtpCooldown,
  } = useCustomerPayment();

  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({ pkLive: "", skLive: "" });
  const [errors, setErrors] = useState({});

  // ---------------- Fetch payment on user login ----------------
  useEffect(() => {
    fetchPayment();
  }, [user]);

  // ---------------- Set form data if payment exists ----------------
  useEffect(() => {
    if (paymentData) {
      setFormData({ pkLive: paymentData.pkLive, skLive: paymentData.skLive });
    }
  }, [paymentData]);

  const showToast = (message, type = "info") => setToast({ message, type });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.pkLive || !formData.pkLive.startsWith("pk_live_"))
      newErrors.pkLive = "PK_LIVE must start with pk_live_";
    if (!formData.skLive || !formData.skLive.startsWith("sk_live_"))
      newErrors.skLive = "SK_LIVE must start with sk_live_";
    return newErrors;
  };

  // ---------------- Send OTP ----------------
  const handleSendOtp = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const paymentId = paymentData?._id || null; // pass existing paymentId if updating
    const res = await sendOtp({
      pkLive: formData.pkLive,
      skLive: formData.skLive,
      paymentId,
    });

    if (res.success) {
      showToast("OTP sent to your email.", "success");
      setShowForm(true);
    } else {
      showToast(res.message, "error");
    }
  };

  // ---------------- Verify OTP ----------------
  const handleVerifyOtp = async () => {
    if (!otp) return showToast("Please enter OTP", "error");

    const paymentId = paymentData?._id || null;
    const res = await verifyOtp({
      otp,
      pkLive: formData.pkLive,
      skLive: formData.skLive,
      paymentId,
    });

    if (res.success) {
      showToast(res.message, "success");
      setOtp("");
      setOtpSent(false);
      setShowForm(false);
    } else {
      showToast(res.message, "error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center font-montserrat p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-5 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
          Payment Details
        </h1>

        {/* ---------------- Existing Payment Display ---------------- */}
        {paymentData && !showForm && (
          <div className="bg-gray-100 p-4 rounded-lg text-center space-y-3">
            <img
              src={stripeLogo}
              alt="Stripe"
              className="mx-auto w-28 sm:w-36"
            />
            <p>
              <span className="font-semibold">Service:</span>{" "}
              {paymentData.serviceName}
            </p>
            <p className="break-words text-sm sm:text-base">
              <span className="font-semibold">PK_LIVE:</span>{" "}
              {paymentData.pkLive}
            </p>
            <p className="break-words text-sm sm:text-base">
              <span className="font-semibold">SK_LIVE:</span>{" "}
              {paymentData.skLive}
            </p>
            <Button
              onClick={() => setShowForm(true)}
              variant="primary"
              rounded
              className="w-full sm:w-auto mt-2"
            >
              Update Payment
            </Button>
          </div>
        )}

        {/* ---------------- Add / Update Payment Form ---------------- */}
        {showForm && (
          <div className="mt-4 space-y-4">
            {!otpSent ? (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    PK_LIVE
                  </label>
                  <input
                    type="text"
                    name="pkLive"
                    value={formData.pkLive}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter pk_live_..."
                  />
                  {errors.pkLive && (
                    <p className="text-red-500 text-sm mt-1">{errors.pkLive}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    SK_LIVE
                  </label>
                  <input
                    type="text"
                    name="skLive"
                    value={formData.skLive}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter sk_live_..."
                  />
                  {errors.skLive && (
                    <p className="text-red-500 text-sm mt-1">{errors.skLive}</p>
                  )}
                </div>

                <Button
                  onClick={handleSendOtp}
                  disabled={loading}
                  variant="primary"
                  rounded
                  className="w-full sm:w-auto"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter OTP"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    variant="primary"
                    rounded
                    className="w-full sm:w-auto"
                  >
                    {loading ? "Verifying..." : "Verify OTP & Save"}
                  </Button>

                  <Button
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setShowForm(false);
                    }}
                    variant="secondary"
                    rounded
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>

                  {otpCooldown > 0 && (
                    <p className="text-gray-500 text-sm">
                      Resend in {otpCooldown}s
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ---------------- Toast Notification ---------------- */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={4000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Payment;
