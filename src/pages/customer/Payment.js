import React, { useState } from "react";
import stripeLogo from "../../assets/images/stripeLogo.png"; // replace with your image path

const Payment = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "",
    pkLive: "",
    skLive: "",
  });
  const [errors, setErrors] = useState({}); // <-- store error messages

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Remove error if user types something
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.serviceName.trim())
      newErrors.serviceName = "Service Name is required";
    if (!formData.pkLive.trim()) newErrors.pkLive = "PK_LIVE is required";
    if (!formData.skLive.trim()) newErrors.skLive = "SK_LIVE is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Log values
    console.log("Payment Setup Data:", formData);
    alert("Payment details submitted successfully!");
  };

  return (
    <div className="flex flex-col items-center justify-center font-montserrat">
      <div className="w-full sm:p-8">
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-start mb-4">
          Payment
        </h1>

        {/* Before form */}
        {!showForm && (
          <div className="flex flex-col items-center text-center space-y-4">
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Do your payments through{" "}
              <span className="font-semibold text-indigo-600">Stripe</span> in a
              secure and easy way, click below to set up your data.
            </p>

            {/* Stripe Image */}
            <img
              src={stripeLogo}
              alt="Stripe"
              className="w-32 sm:w-40 object-contain mt-4"
            />

            {/* Button */}
            <button
              onClick={() => setShowForm(true)}
              className="text-gray-300 px-6 py-2 border border-gary-300 rounded-lg font-semibold mt-4 transition"
            >
              Set up Stripe Account
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
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
                onChange={handleChange}
                placeholder="Enter your service name"
                className={`w-full border p-2 rounded-lg outline-none focus:ring-2 ${
                  errors.serviceName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-indigo-500"
                }`}
              />
              {errors.serviceName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.serviceName}
                </p>
              )}
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
                className={`w-full border p-2 rounded-lg outline-none focus:ring-2 ${
                  errors.pkLive
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-indigo-500"
                }`}
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
                className={`w-full border p-2 rounded-lg outline-none focus:ring-2 ${
                  errors.skLive
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-indigo-500"
                }`}
              />
              {errors.skLive && (
                <p className="text-red-500 text-sm mt-1">{errors.skLive}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Payment;
