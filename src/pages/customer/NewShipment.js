import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModalOfferPublished from "./ModalOfferPublished";
import DateInput from "../../components/common/DateInput";
import logoMobile from "../../assets/images/mobileLogo.png";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { FiEdit3 } from "react-icons/fi";
import Toast from "../../components/common/Toast";
import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

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
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Pickup
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTimeOption, setPickupTimeOption] = useState("on");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupCoords, setPickupCoords] = useState([20.5937, 78.9629]); // default India coords

  // Step 2: Delivery
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryTimeOption, setDeliveryTimeOption] = useState("on");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryCoords, setDeliveryCoords] = useState([20.5937, 78.9629]);

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
      const formData = new FormData();
      formData.append("pickupLocation", pickupLocation);
      formData.append("pickupCoords", JSON.stringify(pickupCoords));
      formData.append("pickupTimeOption", pickupTimeOption);
      formData.append("pickupDate", pickupDate);
      formData.append("deliveryLocation", deliveryLocation);
      formData.append("deliveryCoords", JSON.stringify(deliveryCoords));
      formData.append("deliveryTimeOption", deliveryTimeOption);
      formData.append("deliveryDate", deliveryDate);
      formData.append("numberOfHorses", numberOfHorses);
      formData.append("additionalInfo", additionalInfo);

      horses.forEach((h, idx) => {
        formData.append(`horses[${idx}][registeredName]`, h.registeredName);
        formData.append(`horses[${idx}][barnName]`, h.barnName);
        formData.append(`horses[${idx}][breed]`, h.breed);
        formData.append(`horses[${idx}][colour]`, h.colour);
        formData.append(`horses[${idx}][age]`, h.age);
        formData.append(`horses[${idx}][sex]`, h.sex);
        formData.append(`horses[${idx}][generalInfo]`, h.generalInfo);
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
      console.error(error);
      Toast.error("Failed to create shipment. Please try again.");
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
                className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2 mb-2"
              />
              {errors.pickupLocation && (
                <p className="text-red-500 text-sm">{errors.pickupLocation}</p>
              )}
              <MapContainer
                center={pickupCoords}
                zoom={5}
                style={{ height: "300px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />
                <Marker
                  position={pickupCoords}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) =>
                      setPickupCoords([
                        e.target.getLatLng().lat,
                        e.target.getLatLng().lng,
                      ]),
                  }}
                >
                  <Popup>Pickup Location</Popup>
                </Marker>
              </MapContainer>
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
                className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2 mb-2"
              />
              {errors.deliveryLocation && (
                <p className="text-red-500 text-sm">
                  {errors.deliveryLocation}
                </p>
              )}
              <MapContainer
                center={deliveryCoords}
                zoom={5}
                style={{ height: "300px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker
                  position={deliveryCoords}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) =>
                      setDeliveryCoords([
                        e.target.getLatLng().lat,
                        e.target.getLatLng().lng,
                      ]),
                  }}
                >
                  <Popup>Delivery Location</Popup>
                </Marker>
              </MapContainer>
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

                <div className="mb-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-500">
                    Photo
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleHorseFileChange(idx, "photo", e.target.files[0])
                    }
                  />
                </div>

                <div className="mb-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-500">
                    Coggins
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleHorseFileChange(idx, "cogins", e.target.files[0])
                    }
                  />
                </div>

                <div className="mb-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-500">
                    Health Certificate
                  </label>
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

                <div className="mb-2">
                  <label className="block font-semibold text-sm mb-1 text-gray-500">
                    Additional Info
                  </label>
                  <textarea
                    value={horse.generalInfo}
                    onChange={(e) =>
                      handleHorseChange(idx, "generalInfo", e.target.value)
                    }
                    className="w-full border border-gray-300 text-gray-500 rounded px-3 py-2"
                  ></textarea>
                </div>
              </div>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col gap-4 w-full">
            <label className="block font-semibold text-sm mb-1 text-gray-500">
              Additional Information
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Any special instructions..."
            />
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col gap-4 w-full">
            <h3 className="font-semibold text-lg">Review your shipment</h3>
            <div>
              <p>
                <strong>Pickup Location:</strong> {pickupLocation}
              </p>
              <p>
                <strong>Delivery Location:</strong> {deliveryLocation}
              </p>
              <p>
                <strong>Pickup Date:</strong> {pickupDate}
              </p>
              <p>
                <strong>Delivery Date:</strong> {deliveryDate}
              </p>
              <p>
                <strong>Number of Horses:</strong> {numberOfHorses}
              </p>
              {horses.map((h, idx) => (
                <div key={idx} className="border p-2 my-1 rounded">
                  <p>
                    <strong>Horse {idx + 1}:</strong> {h.registeredName} (
                    {h.barnName})
                  </p>
                  <p>
                    Breed: {h.breed}, Colour: {h.colour}, Age: {h.age}, Sex:{" "}
                    {h.sex}
                  </p>
                  <p>Additional Info: {h.generalInfo}</p>
                </div>
              ))}
              <p>
                <strong>Additional Info:</strong> {additionalInfo}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col items-center relative py-10 px-4">
      <div className="max-w-4xl w-full flex flex-col gap-6">
        <h2 className="text-2xl font-semibold text-gray-700">New Shipment</h2>

        {/* Stepper */}
        <div className="flex gap-2 mb-4">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`flex-1 text-center py-1 rounded ${
                currentStep === s.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {s.title}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4 w-full">
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Previous
            </button>
          )}
          {currentStep < steps.length && (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Next
            </button>
          )}
          {currentStep === steps.length && (
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Finish
            </button>
          )}
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ModalOfferPublished onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default NewShipment;
