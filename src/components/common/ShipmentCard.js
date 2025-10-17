import React from "react";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";

const ShipmentCard = ({ shipment }) => {
  return (
    <div className="flex flex-row w-full border border-gray-300 rounded-[14px] p-3 gap-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200">
      {/* Left Image */}
      <div className="flex-shrink-0">
        <img
          src={shipment.image}
          alt={shipment.name}
          className="w-[80px] h-[124px] sm:w-[100px] sm:h-[140px] md:w-[140px] md:h-[160px] lg:h-[180px] rounded-[16px] object-cover"
        />
      </div>

      {/* Right Content */}
      <div className="flex flex-col justify-between flex-1 gap-2 min-w-0">
        {/* Shipment Name */}
        <div className="font-montserrat font-semibold text-[14px] md:text-[16px] leading-[20px] text-[#333333] ">
          {shipment.name}
        </div>

        {/* Delivery Status */}
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-sm font-montserrat">Delivery</span>
          <p
            className={`w-[90px] h-[24px] text-sm flex items-center justify-center rounded-full border font-medium ${
              shipment.deliveryStatus === "Today"
                ? "text-success-700 border-success-700 bg-success-100"
                : shipment.deliveryStatus === "Tomorrow"
                ? "text-yellow-700 border-yellow-700 bg-yellow-100"
                : "text-gray-500 border-gray-300"
            }`}
          >
            {shipment.deliveryStatus}
          </p>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 text-gray-700 text-sm md:text-[14px] font-montserrat">
          <IoLocationOutline size={18} />
          <span>{shipment.address}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-gray-700 text-sm md:text-[14px] font-montserrat">
          <LuCalendarDays size={18} />
          <span>{shipment.date}</span>
        </div>
      </div>
    </div>
  );
};

export default ShipmentCard;
