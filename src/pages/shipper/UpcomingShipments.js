import React from "react";
import { useNavigate } from "react-router-dom";
import ShipmentCard from "./ShipmentCard";
import Button from "../../components/common/Button";
import { MdNavigateNext } from "react-icons/md";
import { shipments } from "../../data/shipments"; // <-- import

const UpcomingShipments = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 mt-4">
      {shipments.slice(0, 1).map((shipment) => (
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
