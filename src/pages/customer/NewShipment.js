import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ModalOfferPublished from "./ModalOfferPublished";
import DateInput from "../../components/common/DateInput";
import logoMobile from "../../assets/images/mobileLogo.png";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { FiEdit3 } from "react-icons/fi";
import axios from "axios";
import Toast from "../../components/common/Toast";

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
  const navigate = useNavigate();
  const { token } = useAuth();
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

  // ---------------------- New: handleFinish ----------------------
  const handleFinish = async () => {
    // Validate final step
    if (!validateStep()) return;

    try {
      //  Prepare payload for logging/debugging
      const payload = {
        pickupLocation,
        pickupTimeOption,
        pickupDate,
        deliveryLocation,
        deliveryTimeOption,
        deliveryDate,
        numberOfHorses,
        additionalInfo,
        horses: horses.map((h) => ({
          registeredName: h.registeredName,
          barnName: h.barnName,
          breed: h.breed,
          colour: h.colour,
          age: h.age,
          sex: h.sex,
          photo: h.photo ? h.photo.name : null,
          cogins: h.cogins ? h.cogins.name : null,
          healthCertificate: h.healthCertificate
            ? h.healthCertificate.name
            : null,
          generalInfo: h.generalInfo,
        })),
      };

      console.log("Final shipment values before API call:", payload);

      // Prepare FormData for API submission
      const formData = new FormData();
      formData.append("pickupLocation", pickupLocation);
      formData.append("pickupTimeOption", pickupTimeOption);
      formData.append("pickupDate", pickupDate);
      formData.append("deliveryLocation", deliveryLocation);
      formData.append("deliveryTimeOption", deliveryTimeOption);
      formData.append("deliveryDate", deliveryDate);
      formData.append("numberOfHorses", numberOfHorses);
      formData.append("additionalInfo", additionalInfo);

      horses.forEach((h, idx) => {
        try {
          formData.append(`horses[${idx}][registeredName]`, h.registeredName);
          formData.append(`horses[${idx}][barnName]`, h.barnName);
          formData.append(`horses[${idx}][breed]`, h.breed);
          formData.append(`horses[${idx}][colour]`, h.colour);
          formData.append(`horses[${idx}][age]`, h.age);
          formData.append(`horses[${idx}][sex]`, h.sex);
          if (h.photo) formData.append(`horses[${idx}][photo]`, h.photo);
          if (h.cogins) formData.append(`horses[${idx}][cogins]`, h.cogins);
          if (h.healthCertificate)
            formData.append(
              `horses[${idx}][healthCertificate]`,
              h.healthCertificate
            );
          formData.append(`horses[${idx}][generalInfo]`, h.generalInfo);
        } catch (err) {
          console.warn(`Skipping horse index ${idx} due to error:`, err);
        }
      });

      // Make API call
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/customer/shipments`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Shipment created:", response.data);

      // Open confirmation modal
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error creating shipment:", error);
      // Optional: show toast or alert
      Toast.error("Failed to create shipment. Please try again.");
    }
  };

  // ------------------------------------------------------------
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
              <div key={idx} className="bg-gray-50">
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
              <div key={idx} className="">
                {/* Horse Name Heading */}
                <h2
                  className="text-gray-800 font-semibold mb-3 rounded-[15px] bg-[#F2EBDD] "
                  style={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    padding: "14px",
                    borderRadius: "15px",
                  }}
                >
                  Horse {idx + 1} - {horse.registeredName || "Unnamed"}
                </h2>

                {/* Upload a Photo Section */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Upload a photo of the horse
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    A picture enhances your listing, making it more appealing
                    and increasing the likelihood of attracting attention from
                    potential carriers.
                  </p>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleHorseFileChange(idx, "photo", e.target.files[0])
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                {/* Documents Section */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Documents
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    Provide the required paperwork to facilitate a smooth and
                    safe delivery process.
                  </p>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      onChange={(e) =>
                        handleHorseFileChange(idx, "cogins", e.target.files[0])
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="Coggins"
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
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="Health Certificate"
                    />
                  </div>
                </div>

                {/* General Information Section */}
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    General Information
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    Describe any specific preferences or restrictions you may
                    have for the shipment, such as preferred vehicle types and
                    other relevant details.
                  </p>
                  <textarea
                    value={horse.generalInfo}
                    onChange={(e) =>
                      handleHorseChange(idx, "generalInfo", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-500"
                    rows={3}
                    placeholder="Enter additional details"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col w-full gap-4">
            {/* Shipment Details */}
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

              <button
                className="flex items-center gap-2 text-blue-500 hover:underline mt-2"
                onClick={() => setCurrentStep(1)} // Move to Step 1
              >
                <FiEdit3 /> Edit details
              </button>
            </div>

            {/* Horses & Additional Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mt-4 space-y-2">
              <p className="font-semibold">
                Number of horses: {numberOfHorses}
              </p>
              {horses.map((h, idx) => (
                <div key={idx} className="border p-3 rounded-md">
                  <p className="font-semibold mb-1">
                    Horse {idx + 1}: {h.registeredName || "Unnamed"}
                  </p>
                  <p>
                    Breed: {h.breed || "N/A"}, Colour: {h.colour || "N/A"}, Age:{" "}
                    {h.age || "N/A"}, Sex: {h.sex || "N/A"}
                  </p>
                  <div>Photo: {h.photo?.name || "N/A"}</div>
                  <div>Cog-ins: {h.cogins?.name || "N/A"}</div>
                  <div>
                    Health Certificate: {h.healthCertificate?.name || "N/A"}
                  </div>
                  <div>General Info: {h.generalInfo || "N/A"}</div>
                </div>
              ))}
              <div className="mt-2">
                <p className="font-semibold">Additional Info:</p>
                <p>{additionalInfo || "N/A"}</p>
              </div>
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
            if (currentStep === steps.length) {
              handleFinish(); // Call finish function
            } else {
              handleNext(); // Go to next step
            }
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
