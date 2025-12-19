import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import { SlLocationPin } from "react-icons/sl";
import { LuCalendarDays } from "react-icons/lu";
import { shipments } from "../../data/shipments"; // <-- Import the central data file

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);

  useEffect(() => {
    // Find shipment from central data
    const foundShipment = shipments.find((s) => s._id === id);
    setShipment(foundShipment || null);
  }, [id]);

  if (!shipment) {
    return (
      <div className="p-6 font-[Montserrat]">
        <p className="text-gray-700">Shipment not found!</p>
        <Button
          variant="custom"
          bgColor="transparent"
          borderColor="transparent"
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          ← Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 font-[Montserrat]">
      {/* BACK BUTTON */}
      <Button
        variant="custom"
        bgColor="transparent"
        borderColor="transparent"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        ← Back
      </Button>

      <h1 className="text-2xl font-semibold mb-4">Shipment Details</h1>

      <div className="bg-white border rounded-lg p-6 flex flex-col gap-6">
        {/* GENERAL INFO */}
        <div>
          <h2 className="text-lg font-semibold mb-2">General Info</h2>
          <p>
            <span className="font-medium">Shipment ID:</span> {shipment._id}
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <StatusBadge text={shipment.status} />
          </p>
          <p>
            <span className="font-medium">Number of Horses:</span>{" "}
            {shipment.numberOfHorses}
          </p>
          <p>
            <span className="font-medium">Created At:</span>{" "}
            {new Date(shipment.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* PICKUP & DELIVERY */}
        <div className="flex flex-col md:flex-row gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-2">Pickup Info</h2>
            <p className="flex items-center gap-2">
              <SlLocationPin /> {shipment.pickupLocation}
            </p>
            <p className="flex items-center gap-2">
              <LuCalendarDays />{" "}
              {new Date(shipment.pickupDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Delivery Info</h2>
            <p className="flex items-center gap-2">
              <SlLocationPin /> {shipment.deliveryLocation}
            </p>
            <p className="flex items-center gap-2">
              <LuCalendarDays />{" "}
              {new Date(shipment.deliveryDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* HORSES */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Horses</h2>
          <div className="flex flex-wrap gap-4">
            {shipment.horses.map((horse, index) => (
              <div
                key={index}
                className="border rounded p-3 w-[220px] flex flex-col items-center"
              >
                <img
                  src={horse.photo.url}
                  alt={horse.registeredName}
                  className="w-[100px] h-[100px] object-cover rounded-md mb-2"
                />
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {horse.registeredName}
                </p>
                <p>
                  <span className="font-medium">Breed:</span> {horse.breed}
                </p>
                <p>
                  <span className="font-medium">Colour:</span> {horse.colour}
                </p>
                <p>
                  <span className="font-medium">Age:</span> {horse.age}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;
