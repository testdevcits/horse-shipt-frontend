import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import stripeLogo from "../../assets/images/stripeLogo.png";
import Button from "../../components/common/Button";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://horse-shipt.vercel.app/api";

const Payment = () => {
  const { user } = useAuth(); // get logged-in user
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "Stripe", // fixed pre-filled value
    pkLive: "",
    skLive: "",
  });
  const [errors, setErrors] = useState({}); // store validation errors
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        serviceName: formData.serviceName,
        pkLive: formData.pkLive,
        skLive: formData.skLive,
      };

      console.log("Submitting payment setup data:", payload);

      // Call your backend API
      const res = await axios.post(`${API_BASE_URL}/shipper/payment`, payload, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      console.log(res.data);
      alert(res.data.message || "Payment details submitted successfully!");

      setShowForm(false);
      setFormData({ serviceName: "Stripe", pkLive: "", skLive: "" });
      setErrors({});
    } catch (err) {
      console.error("Payment setup error:", err.response || err.message);
      alert(
        err.response?.data?.message ||
          "Failed to submit payment data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center font-montserrat">
      <div className="w-full sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          Payment
        </h1>

        {!showForm ? (
          <div className="flex flex-col items-center text-center space-y-4">
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Do your payments through{" "}
              <span className="font-semibold text-indigo-600">Stripe</span> in a
              secure and easy way, click below to set up your data.
            </p>

            <img
              src={stripeLogo}
              alt="Stripe"
              className="w-32 sm:w-40 object-contain mt-4"
            />

            <Button
              onClick={() => setShowForm(true)}
              variant="custom"
              textColor="#4B5563"
              borderColor="#D1D5DB"
              className="mt-4"
            >
              Set up Stripe Account
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 mt-4 animate-fadeIn"
          >
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Service Name
              </label>
              <input
                type="text"
                name="serviceName"
                value={formData.serviceName}
                readOnly
                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 cursor-not-allowed outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                PK_LIVE
              </label>
              <input
                type="text"
                name="pkLive"
                value={formData.pkLive}
                onChange={handleChange}
                placeholder="Enter your PK_LIVE key"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              {errors.pkLive && (
                <p className="text-red-500 text-sm mt-1">{errors.pkLive}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                SK_LIVE
              </label>
              <input
                type="text"
                name="skLive"
                value={formData.skLive}
                onChange={handleChange}
                placeholder="Enter your SK_LIVE key"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              {errors.skLive && (
                <p className="text-red-500 text-sm mt-1">{errors.skLive}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              rounded
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Payment;
