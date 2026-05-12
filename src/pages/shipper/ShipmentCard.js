import React from "react";
import { useNavigate } from "react-router-dom";
import { createShipmentQueryToken } from "../../utils/createQueryToken";
import { FiArrowRight } from "react-icons/fi";

const statusConfig = {
  open_for_offers: {
    label: "Open for Offers",
    bg: "bg-gray-50",
    text: "text-[#BF9B53]",
    border: "border-[#BF9B53]",
    dot: "bg-[#BF9B53]",
  },
  assigned: {
    label: "Assigned",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

const formatDateRange = (start, end) => {
  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (!start) return "—";
  if (!end || fmt(start) === fmt(end)) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
};

const ShipmentCard = ({ shipment, invitation }) => {
  const navigate = useNavigate();
  if (!shipment) return null;

  const horse = shipment.horses?.[0] || {};
  const st = statusConfig[shipment.status] || statusConfig.open_for_offers;
  const isInvitedShipment = Boolean(invitation || shipment.__isInvitedShipment);
  const distanceMiles = shipment.estimatedDistance?.miles;
  const hasDistance =
    distanceMiles !== null && distanceMiles !== undefined && distanceMiles !== "";
  const answeredQuestionCount = shipment.questionSummary?.answered || 0;

  const handleNavigateWithQuery = () => {
    const token = createShipmentQueryToken(shipment._id);
    const params = new URLSearchParams({
      shipmentId: shipment._id,
      ref: token,
    });
    navigate(`/shipper/shipments/details?${params.toString()}`);
  };

  return (
    <div
      onClick={handleNavigateWithQuery}
      className="bg-white border border-[#BF9B53] rounded-sm p-4 md:p-5 cursor-pointer hover:border-[#BF9B53] hover:shadow-md transition-all duration-200 active:scale-[0.995] font-montserrat"
    >
      <div className="flex gap-4 items-start">
        {/* ── HORSE IMAGE ── */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
            <img
              src={
                horse?.photo?.url ||
                "https://via.placeholder.com/200?text=Horse"
              }
              alt={horse?.registeredName || "Horse"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/200?text=Horse";
              }}
            />
          </div>
          {/* Sex tag on image bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-dark/80 text-white text-[9px] sm:text-[10px] font-bold text-center py-1 rounded-b-xl tracking-wide uppercase">
            {horse.sex || "Horse"}
          </div>
          {isInvitedShipment && (
            <div className="absolute -top-2 -left-2 bg-[#BF9B53] text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
              Invited
            </div>
          )}
        </div>

        {/* ── MAIN BODY ── */}
        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-dark leading-tight truncate">
                {horse.registeredName || "Shipment Invitation"}
                {horse.barnName && (
                  <span className="font-normal text-gray-400">
                    {" "}
                    · {horse.barnName}
                  </span>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {[horse.breed, horse.age ? `${horse.age}yr` : null, horse.colour]
                  .filter(Boolean)
                  .join(" · ") || "Customer invited you to this shipment"}
              </p>
              <span className="inline-block mt-1 text-[10px] sm:text-xs font-semibold font-mono text-[#BF9B53] tracking-wide">
                {shipment.shipmentCode}
              </span>
            </div>

            {/* Status badge */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full border ${st.bg} ${st.text} ${st.border}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`}
                />
                <span className="hidden sm:inline">{st.label}</span>
                <span className="sm:hidden">Open</span>
              </span>
              {answeredQuestionCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-red-700">
                  Reply - {answeredQuestionCount}
                </span>
              )}
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-2 my-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#BF9B53] flex-shrink-0" />
              <span className="text-dark font-medium truncate max-w-[90px] sm:max-w-[130px] md:max-w-[180px] lg:max-w-[220px]">
                {shipment.pickupLocation}
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-200 min-w-[12px]" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#BF9B53] flex-shrink-0" />
              <span className="text-dark font-medium truncate max-w-[90px] sm:max-w-[130px] md:max-w-[180px] lg:max-w-[220px]">
                {shipment.deliveryLocation}
              </span>
            </div>
          </div>

          {/* Date boxes */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Pickup */}
            <div className="group bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] px-3 sm:px-4 py-2.5 transition-all duration-200 hover:shadow-sm hover:from-[#BF9B53]/25 hover:border-[#A8843F]">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-[#8A6E2F] mb-1 group-hover:text-[#6F5622] transition-colors">
                Pickup
              </p>
              <p className="text-[12px] sm:text-sm md:text-base font-semibold text-gray-900">
                {formatDateRange(
                  shipment.pickupDateRange?.start,
                  shipment.pickupDateRange?.end
                )}
              </p>
            </div>

            {/* Delivery */}
            <div className="group bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] px-3 sm:px-4 py-2.5 transition-all duration-200 hover:shadow-sm hover:from-[#BF9B53]/25 hover:border-[#A8843F]">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-[#8A6E2F] mb-1 group-hover:text-[#6F5622] transition-colors">
                Delivery
              </p>
              <p className="text-[12px] sm:text-sm md:text-base font-semibold text-gray-900">
                {formatDateRange(
                  shipment.deliveryDateRange?.start,
                  shipment.deliveryDateRange?.end
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER STATS ── */}
      <div className="border-t border-gray-100 mt-4 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-5 md:gap-6 lg:gap-8">
          {hasDistance && (
            <>
              <div className="text-center">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Distance
                </p>
                <p className="text-xs sm:text-sm md:text-base font-bold text-[#BF9B53]">
                  {Number(distanceMiles).toLocaleString()} mi
                </p>
              </div>

              <div className="w-px h-5 bg-gray-200" />
            </>
          )}

          <div className="text-center">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Horses
            </p>
            <p className="text-xs sm:text-sm md:text-base font-bold text-[#BF9B53]">
              {shipment.numberOfHorses}
            </p>
          </div>

          <div className="w-px h-5 bg-gray-200" />

          <div className="text-center">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Stall
            </p>
            <p className="text-xs sm:text-sm md:text-base font-bold text-[#BF9B53]">
              {horse.requestedStallSize || "—"}
            </p>
          </div>

          <div className="w-px h-5 bg-gray-200 hidden sm:block" />
          <div className="text-center hidden sm:block">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Transport
            </p>
            <p className="text-xs sm:text-sm md:text-base font-bold text-[#BF9B53]">
              {shipment.transportType || "Trucking"}
            </p>
          </div>
        </div>

        {/* Arrow button */}
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 
  bg-white border border-gray-200 
  flex items-center justify-center 
  text-gray-500 
  flex-shrink-0 cursor-pointer
  transition-all duration-200 ease-in-out
  group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 group-hover:shadow-sm"
        >
          <FiArrowRight className="text-[14px] transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
};

export default ShipmentCard;
