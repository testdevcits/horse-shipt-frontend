import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoMobile from "../../assets/images/mobileLogo.png";
import ModalOfferPublished from "./ModalOfferPublished";
import DateInput from "../../components/common/DateInput";
import { useAuth } from "../../contexts/AuthContext";
import { FiEdit3 } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";

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
  const [pickupTimeOption, setPickupTimeOption] = useState("on");
  const [pickupDate, setPickupDate] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryTimeOption, setDeliveryTimeOption] = useState("on");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [numberOfHorses, setNumberOfHorses] = useState(1);
  const [horses, setHorses] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();
  const currentLogo = logoMobile;

  const handleCancel = () => {
    setPickupLocation("");
    setPickupTimeOption("on");
    setPickupDate("");
    setDeliveryLocation("");
    setDeliveryTimeOption("on");
    setDeliveryDate("");
    setNumberOfHorses(1);
    setHorses([]);
    setAdditionalInfo("");
    setCurrentStep(1);
    setErrors({});
    navigate("/customer/dashboard");
  };

  const validateStep = () => {
    const stepErrors = {};
    if (currentStep === 1) {
      if (!pickupLocation.trim()) stepErrors.pickupLocation = "Required";
      if (!pickupTimeOption) stepErrors.pickupTimeOption = "Select time";
      if (!pickupDate) stepErrors.pickupDate = "Required";
    } else if (currentStep === 2) {
      if (!deliveryLocation.trim()) stepErrors.deliveryLocation = "Required";
      if (!deliveryTimeOption) stepErrors.deliveryTimeOption = "Select time";
      if (!deliveryDate) stepErrors.deliveryDate = "Required";
    } else if (currentStep === 3) {
      if (!numberOfHorses || numberOfHorses < 1)
        stepErrors.numberOfHorses = "Enter number of horses";
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep === 3) {
      // Initialize horses array based on numberOfHorses
      const newHorses = [];
      for (let i = 0; i < numberOfHorses; i++) {
        newHorses.push({
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
        });
      }
      setHorses(newHorses);
    }

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log({
        userId: user?._id,
        pickupLocation,
        pickupTimeOption,
        pickupDate,
        deliveryLocation,
        deliveryTimeOption,
        deliveryDate,
        numberOfHorses,
        horses,
        additionalInfo,
      });
      setIsModalOpen(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleHorseChange = (idx, key, value) => {
    const updatedHorses = [...horses];
    updatedHorses[idx][key] = value;
    setHorses(updatedHorses);
  };

  const handleHorseFileChange = (idx, key, file) => {
    const updatedHorses = [...horses];
    updatedHorses[idx][key] = file;
    setHorses(updatedHorses);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col w-full max-w-5xl gap-4 font-montserrat relative">
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

            <div className="relative w-full">
              <label className="block text-sm font-semibold mb-1 text-gray-500">
                Date
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
          <div className="flex flex-col w-full max-w-5xl gap-4 font-montserrat relative">
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
              <label className="block font-semibold text-sm mb-1 text-gray-500">
                When do you want delivery?
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
              {errors.deliveryTimeOption && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.deliveryTimeOption}
                </p>
              )}
            </div>

            <div className="relative w-full">
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
          <div className="flex flex-col w-full max-w-5xl gap-4 font-montserrat relative">
            <label className="block text-sm font-semibold mb-1 text-gray-500">
              Number of Horses
            </label>
            <input
              type="number"
              value={numberOfHorses}
              min={1}
              onChange={(e) => setNumberOfHorses(Number(e.target.value))}
              placeholder="Enter number of horses"
              className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2"
            />
            {errors.numberOfHorses && (
              <p className="text-red-500 text-sm mt-1">
                {errors.numberOfHorses}
              </p>
            )}

            {Array.from({ length: numberOfHorses }).map((_, idx) => (
              <div key={idx} className="mt-2">
                <p className="font-semibold mb-2">Horse {idx + 1}</p>
                <input
                  type="text"
                  placeholder="Registered Name"
                  value={horses[idx]?.registeredName || ""}
                  onChange={(e) =>
                    handleHorseChange(idx, "registeredName", e.target.value)
                  }
                  className="border border-gray-300 rounded px-2 py-1 mb-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Barn Name"
                  value={horses[idx]?.barnName || ""}
                  onChange={(e) =>
                    handleHorseChange(idx, "barnName", e.target.value)
                  }
                  className="border border-gray-300 rounded px-2 py-1 mb-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Breed"
                  value={horses[idx]?.breed || ""}
                  onChange={(e) =>
                    handleHorseChange(idx, "breed", e.target.value)
                  }
                  className="border border-gray-300 rounded px-2 py-1 mb-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Colour"
                  value={horses[idx]?.colour || ""}
                  onChange={(e) =>
                    handleHorseChange(idx, "colour", e.target.value)
                  }
                  className="border border-gray-300 rounded px-2 py-1 mb-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Age"
                  value={horses[idx]?.age || ""}
                  onChange={(e) =>
                    handleHorseChange(idx, "age", e.target.value)
                  }
                  className="border border-gray-300 rounded px-2 py-1 mb-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Sex"
                  value={horses[idx]?.sex || ""}
                  onChange={(e) =>
                    handleHorseChange(idx, "sex", e.target.value)
                  }
                  className="border border-gray-300 rounded px-2 py-1 mb-2 w-full"
                />
              </div>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col w-full max-w-5xl gap-4 font-montserrat relative">
            <label className="block text-sm font-semibold mb-1 text-gray-500">
              Additional Information
            </label>
            {horses.map((horse, idx) => (
              <div key={idx} className="mt-4">
                <p
                  className="font-semibold mb-2"
                  style={{
                    borderRadius: "15px",
                    padding: "14px",
                    background: "#F2EBDD",
                    display: "flex",
                    alignItems: "center",
                    opacity: 1,
                  }}
                >
                  Horse {idx + 1} - {horse.registeredName || "Unnamed"}
                </p>

                <div className="flex flex-col mb-2">
                  <label className="text-sm text-gray-500 mb-1">
                    Upload a photo of the horse
                  </label>
                  <p className="text-xs text-gray-400 mb-1">
                    A picture enhances your listing, making it more appealing...
                  </p>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleHorseFileChange(idx, "photo", e.target.files[0])
                    }
                    className="border border-dashed border-gray-400 rounded p-2"
                  />
                </div>

                <div className="flex flex-col mb-2">
                  <label className="text-sm text-gray-500 mb-1">
                    Documents
                  </label>
                  <p className="text-xs text-gray-400 mb-1">
                    Provide the required paperwork to facilitate smooth
                    delivery...
                  </p>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleHorseFileChange(idx, "cogins", e.target.files[0])
                    }
                    className="border border-dashed border-gray-400 rounded p-2 mb-2"
                  />
                  <input
                    type="file"
                    onChange={(e) =>
                      handleHorseFileChange(
                        idx,
                        "healthCertificate",
                        e.target.files[0]
                      )
                    }
                    className="border border-dashed border-gray-400 rounded p-2"
                  />
                </div>

                <div className="flex flex-col mb-2">
                  <label className="text-sm text-gray-500 mb-1">
                    General Information
                  </label>
                  <p className="text-xs text-gray-400 mb-1">
                    Describe any specific preferences...
                  </p>
                  <textarea
                    value={horse.generalInfo}
                    onChange={(e) =>
                      handleHorseChange(idx, "generalInfo", e.target.value)
                    }
                    className="border border-gray-300 rounded p-2"
                  />
                </div>
              </div>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col w-full max-w-5xl gap-2 font-montserrat">
            <p className="text-gray-700">Review your shipment details:</p>
            <div className="text-gray-600 flex flex-col gap-3 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              {/* Pickup */}
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-semibold text-gray-700">Pickup:</p>
                <div className="flex items-center gap-1">
                  <IoLocationOutline className="text-gray-500 text-lg" />
                  <span>{pickupLocation}</span>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <LuCalendarDays className="text-gray-500 text-lg" />
                  <span>
                    {pickupDate} ({pickupTimeOption})
                  </span>
                </div>
              </div>

              {/* Delivery */}
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-semibold text-gray-700">Delivery:</p>
                <div className="flex items-center gap-1">
                  <IoLocationOutline className="text-gray-500 text-lg" />
                  <span>{deliveryLocation}</span>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <LuCalendarDays className="text-gray-500 text-lg" />
                  <span>
                    {deliveryDate} ({deliveryTimeOption})
                  </span>
                </div>
              </div>

              <button
                className="flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-800 transition"
                onClick={() => setCurrentStep(3)}
              >
                <FiEdit3 className="text-base" /> Edit Horse Details
              </button>
            </div>
            {/* ---------------- Horse Details ---------------- */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="font-semibold text-gray-800 mb-2">
                Total Horses: {numberOfHorses}
              </p>

              {numberOfHorses > 1 && (
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="font-semibold text-gray-700 text-sm">
                    Select Horse:
                  </label>
                  <select
                    value={selectedHorse}
                    onChange={(e) => setSelectedHorse(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {horses.map((h, idx) => (
                      <option key={idx} value={idx}>
                        Horse {idx + 1} - {h.registeredName || "Unnamed"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Selected Horse Info */}
              {horses.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-800 mb-2">
                    Horse {selectedHorse + 1} -{" "}
                    {horses[selectedHorse].registeredName || "Unnamed"}
                  </p>
                  <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                    <p>
                      <strong>Breed:</strong>{" "}
                      {horses[selectedHorse].breed || "N/A"}
                    </p>
                    <p>
                      <strong>Colour:</strong>{" "}
                      {horses[selectedHorse].colour || "N/A"}
                    </p>
                    <p>
                      <strong>Age:</strong> {horses[selectedHorse].age || "N/A"}
                    </p>
                    <p>
                      <strong>Sex:</strong> {horses[selectedHorse].sex || "N/A"}
                    </p>
                    <p>
                      <strong>Photo:</strong>{" "}
                      {horses[selectedHorse].photo?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Cog-ins:</strong>{" "}
                      {horses[selectedHorse].cogins?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Health Certificate:</strong>{" "}
                      {horses[selectedHorse].healthCertificate?.name || "N/A"}
                    </p>
                    <p>
                      <strong>General Info:</strong>{" "}
                      {horses[selectedHorse].generalInfo || "N/A"}
                    </p>
                  </div>

                  <button
                    className="flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-800 transition"
                    onClick={() => setCurrentStep(3)}
                  >
                    <FiEdit3 className="text-base" /> Edit Horse Details
                  </button>
                </div>
              )}
            </div>

            {/* ---------------- Additional Info ---------------- */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="font-semibold text-gray-700 mb-1">
                Additional Info:
              </p>
              <p className="text-gray-600">{additionalInfo || "N/A"}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <img src={currentLogo} alt="Logo" className="h-12" />
        <button onClick={handleCancel} className="text-red-500">
          Cancel
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-4">
        {steps[currentStep - 1].title}
      </h2>
      {renderStepContent()}

      <div className="flex justify-between mt-4">
        {currentStep > 1 && (
          <button
            onClick={handlePrevious}
            className="px-4 py-2 border rounded hover:bg-gray-200"
          >
            Previous
          </button>
        )}
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {currentStep === steps.length ? "Finish" : "Next"}
        </button>
      </div>

      {isModalOpen && (
        <ModalOfferPublished
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Shipment Submitted"
        >
          <p>All shipment details have been logged successfully!</p>
        </ModalOfferPublished>
      )}
    </div>
  );
};

export default NewShipment;
