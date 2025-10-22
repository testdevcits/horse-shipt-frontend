import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import stripeLogo from "../../assets/images/stripeLogo.png";
import Button from "../../components/common/Button";
import axios from "axios";
import Toast from "../../components/common/Toast";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

const Payment = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [paymentData, setPaymentData] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({ pkLive: "", skLive: "" });
  const [errors, setErrors] = useState({});

  // Fetch existing payment
  const fetchPayment = async () => {
    if (!user?._id || !user?.token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/customer/payment`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPaymentData(res.data.data);
      setFormData({
        pkLive: res.data.data.pkLive,
        skLive: res.data.data.skLive,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [user]);

  // OTP cooldown
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

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

  // Send OTP
  const handleSendOtp = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/customer/payment/request-otp`,
        { pkLive: formData.pkLive, skLive: formData.skLive },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showToast("OTP sent to your email.", "success");
      setOtpSent(true);
      setOtpCooldown(30); // 30 seconds cooldown before resending
    } catch (err) {
      console.error(err.response || err.message);
      showToast(err.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      showToast("Please enter OTP", "error");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/customer/payment/verify-otp`,
        { otp },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showToast(res.data.message || "Payment updated successfully!", "success");
      setPaymentData(res.data.data);
      setShowUpdateForm(false);
      setOtp("");
      setOtpSent(false);
      setErrors({});
    } catch (err) {
      console.error(err.response || err.message);
      showToast(
        err.response?.data?.message || "OTP verification failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center font-montserrat">
      <div className="w-full sm:p-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
          Payment
        </h1>

        {/* Existing Payment */}
        {paymentData && !showUpdateForm && (
          <div className="bg-gray-100 p-4 rounded-lg space-y-3 text-center">
            <p className="text-gray-700">
              <span className="font-semibold">Service:</span>{" "}
              {paymentData.serviceName}
            </p>
            <p className="text-gray-700 break-words">
              <span className="font-semibold">PK_LIVE:</span>{" "}
              {paymentData.pkLive}
            </p>
            <p className="text-gray-700 break-words">
              <span className="font-semibold">SK_LIVE:</span>{" "}
              {paymentData.skLive}
            </p>
            <Button
              onClick={() => setShowUpdateForm(true)}
              variant="primary"
              rounded
            >
              Update Payment
            </Button>
          </div>
        )}

        {/* Payment Update Form */}
        {showUpdateForm && (
          <div className="space-y-4 mt-4">
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
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                  />
                  {errors.pkLive && (
                    <p className="text-red-500 text-sm">{errors.pkLive}</p>
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
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                  />
                  {errors.skLive && (
                    <p className="text-red-500 text-sm">{errors.skLive}</p>
                  )}
                </div>

                <Button
                  onClick={handleSendOtp}
                  disabled={loading}
                  variant="primary"
                  rounded
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
                    className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    variant="primary"
                    rounded
                  >
                    {loading ? "Verifying..." : "Verify OTP & Update"}
                  </Button>

                  <Button
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    variant="secondary"
                    rounded
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
