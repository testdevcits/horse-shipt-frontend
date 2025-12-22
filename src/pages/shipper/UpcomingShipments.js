import React from "react";
import { useNavigate } from "react-router-dom";
import ShipmentCard from "./ShipmentCard";
import Button from "../../components/common/Button";
import { MdNavigateNext } from "react-icons/md";
import { useShipperShipment } from "../../contexts/shipperContext/ShipperShipmentContext";

const UpcomingShipments = () => {
  const navigate = useNavigate();

  const { availableShipments, loading } = useShipperShipment();

  if (loading) {
    return (
      <div className="mt-4 text-gray-500 text-sm">Loading shipments...</div>
    );
  }

  if (!availableShipments.length) {
    return (
      <div className="mt-4 text-gray-500 text-sm">No available shipments</div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Show ONLY 1 shipment like before */}
      {availableShipments.slice(0, 1).map((shipment) => (
        <ShipmentCard key={shipment._id} shipment={shipment} />
      ))}

      <div className="flex gap-4 mt-2">
        <Button
          variant="custom"
          bgColor="transparent"
          borderColor="transparent"
          rounded={false}
          className="px-6 py-2 font-[montserrat] flex items-center gap-2"
          onClick={() => navigate("/shipper/shipments")}
        >
          See All Shipments
          <MdNavigateNext size={20} />
        </Button>
      </div>
    </div>
  );
};

export default UpcomingShipments;
