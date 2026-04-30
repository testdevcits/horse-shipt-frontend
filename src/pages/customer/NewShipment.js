import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Step1Pickup from "./steps/Step1Pickup";
import Step2Delivery from "./steps/Step2Delivery";
import Step3HorseInfo from "./steps/Step3HorseInfo";
import Step4HorseDocuments from "./steps/Step4HorseDocs";
import Step5Review from "./steps/Step5Review";

import ModalOfferPublished from "./ModalOfferPublished";
import logoMobile from "../../assets/images/mobileLogo.png";
import Toast from "../../components/common/Toast";
import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";
import PageLoader from "../../components/common/PageLoader";

const steps = [
  { id: 1, title: "Pickup Date" },
  { id: 2, title: "Select Drop-Off Date" },
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
  notes: "",
};

const NewShipment = () => {
  const navigate = useNavigate();
  const {
    myHorses,
    getMyHorses,
    createHorse,
    createShipment,
    fetchShipmentById,
    updateShipment,
  } = useCustomerShipments();

  const location = useLocation();
  const { id } = useParams();

  const isEditMode = location.state?.editMode;
  const shipmentDataFromState = location.state?.shipment;

  // ===== MAIN STATE =====
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [editingHorseIdx, setEditingHorseIdx] = useState(null);
  const [isInitializing, setIsInitializing] = useState(isEditMode);

  // ===== STEP 1: PICKUP =====
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTimeOption, setPickupTimeOption] = useState("on");
  const [pickupStartDate, setPickupStartDate] = useState("");
  const [pickupEndDate, setPickupEndDate] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);

  // ===== STEP 2: DELIVERY =====
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryTimeOption, setDeliveryTimeOption] = useState("on");
  const [deliveryStartDate, setDeliveryStartDate] = useState("");
  const [deliveryEndDate, setDeliveryEndDate] = useState("");
  const [deliveryCoords, setDeliveryCoords] = useState(null);

  // ===== STEP 3 & 4: HORSES =====
  const [numberOfHorses, setNumberOfHorses] = useState(1);
  const [horses, setHorses] = useState([{ ...defaultHorse }]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDocWarning, setShowDocWarning] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");

  //  Track if myHorses have been applied once in create mode
  const myHorsesApplied = useRef(false);

  /* ==========================================
     EFFECT: LOAD DATA IN EDIT MODE
     ========================================== */
  useEffect(() => {
    const loadData = async () => {
      try {
        let data = shipmentDataFromState;

        if (!data && id) {
          data = await fetchShipmentById(id);
        }

        if (data) {
          // Pickup
          setPickupLocation(data.pickupLocation || "");
          setPickupTimeOption(data.pickupTimeOption || "on");
          setPickupCoords(
            data.pickupCoords
              ? {
                  lat: data.pickupCoords?.latitude || data.pickupCoords?.lat,
                  lng: data.pickupCoords?.longitude || data.pickupCoords?.lng,
                }
              : null
          );
          setPickupStartDate(data.pickupDateRange?.start?.split("T")[0] || "");
          setPickupEndDate(data.pickupDateRange?.end?.split("T")[0] || "");

          // Delivery
          setDeliveryLocation(data.deliveryLocation || "");
          setDeliveryTimeOption(data.deliveryTimeOption || "on");
          setDeliveryCoords(
            data.deliveryCoords
              ? {
                  lat:
                    data.deliveryCoords?.latitude || data.deliveryCoords?.lat,
                  lng:
                    data.deliveryCoords?.longitude || data.deliveryCoords?.lng,
                }
              : null
          );
          setDeliveryStartDate(
            data.deliveryDateRange?.start?.split("T")[0] || ""
          );
          setDeliveryEndDate(data.deliveryDateRange?.end?.split("T")[0] || "");

          // Other
          setNumberOfHorses(data.numberOfHorses || 1);
          setAdditionalInfo(data.additionalInfo || "");
          setRecipientEmail(data.recipientEmail || "");

          // ✅ Only set the horses that belong to this shipment
          if (Array.isArray(data.horses) && data.horses.length > 0) {
            const processedHorses = data.horses.map((h) => ({
              registeredName: h.registeredName || "",
              barnName: h.barnName || "",
              breed: h.breed || "",
              otherBreed: h.otherBreed || "",
              colour: h.colour || "",
              age: h.age?.toString() || "",
              sex: h.sex || "",
              stallType: h.requestedStallSize || h.stallType || "",
              size: h.size || "",
              photo: h.photo?.url || null,
              cogins: h.documents?.coggins?.url || null,
              healthCertificate: h.documents?.healthCertificate?.url || null,
              otherDocuments: h.documents?.other?.url || null,
              generalInfo: h.generalInfo || "",
              images: [],
              selectedHorseId: h._id || "",
              notes: h.notes || "",
            }));

            setHorses(processedHorses);
          }
        }
      } catch (error) {
        console.error("Error loading shipment data:", error);
        Toast.error("Failed to load shipment data");
      } finally {
        setIsInitializing(false);
      }
    };

    if (isEditMode) {
      loadData();
    } else {
      setIsInitializing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode, fetchShipmentById, shipmentDataFromState]);

  /* ==========================================
     EFFECT: Load My Horses on Mount (Create Mode Only)
     ========================================== */
  useEffect(() => {
    if (!isEditMode && typeof getMyHorses === "function") {
      getMyHorses();
    }
  }, [getMyHorses, isEditMode]);

  /* ==========================================
     EFFECT: Populate horses from backend ONCE (Create Mode Only)
     ✅ FIX: Use a ref to ensure myHorses is only applied once,
     so user changes to numberOfHorses are not overwritten.
     ========================================== */
  useEffect(() => {
    if (isEditMode || isInitializing || myHorsesApplied.current) return;

    if (Array.isArray(myHorses) && myHorses.length > 0) {
      // Pre-fill with ALL saved horses as default starting point
      // User can change numberOfHorses to select how many they want
      const populatedHorses = myHorses.map((h) => ({
        ...defaultHorse,
        ...h,
        selectedHorseId: h._id,
        stallType: h.stallType || h.defaultStallSize || "",
      }));
      setHorses(populatedHorses);
      // ✅ Do NOT auto-set numberOfHorses here — let user control it
      // Default to 1 so only the first horse shows until user increases count
      setNumberOfHorses(1);
      myHorsesApplied.current = true;
    }
  }, [myHorses, isEditMode, isInitializing]);

  /* ==========================================
     EFFECT: Adjust horses array size when numberOfHorses changes (Create Mode Only)
     ========================================== */
  useEffect(() => {
    if (isEditMode) return;

    setHorses((prev) => {
      const count = Number(numberOfHorses) || 1;

      if (count > prev.length) {
        const diff = count - prev.length;
        return [
          ...prev,
          ...Array.from({ length: diff }, () => ({ ...defaultHorse })),
        ];
      } else if (count < prev.length) {
        return prev.slice(0, count);
      }
      return prev;
    });
  }, [numberOfHorses, isEditMode]);

  /* ==========================================
     HANDLERS: Horse field changes
     ========================================== */
  const handleHorseChange = (index, field, value) => {
    setHorses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleHorseFileChange = (index, field, file) => {
    setHorses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: file };
      return updated;
    });
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  /* ==========================================
     HANDLER: Cancel Shipment
     ========================================== */
  const handleCancel = () => {
    setPickupLocation("");
    setPickupTimeOption("on");
    setPickupStartDate("");
    setPickupEndDate("");
    setDeliveryLocation("");
    setDeliveryTimeOption("on");
    setDeliveryStartDate("");
    setDeliveryEndDate("");
    setNumberOfHorses(1);
    setHorses([{ ...defaultHorse }]);
    setAdditionalInfo("");
    setCurrentStep(1);
    setEditingHorseIdx(null);
    setErrors({});
    navigate("/customer/dashboard");
  };

  /* ==========================================
     VALIDATION: Step by step with delivery date check
     ========================================== */
  const validateStep = () => {
    const stepErrors = {};

    if (currentStep === 1) {
      if (!pickupLocation || !pickupLocation.trim()) {
        stepErrors.pickupLocation = "Pickup location is required";
      }
      if (!pickupTimeOption) {
        stepErrors.pickupTimeOption = "Pickup time option is required";
      }
      if (!pickupStartDate || pickupStartDate.trim() === "") {
        stepErrors.pickupStartDate = "Pickup start date is required";
      }
      if (!pickupEndDate || pickupEndDate.trim() === "") {
        stepErrors.pickupEndDate = "Pickup end date is required";
      }
      if (
        pickupStartDate &&
        pickupEndDate &&
        new Date(pickupEndDate) < new Date(pickupStartDate)
      ) {
        stepErrors.pickupEndDate = "End date cannot be before start date";
      }
    } else if (currentStep === 2) {
      if (!deliveryLocation || !deliveryLocation.trim()) {
        stepErrors.deliveryLocation = "Delivery location is required";
      }
      if (!deliveryStartDate || deliveryStartDate.trim() === "") {
        stepErrors.deliveryStartDate = "Delivery start date is required";
      }
      if (!deliveryEndDate || deliveryEndDate.trim() === "") {
        stepErrors.deliveryEndDate = "Delivery end date is required";
      }
      if (
        deliveryStartDate &&
        deliveryEndDate &&
        new Date(deliveryEndDate) < new Date(deliveryStartDate)
      ) {
        stepErrors.deliveryEndDate = "End date cannot be before start date";
      }
      if (pickupStartDate && deliveryStartDate) {
        if (new Date(deliveryStartDate) < new Date(pickupStartDate)) {
          stepErrors.deliveryStartDate =
            "Delivery date cannot be before pickup date";
        }
      }
      if (pickupEndDate && deliveryEndDate) {
        if (new Date(deliveryEndDate) < new Date(pickupEndDate)) {
          stepErrors.deliveryEndDate =
            "Delivery end date cannot be before pickup end date";
        }
      }
    } else if (currentStep === 3) {
      horses.slice(0, numberOfHorses).forEach((h, idx) => {
        if (!h.registeredName) {
          stepErrors[`registeredName${idx}`] = "Registered Name required";
        }
        if (!h.barnName) {
          stepErrors[`barnName${idx}`] = "Barn Name required";
        }
        if (!h.breed) {
          stepErrors[`breed${idx}`] = "Breed required";
        }
        if (h.breed === "Other Breed" && !h.otherBreed) {
          stepErrors[`otherBreed${idx}`] = "Specify other breed";
        }
        if (!h.sex) {
          stepErrors[`sex${idx}`] = "Sex required";
        }
        if (!h.age) {
          stepErrors[`age${idx}`] = "Age required";
        }
        if (!h.colour) {
          stepErrors[`colour${idx}`] = "Colour required";
        }
        if (!h.stallType) {
          stepErrors[`stallType${idx}`] = "Stall type required";
        }
      });
    } else if (currentStep === 4) {
      horses.slice(0, numberOfHorses).forEach((h, idx) => {
        if (!h.photo) {
          stepErrors[`photo${idx}`] = "Horse photo is required";
        }
      });
    }

    if (recipientEmail && !/\S+@\S+\.\S+/.test(recipientEmail)) {
      Toast.error("Invalid recipient email", 3000);
      return false;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  /* ==========================================
     NAVIGATION: Next/Previous
     ========================================== */
  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep === 4) {
      const missingDocs = horses
        .slice(0, numberOfHorses)
        .some((h) => !h.cogins || !h.healthCertificate);
      if (missingDocs) {
        setShowDocWarning(true);
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  /* ==========================================
     SUBMISSION: Create/Update Shipment
     ========================================== */
  const handleFinish = async () => {
    if (!validateStep()) return;

    try {
      setIsLoading(true);
      const formData = new FormData();

      // Pickup Info
      formData.append("pickupLocation", pickupLocation);
      formData.append("pickupLat", pickupCoords?.lat || "");
      formData.append("pickupLng", pickupCoords?.lng || "");
      formData.append("pickupTimeOption", pickupTimeOption);
      formData.append("pickupStartDate", pickupStartDate);
      formData.append("pickupEndDate", pickupEndDate);

      // Delivery Info
      formData.append("deliveryLocation", deliveryLocation);
      formData.append("deliveryLat", deliveryCoords?.lat || "");
      formData.append("deliveryLng", deliveryCoords?.lng || "");
      formData.append("deliveryTimeOption", deliveryTimeOption);
      formData.append("deliveryStartDate", deliveryStartDate);
      formData.append("deliveryEndDate", deliveryEndDate);

      // Other Details
      formData.append("numberOfHorses", numberOfHorses);
      formData.append("additionalInfo", additionalInfo);
      formData.append("recipientEmail", recipientEmail);

      // ✅ Only send horses up to numberOfHorses
      horses.slice(0, numberOfHorses).forEach((h, idx) => {
        formData.append(
          `horses[${idx}][registeredName]`,
          h.registeredName || ""
        );
        formData.append(`horses[${idx}][barnName]`, h.barnName || "");
        formData.append(`horses[${idx}][breed]`, h.breed || "");
        formData.append(`horses[${idx}][otherBreed]`, h.otherBreed || "");
        formData.append(`horses[${idx}][colour]`, h.colour || "");
        formData.append(`horses[${idx}][age]`, h.age || "");
        formData.append(`horses[${idx}][sex]`, h.sex || "");
        formData.append(`horses[${idx}][stallType]`, h.stallType || "");
        formData.append(`horses[${idx}][size]`, h.size || "");
        formData.append(`horses[${idx}][generalInfo]`, h.generalInfo || "");
        formData.append(`horses[${idx}][notes]`, h.notes || "");

        if (h.photo instanceof File) {
          formData.append(`horses[${idx}][photo]`, h.photo);
        }
        if (h.cogins instanceof File) {
          formData.append(`horses[${idx}][cogins]`, h.cogins);
        }
        if (h.healthCertificate instanceof File) {
          formData.append(
            `horses[${idx}][healthCertificate]`,
            h.healthCertificate
          );
        }
        if (h.otherDocuments instanceof File) {
          formData.append(`horses[${idx}][otherDocuments]`, h.otherDocuments);
        }
      });

      if (isEditMode) {
        await updateShipment(id, formData);
      } else {
        await createShipment(formData);
      }
      setIsModalOpen(true);
    } catch (error) {
      console.error("Shipment creation error:", error);
      Toast.error(
        error?.response?.data?.message || "Failed to create shipment",
        3000
      );
    } finally {
      setIsLoading(true);
    }
  };

  /* ==========================================
     HANDLER: Edit Step
     ========================================== */
  const handleEditStep = (step, horseIdx = null) => {
    if (horseIdx !== null) {
      setEditingHorseIdx(horseIdx);
    }
    setCurrentStep(step);
  };

  /* ==========================================
     RENDER: Step Content
     ========================================== */
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
            pickupStartDate={pickupStartDate}
            setPickupStartDate={setPickupStartDate}
            pickupEndDate={pickupEndDate}
            setPickupEndDate={setPickupEndDate}
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
            deliveryStartDate={deliveryStartDate}
            setDeliveryStartDate={setDeliveryStartDate}
            deliveryEndDate={deliveryEndDate}
            setDeliveryEndDate={setDeliveryEndDate}
            pickupStartDate={pickupStartDate}
            pickupEndDate={pickupEndDate}
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
            editingHorseIdx={editingHorseIdx}
            setEditingHorseIdx={setEditingHorseIdx}
            errors={errors}
            isEditMode={isEditMode}
          />
        );
      case 4:
        return (
          <Step4HorseDocuments
            horses={horses.slice(0, numberOfHorses)}
            handleHorseFileChange={handleHorseFileChange}
            errors={errors}
            clearError={clearError}
            showWarning={showDocWarning}
            onCloseWarning={() => {
              setShowDocWarning(false);
              setCurrentStep(5);
            }}
            recipientEmail={recipientEmail}
            setRecipientEmail={setRecipientEmail}
          />
        );
      case 5:
        return (
          <Step5Review
            pickupLocation={pickupLocation}
            pickupStartDate={pickupStartDate}
            pickupEndDate={pickupEndDate}
            pickupTimeOption={pickupTimeOption}
            deliveryLocation={deliveryLocation}
            deliveryStartDate={deliveryStartDate}
            deliveryEndDate={deliveryEndDate}
            deliveryTimeOption={deliveryTimeOption}
            numberOfHorses={numberOfHorses}
            horses={horses.slice(0, numberOfHorses)}
            additionalInfo={additionalInfo}
            recipientEmail={recipientEmail}
            onEditStep={handleEditStep}
          />
        );
      default:
        return null;
    }
  };

  if (isInitializing) {
    return <PageLoader text="Loading shipment details..." fullScreen={true} />;
  }

  /* ==========================================
     RENDER: Main Component
     ========================================== */
  return (
    <div className="w-full flex flex-col items-center relative py-6">
      {isLoading && (
        <PageLoader text="Processing shipment..." fullScreen={true} />
      )}

      {/* Stepper Progress */}
      <div className="w-full max-w-5xl flex gap-2 relative mb-10 px-2 items-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          return (
            <div key={step.id} className="flex-1 flex justify-center relative">
              {isCurrent && (
                <img
                  src={logoMobile}
                  alt="Current Step"
                  className="absolute -top-10 w-12 h-12 object-contain z-10"
                />
              )}
              {index < steps.length && (
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
      <div className="flex flex-row justify-between w-full max-w-5xl gap-2 relative mt-2 items-center px-4">
        <div className="font-montserrat font-semibold text-[20px] leading-[30px]">
          {isEditMode ? "Edit Shipment" : "New Shipment"}
        </div>
        <div
          className="font-montserrat cursor-pointer text-gray-500 hover:text-gray-700"
          onClick={handleCancel}
        >
          Cancel
        </div>
      </div>

      {/* Step Title */}
      <div className="w-full max-w-5xl px-4 mb-4 mt-4">
        <p className="font-montserrat text-md font-semibold text-gray-700">
          {steps[currentStep - 1]?.title}
        </p>
      </div>

      {/* Step Content */}
      <div className="w-full max-w-5xl">{renderStepContent()}</div>

      {/* Navigation Buttons */}
      <div className="flex w-full max-w-5xl justify-between md:justify-end gap-4 mt-6 px-4">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-lg font-montserrat border transition-all ${
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
          className="px-6 py-2 rounded-lg font-montserrat bg-[#BF9B53] text-white hover:bg-[#a7863e] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          disabled={isLoading}
        >
          {currentStep === steps.length
            ? isEditMode
              ? "Update"
              : "Finish"
            : "Next"}
        </button>
      </div>

      {/* Success Modal */}
      {isModalOpen && (
        <ModalOfferPublished
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onViewShipments={() => {
            setIsModalOpen(false);
            navigate("/customer/orders?tab=draft");
          }}
          onAnotherAction={() => {
            setIsModalOpen(false);
            handleCancel();
          }}
        />
      )}
    </div>
  );
};

export default NewShipment;
