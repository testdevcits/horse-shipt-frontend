import React, { useEffect, useMemo, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { useShipperInvitations } from "../../contexts/shipperContext/ShipperInvitationContext";
import ShipmentCard from "./ShipmentCard";
import PageLoader from "../../components/common/PageLoader";

const normalizeInvitationShipment = (invite) => {
  if (invite?.shipment && typeof invite.shipment === "object") {
    return {
      ...invite.shipment,
      __invitation: invite,
      __isInvitedShipment: true,
    };
  }

  return {
    _id: invite?.shipment,
    shipmentCode: invite?.shipmentCode,
    pickupLocation: invite?.pickupLocation,
    deliveryLocation: invite?.deliveryLocation,
    status: "open_for_offers",
    horses: [],
    numberOfHorses: invite?.numberOfHorses,
    __invitation: invite,
    __isInvitedShipment: true,
  };
};

const InvitedShipments = () => {
  const { invitations, loading, fetchInvitations } = useShipperInvitations();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const invitedShipments = useMemo(
    () =>
      (invitations || [])
        .filter((invite) => invite?.status === "pending")
        .map(normalizeInvitationShipment)
        .filter((shipment) => shipment?._id),
    [invitations]
  );

  const filteredShipments = invitedShipments.filter((shipment) =>
    [
      shipment.shipmentCode,
      shipment.pickupLocation,
      shipment.deliveryLocation,
      shipment.__invitation?.customer?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 font-montserrat">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark">
            Invited Shipments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Shipments customers specifically invited you to review.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invites..."
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-system-primary focus:ring-2 focus:ring-system-primary/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <PageLoader text="Loading invited shipments..." />
        </div>
      ) : filteredShipments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-lg font-semibold text-dark">No invited shipments</p>
          <p className="text-sm text-gray-500 mt-1">
            New customer invitations will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {filteredShipments.map((shipment) => (
            <ShipmentCard
              key={shipment._id}
              shipment={shipment}
              invitation={shipment.__invitation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InvitedShipments;
