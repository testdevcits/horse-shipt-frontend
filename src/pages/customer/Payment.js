import React, { useState } from "react";
import stripeLogo from "../../assets/images/stripeLogo.png"; // replace with your image path
import Button from "../../components/common/Button"; // import your Button component

const Payment = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: "",
    pkLive: "",
    skLive: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Payment Setup Data:", formData);
    alert("Payment details submitted successfully!");
  };

  return (
    <div className="flex flex-col items-center justify-center font-montserrat">
      <div className="w-full sm:p-8">
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">
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

            {/* Set up Stripe Button */}
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
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
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
            </div>

            {/* Submit Button using reusable Button component */}
            <Button type="submit" variant="primary" fullWidth rounded>
              Submit
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Payment;
