import React from "react";
import { useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { FiArrowRight } from "react-icons/fi";
import { createShipmentQueryToken } from "../../utils/createQueryToken";

const CustomerShipmentCard = ({ shipment }) => {
  const navigate = useNavigate();

  if (!shipment || !shipment.horses?.length) return null;

  const horse = shipment.horses[0];

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const handleNavigateWithQuery = () => {
    const token = createShipmentQueryToken(shipment._id);
    const params = new URLSearchParams({
      shipmentId: shipment._id,
      ref: token,
    });
    navigate(`/customer/my-shipments?${params.toString()}`);
  };

  const formatDate = (date) => {
    if (!date) return "Pending";
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const isPickupToday =
    shipment.pickupDate &&
    new Date(shipment.pickupDate).toDateString() === new Date().toDateString();

  return (
    <div
      onClick={handleNavigateWithQuery}
      className="group flex flex-col sm:flex-row bg-white border border-2 border-[#8B7D4A] rounded-md p-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer gap-4"
    >
      {/* HORSE IMAGE */}
      <div className="flex-shrink-0 w-full sm:w-[120px] md:w-[140px]">
        <img
          src={
            horse?.photo?.url || "https://via.placeholder.com/150?text=Horse"
          }
          alt={horse?.registeredName || "Horse"}
          className="w-full h-[140px] sm:h-[150px] md:h-[180px] rounded-lg object-cover border border-gray-200 group-hover:border-[#BF9B53]"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150?text=Horse";
          }}
        />
      </div>

      {/* DETAILS */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-snug truncate">
            {shipment.numberOfHorses} Horse
            {shipment.numberOfHorses > 1 ? "s" : ""} Shipment
          </h3>

          <div className="flex items-center gap-2">
            {isPickupToday && (
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                Today
              </span>
            )}
            <FiArrowRight className="text-gray-400 group-hover:text-[#BF9B53] transition" />
          </div>
        </div>

        {/* PICKUP & DELIVERY TIMELINE */}
        <div className="flex gap-3">
          {/* TIMELINE */}
          <div className="flex flex-col items-center mt-1">
            <div className="w-2.5 h-2.5 bg-[#BF9B53] rounded-full" />
            <div className="w-[2px] h-14 bg-[#BF9B53]" />
            <div className="w-2.5 h-2.5 bg-[#BF9B53] rounded-full" />
          </div>

          {/* LOCATIONS & DATES */}
          <div className="flex-1 space-y-3">
            {/* PICKUP */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Pickup</p>

              <div className="flex items-center gap-2 text-sm text-gray-800">
                <IoLocationOutline size={16} />
                <span title={shipment.pickupLocation}>
                  {truncateText(shipment.pickupLocation, 30)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <LuCalendarDays size={14} />
                <span>{formatDate(shipment.pickupDate)}</span>
              </div>
            </div>

            {/* DELIVERY */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Delivery</p>

              <div className="flex items-center gap-2 text-sm text-gray-800">
                <IoLocationOutline size={16} />
                <span title={shipment.deliveryLocation}>
                  {truncateText(shipment.deliveryLocation, 30)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <LuCalendarDays size={14} />
                <span>{formatDate(shipment.deliveryDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
          <span className="text-gray-500">
            Horses:{" "}
            <span className="font-semibold text-gray-800">
              {shipment.numberOfHorses}
            </span>
          </span>

          <span
            className={`px-2 py-0.5 rounded-full font-medium ${
              shipment.status === "delivered"
                ? "bg-green-100 text-green-700"
                : shipment.status === "assigned"
                ? "bg-blue-100 text-blue-700"
                : "bg-yellow-500 text-white"
            }`}
          >
            {shipment.status || "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerShipmentCard;
