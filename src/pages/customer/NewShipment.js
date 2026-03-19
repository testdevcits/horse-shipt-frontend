// /pages/customer/NewShipment.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Step1Pickup from "./steps/Step1Pickup";
import Step2Delivery from "./steps/Step2Delivery";
import Step3HorseInfo from "./steps/Step3HorseInfo";
import Step4HorseDocuments from "./steps/Step4HorseDocs";
import Step5Review from "./steps/Step5Review";

import ModalOfferPublished from "./ModalOfferPublished";
import logoMobile from "../../assets/images/mobileLogo.png";
import Toast from "../../components/common/Toast";
import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";

const steps = [
  { id: 1, title: "Pickup" },
  { id: 2, title: "Delivery" },
  { id: 3, title: "Number of Horses" },
  { id: 4, title: "Additional Information" },
  { id: 5, title: "Review your shipment details" },
];

const defaultHorse = {
  registeredName: "",
  barnName: "",
  breed: "",
  otherBreed: "",
  colour: "",
  age: "",
  sex: "",
  stallType: "",
  size: "",
  photo: null,
  cogins: null,
  healthCertificate: null,
  otherDocuments: null,
  generalInfo: "",
  images: [],
  selectedHorseId: "",
};

const NewShipment = () => {
  const navigate = useNavigate();
  const { myHorses, getMyHorses, createHorse, createShipment } =
    useCustomerShipments();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Pickup
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTimeOption, setPickupTimeOption] = useState("on");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);

  // Step 2: Delivery
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryTimeOption, setDeliveryTimeOption] = useState("on");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryCoords, setDeliveryCoords] = useState(null);

  // Step 3 & 4: Horses
  const [numberOfHorses, setNumberOfHorses] = useState(1);
  const [horses, setHorses] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDocWarning, setShowDocWarning] = useState(false);

  /* ---------------- Load My Horses ---------------- */
  useEffect(() => {
    if (typeof getMyHorses === "function") getMyHorses();
  }, [getMyHorses]);

  /* ---------------- Populate horses from backend ---------------- */
  useEffect(() => {
    if (Array.isArray(myHorses) && myHorses.length) {
      const populatedHorses = myHorses.map((h) => ({
        ...defaultHorse,
        ...h,
        selectedHorseId: h._id,
        stallType: h.stallType || h.defaultStallSize || "",
      }));
      setHorses(populatedHorses);
      setNumberOfHorses(populatedHorses.length);
    } else if (horses.length === 0) {
      // Default first horse
      setHorses([defaultHorse]);
      setNumberOfHorses(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myHorses]);

  /* ---------------- Adjust horses array when numberOfHorses changes ---------------- */
  useEffect(() => {
    setHorses((prev) => {
      const count = Number(numberOfHorses) || 0;
      if (count > prev.length) {
        const diff = count - prev.length;
        return [...prev, ...Array.from({ length: diff }, () => defaultHorse)];
      } else if (count < prev.length) {
        return prev.slice(0, count);
      }
      return prev;
    });
  }, [numberOfHorses]);

  /* ---------------- Horse handlers ---------------- */
  const handleHorseChange = (index, field, value) => {
    setHorses((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleHorseFileChange = (index, field, file) => {
    setHorses((prev) => {
      const updated = [...prev];
      updated[index][field] = file;
      return updated;
    });
  };

  /* ---------------- Clear field error ---------------- */
  const clearError = (field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  /* ---------------- Cancel shipment ---------------- */
  const handleCancel = () => {
    setPickupLocation("");
    setPickupTimeOption("on");
    setPickupDate("");
    setDeliveryLocation("");
    setDeliveryTimeOption("on");
    setDeliveryDate("");
    setNumberOfHorses(1);
    setHorses([defaultHorse]);
    setAdditionalInfo("");
    setCurrentStep(1);
    setErrors({});
    navigate("/customer/dashboard");
  };

  /* ---------------- Step Validation ---------------- */
  const validateStep = () => {
    const stepErrors = {};
    if (currentStep === 1) {
      if (!pickupLocation.trim())
        stepErrors.pickupLocation = "Pickup location required";
      if (!pickupTimeOption) stepErrors.pickupTimeOption = "Select time option";
      if (!pickupDate) stepErrors.pickupDate = "Pickup date required";
    } else if (currentStep === 2) {
      if (!deliveryLocation.trim())
        stepErrors.deliveryLocation = "Delivery location required";
      if (!deliveryDate) stepErrors.deliveryDate = "Delivery date required";
    } else if (currentStep === 3) {
      horses.forEach((h, idx) => {
        if (!h.registeredName)
          stepErrors[`registeredName${idx}`] = "Registered Name required";
        if (!h.barnName) stepErrors[`barnName${idx}`] = "Barn Name required";
        if (!h.breed) stepErrors[`breed${idx}`] = "Breed required";
        if (h.breed === "Other Breed" && !h.otherBreed)
          stepErrors[`otherBreed${idx}`] = "Specify other breed";
        if (!h.sex) stepErrors[`sex${idx}`] = "Sex required";
      });
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  /* ---------------- Navigation ---------------- */
  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep === 4) {
      const missingDocs = horses.some((h) => !h.cogins || !h.healthCertificate);

      if (missingDocs) {
        setShowDocWarning(true); // modal show
        return; // stop next
      }
    }

    if (currentStep < steps.length) setCurrentStep((prev) => prev + 1);
    else handleFinish();
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  /* ---------------- Submit shipment ---------------- */
  const handleFinish = async () => {
    if (!validateStep()) return;

    try {
      const formData = new FormData();

      // 🔹 Pickup
      formData.append("pickupLocation", pickupLocation);
      formData.append("pickupLat", pickupCoords?.lat || "");
      formData.append("pickupLng", pickupCoords?.lng || "");
      formData.append("pickupTimeOption", pickupTimeOption);
      formData.append("pickupDate", pickupDate);

      // 🔹 Delivery
      formData.append("deliveryLocation", deliveryLocation);
      formData.append("deliveryLat", deliveryCoords?.lat || "");
      formData.append("deliveryLng", deliveryCoords?.lng || "");
      formData.append("deliveryTimeOption", deliveryTimeOption);
      formData.append("deliveryDate", deliveryDate);

      // 🔹 Other details
      formData.append("numberOfHorses", numberOfHorses);
      formData.append("additionalInfo", additionalInfo);

      // 🔹 Horses
      horses.forEach((h, idx) => {
        formData.append(`horses[${idx}][registeredName]`, h.registeredName);
        formData.append(`horses[${idx}][barnName]`, h.barnName);
        formData.append(`horses[${idx}][breed]`, h.breed);
        formData.append(`horses[${idx}][otherBreed]`, h.otherBreed || "");
        formData.append(`horses[${idx}][colour]`, h.colour || "");
        formData.append(`horses[${idx}][age]`, h.age || "");
        formData.append(`horses[${idx}][sex]`, h.sex || "");
        formData.append(`horses[${idx}][stallType]`, h.stallType || "");
        formData.append(`horses[${idx}][size]`, h.size || "");
        formData.append(`horses[${idx}][generalInfo]`, h.generalInfo || "");

        if (h.photo instanceof File)
          formData.append(`horses[${idx}][photo]`, h.photo);
        if (h.cogins instanceof File)
          formData.append(`horses[${idx}][cogins]`, h.cogins);
        if (h.healthCertificate instanceof File)
          formData.append(
            `horses[${idx}][healthCertificate]`,
            h.healthCertificate
          );
        if (h.otherDocuments instanceof File)
          formData.append(`horses[${idx}][otherDocuments]`, h.otherDocuments);
      });

      await createShipment(formData);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      setToast({ message: "Failed to create shipment", type: "error" });
    }
  };

  /* ---------------- Render Step Content ---------------- */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Pickup
            pickupLocation={pickupLocation}
            setPickupLocation={setPickupLocation}
            pickupCoords={pickupCoords}
            setPickupCoords={setPickupCoords}
            pickupTimeOption={pickupTimeOption}
            setPickupTimeOption={setPickupTimeOption}
            pickupDate={pickupDate}
            setPickupDate={setPickupDate}
            errors={errors}
            clearError={clearError}
          />
        );
      case 2:
        return (
          <Step2Delivery
            deliveryLocation={deliveryLocation}
            setDeliveryLocation={setDeliveryLocation}
            deliveryCoords={deliveryCoords}
            setDeliveryCoords={setDeliveryCoords}
            deliveryTimeOption={deliveryTimeOption}
            setDeliveryTimeOption={setDeliveryTimeOption}
            deliveryDate={deliveryDate}
            setDeliveryDate={setDeliveryDate}
            errors={errors}
            clearError={clearError}
          />
        );
      case 3:
        return (
          <Step3HorseInfo
            numberOfHorses={numberOfHorses}
            setNumberOfHorses={setNumberOfHorses}
            horses={horses}
            setHorses={setHorses}
            handleHorseChange={handleHorseChange}
            myHorses={myHorses}
            getMyHorses={getMyHorses}
            createHorse={createHorse}
          />
        );
      case 4:
        return (
          <Step4HorseDocuments
            horses={horses}
            handleHorseChange={handleHorseChange}
            handleHorseFileChange={handleHorseFileChange}
            setAdditionalInfo={setAdditionalInfo}
            errors={errors}
            clearError={clearError}
            showWarning={showDocWarning}
            onCloseWarning={() => {
              setShowDocWarning(false);
              setCurrentStep(5);
            }}
          />
        );
      case 5:
        return (
          <Step5Review
            pickupLocation={pickupLocation}
            pickupDate={pickupDate}
            pickupTimeOption={pickupTimeOption}
            deliveryLocation={deliveryLocation}
            deliveryDate={deliveryDate}
            deliveryTimeOption={deliveryTimeOption}
            numberOfHorses={numberOfHorses}
            horses={horses}
            additionalInfo={additionalInfo}
            onEditStep={setCurrentStep}
          />
        );
      default:
        return null;
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="w-full flex flex-col items-center relative py-10">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Stepper */}
      <div className="w-full max-w-4xl flex gap-2 relative mb-10 px-4 items-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          return (
            <div key={step.id} className="flex-1 flex justify-center relative">
              {isCurrent && (
                <img
                  src={logoMobile}
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

      {/* Header */}
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

      {/* Step Title */}
      <div className="w-full max-w-5xl px-4 mb-4 mt-4">
        <p className="font-montserrat text-xl font-semibold text-gray-700">
          {steps[currentStep - 1].title}
        </p>
      </div>

      {/* Step Content */}
      <div className="w-full max-w-5xl px-4">{renderStepContent()}</div>

      {/* Navigation Buttons */}
      <div className="flex w-full max-w-5xl justify-between md:justify-end gap-4 mt-6 px-4">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-lg font-montserrat border ${
            currentStep === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-500 border-gray-300 hover:bg-[#BF9B53] hover:text-white"
          }`}
        >
          Previous
        </button>
        <button
          onClick={() =>
            currentStep === steps.length ? handleFinish() : handleNext()
          }
          className="px-6 py-2 rounded-lg font-montserrat bg-[#BF9B53] text-white hover:bg-[#a7863e]"
        >
          {currentStep === steps.length ? "Finish" : "Next"}
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ModalOfferPublished
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onViewShipments={() => {
            setIsModalOpen(false);
            navigate("/customer/dashboard");
          }}
          onAnotherAction={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default NewShipment;
