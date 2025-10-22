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
  const [payment, setPayment] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ pkLive: "", skLive: "" });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Fetch existing payment on mount
  useEffect(() => {
    const fetchPayment = async () => {
      if (!user?._id || !user?.token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/customer/payment`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.data.success) setPayment(res.data.data);
      } catch (err) {
        console.log("No payment found or error:", err.response?.data?.message);
      }
    };
    fetchPayment();
  }, [user]);

  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
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

  // ------------------ Submit New Payment ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!user?._id || !user?.token) {
      showToast("User not logged in.", "error");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/customer/payment`,
        formData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setPayment(res.data.data);
      showToast(res.data.message || "Payment created successfully", "success");
      setShowForm(false);
      setFormData({ pkLive: "", skLive: "" });
      setErrors({});
    } catch (err) {
      console.error(err.response || err.message);
      showToast(
        err.response?.data?.message || "Failed to create payment",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Request OTP ------------------
  const handleRequestOtp = async () => {
    if (!user?._id || !user?.token) return;
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/customer/payment/otp`,
        { ...formData },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showToast(res.data.message || "OTP sent!", "success");
      setOtpSent(true);
      setOtpCooldown(30); // 30s cooldown
    } catch (err) {
      console.error(err.response || err.message);
      showToast(err.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Verify OTP ------------------
  const handleVerifyOtp = async () => {
    if (!otp) {
      showToast("Enter OTP first", "error");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/customer/payment/verify-otp`,
        { otp },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showToast(res.data.message || "Payment updated successfully", "success");
      setPayment(res.data.data);
      setOtp("");
      setOtpSent(false);
      setFormData({ pkLive: "", skLive: "" });
      setErrors({});
      setShowForm(false);
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
      <div className="w-full sm:p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Payment</h1>

        {!payment ? (
          !showForm ? (
            <div className="flex flex-col items-center text-center space-y-4">
              <p className="text-gray-600">
                Set up your Stripe payment account securely.
              </p>
              <img src={stripeLogo} alt="Stripe" className="w-32 mt-2" />
              <Button
                onClick={() => setShowForm(true)}
                variant="custom"
                textColor="#4B5563"
                borderColor="#D1D5DB"
              >
                Set up Stripe Account
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">PK_LIVE</label>
                <input
                  type="text"
                  name="pkLive"
                  value={formData.pkLive}
                  onChange={handleChange}
                  placeholder="pk_live_..."
                  className="w-full border rounded p-2"
                  required
                />
                {errors.pkLive && (
                  <p className="text-red-500 text-sm">{errors.pkLive}</p>
                )}
              </div>

              <div>
                <label className="block mb-1">SK_LIVE</label>
                <input
                  type="text"
                  name="skLive"
                  value={formData.skLive}
                  onChange={handleChange}
                  placeholder="sk_live_..."
                  className="w-full border rounded p-2"
                  required
                />
                {errors.skLive && (
                  <p className="text-red-500 text-sm">{errors.skLive}</p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Submitting..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-gray-700">
              Payment setup exists for Stripe. PK:{" "}
              <span className="font-mono">{payment.pkLive}</span>
            </p>
            {!showForm ? (
              <Button
                onClick={() => {
                  setShowForm(true);
                  setFormData({ pkLive: payment.pkLive, skLive: "" });
                }}
              >
                Update Payment
              </Button>
            ) : !otpSent ? (
              <>
                <div className="space-y-2">
                  <div>
                    <label>PK_LIVE</label>
                    <input
                      type="text"
                      name="pkLive"
                      value={formData.pkLive}
                      onChange={handleChange}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label>SK_LIVE</label>
                    <input
                      type="text"
                      name="skLive"
                      value={formData.skLive}
                      onChange={handleChange}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <Button onClick={handleRequestOtp} disabled={otpCooldown > 0}>
                    {otpCooldown > 0 ? `Wait ${otpCooldown}s` : "Send OTP"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border rounded p-2"
                />
                <Button onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
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
