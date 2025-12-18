import React from "react";
import StatusBadge from "../../components/common/StatusBadge";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays, LuCircleChevronRight } from "react-icons/lu";

const ShipmentCard = ({ shipment }) => {
  if (!shipment || !shipment.horses?.length) return null;

  const horse = shipment.horses[0];

  return (
    <div className="bg-white border-2 border-gray-300 rounded p-4 font-[Montserrat]">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6">
        {/* LEFT COLUMN – HORSE DETAILS */}
        <div className="">
          {/* Heading */}
          <h3 className="text-md font-[Montserrat] text-gray-800 mb-3">
            {shipment.numberOfHorses} Horse Shipping from{" "}
            <span className="font-medium">{shipment.pickupLocation}</span> to{" "}
            <span className="font-medium">{shipment.deliveryLocation}</span>
          </h3>

          <div className="flex gap-4 items-center">
            {/* Horse Image */}
            <img
              src={horse?.photo?.url}
              alt={horse?.registeredName}
              className="w-[100px] h-[100px] object-cover "
            />

            {/* Horse Pickup & Delivery Info */}
            <div className="flex gap-6">
              {/* Pickup */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-800">
                    Pickup
                  </span>
                  <StatusBadge
                    text="Today"
                    bgColor="bg-[#FEF9C3]"
                    borderColor="border-[#A16207]"
                    dotColor="bg-[#A16207]"
                    textColor="text-[#A16207]"
                    paddingX="px-2"
                    paddingY="py-0.5"
                  />
                </div>
                <p className="flex items-center text-sm text-gray-700 gap-2 mt-1">
                  <SlLocationPin size={18} /> {shipment.pickupLocation}
                </p>
                <p className="flex items-center text-sm text-gray-700 gap-2">
                  <LuCalendarDays size={18} />{" "}
                  {new Date(shipment.pickupDate).toLocaleDateString()}
                </p>
              </div>

              {/* Delivery */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    Delivery
                  </span>
                </div>
                <p className="flex items-center text-sm text-gray-700 gap-2 mt-1">
                  <SlLocationPin size={18} /> {shipment.deliveryLocation}
                </p>
                <p className="flex items-center text-sm text-gray-700 gap-2">
                  <LuCalendarDays size={18} />{" "}
                  {new Date(shipment.deliveryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* VERTICAL DIVIDER */}
        <div className="hidden md:block w-[1px] bg-gray-200" />

        {/* RIGHT COLUMN – SHIPMENT DETAILS */}
        <div className="flex items-center relative">
          {/* Content */}
          <div className="flex flex-col gap-6 flex-1">
            {/* Heading */}
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              General Details
            </h3>

            <div className="flex items-start gap-6">
              {/* Pickup */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    Pickup
                  </span>
                </div>
                <p className="flex items-center text-sm text-gray-700 gap-2 mt-1">
                  <SlLocationPin size={18} /> {shipment.pickupLocation}
                </p>
                <p className="flex items-center text-sm text-gray-700 gap-2">
                  <LuCalendarDays size={18} />{" "}
                  {new Date(shipment.pickupDate).toLocaleDateString()}
                </p>
              </div>

              {/* Delivery */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    Delivery
                  </span>
                </div>
                <p className="flex items-center text-sm text-gray-700 gap-2 mt-1">
                  <SlLocationPin size={18} /> {shipment.deliveryLocation}
                </p>
                <p className="flex items-center text-sm text-gray-700 gap-2">
                  <LuCalendarDays size={18} />{" "}
                  {new Date(shipment.deliveryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* End Icon – Vertically Centered */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-system-primary">
            <LuCircleChevronRight size={22} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentCard;
