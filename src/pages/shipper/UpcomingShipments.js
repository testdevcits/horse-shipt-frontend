import React from "react";
import ShipmentCard from "./ShipmentCard";
import Button from "../../components/common/Button";
import { MdNavigateNext } from "react-icons/md";
const shipments = [
  {
    _id: "68fa3354c3e032b612c53475",
    status: "pending",
    pickupLocation: "Pickup Adress Name",
    pickupDate: "2025-10-02",
    deliveryLocation: "Delivery Adress Name",
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
          url: "https://res.cloudinary.com/dra3iqxvf/image/upload/v1761227013/shipments/nqxkvhmpb9yindt4w4ce.jpg",
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

      <div className="flex gap-4 mt-2">
        <Button
          variant="custom"
          bgColor="transparent"
          borderColor="transparent"
          rounded={false}
          className="px-6 py-2  font-[montserrat] flex items-center gap-2 "
          //   onClick={handleSeeAll}
        >
          See All Shipments
          <MdNavigateNext size={20} />
        </Button>
      </div>
    </div>
  );
};

export default UpcomingShipments;
