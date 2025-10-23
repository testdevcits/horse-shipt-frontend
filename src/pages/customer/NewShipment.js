import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoMobile from "../../assets/images/mobileLogo.png";
import ModalOfferPublished from "./ModalOfferPublished";
import DateInput from "../../components/common/DateInput";

const steps = [
  { id: 1, title: "Pickup" },
  { id: 2, title: "Delivery" },
  { id: 3, title: "Number of Horses" },
  { id: 4, title: "Additional Information" },
  { id: 5, title: "Review your shipment details" },
];

const registeredNames = ["Thunderbolt", "Silver Star", "Majestic", "Shadow"];
const breeds = ["Arabian", "Thoroughbred", "Quarter Horse", "Morgan"];
const sexes = ["Male", "Female"];

const NewShipment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTimeOption, setPickupTimeOption] = useState("on");
  const [pickupDate, setPickupDate] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryTimeOption, setDeliveryTimeOption] = useState("on");
  const [deliveryDate, setDeliveryDate] = useState("");
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
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setCurrentStep(1);
    setErrors({});
    navigate("/customer/dashboard");
  };

  const handleHorseChange = (index, field, value) => {
    const updatedHorses = [...horses];
    updatedHorses[index][field] = value;
    setHorses(updatedHorses);
  };

  const handleHorseFileChange = (index, field, file) => {
    const updatedHorses = [...horses];
    updatedHorses[index][field] = file;
    setHorses(updatedHorses);
  };

  const handleNumberOfHorsesChange = (value) => {
    const count = Math.max(1, parseInt(value) || 1);
    setNumberOfHorses(count);
    const updatedHorses = [...horses];
    while (updatedHorses.length < count) {
      updatedHorses.push({
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
    while (updatedHorses.length > count) {
      updatedHorses.pop();
    }
    setHorses(updatedHorses);
  };

  const validateStep = () => {
    const stepErrors = {};
    if (currentStep === 1) {
      if (!pickupLocation.trim())
        stepErrors.pickupLocation = "Pickup location is required";
      if (!pickupTimeOption)
        stepErrors.pickupTimeOption = "Please select a pickup time option";
      if (!pickupDate) stepErrors.pickupDate = "Pickup date is required";
    } else if (currentStep === 2) {
      if (!deliveryLocation.trim())
        stepErrors.deliveryLocation = "Delivery location is required";
      if (!deliveryTimeOption)
        stepErrors.deliveryTimeOption = "Please select a delivery time option";
      if (!deliveryDate) stepErrors.deliveryDate = "Delivery date is required";
    } else if (currentStep === 3) {
      if (!numberOfHorses) stepErrors.numberOfHorses = "Enter number of horses";
      horses.forEach((horse, idx) => {
        if (!horse.registeredName)
          stepErrors[`registeredName${idx}`] = "Select registered name";
        if (!horse.barnName) stepErrors[`barnName${idx}`] = "Enter barn name";
        if (!horse.breed) stepErrors[`breed${idx}`] = "Select breed";
        if (!horse.colour) stepErrors[`colour${idx}`] = "Enter colour";
        if (!horse.age) stepErrors[`age${idx}`] = "Enter age";
        if (!horse.sex) stepErrors[`sex${idx}`] = "Select sex";
      });
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log("Final Values:", {
        pickupLocation,
        pickupTimeOption,
        pickupDate,
        deliveryLocation,
        deliveryTimeOption,
        deliveryDate,
        numberOfHorses,
        horses,
      });
      setIsModalOpen(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
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
                When can your horse(s) be delivered?
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
          <div className="flex flex-col w-full max-w-5xl gap-4 font-montserrat">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-500">
                Number of Horses
              </label>
              <input
                type="number"
                value={numberOfHorses}
                onChange={(e) => handleNumberOfHorsesChange(e.target.value)}
                placeholder="Enter number of horses"
                className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2"
              />
              {errors.numberOfHorses && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.numberOfHorses}
                </p>
              )}
            </div>

            {horses.map((horse, idx) => (
              <div key={idx} className="border p-4 rounded mb-4">
                <p className="font-semibold mb-2">Horse {idx + 1}</p>

                <div className="flex flex-col mb-2">
                  <label className="text-sm text-gray-500 mb-1">
                    Registered Name
                  </label>
                  <select
                    value={horse.registeredName}
                    onChange={(e) =>
                      handleHorseChange(idx, "registeredName", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-gray-500"
                  >
                    <option value="">Select Name</option>
                    {registeredNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  {errors[`registeredName${idx}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`registeredName${idx}`]}
                    </p>
                  )}
                </div>

                <div className="flex flex-col mb-2">
                  <label className="text-sm text-gray-500 mb-1">
                    Barn Name
                  </label>
                  <input
                    type="text"
                    value={horse.barnName}
                    onChange={(e) =>
                      handleHorseChange(idx, "barnName", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-gray-500"
                  />
                  {errors[`barnName${idx}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`barnName${idx}`]}
                    </p>
                  )}
                </div>

                <div className="flex flex-col mb-2">
                  <label className="text-sm text-gray-500 mb-1">Breed</label>
                  <select
                    value={horse.breed}
                    onChange={(e) =>
                      handleHorseChange(idx, "breed", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-gray-500"
                  >
                    <option value="">Select Breed</option>
                    {breeds.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  {errors[`breed${idx}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`breed${idx}`]}
                    </p>
                  )}
                </div>

                <div className="flex flex-col mb-2">
                  <label className="text-sm text-gray-500 mb-1">Colour</label>
                  <input
                    type="text"
                    value={horse.colour}
                    onChange={(e) =>
                      handleHorseChange(idx, "colour", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-gray-500"
                  />
                  {errors[`colour${idx}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`colour${idx}`]}
                    </p>
                  )}
                </div>

                <div className="flex flex-col mb-2">
                  <label className="text-sm text-gray-500 mb-1">Age</label>
                  <input
                    type="number"
                    value={horse.age}
                    onChange={(e) =>
                      handleHorseChange(idx, "age", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-gray-500"
                  />
                  {errors[`age${idx}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`age${idx}`]}
                    </p>
                  )}
                </div>

                <div className="flex flex-col mb-2">
                  <label className="text-sm text-gray-500 mb-1">Sex</label>
                  <select
                    value={horse.sex}
                    onChange={(e) =>
                      handleHorseChange(idx, "sex", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1 text-gray-500"
                  >
                    <option value="">Select Sex</option>
                    {sexes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors[`sex${idx}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`sex${idx}`]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col w-full max-w-5xl gap-4 font-montserrat">
            {horses.map((horse, idx) => (
              <div key={idx} className="border p-4 rounded mb-4">
                <p className="font-semibold mb-2">
                  Horse {idx + 1} -{" "}
                  {horse.registeredName || "Name not selected"}
                </p>

                {/* Upload Photo */}
                <p className="text-sm font-semibold mb-1">
                  Upload a photo of the horse
                </p>
                <p className="text-gray-500 text-sm mb-2">
                  A picture enhances your listing, making it more appealing and
                  increasing the likelihood of attracting attention from
                  potential carriers.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleHorseFileChange(idx, "photo", e.target.files[0])
                  }
                  className="w-full h-20 border-2 border-dashed rounded-lg p-2 mb-4"
                />

                {/* Documents */}
                <p className="text-sm font-semibold mb-1">Documents</p>
                <p className="text-gray-500 text-sm mb-2">
                  Provide the required paperwork to facilitate a smooth and safe
                  delivery process.
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      handleHorseFileChange(idx, "cogins", e.target.files[0])
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    placeholder="Cog-ins"
                  />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      handleHorseFileChange(
                        idx,
                        "healthCertificate",
                        e.target.files[0]
                      )
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    placeholder="Health Certificate"
                  />
                </div>

                {/* General Information */}
                <p className="text-sm font-semibold mt-4 mb-1">
                  General Information
                </p>
                <p className="text-gray-500 text-sm mb-2">
                  Describe any specific preferences or restrictions you may have
                  for the shipment, such as preferred vehicle types and other
                  relevant details.
                </p>
                <textarea
                  value={horse.generalInfo}
                  onChange={(e) =>
                    handleHorseChange(idx, "generalInfo", e.target.value)
                  }
                  className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2"
                  placeholder="General information"
                />
              </div>
            ))}
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
              <li>
                Delivery: {deliveryLocation} on {deliveryDate} (
                {deliveryTimeOption})
              </li>
              <li>Number of horses: {numberOfHorses}</li>
              {horses.map((h, idx) => (
                <li key={idx}>
                  <strong>Horse {idx + 1}:</strong> {h.registeredName}, Barn:{" "}
                  {h.barnName}, Breed: {h.breed}, Colour: {h.colour}, Age:{" "}
                  {h.age}, Sex: {h.sex}
                  <br />
                  Photo: {h.photo ? h.photo.name : "Not uploaded"}
                  <br />
                  Cog-ins: {h.cogins ? h.cogins.name : "Not uploaded"}
                  <br />
                  Health Certificate:{" "}
                  {h.healthCertificate
                    ? h.healthCertificate.name
                    : "Not uploaded"}
                  <br />
                  General Info: {h.generalInfo || "N/A"}
                </li>
              ))}
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
      <div className="flex-1 w-full max-w-5xl flex flex-col items-start mt-6 pb-8">
        <p className="font-montserrat text-gray-500 text-[20px] leading-[30px] mb-4">
          {steps[currentStep - 1].title}
        </p>
        {renderStepContent()}

        {/* Buttons */}
        <div className="flex w-full justify-between md:justify-end gap-4 mt-6">
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
            className="px-6 py-2 rounded-lg font-montserrat bg-[#BF9B53] text-white hover:bg-[#A67A3D]"
          >
            {currentStep === steps.length ? "Finish" : "Next"}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <ModalOfferPublished onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default NewShipment;
