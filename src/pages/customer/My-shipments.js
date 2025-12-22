// src/pages/customer/MyShipments.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import ShipmentCard from "../../components/common/ShipmentCard";
import Toast from "../../components/common/Toast";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";

const MyShipments = () => {
  const { token } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/customer/shipments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) setShipments(response.data.shipments);
      } catch (err) {
        console.error(err);
        Toast.error("Failed to load shipments.");
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, [token]);

  if (loading) return <p>Loading shipments...</p>;
  if (shipments.length === 0)
    return <p className="text-gray-500 font-montserrat">No shipments found.</p>;

  return (
    <div className="w-full flex flex-col gap-6 p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-montserrat font-semibold mb-4">
        My Shipments
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shipments.map((shipment) => (
          <div
            key={shipment._id}
            onClick={() => setSelectedShipment(shipment)}
            className="cursor-pointer"
          >
            <ShipmentCard
              shipment={{
                name: `Shipment ${shipment._id.slice(-5)}`,
                image:
                  shipment.horses[0]?.photo?.url ||
                  "https://via.placeholder.com/140x160",
                address: shipment.pickupLocation,
                date: new Date(shipment.pickupDate).toLocaleDateString(),
                deliveryStatus:
                  shipment.status === "pending"
                    ? "Pending"
                    : shipment.status === "in-transit"
                    ? "In Transit"
                    : "Delivered",
              }}
            />
          </div>
        ))}
      </div>

      {selectedShipment && (
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold font-montserrat mb-4">
            Shipment Details
          </h2>

          <div className="flex flex-col sm:flex-row gap-6 mb-4">
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Pickup Location</span>
              <div className="flex items-center gap-2">
                <IoLocationOutline />
                <span>{selectedShipment.pickupLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <LuCalendarDays />
                <span>
                  {new Date(selectedShipment.pickupDate).toLocaleDateString()} (
                  {selectedShipment.pickupTimeOption})
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-semibold">Delivery Location</span>
              <div className="flex items-center gap-2">
                <IoLocationOutline />
                <span>{selectedShipment.deliveryLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <LuCalendarDays />
                <span>
                  {new Date(selectedShipment.deliveryDate).toLocaleDateString()}{" "}
                  ({selectedShipment.deliveryTimeOption})
                </span>
              </div>
            </div>
          </div>

          <p className="font-semibold mb-2">
            Number of Horses: {selectedShipment.numberOfHorses}
          </p>

          {selectedShipment.horses.map((h, idx) => (
            <div
              key={h._id}
              className="mb-4 p-4 border border-gray-200 rounded-lg"
            >
              <h3 className="font-semibold mb-2">
                Horse {idx + 1}: {h.registeredName}
              </h3>
              <p>
                Breed: {h.breed}, Colour: {h.colour}, Age: {h.age}, Sex: {h.sex}
              </p>
              <p>General Info: {h.generalInfo || "N/A"}</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                {h.photo && (
                  <a
                    href={h.photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Photo
                  </a>
                )}
                {h.cogins && (
                  <a
                    href={h.cogins.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Coggins
                  </a>
                )}
                {h.healthCertificate && (
                  <a
                    href={h.healthCertificate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Health Certificate
                  </a>
                )}
              </div>
            </div>
          ))}

          <p className="font-semibold">Additional Info:</p>
          <p>{selectedShipment.additionalInfo || "N/A"}</p>
        </div>
      )}
    </div>
  );
};

export default MyShipments;
