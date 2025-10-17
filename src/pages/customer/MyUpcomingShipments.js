import React from "react";
import { MdNavigateNext } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { shipments } from "../../data/shipmentsData";
import ShipmentCard from "../../components/common/ShipmentCard";
import Button from "../../components/common/Button";

const MyUpcomingShipments = () => {
  const navigate = useNavigate();

  const currentShipments = shipments.filter(
    (shipment) => shipment.deliveryStatus === "Today"
  );
  const upcomingShipments = shipments.filter(
    (shipment) => shipment.deliveryStatus !== "Today"
  );

  const upcomingToShow = upcomingShipments.slice(0, 3);

  const handleSeeAll = () => {
    navigate("/all-shipments");
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Current Shipments */}
      {currentShipments.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-montserrat font-semibold text-lg text-systemText">
            Current Shipments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Shipments */}
      {upcomingToShow.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-montserrat font-semibold text-lg text-systemText">
            My Upcoming Shipments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingToShow.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        </div>
      )}

      {/* See All Shipments Button */}
      {upcomingShipments.length > 2 && (
        <div className="flex gap-4 mt-2">
          <Button
            variant="custom"
            bgColor="transparent"
            borderColor="transparent"
            textColor="#BF9B53"
            rounded={false}
            className="px-6 py-2 font-montserrat flex items-center gap-2"
            onClick={handleSeeAll}
          >
            See All Shipments
            <MdNavigateNext color="#BF9B53" size={20} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyUpcomingShipments;
