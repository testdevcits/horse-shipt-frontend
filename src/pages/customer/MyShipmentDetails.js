import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCustomerShipments } from "../../contexts/customerContext/CustomerShipmentContext";
import Toast from "../../components/common/Toast";
import Button from "../../components/common/Button";

const MyShipmentDetails = () => {
  const [searchParams] = useSearchParams();
  const shipmentId = searchParams.get("shipmentId");

  const { fetchShipmentById, currentShipment, loading, publishShipment } =
    useCustomerShipments();

  const [showConfirm, setShowConfirm] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (shipmentId) {
      fetchShipmentById(shipmentId);
    }
  }, [shipmentId, fetchShipmentById]);

  const handlePublish = async () => {
    if (!currentShipment) return;
    setPublishing(true);
    try {
      await publishShipment(currentShipment._id);
      Toast.success("Shipment published successfully!");
      setShowConfirm(false);
    } catch (err) {
      Toast.error("Failed to publish shipment.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading)
    return <p className="text-center mt-8">Loading shipment details...</p>;
  if (!currentShipment)
    return <p className="text-red-500 text-center mt-8">Shipment not found.</p>;

  const shipment = currentShipment;

  return (
    <div className="w-full p-4 md:p-8 lg:p-12">
      <h2 className="font-montserrat font-semibold text-2xl md:text-3xl mb-6 text-center md:text-left">
        Shipment Details
      </h2>

      <div className="border p-4 md:p-6 lg:p-8 rounded-xl shadow-md flex flex-col gap-6 bg-white">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={shipment.horses[0]?.photo?.url}
            alt={shipment.horses[0]?.registeredName || "Shipment Image"}
            className="w-full md:w-[250px] lg:w-[300px] h-[250px] md:h-[280px] lg:h-[320px] rounded-lg object-cover shadow-sm"
          />
          <div className="flex-1 flex flex-col gap-3">
            <p className="text-lg md:text-xl font-semibold">
              <strong>Name:</strong>{" "}
              {shipment.horses[0]?.registeredName || "N/A"}
            </p>
            <p className="text-gray-700 text-sm md:text-base">
              <strong>Delivery Status:</strong>{" "}
              {shipment.status.charAt(0).toUpperCase() +
                shipment.status.slice(1)}
            </p>
            <p className="text-gray-700 text-sm md:text-base">
              <strong>Pickup Location:</strong> {shipment.pickupLocation}
            </p>
            <p className="text-gray-700 text-sm md:text-base">
              <strong>Delivery Location:</strong> {shipment.deliveryLocation}
            </p>
            <p className="text-gray-700 text-sm md:text-base">
              <strong>Pickup Date:</strong>{" "}
              {new Date(shipment.pickupDate).toLocaleDateString()}
            </p>
            <p className="text-gray-700 text-sm md:text-base">
              <strong>Delivery Date:</strong>{" "}
              {new Date(shipment.deliveryDate).toLocaleDateString()}
            </p>
            <p className="text-gray-700 text-sm md:text-base">
              <strong>Additional Info:</strong>{" "}
              {shipment.additionalInfo || "N/A"}
            </p>

            {/* Publish Button */}
            {!shipment.publish && (
              <Button
                onClick={() => setShowConfirm(true)}
                variant="primary"
                rounded
                className="mt-4 self-start"
                fullWidth={false}
                disabled={publishing}
              >
                {publishing ? "Publishing..." : "Publish Shipment"}
              </Button>
            )}
            {shipment.publish && (
              <span className="mt-4 text-green-600 font-semibold text-sm md:text-base">
                Shipment is Published
              </span>
            )}
          </div>
        </div>

        {/* Horses Info */}
        {shipment.horses && shipment.horses.length > 0 && (
          <div className="mt-6">
            <h3 className="font-montserrat font-semibold text-xl md:text-2xl mb-4 text-center md:text-left">
              Horses
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shipment.horses.map((horse) => (
                <div
                  key={horse._id}
                  className="border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start bg-gray-50 shadow-sm"
                >
                  <img
                    src={horse.photo.url}
                    alt={horse.registeredName}
                    className="w-full md:w-28 h-28 md:h-28 object-cover rounded-md"
                  />
                  <div className="flex flex-col text-sm md:text-base gap-1">
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

                    {/* Documents Links */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {horse.cogins && (
                        <a
                          href={horse.cogins.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm md:text-base"
                        >
                          Cogins PDF
                        </a>
                      )}
                      {horse.healthCertificate && (
                        <a
                          href={horse.healthCertificate.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm md:text-base"
                        >
                          Health Certificate
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-72 sm:w-96 flex flex-col gap-4">
            <h3 className="font-semibold text-lg md:text-xl text-center">
              Confirm Publish
            </h3>
            <p className="text-sm md:text-base text-center">
              Are you sure you want to publish this shipment?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={() => setShowConfirm(false)}
                variant="secondary"
                rounded
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                variant="primary"
                rounded
                disabled={publishing}
              >
                {publishing ? "Publishing..." : "Yes, Publish"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyShipmentDetails;
