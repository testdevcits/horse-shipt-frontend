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

  // Document modal
  const [docModal, setDocModal] = useState({
    visible: false,
    url: "",
    title: "",
  });

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
    <div className="w-full">
      <h2 className="font-montserrat font-semibold text-2xl md:text-3xl mb-6 text-center md:text-left">
        Shipment Details
      </h2>

      <div className="relative border p-4 md:p-6 lg:p-8 rounded-xl shadow-md flex flex-col gap-6 bg-white">
        {/* Publish Button Top Right */}
        {!shipment.publish && (
          <div className="absolute top-4 right-4">
            <Button
              onClick={() => setShowConfirm(true)}
              variant="primary"
              rounded
              disabled={publishing}
            >
              {publishing ? "Publishing..." : "Publish Shipment"}
            </Button>
          </div>
        )}
        {shipment.publish && (
          <div className="absolute top-4 right-4 text-green-600 font-semibold">
            Shipment Published
          </div>
        )}

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
              <strong>Status:</strong>{" "}
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

                    {/* Documents Links - Open in modal */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {horse.cogins && (
                        <button
                          onClick={() =>
                            setDocModal({
                              visible: true,
                              url: horse.cogins.url,
                              title: "Cogins PDF",
                            })
                          }
                          className="text-blue-600 hover:underline text-sm md:text-base"
                        >
                          Cogins PDF
                        </button>
                      )}
                      {horse.healthCertificate && (
                        <button
                          onClick={() =>
                            setDocModal({
                              visible: true,
                              url: horse.healthCertificate.url,
                              title: "Health Certificate",
                            })
                          }
                          className="text-blue-600 hover:underline text-sm md:text-base"
                        >
                          Health Certificate
                        </button>
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
            <div className="flex justify-between gap-2 mt-4">
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

      {/* Document Viewer Modal */}
      {docModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-11/12 md:w-4/5 lg:w-3/5 h-4/5 rounded-lg shadow-lg flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">{docModal.title}</h3>
              <button
                onClick={() =>
                  setDocModal({ visible: false, url: "", title: "" })
                }
                className="text-gray-500 hover:text-gray-700 font-bold text-xl"
              >
                ×
              </button>
            </div>
            <iframe
              src={docModal.url}
              title={docModal.title}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyShipmentDetails;
