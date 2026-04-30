import React, { useEffect } from "react";
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

  const formatTimeOption = (option) => {
    if (!option) return "";
    return option.charAt(0).toUpperCase() + option.slice(1);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Safety check for horses array
  const displayHorses = Array.isArray(horses) ? horses : [];
  const horseCount = numberOfHorses || 0;

  return (
    <div className="flex flex-col w-full gap-4 font-montserrat">
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
        <div className="mb-6">
          <div className="flex items-center gap-1 mb-2">
            <IoLocationOutline className="text-[#BF9B53] text-lg" />
            <span className="font-bold text-[#BF9B53]">Pickup:</span>
          </div>
          <p className="text-gray-700 ml-7 font-medium">
            {pickupLocation || "Not specified"}
          </p>
          <div className="flex items-center gap-3 mt-2 ml-7">
            <LuCalendarDays className="text-gray-500" />
            <p className="text-gray-600">
              <span className="font-semibold">
                {formatDate(pickupStartDate)}
              </span>
              {" to "}
              <span className="font-semibold">{formatDate(pickupEndDate)}</span>
              {pickupTimeOption && (
                <span className="ml-2 text-[#BF9B53] font-semibold">
                  ({formatTimeOption(pickupTimeOption)})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Delivery */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <IoLocationOutline className="text-[#BF9B53] text-lg" />
            <span className="font-bold text-[#BF9B53]">Delivery:</span>
          </div>
          <p className="text-gray-700 ml-7 font-medium">
            {deliveryLocation || "Not specified"}
          </p>
          <div className="flex items-center gap-3 mt-2 ml-7">
            <LuCalendarDays className="text-gray-500" />
            <p className="text-gray-600">
              <span className="font-semibold">
                {formatDate(deliveryStartDate)}
              </span>
              {" to "}
              <span className="font-semibold">
                {formatDate(deliveryEndDate)}
              </span>
              {deliveryTimeOption && (
                <span className="ml-2 text-[#BF9B53] font-semibold">
                  ({formatTimeOption(deliveryTimeOption)})
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
            Horses ({horseCount || 0})
          </h3>
        </div>

        {displayHorses && displayHorses.length > 0 ? (
          displayHorses.map((h, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-gray-50 to-white rounded-lg border-2 border-gray-200 p-4 relative"
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

              <p className="font-bold text-gray-800 mb-3">
                Horse {idx + 1}:{" "}
                <span className="text-[#BF9B53]">
                  {h?.registeredName || "Unnamed"}
                </span>
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                <div>
                  <span className="font-semibold text-gray-600">
                    Barn Name:
                  </span>
                  <p className="text-gray-800">{h?.barnName || "N/A"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Breed:</span>
                  <p className="text-gray-800">{h?.breed || "N/A"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Colour:</span>
                  <p className="text-gray-800">{h?.colour || "N/A"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Age:</span>
                  <p className="text-gray-800">{h?.age || "N/A"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Sex:</span>
                  <p className="text-gray-800">{h?.sex || "N/A"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">
                    Stall Type:
                  </span>
                  <p className="text-gray-800">{h?.stallType || "N/A"}</p>
                </div>
              </div>

              {h?.photo && (
                <div className="mb-3">
                  <span className="font-semibold text-gray-600 text-sm">
                    Photo:
                  </span>
                  <div className="mt-2">
                    <img
                      src={
                        h.photo?.url
                          ? h.photo.url
                          : typeof h.photo === "string"
                          ? h.photo
                          : h.photo instanceof File
                          ? URL.createObjectURL(h.photo)
                          : ""
                      }
                      alt={`Horse ${idx + 1}`}
                      className="w-40 h-40 object-cover rounded-lg border-2 border-gray-300"
                      onError={(e) => {
                        e.target.src = "/placeholder-horse.png";
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-600">Coggins:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      h?.cogins
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {h?.cogins ? "✓ Uploaded" : "Not Uploaded"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-600">
                    Health Cert:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      h?.healthCertificate
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {h?.healthCertificate ? "✓ Uploaded" : "Not Uploaded"}
                  </span>
                </div>
              </div>

              {h?.generalInfo && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-600 text-sm">
                    Shipment Details:
                  </span>
                  <p className="text-gray-700 text-sm mt-1">{h.generalInfo}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No horses added yet</p>
        )}

        <button
          onClick={() => onEditStep(4)}
          className="mt-4 w-full px-4 py-3 bg-gray-100 rounded-sm text-gray-700 hover:bg-gray-200 font-semibold transition-all border-2 border-gray-300"
        >
          Edit Horse Documents & Shipment Details
        </button>
      </div>

      {recipientEmail && (
        <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-4 rounded-lg">
          <h3 className="font-bold text-gray-800 mb-2">Recipient Access</h3>
          <p className="text-gray-700 font-semibold">{recipientEmail}</p>
          <p className="text-sm text-gray-600 mt-2">
            This recipient will receive an email with tracking information after
            shipment is published.
          </p>
        </div>
      )}

      {/* ===== SUMMARY ===== */}
      <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-3 rounded-lg">
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <span className="text-[#BF9B53] font-bold">✓</span>
            <span>Pickup location and date range confirmed</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#BF9B53] font-bold">✓</span>
            <span>Delivery location and date range confirmed</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#BF9B53] font-bold">✓</span>
            <span>
              {horseCount} horse{horseCount !== 1 ? "s" : ""} registered
            </span>
          </li>
          {recipientEmail && (
            <li className="flex items-center gap-2">
              <span className="text-[#BF9B53] font-bold">✓</span>
              <span>Recipient email provided</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Step5Review;
