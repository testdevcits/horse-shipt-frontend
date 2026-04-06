import React from "react";
import { useNavigate } from "react-router-dom";
// import StatusBadge from "../../components/common/StatusBadge";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays } from "react-icons/lu";
import { FiArrowRight, FiTruck } from "react-icons/fi";
import { createShipmentQueryToken } from "../../utils/createQueryToken";

/**
 * ============================================================
 * MODERN SHIPMENT CARD COMPONENT
 * Updated with better responsive design and modern UI
 * ============================================================
 */

const ShipmentCard = ({ shipment }) => {
  const navigate = useNavigate();

  // Safety check
  if (!shipment || !shipment.horses?.length) return null;

  const horse = shipment.horses[0];

  const handleNavigateWithQuery = () => {
    const token = createShipmentQueryToken(shipment._id);
    const params = new URLSearchParams({
      shipmentId: shipment._id,
      ref: token,
    });
    navigate(`/shipper/shipments/details?${params.toString()}`);
  };

  // Check if pickup is today
  const isPickupToday =
    new Date(shipment.pickupDate).toDateString() === new Date().toDateString();

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      onClick={handleNavigateWithQuery}
      className="group relative bg-white border border-gray-200 hover:border-[#BF9B53] rounded-md p-4 md:p-6 font-montserrat shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer w-full overflow-hidden"
    >
      {/* BACKGROUND ACCENT */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#BF9B53] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* TOP-RIGHT NAVIGATION ARROW */}
      <div className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#BF9B53] to-[#9d7d42] text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
        <FiArrowRight
          size={18}
          className="group-hover:translate-x-0.5 transition-transform"
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full">
        {/* ======================= LEFT SECTION ======================= */}
        <div className="flex-1 min-w-0">
          {/* TITLE */}
          <h3 className="mb-4 text-gray-900 font-semibold text-[15px] md:text-[16px] leading-[22px] md:leading-[24px] break-words">
            <span className="text-[#BF9B53] font-bold">
              {shipment.numberOfHorses}
            </span>{" "}
            Horse
            {shipment.numberOfHorses > 1 ? "s" : ""} Shipping
            <br className="hidden sm:block" />
            from{" "}
            <span className="font-bold text-gray-900">
              {shipment.pickupLocation}
            </span>{" "}
            to{" "}
            <span className="font-bold text-gray-900">
              {shipment.deliveryLocation}
            </span>
          </h3>

          {/* HORSE IMAGE & DETAILS CONTAINER */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-5 w-full">
            {/* HORSE IMAGE */}
            <div className="sm:flex-shrink-0">
              <img
                src={
                  horse?.photo?.url ||
                  "https://via.placeholder.com/150?text=Horse"
                }
                alt={horse?.registeredName || "Horse"}
                className="w-full h-[160px] sm:h-[120px] md:h-[140px] rounded-lg object-cover shadow-md border border-gray-200 group-hover:border-[#BF9B53] transition-all"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150?text=Horse";
                }}
              />
            </div>

            {/* PICKUP & DELIVERY DETAILS */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 flex-1 w-full">
              {/* PICKUP SECTION */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-gray-700 font-semibold text-sm md:text-[15px]">
                      Pickup
                    </span>
                  </div>
                  {isPickupToday && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold border border-green-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <p
                    className="flex items-start gap-2 text-gray-600 text-sm md:text-[15px] break-words"
                    title={shipment.pickupLocation}
                  >
                    <SlLocationPin
                      size={16}
                      className="mt-0.5 flex-shrink-0 text-[#BF9B53]"
                    />
                    <span className="break-all">{shipment.pickupLocation}</span>
                  </p>

                  <p className="flex items-center gap-2 text-gray-600 text-sm md:text-[15px]">
                    <LuCalendarDays
                      size={16}
                      className="flex-shrink-0 text-[#BF9B53]"
                    />
                    <span className="font-medium">
                      {formatDate(shipment.pickupDate)}
                    </span>
                  </p>
                </div>
              </div>

              {/* ARROW DIVIDER (Mobile & Tablet) */}
              <div className="sm:hidden flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-400">
                  <FiArrowRight size={18} />
                </div>
              </div>

              {/* DELIVERY SECTION */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-gray-700 font-semibold text-sm md:text-[15px]">
                      Delivery
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p
                    className="flex items-start gap-2 text-gray-600 text-sm md:text-[15px] break-words"
                    title={shipment.deliveryLocation}
                  >
                    <SlLocationPin
                      size={16}
                      className="mt-0.5 flex-shrink-0 text-[#BF9B53]"
                    />
                    <span className="break-all">
                      {shipment.deliveryLocation}
                    </span>
                  </p>

                  <p className="flex items-center gap-2 text-gray-600 text-sm md:text-[15px]">
                    <LuCalendarDays
                      size={16}
                      className="flex-shrink-0 text-[#BF9B53]"
                    />
                    <span className="font-medium">
                      {formatDate(shipment.deliveryDate)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DIVIDER (Hidden on Mobile) */}
        <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

        {/* ======================= RIGHT SECTION ======================= */}
        <div className="flex flex-col md:min-w-[240px] gap-3">
          <h4 className="text-gray-900 font-semibold text-sm md:text-[15px] flex items-center gap-2">
            <FiTruck size={16} className="text-[#BF9B53]" />
            Shipment Details
          </h4>

          <div className="space-y-2.5">
            {/* Distance */}
            <div className="flex justify-between items-start gap-3 text-xs md:text-[14px]">
              <span className="text-gray-600 font-medium flex-shrink-0">
                Distance:
              </span>
              <span className="text-gray-900 font-semibold text-right">
                {shipment.estimatedDistance
                  ? `${shipment.estimatedDistance.miles}mi (${shipment.estimatedDistance.km}km)`
                  : "200 miles"}
              </span>
            </div>

            {/* Transport Type */}
            <div className="flex justify-between items-start gap-3 text-xs md:text-[14px]">
              <span className="text-gray-600 font-medium flex-shrink-0">
                Transport:
              </span>
              <span className="text-gray-900 font-semibold text-right">
                {shipment.transportType || "Trucking"}
              </span>
            </div>

            {/* Total Horses */}
            <div className="flex justify-between items-start gap-3 text-xs md:text-[14px]">
              <span className="text-gray-600 font-medium flex-shrink-0">
                Horses:
              </span>
              <span className="text-gray-900 font-semibold text-right">
                {shipment.numberOfHorses}
              </span>
            </div>

            {/* Buyer */}
            <div className="flex justify-between items-start gap-3 text-xs md:text-[14px]">
              <span className="text-gray-600 font-medium flex-shrink-0">
                Buyer:
              </span>
              <span className="text-gray-900 font-semibold text-right break-words">
                {shipment.customer?.name || "Buyer Name"}
              </span>
            </div>

            {/* Stalls */}
            <div className="flex justify-between items-start gap-3 text-xs md:text-[14px]">
              <span className="text-gray-600 font-medium flex-shrink-0">
                Stalls:
              </span>
              <span className="text-gray-900 font-semibold text-right">
                {shipment.stallsRequired || 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS INDICATOR BOTTOM BAR (Optional) */}
      {shipment.status && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs md:text-[13px]">
            <span className="text-gray-600">Status:</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold ${
                shipment.status === "assigned"
                  ? "bg-blue-100 text-blue-700"
                  : shipment.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
              {shipment.status?.charAt(0).toUpperCase() +
                shipment.status?.slice(1) || "Pending"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentCard;
