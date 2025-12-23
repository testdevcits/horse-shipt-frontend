import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import ModalOfferPublished from "./ModalOfferPublished";
import DateInput from "../../components/common/DateInput";
import logoMobile from "../../assets/images/mobileLogo.png";
// import { IoLocationOutline } from "react-icons/io5";
// import { LuCalendarDays } from "react-icons/lu";
// import { FiEdit3 } from "react-icons/fi";
import Toast from "../../components/common/Toast";

import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";

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

const libraries = ["places"]; // Required for Google Places Autocomplete

const NewShipment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Pickup
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTimeOption, setPickupTimeOption] = useState("on");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupAutocomplete, setPickupAutocomplete] = useState(null);

  // Step 2: Delivery
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryTimeOption, setDeliveryTimeOption] = useState("on");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAutocomplete, setDeliveryAutocomplete] = useState(null);

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
  const { createShipment } = useCustomerShipments();

  // Handle autocomplete load
  const onPickupLoad = (autocomplete) => setPickupAutocomplete(autocomplete);
  const onDeliveryLoad = (autocomplete) =>
    setDeliveryAutocomplete(autocomplete);

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete) {
      const place = pickupAutocomplete.getPlace();
      setPickupLocation(place.formatted_address || "");
    }
  };

  const onDeliveryPlaceChanged = () => {
    if (deliveryAutocomplete) {
      const place = deliveryAutocomplete.getPlace();
      setDeliveryLocation(place.formatted_address || "");
    }
  };

  // Update horses array when numberOfHorses changes
  useEffect(() => {
    const count = Number(numberOfHorses) || 0;

    if (count > horses.length) {
      const diff = count - horses.length;
      setHorses((prev) => [
        ...prev,
        ...Array.from({ length: diff }, () => ({
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
        })),
      ]);
    }

    if (count < horses.length) {
      setHorses((prev) => prev.slice(0, count));
    }
  }, [numberOfHorses, horses.length]);

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

  const handleFinish = async () => {
    if (!validateStep()) return;

    try {
      const horsesCount = Number(numberOfHorses) || 0;
      const horseList = Array.isArray(horses) ? horses : [];

      const formData = new FormData();
      formData.append("pickupLocation", pickupLocation || "");
      formData.append("pickupTimeOption", pickupTimeOption || "");
      formData.append("pickupDate", pickupDate || "");
      formData.append("deliveryLocation", deliveryLocation || "");
      formData.append("deliveryTimeOption", deliveryTimeOption || "");
      formData.append("deliveryDate", deliveryDate || "");
      formData.append("numberOfHorses", horsesCount);
      formData.append("additionalInfo", additionalInfo || "");

      horseList.forEach((h, idx) => {
        formData.append(
          `horses[${idx}][registeredName]`,
          h.registeredName || ""
        );
        formData.append(`horses[${idx}][barnName]`, h.barnName || "");
        formData.append(`horses[${idx}][breed]`, h.breed || "");
        formData.append(`horses[${idx}][colour]`, h.colour || "");
        formData.append(`horses[${idx}][age]`, h.age || "");
        formData.append(`horses[${idx}][sex]`, h.sex || "");
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
      });

      await createShipment(formData);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error creating shipment:", error);
      Toast.error("Failed to create shipment. Please try again.");
    }
  };

  // --------------------- Render Step Content ---------------------
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col w-full gap-4">
            <LoadScript
              googleMapsApiKey="AIzaSyBSZaXYR38yPQbCk_3uwEJtbkElumVkWw4"
              libraries={libraries}
            >
              <Autocomplete
                onLoad={onPickupLoad}
                onPlaceChanged={onPickupPlaceChanged}
              >
                <input
                  type="text"
                  value={pickupLocation}
                  placeholder="Pickup Address"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </Autocomplete>
            </LoadScript>
            {errors.pickupLocation && (
              <p className="text-red-500 text-sm">{errors.pickupLocation}</p>
            )}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-500">
                When can your horse(s) be picked up?
              </label>
              <select
                value={pickupTimeOption}
                onChange={(e) => setPickupTimeOption(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-2 bg-gray-100"
              >
                <option value="on">On</option>
                <option value="before">Before</option>
                <option value="after">After</option>
                <option value="between">Between</option>
              </select>
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
            <LoadScript
              googleMapsApiKey="AIzaSyBSZaXYR38yPQbCk_3uwEJtbkElumVkWw4"
              libraries={libraries}
            >
              <Autocomplete
                onLoad={onDeliveryLoad}
                onPlaceChanged={onDeliveryPlaceChanged}
              >
                <input
                  type="text"
                  value={deliveryLocation}
                  placeholder="Delivery Address"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </Autocomplete>
            </LoadScript>
            {errors.deliveryLocation && (
              <p className="text-red-500 text-sm">{errors.deliveryLocation}</p>
            )}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-500">
                When should your horse(s) be delivered?
              </label>
              <select
                value={deliveryTimeOption}
                onChange={(e) => setDeliveryTimeOption(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-2 bg-gray-100"
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
              <select
                value={numberOfHorses}
                onChange={(e) => setNumberOfHorses(Number(e.target.value))}
                className="w-full border border-gray-300 text-gray-500 rounded px-2 py-2 bg-gray-100"
              >
                {[...Array(10).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {horses.map((horse, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-md">
                <p className="font-semibold mb-2">
                  Horse {idx + 1}: {horse.registeredName || "Unnamed"}
                </p>

                <div className="mb-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-500">
                    Registered Name
                  </label>
                  <select
                    value={horse.registeredName}
                    onChange={(e) =>
                      handleHorseChange(idx, "registeredName", e.target.value)
                    }
                    className="w-full border border-gray-300 text-gray-500 rounded px-2 py-2 bg-gray-100"
                  >
                    <option value="">Select Name</option>
                    {registeredNames.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  {errors[`registeredName${idx}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`registeredName${idx}`]}
                    </p>
                  )}
                </div>

                <div className="mb-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-500">
                    Barn Name
                  </label>
                  <input
                    type="text"
                    value={horse.barnName}
                    onChange={(e) =>
                      handleHorseChange(idx, "barnName", e.target.value)
                    }
                    className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2"
                  />
                  {errors[`barnName${idx}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`barnName${idx}`]}
                    </p>
                  )}
                </div>

                <div className="mb-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-500">
                    Breed
                  </label>
                  <select
                    value={horse.breed}
                    onChange={(e) =>
                      handleHorseChange(idx, "breed", e.target.value)
                    }
                    className="w-full border border-gray-300 text-gray-500 rounded px-2 py-2 bg-gray-100"
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

                <div className="mb-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-500">
                    Colour
                  </label>
                  <input
                    type="text"
                    value={horse.colour}
                    onChange={(e) =>
                      handleHorseChange(idx, "colour", e.target.value)
                    }
                    className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2"
                  />
                  {errors[`colour${idx}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`colour${idx}`]}
                    </p>
                  )}
                </div>

                <div className="mb-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-500">
                    Age
                  </label>
                  <input
                    type="text"
                    value={horse.age}
                    onChange={(e) =>
                      handleHorseChange(idx, "age", e.target.value)
                    }
                    className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2"
                  />
                  {errors[`age${idx}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`age${idx}`]}
                    </p>
                  )}
                </div>

                <div className="mb-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-500">
                    Sex
                  </label>
                  <select
                    value={horse.sex}
                    onChange={(e) =>
                      handleHorseChange(idx, "sex", e.target.value)
                    }
                    className="w-full border border-gray-300 text-gray-500 rounded px-2 py-2 bg-gray-100"
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
          <div className="flex flex-col w-full gap-6">
            {horses.map((horse, idx) => (
              <div key={idx}>
                <h2 className="text-gray-800 font-semibold mb-3 rounded-[15px] bg-[#F2EBDD] p-4">
                  Uploads for Horse {idx + 1}
                </h2>
                <div className="flex flex-col gap-2">
                  <label>Photo</label>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleHorseFileChange(idx, "photo", e.target.files[0])
                    }
                  />

                  <label>Cogins</label>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleHorseFileChange(idx, "cogins", e.target.files[0])
                    }
                  />

                  <label>Health Certificate</label>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleHorseFileChange(
                        idx,
                        "healthCertificate",
                        e.target.files[0]
                      )
                    }
                  />

                  <label>Additional Information</label>
                  <textarea
                    value={horse.generalInfo}
                    onChange={(e) =>
                      handleHorseChange(idx, "generalInfo", e.target.value)
                    }
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
              </div>
            ))}

            <div className="mt-4">
              <label className="block font-semibold mb-2 text-gray-500">
                Overall Additional Info
              </label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold mb-3">Review Shipment</h2>
            <p>
              <strong>Pickup:</strong> {pickupLocation} on {pickupDate} (
              {pickupTimeOption})
            </p>
            <p>
              <strong>Delivery:</strong> {deliveryLocation} on {deliveryDate} (
              {deliveryTimeOption})
            </p>
            <p>
              <strong>Number of Horses:</strong> {numberOfHorses}
            </p>
            {horses.map((h, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-md mt-2">
                <p>
                  <strong>Horse {idx + 1}:</strong> {h.registeredName} (
                  {h.barnName})
                </p>
                <p>Breed: {h.breed}</p>
                <p>Colour: {h.colour}</p>
                <p>Age: {h.age}</p>
                <p>Sex: {h.sex}</p>
                {h.generalInfo && <p>Info: {h.generalInfo}</p>}
              </div>
            ))}
            {additionalInfo && (
              <p className="mt-2">
                <strong>Overall Info:</strong> {additionalInfo}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col items-center relative py-10 ">
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
          onClick={() => {
            if (currentStep === steps.length) handleFinish();
            else handleNext();
          }}
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
            navigate("/customer/my-shipments");
          }}
          onAnotherAction={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default NewShipment;
