import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/common/Toast";

const MyShipmentDetails = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const shipmentId = searchParams.get("shipmentId");

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shipmentId) return;

    const fetchShipment = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/customer/shipments/${shipmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          setShipment(response.data.shipment);
        }
      } catch (error) {
        console.error("Failed to fetch shipment:", error);
        Toast.error("Failed to load shipment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [shipmentId, token]);

  if (loading) return <p>Loading shipment details...</p>;
  if (!shipment) return <p className="text-red-500">Shipment not found.</p>;

  return (
    <div className="w-full p-4">
      <h2 className="font-montserrat font-semibold text-xl mb-4">
        Shipment Details
      </h2>

      <div className="border p-4 rounded-lg shadow-sm flex flex-col gap-4">
        <div className="flex gap-4">
          <img
            src={shipment.image}
            alt={shipment.name}
            className="w-[150px] h-[200px] rounded-lg object-cover"
          />
          <div className="flex flex-col gap-2">
            <p>
              <strong>Name:</strong> {shipment.name}
            </p>
            <p>
              <strong>Delivery Status:</strong> {shipment.deliveryStatus}
            </p>
            <p>
              <strong>Pickup Location:</strong> {shipment.pickupLocation}
            </p>
            <p>
              <strong>Delivery Location:</strong> {shipment.deliveryLocation}
            </p>
            <p>
              <strong>Pickup Date:</strong>{" "}
              {new Date(shipment.pickupDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Delivery Date:</strong>{" "}
              {new Date(shipment.deliveryDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Additional Info:</strong>{" "}
              {shipment.additionalInfo || "N/A"}
            </p>
          </div>
        </div>

        {/* Horses Info */}
        {shipment.horses && shipment.horses.length > 0 && (
          <div>
            <h3 className="font-montserrat font-semibold text-lg mt-4 mb-2">
              Horses
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shipment.horses.map((horse) => (
                <div
                  key={horse._id}
                  className="border rounded-lg p-2 flex gap-2 items-center"
                >
                  <img
                    src={horse.photo.url}
                    alt={horse.registeredName}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex flex-col text-sm">
                    <p>
                      <strong>Registered Name:</strong> {horse.registeredName}
                    </p>
                    <p>
                      <strong>Barn Name:</strong> {horse.barnName}
                    </p>
                    <p>
                      <strong>Breed:</strong> {horse.breed}
                    </p>
                    <p>
                      <strong>Colour:</strong> {horse.colour}
                    </p>
                    <p>
                      <strong>Age:</strong> {horse.age}
                    </p>
                    <p>
                      <strong>Sex:</strong> {horse.sex}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyShipmentDetails;
