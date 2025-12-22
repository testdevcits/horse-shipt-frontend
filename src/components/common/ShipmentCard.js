import React from "react";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";

const ShipmentCard = ({ shipment }) => {
  // For deliveryStatus, you can calculate based on deliveryDate
  const deliveryDate = new Date(shipment.deliveryDate);
  const today = new Date();
  let deliveryStatus = "Upcoming";

  if (
    deliveryDate.getFullYear() === today.getFullYear() &&
    deliveryDate.getMonth() === today.getMonth() &&
    deliveryDate.getDate() === today.getDate()
  ) {
    deliveryStatus = "Today";
  }

  return (
    <div className="flex flex-row w-full border border-gray-300 rounded-[14px] p-3 gap-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200">
      {/* Left Image: show first horse photo if exists */}
      <div className="flex-shrink-0">
        <img
          src={
            shipment.horses?.[0]?.photo?.url ||
            "https://via.placeholder.com/140x160?text=No+Image"
          }
          alt={shipment.horses?.[0]?.registeredName || "Horse"}
          className="w-[80px] h-[124px] sm:w-[100px] sm:h-[140px] md:w-[140px] md:h-[160px] lg:h-[180px] rounded-[16px] object-cover"
        />
      </div>

      {/* Right Content */}
      <div className="flex flex-col justify-between flex-1 gap-2 min-w-0">
        {/* Shipment Info */}
        <div className="font-montserrat font-semibold text-[14px] md:text-[16px] leading-[20px] text-[#333333] ">
          Pickup: {shipment.pickupLocation} → Delivery:{" "}
          {shipment.deliveryLocation}
        </div>

        {/* Delivery Status */}
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-sm font-montserrat">Delivery</span>
          <p
            className={`w-[90px] h-[24px] text-sm flex items-center justify-center rounded-full border font-medium ${
              deliveryStatus === "Today"
                ? "text-success-700 border-success-700 bg-success-100"
                : "text-gray-500 border-gray-300"
            }`}
          >
            {deliveryStatus}
          </p>
        </div>

        {/* Pickup & Delivery Dates */}
        <div className="flex flex-col gap-1 text-gray-700 text-sm md:text-[14px] font-montserrat">
          <div className="flex items-center gap-2">
            <IoLocationOutline size={18} />
            <span>
              Pickup: {new Date(shipment.pickupDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LuCalendarDays size={18} />
            <span>
              Delivery: {new Date(shipment.deliveryDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentCard;
