import React from "react";
import { useNavigate } from "react-router-dom";
import { createShipperShipmentDetailsPath } from "../../utils/createQueryToken";
import { FiArrowUpRight, FiMapPin, FiTruck } from "react-icons/fi";
import { LuBoxes } from "react-icons/lu";
import horseIcon from "../../assets/images/Horse.png";
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

const ShipmentCard = ({ shipment, invitation, isHighlighted = false }) => {
  const navigate = useNavigate();
  if (!shipment) return null;

  const horse = shipment.horses?.[0] || {};
  const horseImageSrc = horse?.photo?.url || horseIcon;
  const st = statusConfig[shipment.status] || statusConfig.open_for_offers;
  const isInvitedShipment = Boolean(invitation || shipment.__isInvitedShipment);
  const distanceMiles = shipment.estimatedDistance?.miles;
  const hasDistance =
    distanceMiles !== null && distanceMiles !== undefined && distanceMiles !== "";
  const matchedPreferredAreas = Array.isArray(shipment.matchedPreferredAreas)
    ? shipment.matchedPreferredAreas
    : [];
  const answeredQuestionCount =
    shipment.questionSummary?.unreadForShipper ??
    shipment.questionSummary?.answered ??
    0;

  const handleNavigateWithQuery = () => {
    navigate(createShipperShipmentDetailsPath(shipment._id));
  };

  const handleHorseImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = horseIcon;
  };

  return (
    <div
      onClick={handleNavigateWithQuery}
      className={`group bg-white border rounded-sm p-3 sm:p-4 md:p-5 cursor-pointer hover:border-[#BF9B53] hover:shadow-md transition-all duration-200 active:scale-[0.995] font-montserrat ${isHighlighted
        ? "border-[#BF9B53] shadow-md ring-2 ring-[#BF9B53]/25"
        : "border-gray-100"
        }`}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:gap-7 xl:items-start">
        {/* ── HORSE IMAGE ── */}
        {/* <div className="relative w-full flex-shrink-0 sm:w-[230px] md:w-[230px] lg:w-[230px]">
          {isInvitedShipment ? (
            <div className="h-[224px] rounded-[8px] bg-[#BF9B53] p-[6px]">
              <div className="flex h-[24px] items-center justify-center">
                <h3 className="font-montserrat text-[13px] font-bold leading-none text-white">
                  Quote Requested
                </h3>
              </div>

              <div className="h-[188px] overflow-hidden rounded-[7px] bg-white">
                <img
                  src={
                    horse?.photo?.url ||
                    "https://via.placeholder.com/400?text=Horse"
                  }
                  alt={horse?.registeredName || "Horse"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/400?text=Horse";
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="h-[330px] w-[316px] overflow-hidden rounded-[8px] border border-gray-200 bg-white">
              <img
                src={
                  horse?.photo?.url ||
                  "https://via.placeholder.com/400?text=Horse"
                }
                alt={horse?.registeredName || "Horse"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/400?text=Horse";
                }}
              />
            </div>
          )}
        </div> */}

       <div className="relative flex-shrink-0 w-full sm:w-[260px] md:w-[300px] lg:w-[315px] xl:w-[330px]">

  {isInvitedShipment ? (

    /* Quote Requested Card */
    <div className="rounded-[16px] bg-[#BF9B53] p-[8px] relative w-full h-full group overflow-hidden ">

      {/* Heading */}
      <div className="flex h-10 items-center justify-center">
        <h3 className="text-sm font-bold text-white">
          Quote Requested
        </h3>
      </div>

      {/* Image */}
       <div className="overflow-hidden rounded-[12px] bg-white relative w-full h-full object-cover">
        <img
          src={horseImageSrc}
          alt={horse?.registeredName || "Horse"}
          className="aspect-[1.02/1] w-full object-cover"
          onError={handleHorseImageError}
        />
      </div>
    </div>

  ) : (

    /* Normal Card */
    <div className="overflow-hidden rounded-[16px] border border-gray-200 bg-white">
      <img
        src={horseImageSrc}
        alt={horse?.registeredName || "Horse"}
        className="aspect-[1.02/1] w-full object-cover"
        onError={handleHorseImageError}
      />
    </div>

  )}

</div>


        {/* ── MAIN BODY ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Name row */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <h3 className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                <span className="font-montserrat text-[20px] font-bold leading-[28px] tracking-normal text-[#111827] sm:text-[24px] sm:leading-[35px]">
                  {horse.registeredName || "Quote Request"}
                </span>

                <span className="font-montserrat text-[20px] font-bold leading-[28px] tracking-normal text-[#6B7280] sm:text-[24px] sm:leading-[35px]">.</span>

                {horse.barnName && (
                  <span className="min-w-0 break-words font-montserrat text-[20px] font-normal leading-[28px] tracking-normal text-[#6B7280] sm:text-[24px] sm:leading-[35px]">
                  {"  "}  {horse.barnName}
                  </span>
                )}
              </h3>
              <p className="mt-2 flex flex-wrap items-center gap-2 font-montserrat text-[12px] font-semibold leading-[20px] tracking-normal text-[#4B5563] sm:mt-4">
                {[horse.breed, horse.age ? `${horse.age}yr` : null, horse.colour]
                  .filter(Boolean)
                  .map((item, index, arr) => (
                    <span key={index} className="flex items-center gap-2">
                      {item}

                      {index !== arr.length - 1 && (
                        <span className="text-[#9CA3AF]">|</span>
                      )}
                    </span>
                  ))}
              </p>
              <span className="mt-2 inline-block font-montserrat text-[12px] font-semibold leading-[20px] tracking-normal text-[#735D32] sm:mt-4">
                {shipment.shipmentCode}
              </span>
              {matchedPreferredAreas.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {matchedPreferredAreas.slice(0, 3).map((area) => (
                    <span
                      key={area.id || area.locationName}
                      className="inline-flex bg-[#F5EFE2] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#735D32]"
                    >
                      {area.locationName}
                      {area.pickupMatched && area.deliveryMatched
                        ? " • pickup & delivery"
                        : area.pickupMatched
                        ? " • pickup"
                        : " • delivery"}
                    </span>
                  ))}
                  {matchedPreferredAreas.length > 3 && (
                    <span className="inline-flex bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                      +{matchedPreferredAreas.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Status badge */}

            <div className="flex h-[42px] w-full max-w-[150px] flex-col items-center justify-center rounded-[5px] border border-[#BF9B53] bg-[#FBF9F4] px-3 sm:h-[45px] sm:items-end">
              <span className="inline-flex items-center gap-2">

                {/* <span
      className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${st.dot}`}
    /> */}

                <span className="hidden font-montserrat text-[12px] font-medium uppercase leading-[20px] tracking-normal text-[#4B5563] sm:inline">
                  {st.label}
                </span>

                <span className="font-montserrat text-[12px] font-medium uppercase leading-[20px] tracking-normal text-[#4B5563] sm:hidden">
                  Open
                </span>
              </span>

              {answeredQuestionCount > 0 && (
                <span className="text-[10px] font-bold text-red-700 sm:text-xs">
                  Reply - {answeredQuestionCount}
                </span>
              )}
            </div>
          </div>

          {/* Route */}
          <div className="relative mb-5 overflow-hidden bg-[#F3F4F6] px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[auto_minmax(160px,1fr)_auto] lg:items-center lg:gap-5">
              <div className="relative z-10">
                <div className="mb-3 flex max-w-[220px] items-center gap-1.5 text-[10px] text-gray-500">
                  <FiMapPin className="text-[#735D32] flex-shrink-0" size={15} />
                  <span className="truncate font-montserrat text-[10px] leading-[20px] tracking-normal text-[#4B5563]">
                    {shipment.pickupLocation || "Pickup location"}
                  </span>
                </div>
                <div className="inline-block min-w-[80px] rounded border border-[#735D32] bg-white px-3 py-3">
                  <p className="mb-1 font-montserrat text-[12px] font-semibold uppercase leading-[18px] tracking-normal text-[#4B5563] sm:text-[13px] sm:leading-[20px]">
                    Pickup
                  </p>
                  <p className="whitespace-nowrap font-montserrat text-[16px] font-bold uppercase leading-[20px] tracking-normal text-[#735D32] sm:text-[18px]">
                    {formatDateRange(
                      shipment.pickupDateRange?.start,
                      shipment.pickupDateRange?.end
                    )}
                  </p>
                </div>
              </div>

              <div className="relative hidden h-11 w-full max-w-[600px] items-center justify-center justify-self-center lg:flex">
                <span className="absolute left-10 right-10 top-1/2 h-px -translate-y-1/2 bg-[#BF9B53]" />
                <span className="absolute left-10 top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full bg-[#BF9B53]" />
                <span className="absolute right-10 top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full bg-[#BF9B53]" />
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#8A6E2F] shadow-sm">
                  <FiTruck size={23} />
                </span>
              </div>

              <div className="relative z-10 lg:text-right">
                <div className="mb-3 flex max-w-[220px] items-center gap-1.5 text-[10px] text-gray-500 lg:ml-auto lg:justify-end">
                  <FiMapPin className="text-[#8A6E2F] flex-shrink-0" size={13} />
                  <span className="truncate font-montserrat text-[10px] leading-[20px] tracking-normal text-[#4B5563]">{shipment.deliveryLocation || "Delivery location"}</span>
                </div>
                <div className="inline-block min-w-[80px] rounded border border-[#735D32] bg-white px-3 py-3">
                  <p className="mb-1 font-montserrat text-[12px] font-semibold uppercase leading-[18px] tracking-normal text-[#4B5563] sm:text-[13px] sm:leading-[20px]">
                    Delivery
                  </p>
                  <p className="whitespace-nowrap font-montserrat text-[16px] font-bold uppercase leading-[20px] tracking-normal text-[#735D32] sm:text-[18px]">
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
          <div className="flex items-end justify-between gap-3 sm:gap-4">
            <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-4 sm:flex sm:flex-wrap sm:items-stretch sm:gap-5 md:gap-6">
              {hasDistance && (
                <>
                  <div className="flex items-center gap-3">

                    <span className="flex h-9 w-9 items-center justify-center rounded border border-gray-100 bg-[#FBF9F3] text-[#8A6E2F]">
                      <FiMapPin size={18} />
                    </span>

                    <div className="min-w-0 space-y-[1px] ">
                      <p className="font-montserrat text-[10px] font-medium leading-[14px] tracking-normal text-[#4B5563]">
                        Distance
                      </p>

                      <p className="font-montserrat text-[12px] font-semibold leading-[16px] tracking-normal text-[#4B5563]">
                        {Number(distanceMiles).toLocaleString()} mi
                      </p>
                    </div>
                  </div>

                  <div className="hidden w-px bg-gray-200 sm:block" />
                </>
              )}

              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded border border-gray-100 bg-[#FBF9F3]">

                  <img
                    src={horseIcon}
                    alt="Horse"
                    className="h-[18px] w-[18px] object-contain "
                  />

                </span>

                <div className="min-w-0 space-y-[1px]">
                  <p className="font-montserrat text-[10px] font-medium leading-[14px] tracking-normal text-[#4B5563]">
                    Horses
                  </p>

                  <p className="font-montserrat text-[12px] font-semibold leading-[16px] tracking-normal text-[#4B5563]">
                    {shipment.numberOfHorses || "01"}
                  </p>
                </div>
              </div>

              <div className="hidden w-px bg-gray-200 sm:block" />

              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded bg-[#FBF9F3] border border-gray-100 flex items-center justify-center text-[#8A6E2F]">
                  <LuBoxes  size={18} />
                </span>
                <div className="space-y-[1px]">
                  <p className="font-montserrat text-[10px] font-medium leading-[14px] tracking-normal text-[#4B5563]">
                    Stall
                  </p>

                  <p className="font-montserrat text-[12px] font-semibold leading-[16px] tracking-normal text-[#4B5563]">
                    {horse.requestedStallSize || "Box"}
                  </p>
                </div>
              </div>

              <div className="hidden w-px bg-gray-200 sm:block" />

              <div className="hidden sm:flex items-center gap-3">
                <span className="w-9 h-9 rounded bg-[#FBF9F3] border border-gray-100 flex items-center justify-center text-[#8A6E2F]">
                  <FiTruck size={18} />
                </span>
                <div className="space-y-[1px]">
                  <p className="font-montserrat text-[10px] font-medium leading-[14px] tracking-normal text-[#4B5563]">
                    Transport
                  </p>

                  <p className="font-montserrat text-[12px] font-semibold leading-[16px] tracking-normal text-[#4B5563]">
                    {shipment.transportType || "Trucking"}
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow button */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-gray-300 text-white transition-all duration-200 ease-in-out group-hover:bg-[#BF9B53] group-hover:shadow-sm sm:h-11 sm:w-11">
              <FiArrowUpRight className="text-xl transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentCard;
