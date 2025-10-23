import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ModalOfferPublished from "./ModalOfferPublished";
import DateInput from "../../components/common/DateInput";
import logoMobile from "../../assets/images/mobileLogo.png";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { FiEdit3 } from "react-icons/fi";

const steps = [
  { id: 1, title: "Pickup" },
  { id: 2, title: "Delivery" },
  { id: 3, title: "Number of Horses" },
  { id: 4, title: "Additional Information & Uploads" },
  { id: 5, title: "Review your shipment details" },
];

const registeredNames = ["Starfire", "Lightning", "Thunder", "Blaze"];
const breeds = ["Arabian", "Thoroughbred", "Quarter Horse", "Warmblood"];
const sexes = ["Male", "Female"];

const NewShipment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Pickup
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTimeOption, setPickupTimeOption] = useState("on");
  const [pickupDate, setPickupDate] = useState("");

  // Step 2: Delivery
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryTimeOption, setDeliveryTimeOption] = useState("on");
  const [deliveryDate, setDeliveryDate] = useState("");

  // Step 3 & 4: Horses
  const [numberOfHorses, setNumberOfHorses] = useState(1);
  const [horses, setHorses] = useState([
    {
      registeredName: "",
      barnName: "",
      breed: "",
      colour: "",
      age: "",
      sex: "",
      photo: null,
      cogins: null,
      healthCertificate: null,
      generalInfo: "",
    },
  ]);

  const [additionalInfo, setAdditionalInfo] = useState("");
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update horses array when numberOfHorses changes
  useEffect(() => {
    const diff = numberOfHorses - horses.length;
    if (diff > 0) {
      setHorses((prev) => [
        ...prev,
        ...Array(diff).fill({
          registeredName: "",
          barnName: "",
          breed: "",
          colour: "",
          age: "",
          sex: "",
          photo: null,
          cogins: null,
          healthCertificate: null,
          generalInfo: "",
        }),
      ]);
    } else if (diff < 0) {
      setHorses((prev) => prev.slice(0, numberOfHorses));
    }
  }, [numberOfHorses]);

  const handleCancel = () => {
    setPickupLocation("");
    setPickupTimeOption("on");
    setPickupDate("");
    setDeliveryLocation("");
    setDeliveryTimeOption("on");
    setDeliveryDate("");
    setNumberOfHorses(1);
    setHorses([
      {
        registeredName: "",
        barnName: "",
        breed: "",
        colour: "",
        age: "",
        sex: "",
        photo: null,
        cogins: null,
        healthCertificate: null,
        generalInfo: "",
      },
    ]);
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
      if (!pickupTimeOption) stepErrors.pickupTimeOption = "Select time option";
      if (!pickupDate) stepErrors.pickupDate = "Pickup date is required";
    } else if (currentStep === 2) {
      if (!deliveryLocation.trim())
        stepErrors.deliveryLocation = "Delivery location is required";
      if (!deliveryDate) stepErrors.deliveryDate = "Delivery date is required";
    } else if (currentStep === 3) {
      horses.forEach((h, idx) => {
        if (!h.registeredName)
          stepErrors[`registeredName${idx}`] = "Registered Name required";
        if (!h.barnName) stepErrors[`barnName${idx}`] = "Barn Name required";
        if (!h.breed) stepErrors[`breed${idx}`] = "Breed required";
        if (!h.colour) stepErrors[`colour${idx}`] = "Colour required";
        if (!h.age) stepErrors[`age${idx}`] = "Age required";
        if (!h.sex) stepErrors[`sex${idx}`] = "Sex required";
      });
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < steps.length) setCurrentStep((prev) => prev + 1);
    else setIsModalOpen(true);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col w-full gap-4">
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
              <label className="block text-sm font-semibold mb-1 text-gray-500">
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
              <DateInput
                value={pickupDate}
                onChange={setPickupDate}
                error={errors.pickupDate}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col w-full gap-4">
            <div>
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
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-500">
                When should your horse(s) be delivered?
              </label>
              <select
                value={deliveryTimeOption}
                onChange={(e) => setDeliveryTimeOption(e.target.value)}
                className="text-gray-500 w-full border border-gray-300 rounded hover:bg-gray-300"
                style={{
                  height: "38px",
                  borderRadius: "6px",
                  padding: "9px 10px",
                  background: "#F3F4F6",
                }}
              >
                <option value="on">On</option>
                <option value="before">Before</option>
                <option value="after">After</option>
                <option value="between">Between</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-500">
                Delivery Date
              </label>
              <DateInput
                value={deliveryDate}
                onChange={setDeliveryDate}
                error={errors.deliveryDate}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col w-full gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-500">
                Number of Horses
              </label>
              <input
                type="number"
                min={1}
                value={numberOfHorses}
                onChange={(e) => setNumberOfHorses(Number(e.target.value))}
                className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2"
              />
            </div>
            {horses.map((horse, idx) => (
              <div key={idx} className="border rounded p-3 space-y-2 bg-white">
                <h3 className="font-semibold text-gray-600">Horse {idx + 1}</h3>
                <input
                  type="text"
                  placeholder="Registered Name"
                  value={horse.registeredName}
                  onChange={(e) =>
                    handleHorseChange(idx, "registeredName", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1"
                />
                <input
                  type="text"
                  placeholder="Barn Name"
                  value={horse.barnName}
                  onChange={(e) =>
                    handleHorseChange(idx, "barnName", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1"
                />
                <select
                  value={horse.breed}
                  onChange={(e) =>
                    handleHorseChange(idx, "breed", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">Select Breed</option>
                  {breeds.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Colour"
                  value={horse.colour}
                  onChange={(e) =>
                    handleHorseChange(idx, "colour", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1"
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={horse.age}
                  onChange={(e) =>
                    handleHorseChange(idx, "age", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1"
                />
                <select
                  value={horse.sex}
                  onChange={(e) =>
                    handleHorseChange(idx, "sex", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">Select Sex</option>
                  {sexes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="file"
                  onChange={(e) =>
                    handleHorseFileChange(idx, "photo", e.target.files[0])
                  }
                />
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col w-full gap-4">
            <label className="block text-sm font-semibold mb-1 text-gray-500">
              Additional Information
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Any extra details about your shipment"
            />
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col w-full gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <IoLocationOutline className="text-gray-500 text-lg" />
                <p>
                  <span className="font-semibold">Pickup:</span>{" "}
                  {pickupLocation}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <LuCalendarDays className="text-gray-500 text-lg" />
                <p>
                  {pickupDate} ({pickupTimeOption})
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <IoLocationOutline className="text-gray-500 text-lg" />
                <p>
                  <span className="font-semibold">Delivery:</span>{" "}
                  {deliveryLocation}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <LuCalendarDays className="text-gray-500 text-lg" />
                <p>
                  {deliveryDate} ({deliveryTimeOption})
                </p>
              </div>

              {/* Edit Picture Button */}
              <button
                className="flex items-center gap-2 text-blue-500 hover:underline mt-2"
                onClick={() => setCurrentStep(1)} // Move to Step 1
              >
                <FiEdit3 /> Edit details
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col items-center relative py-10 bg-gray-50 min-h-screen">
      {/* Stepper */}
      <div className="flex w-full max-w-5xl justify-between mb-6 px-4">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === step.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {step.id}
            </div>
            <span className="text-xs mt-1 text-center">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="w-full max-w-5xl px-4">{renderStepContent()}</div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-6">
        {currentStep > 1 && (
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={handlePrevious}
          >
            Previous
          </button>
        )}
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleNext}
        >
          {currentStep === steps.length ? "Submit" : "Next"}
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ModalOfferPublished
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onViewShipments={() => {
            setIsModalOpen(false);
            navigate("/customer/my-shipments");
          }}
        />
      )}
    </div>
  );
};

export default NewShipment;
