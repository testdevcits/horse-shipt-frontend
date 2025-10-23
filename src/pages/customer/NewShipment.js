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
  const { user, token } = useAuth();
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
    const shipmentData = {
      customerId: user?._id,
      pickupLocation,
      pickupTimeOption,
      pickupDate,
      deliveryLocation,
      deliveryTimeOption,
      deliveryDate,
      numberOfHorses,
      horses,
      additionalInfo,
    };

    console.log("Shipment Data:", shipmentData);

    try {
      const formData = new FormData();
      Object.entries(shipmentData).forEach(([key, value]) => {
        if (key === "horses") {
          value.forEach((h, idx) => {
            Object.entries(h).forEach(([hk, hv]) => {
              if (hv instanceof File)
                formData.append(`horses[${idx}][${hk}]`, hv);
              else formData.append(`horses[${idx}][${hk}]`, hv);
            });
          });
        } else {
          formData.append(key, value);
        }
      });

      await axios.post(
        `${
          process.env.REACT_APP_API_BASE_URL ||
          "https://horse-shipt.vercel.app/api"
        }/shipments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsModalOpen(true);
    } catch (error) {
      console.error(
        "Error submitting shipment:",
        error.response?.data || error.message
      );
    }
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
              <div key={idx} className="bg-gray-50 p-3 rounded-md">
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
                    <p className="text-red-500 text-sm">
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
                    className="w-full border border-gray-300 text-gray-500 rounded px-2 py-2"
                  />
                  {errors[`barnName${idx}`] && (
                    <p className="text-red-500 text-sm">
                      {errors[`barnName${idx}`]}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-500">
                      Breed
                    </label>
                    <select
                      value={horse.breed}
                      onChange={(e) =>
                        handleHorseChange(idx, "breed", e.target.value)
                      }
                      className="w-full border border-gray-300 text-gray-500 rounded px-2 py-1 bg-gray-100"
                    >
                      <option value="">Select Breed</option>
                      {breeds.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    {errors[`breed${idx}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`breed${idx}`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500">
                      Colour
                    </label>
                    <input
                      type="text"
                      value={horse.colour}
                      onChange={(e) =>
                        handleHorseChange(idx, "colour", e.target.value)
                      }
                      className="w-full border border-gray-300 text-gray-500 rounded px-2 py-1"
                    />
                    {errors[`colour${idx}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`colour${idx}`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500">
                      Age
                    </label>
                    <input
                      type="number"
                      value={horse.age}
                      onChange={(e) =>
                        handleHorseChange(idx, "age", e.target.value)
                      }
                      className="w-full border border-gray-300 text-gray-500 rounded px-2 py-1"
                    />
                    {errors[`age${idx}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`age${idx}`]}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-semibold text-gray-500">
                      Sex
                    </label>
                    <select
                      value={horse.sex}
                      onChange={(e) =>
                        handleHorseChange(idx, "sex", e.target.value)
                      }
                      className="w-full border border-gray-300 text-gray-500 rounded px-2 py-1 bg-gray-100"
                    >
                      <option value="">Select Sex</option>
                      {sexes.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors[`sex${idx}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`sex${idx}`]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col w-full gap-6">
            <div>
              <label className="block font-semibold text-gray-500 mb-1">
                Additional Information
              </label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="w-full border border-gray-300 text-gray-500 rounded px-2 py-2"
              />
            </div>
            {horses.map((horse, idx) => (
              <div key={idx} className="border p-2 rounded-md">
                <p className="font-semibold mb-1">Horse {idx + 1} Files</p>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleHorseFileChange(idx, "photo", e.target.files[0])
                    }
                  />
                  <input
                    type="file"
                    onChange={(e) =>
                      handleHorseFileChange(idx, "cogins", e.target.files[0])
                    }
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
                  />
                </div>
              </div>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col w-full gap-4">
            <h3 className="font-semibold text-lg mb-2">Review your shipment</h3>
            <pre className="bg-gray-100 p-3 rounded">
              {JSON.stringify(
                {
                  pickupLocation,
                  pickupTimeOption,
                  pickupDate,
                  deliveryLocation,
                  deliveryTimeOption,
                  deliveryDate,
                  numberOfHorses,
                  horses,
                  additionalInfo,
                },
                null,
                2
              )}
            </pre>
            <button
              onClick={handleFinish}
              className="px-6 py-2 rounded-lg font-montserrat bg-[#BF9B53] text-white hover:bg-[#a7863e]"
            >
              Finish & Submit
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col items-center relative py-10 bg-gray-50 min-h-screen">
      <div className="flex w-full max-w-5xl justify-between items-center px-4 mb-6">
        <img src={logoMobile} alt="Logo" className="h-10" />
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
      <div className="flex w-full max-w-5xl flex-col gap-6 px-4">
        <div className="flex gap-2 items-center text-gray-600 font-semibold mb-4">
          <span>
            Step {currentStep} of {steps.length}:
          </span>
          <span className="mt-4">{steps[currentStep - 1].title}</span>
        </div>
        {renderStepContent()}
        {currentStep !== 5 && (
          <div className="flex w-full justify-between mt-6 px-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-[#BF9B53] hover:text-white"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-lg bg-[#BF9B53] text-white hover:bg-[#a7863e]"
            >
              Next
            </button>
          </div>
        )}
      </div>

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
