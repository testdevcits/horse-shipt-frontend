import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/common/Button";
import Toast from "../../components/common/Toast";
import axios from "axios";
import stripeLogo from "../../assets/images/stripeLogo.png";

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

  const isUpdate = !!paymentData; // true if payment exists

  // ---------------- Fetch payment ----------------
  const fetchPayment = async () => {
    if (!user?._id || !user?.token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/customer/payment`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (res.data?.data) {
        setPaymentData(res.data.data);
        setFormData({
          pkLive: res.data.data.pkLive,
          skLive: res.data.data.skLive,
        });
      } else {
        setPaymentData(null);
      }
    } catch (err) {
      console.error(err.response || err.message);
      setPaymentData(null);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [user]);

  // ---------------- OTP cooldown timer ----------------
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => setOtpCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

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

  // ---------------- Add new payment (no OTP) ----------------
  const handleAddPayment = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/customer/payment`,
        { pkLive: formData.pkLive, skLive: formData.skLive },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setPaymentData(res.data.data);
      showToast(res.data.message || "Payment added successfully!", "success");
      setFormData({ pkLive: "", skLive: "" });
    } catch (err) {
      console.error(err.response || err.message);
      showToast(
        err.response?.data?.message || "Failed to add payment",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Send OTP for update ----------------
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
      setOtpCooldown(30);
    } catch (err) {
      console.error(err.response || err.message);
      showToast(err.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Verify OTP & update ----------------
  const handleVerifyOtp = async () => {
    if (!otp) return showToast("Please enter OTP", "error");

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/customer/payment/verify-otp`,
        { otp, pkLive: formData.pkLive, skLive: formData.skLive },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setPaymentData(res.data.data);
      showToast(res.data.message || "Payment updated successfully!", "success");
      setOtp("");
      setOtpSent(false);
      setShowUpdateForm(false);
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
    <div className="flex flex-col items-center justify-center font-montserrat p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-5 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
          Payment Details
        </h1>

        {/* ---------------- Existing Payment ---------------- */}
        {paymentData && !showUpdateForm && (
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
              onClick={() => setShowUpdateForm(true)}
              variant="primary"
              rounded
              className="w-full sm:w-auto mt-2"
            >
              Update Payment
            </Button>
          </div>
        )}

        {/* ---------------- Add / Update Form ---------------- */}
        {(!paymentData || showUpdateForm) && (
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
                  onClick={isUpdate ? handleSendOtp : handleAddPayment}
                  disabled={loading}
                  variant="primary"
                  rounded
                  className="w-full sm:w-auto"
                >
                  {loading
                    ? isUpdate
                      ? "Sending OTP..."
                      : "Adding Payment..."
                    : isUpdate
                    ? "Send OTP"
                    : "Add Payment"}
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
                    {loading ? "Verifying..." : "Verify OTP & Update"}
                  </Button>

                  <Button
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
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
