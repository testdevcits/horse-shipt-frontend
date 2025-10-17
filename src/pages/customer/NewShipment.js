import React, { useState, useEffect } from "react";
import logoDesktop from "../../assets/images/logo.png"; // desktop logo
import logoMobile from "../../assets/images/mobileLogo.png"; // mobile/tablet logo

const steps = [
  { id: 1, title: "Pickup" },
  { id: 2, title: "Delivery" },
  { id: 3, title: "Number of horses" },
  { id: 4, title: "Additional Information" },
  { id: 5, title: "Review your shipment details" },
];

const NewShipment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Form state for Step 1
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTimeOption, setPickupTimeOption] = useState("");
  const [pickupDate, setPickupDate] = useState("");

  // Error state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const validateStep = () => {
    const stepErrors = {};
    if (currentStep === 1) {
      if (!pickupLocation.trim())
        stepErrors.pickupLocation = "Pickup location is required";
      if (!pickupTimeOption)
        stepErrors.pickupTimeOption = "Please select a time option";
      if (!pickupDate) stepErrors.pickupDate = "Pickup date is required";
    }
    // Add more validations for other steps if needed
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < steps.length) setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col w-full max-w-5xl gap-4 font-montserrat">
            {/* Pickup Location */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Enter pickup location"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              {errors.pickupLocation && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.pickupLocation}
                </p>
              )}
            </div>

            {/* Pickup Time Option */}
            <div>
              <label className="block font-semibold text-sm mb-1 text-gray-500">
                When can your horse(s) be picked up?
              </label>
              <select
                value={pickupTimeOption}
                onChange={(e) => setPickupTimeOption(e.target.value)}
                className="text-gray-500 w-full border border-gray-300 rounded hover:bg-gray-300"
                style={{
                  height: "38px",
                  borderRadius: "6px",
                  padding: "9px 10px",
                  background: "#F3F4F6",
                  opacity: 1,
                }}
              >
                <option value="">Select</option>
                <option value="on">On</option>
                <option value="before">Before</option>
                <option value="after">After</option>
                <option value="between">Between</option>
              </select>
              {errors.pickupTimeOption && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.pickupTimeOption}
                </p>
              )}
            </div>

            {/* Pickup Date */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-500">
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full text-gray-500 border border-gray-300 rounded px-3 py-2"
              />
              {errors.pickupDate && (
                <p className="text-red-500 text-sm mt-1">{errors.pickupDate}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return <div>Step 2: Delivery Form</div>;
      case 3:
        return <div>Step 3: Number of horses Form</div>;
      case 4:
        return <div>Step 4: Additional Information Form</div>;
      case 5:
        return <div>Step 5: Review your shipment details</div>;
      default:
        return null;
    }
  };

  const currentLogo = logoMobile;

  return (
    <div className="w-full h-screen flex flex-col items-center relative">
      {/* ================= Steps Header ================= */}
      <div className="w-full max-w-4xl flex gap-2 relative mb-10 px-4 items-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex-1 flex justify-center relative">
              {isCurrent && (
                <img
                  src={currentLogo}
                  alt="Step Logo"
                  className="absolute -top-10 w-12 h-12 object-contain z-10"
                />
              )}
              {index <= steps.length - 1 && (
                <div
                  className={`absolute top-5 left-0 w-full h-2 rounded-full ${
                    isCompleted
                      ? "bg-[#BF9B53]"
                      : isCurrent
                      ? "bg-[#4C3E21]"
                      : "bg-gray-300"
                  }`}
                  style={{ zIndex: 0 }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ================= Step Header ================= */}
      <div className="flex flex-row justify-between w-full max-w-5xl gap-2 relative mt-4 items-center">
        <div className="font-montserrat font-semibold text-[20px] leading-[30px] tracking-[0%]">
          New Shipment
        </div>
        <div className="font-montserrat cursor-pointer text-gray-500">
          Cancel
        </div>
      </div>

      {/* ================= Step Content ================= */}
      <div className="flex-1 w-full max-w-5xl flex flex-col items-start mt-6 overflow-y-auto pb-28">
        <p className="font-montserrat text-gray-500 text-[20px] leading-[30px] mb-4">
          {steps[currentStep - 1].title}
        </p>
        {renderStepContent()}
      </div>

      {/* ================= Buttons ================= */}
      <div className="fixed bottom-4 flex w-full max-w-5xl justify-between md:justify-end gap-4 px-4">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`px-6 py-2 max-w-2xl rounded-lg font-montserrat border ${
            currentStep === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-500 border-gray-300 hover:bg-[#BF9B53] hover:text-white"
          }`}
        >
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === steps.length}
          className={`px-6 py-2 rounded-lg font-montserrat ${
            currentStep === steps.length
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-[#BF9B53] text-white hover:bg-[#a7863e]"
          }`}
        >
          {currentStep === steps.length ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default NewShipment;
