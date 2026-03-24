import React from "react";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { FiEdit3 } from "react-icons/fi";

const Step5Review = ({
  pickupLocation,
  pickupDate,
  pickupTimeOption,
  deliveryLocation,
  deliveryDate,
  deliveryTimeOption,
  numberOfHorses,
  horses,
  additionalInfo,
  recipientEmail,
  onEditStep,
}) => {
  return (
    <div className="flex flex-col w-full gap-6">
      {/* Pickup & Delivery Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative">
        <button
          className="absolute top-2 right-2 flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
          onClick={() => onEditStep(1)}
        >
          <FiEdit3 /> Edit
        </button>

        <h3 className="font-semibold mb-2">Pickup & Delivery Info</h3>

        <div className="flex items-center gap-2">
          <span className="font-semibold">Pickup:</span>
          <IoLocationOutline className="text-gray-500 text-lg" />
          <p>{pickupLocation || "N/A"}</p>
        </div>

        <div className="flex items-center gap-2">
          <LuCalendarDays className="text-gray-500 text-lg" />
          <p>
            {pickupDate || "N/A"} ({pickupTimeOption || "N/A"})
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold">Delivery:</span>
          <IoLocationOutline className="text-gray-500 text-lg" />
          <p>{deliveryLocation || "N/A"}</p>
        </div>

        <div className="flex items-center gap-2">
          <LuCalendarDays className="text-gray-500 text-lg" />
          <p>
            {deliveryDate || "N/A"} ({deliveryTimeOption || "N/A"})
          </p>
        </div>
      </div>

      {/* Horses Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-4 relative">
        <h3 className="font-semibold mb-2">Horses ({numberOfHorses || 0})</h3>

        {horses.map((h, idx) => (
          <div key={idx} className="rounded-md border p-3 relative">
            <button
              className="absolute top-2 right-2 flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => onEditStep(3, idx)}
            >
              <FiEdit3 /> Edit
            </button>

            <p className="font-semibold mb-1">
              Horse {idx + 1}: {h.registeredName || "Unnamed"}
            </p>

            <p>
              Barn Name: {h.barnName || "N/A"}, Breed: {h.breed || "N/A"},{" "}
              Colour: {h.colour || "N/A"}, Age: {h.age || "N/A"}, Sex:{" "}
              {h.sex || "N/A"}, Size: {h.size || "N/A"}, Stall Type:{" "}
              {h.stallType || "N/A"}
            </p>

            {/* Photo */}
            {h.photo && (
              <div className="mt-2">
                <span className="font-semibold">Photo:</span>
                <img
                  src={h.photo.url ? h.photo.url : URL.createObjectURL(h.photo)}
                  alt={`Horse ${idx + 1}`}
                  className="w-32 h-32 object-cover rounded-lg border mt-1"
                />
              </div>
            )}

            {/* Documents */}
            <div className="mt-2 space-y-1">
              {["cogins", "healthCertificate", "otherDocuments"].map((doc) => (
                <div key={doc}>
                  <span className="font-semibold">{doc}:</span>{" "}
                  {h[doc] ? h[doc].name || "Uploaded" : "N/A"}
                </div>
              ))}
            </div>

            {/* General Info */}
            <div className="mt-2">
              <span className="font-semibold">General Info:</span>{" "}
              {h.generalInfo || "N/A"}
            </div>
          </div>
        ))}

        <button
          onClick={() => onEditStep(4)}
          className="mt-3 px-4 py-2 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-200"
        >
          Edit Horse Documents & Info
        </button>
      </div>

      {/* Additional Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative">
        <button
          className="absolute top-2 right-2 flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
          onClick={() => onEditStep(4)}
        >
          <FiEdit3 /> Edit
        </button>

        <h3 className="font-semibold mb-1">Additional Info</h3>
        <p>{additionalInfo || "N/A"}</p>
      </div>

      {recipientEmail && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold mb-1">Recipient Access</h3>
          <p className="text-gray-700">{recipientEmail}</p>
          <p className="text-sm text-gray-500 mt-1">
            This recipient will receive an email to track this shipment.
          </p>
        </div>
      )}
    </div>
  );
};

export default Step5Review;
