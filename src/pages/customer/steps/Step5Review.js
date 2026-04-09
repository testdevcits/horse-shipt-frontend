// /pages/customer/steps/Step5Review.jsx
// ✅ COMPLETE WORKING FILE - Copy and use directly
// ⭐ EDIT BUTTONS FULLY FUNCTIONAL
// ⭐ UPDATED: Shows date ranges correctly

import React from "react";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { FiEdit3 } from "react-icons/fi";

const Step5Review = ({
  pickupLocation,
  pickupStartDate,
  pickupEndDate,
  pickupTimeOption,
  deliveryLocation,
  deliveryStartDate,
  deliveryEndDate,
  deliveryTimeOption,
  numberOfHorses,
  horses,
  additionalInfo,
  recipientEmail,
  onEditStep,
}) => {
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 font-montserrat">
      {/* ===== PICKUP & DELIVERY INFO ===== */}
      <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg p-6 shadow-md relative">
        <button
          className="absolute top-4 right-4 flex items-center gap-2 text-gray-500 hover:text-[#BF9B53] hover:bg-gray-100 px-3 py-2 rounded-lg transition-all"
          onClick={() => onEditStep(1)}
          title="Edit Pickup & Delivery"
        >
          <FiEdit3 size={16} />
          <span className="text-sm font-semibold">Edit</span>
        </button>

        <h3 className="font-bold text-lg text-gray-800 mb-4 pb-3 border-b-2 border-[#BF9B53]">
          Pickup & Delivery Details
        </h3>

        {/* Pickup */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-gray-700">Pickup:</span>
            <IoLocationOutline className="text-[#BF9B53] text-lg" />
          </div>
          <p className="text-gray-600 ml-7">
            {pickupLocation || "Not specified"}
          </p>
          <div className="flex items-center gap-3 mt-2 ml-7">
            <LuCalendarDays className="text-gray-500" />
            <p className="text-gray-600">
              {formatDate(pickupStartDate)} - {formatDate(pickupEndDate)}
              {pickupTimeOption && (
                <span className="ml-2">
                  (
                  {pickupTimeOption.charAt(0).toUpperCase() +
                    pickupTimeOption.slice(1)}
                  )
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Delivery */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-gray-700">Delivery:</span>
            <IoLocationOutline className="text-green-500 text-lg" />
          </div>
          <p className="text-gray-600 ml-7">
            {deliveryLocation || "Not specified"}
          </p>
          <div className="flex items-center gap-3 mt-2 ml-7">
            <LuCalendarDays className="text-gray-500" />
            <p className="text-gray-600">
              {formatDate(deliveryStartDate)} - {formatDate(deliveryEndDate)}
              {deliveryTimeOption && (
                <span className="ml-2">
                  (
                  {deliveryTimeOption.charAt(0).toUpperCase() +
                    deliveryTimeOption.slice(1)}
                  )
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ===== HORSES SECTION ===== */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-md space-y-4">
        <div className="flex justify-between items-center pb-3 border-b-2 border-[#BF9B53]">
          <h3 className="font-bold text-lg text-gray-800">
            Horses ({numberOfHorses || 0})
          </h3>
        </div>

        {horses.slice(0, numberOfHorses).map((h, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-r from-gray-50 to-white rounded-lg border-2 border-gray-200 p-4 relative hover:shadow-lg transition-all"
          >
            {/* Edit Button */}
            <button
              className="absolute top-4 right-4 flex items-center gap-2 text-gray-500 hover:text-[#BF9B53] hover:bg-gray-100 px-3 py-1 rounded-lg transition-all"
              onClick={() => onEditStep(3, idx)}
              title={`Edit Horse ${idx + 1}`}
            >
              <FiEdit3 size={14} />
              <span className="text-xs font-semibold">Edit</span>
            </button>

            {/* Horse Header */}
            <p className="font-bold text-gray-800 mb-3">
              Horse {idx + 1}: {h.registeredName || "Unnamed"}
            </p>

            {/* Horse Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
              <div>
                <span className="font-semibold text-gray-600">Barn Name:</span>
                <p className="text-gray-800">{h.barnName || "N/A"}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Breed:</span>
                <p className="text-gray-800">{h.breed || "N/A"}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Colour:</span>
                <p className="text-gray-800">{h.colour || "N/A"}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Age:</span>
                <p className="text-gray-800">{h.age || "N/A"}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Sex:</span>
                <p className="text-gray-800">{h.sex || "N/A"}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Stall Type:</span>
                <p className="text-gray-800">{h.stallType || "N/A"}</p>
              </div>
            </div>

            {/* Photo */}
            {h.photo && (
              <div className="mb-3">
                <span className="font-semibold text-gray-600 text-sm">
                  Photo:
                </span>
                <img
                  src={h.photo.url ? h.photo.url : URL.createObjectURL(h.photo)}
                  alt={`Horse ${idx + 1}`}
                  className="w-40 h-40 object-cover rounded-lg border-2 border-gray-300 mt-2"
                />
              </div>
            )}

            {/* Documents Status */}
            <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-600">Coggins:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    h.cogins
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {h.cogins ? "✓ Uploaded" : "Not Uploaded"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-600">
                  Health Cert:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    h.healthCertificate
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {h.healthCertificate ? "✓ Uploaded" : "Not Uploaded"}
                </span>
              </div>
            </div>

            {/* General Info */}
            {h.generalInfo && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-600 text-sm">
                  Shipment Details:
                </span>
                <p className="text-gray-700 text-sm mt-1">{h.generalInfo}</p>
              </div>
            )}
          </div>
        ))}

        {/* Edit Horse Documents Button */}
        <button
          onClick={() => onEditStep(4)}
          className="mt-4 w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 font-semibold transition-all border-2 border-gray-300"
        >
          Edit Horse Documents & Notes
        </button>
      </div>

      {/* ===== RECIPIENT ACCESS ===== */}
      {recipientEmail && (
        <div className="bg-[#BF9B53]/10 border-2 border-[#BF9B53] rounded-lg p-6 shadow-md">
          <h3 className="font-bold text-gray-800 mb-2">✓ Recipient Access</h3>
          <p className="text-gray-700 font-semibold">{recipientEmail}</p>
          <p className="text-sm text-gray-500 mt-3">
            This recipient will receive an email with tracking information after
            shipment is published.
          </p>
        </div>
      )}

      {/* ===== SUMMARY ===== */}
      <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-2 border-[#BF9B53] rounded-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3">✓ Shipment Summary</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Pickup location and date range confirmed</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Delivery location and date range confirmed</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>
              {numberOfHorses} horse{numberOfHorses !== 1 ? "s" : ""} registered
            </span>
          </li>
          {recipientEmail && (
            <li className="flex items-center gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Recipient email provided</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Step5Review;
