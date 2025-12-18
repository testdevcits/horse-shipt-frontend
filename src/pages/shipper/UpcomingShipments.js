import React from "react";
import ShipmentCard from "./ShipmentCard";
import Button from "../../components/common/Button";

const shipments = [
  {
    _id: "68fa3354c3e032b612c53475",
    status: "pending",
    pickupLocation: "Test1",
    pickupDate: "2025-10-02",
    deliveryLocation: "Test2",
    deliveryDate: "2025-10-04",
    numberOfHorses: 1,
    createdAt: "2025-10-23",
    horses: [
      {
        registeredName: "Thunder",
        breed: "Warmblood",
        colour: "Black",
        age: "10",
        photo: {
          url: "https://res.cloudinary.com/dra3iqxvf/image/upload/v1761227603/shipments/lfuyuvjxvkxlj7it0ogq.jpg",
        },
      },
    ],
  },
];

const UpcomingShipments = () => {
  return (
    <div className="flex flex-col gap-4 mt-4">
      {shipments.slice(0, 1).map((shipment) => (
        <ShipmentCard key={shipment._id} shipment={shipment} />
      ))}

      <div className="flex justify-end">
        <Button variant="secondary">See All Shipments</Button>
      </div>
    </div>
  );
};

export default UpcomingShipments;
