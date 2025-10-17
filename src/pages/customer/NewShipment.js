import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoMobile from "../../assets/images/mobileLogo.png";
import ModalOfferPublished from "./ModalOfferPublished";

const steps = [
  { id: 1, title: "Pickup" },
  { id: 2, title: "Delivery" },
  { id: 3, title: "Number of horses" },
  { id: 4, title: "Additional Information" },
  { id: 5, title: "Review your shipment details" },
];

const NewShipment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTimeOption, setPickupTimeOption] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(""); // example field for step 2
  const [numberOfHorses, setNumberOfHorses] = useState(""); // step 3
  const [additionalInfo, setAdditionalInfo] = useState(""); // step 4
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleCancel = () => {
    setPickupLocation("");
    setPickupTimeOption("");
    setPickupDate("");
    setDeliveryLocation("");
    setNumberOfHorses("");
    setAdditionalInfo("");
    setCurrentStep(1);
    setErrors({});
    navigate("/customer/dashboard");
  };

  const validateStep = () => {
    const stepErrors = {};
    if (currentStep === 1) {
      if (!pickupLocation.trim())
        stepErrors.pickupLocation = "Pickup location is required";
      if (!pickupTimeOption)
        stepErrors.pickupTimeOption = "Please select a time option";
      if (!pickupDate) stepErrors.pickupDate = "Pickup date is required";
    } else if (currentStep === 2) {
      if (!deliveryLocation.trim())
        stepErrors.deliveryLocation = "Delivery location is required";
    } else if (currentStep === 3) {
      if (!numberOfHorses) stepErrors.numberOfHorses = "Enter number of horses";
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Finish clicked on last step
      setIsModalOpen(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };
  const currentLogo = logoMobile;
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col w-full max-w-5xl gap-4 font-montserrat">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-500">
                Pickup Location
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Address"
                className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2"
              />
              {errors.pickupLocation && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.pickupLocation}
                </p>
              )}
            </div>

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
        return (
          <div className="flex flex-col w-full max-w-5xl gap-4 font-montserrat">
            <label className="block text-sm font-semibold mb-1 text-gray-500">
              Delivery Location
            </label>
            <input
              type="text"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder="Address"
              className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2"
            />
            {errors.deliveryLocation && (
              <p className="text-red-500 text-sm mt-1">
                {errors.deliveryLocation}
              </p>
            )}
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col w-full max-w-5xl gap-4 font-montserrat">
            <label className="block text-sm font-semibold mb-1 text-gray-500">
              Number of Horses
            </label>
            <input
              type="number"
              value={numberOfHorses}
              onChange={(e) => setNumberOfHorses(e.target.value)}
              placeholder="Enter number of horses"
              className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2"
            />
            {errors.numberOfHorses && (
              <p className="text-red-500 text-sm mt-1">
                {errors.numberOfHorses}
              </p>
            )}
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col w-full max-w-5xl gap-4 font-montserrat">
            <label className="block text-sm font-semibold mb-1 text-gray-500">
              Additional Information
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any additional info"
              className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2"
            />
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col w-full max-w-5xl gap-2 font-montserrat">
            <p className="text-gray-700">Review your shipment details:</p>
            <ul className="text-gray-600 list-disc ml-5">
              <li>
                Pickup: {pickupLocation} on {pickupDate} ({pickupTimeOption})
              </li>
              <li>Delivery: {deliveryLocation}</li>
              <li>Number of horses: {numberOfHorses}</li>
              <li>Additional Info: {additionalInfo || "N/A"}</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col items-center relative py-10">
      {/* Steps Header */}
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
      {/* Step Header */}
      <div className="flex flex-row justify-between w-full max-w-5xl gap-2 relative mt-4 items-center px-4">
        <div className="font-montserrat font-semibold text-[20px] leading-[30px] tracking-[0%]">
          New Shipment
        </div>
        <div
          className="font-montserrat cursor-pointer text-gray-500"
          onClick={handleCancel}
        >
          Cancel
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 w-full max-w-5xl flex flex-col items-start mt-6 overflow-y-auto pb-28">
        <p className="font-montserrat text-gray-500 text-[20px] leading-[30px] mb-4">
          {steps[currentStep - 1].title}
        </p>
        {renderStepContent()}
      </div>

      {/* Buttons Fixed at Bottom */}
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
          className={`px-6 py-2 rounded-lg font-montserrat ${
            currentStep === steps.length
              ? "bg-[#BF9B53] text-white hover:bg-[#a7863e]"
              : "bg-[#BF9B53] text-white hover:bg-[#a7863e]"
          }`}
        >
          {currentStep === steps.length ? "Finish" : "Next"}
        </button>
      </div>

      {/* Modal */}
      <ModalOfferPublished
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onViewShipments={() => {
          setIsModalOpen(false);
          navigate("/customer/my-shipments");
        }}
        onAnotherAction={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default NewShipment;
