import React from "react";
import ShipmentCard from "./ShipmentCard";
import { shipments } from "../../data/shipments"; // <-- import

const AllUpcomingShipments = () => {
  return (
    <div className="font-[Montserrat]">
      <h1 className="text-2xl font-semibold mb-4">All Upcoming Shipments</h1>
      <div className="flex flex-col gap-4">
        {shipments.map((shipment) => (
          <ShipmentCard key={shipment._id} shipment={shipment} />
        ))}
      </div>
    </div>
  );
};

export default AllUpcomingShipments;
