import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
// import API from "../../api/axios"; // later

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading] = useState(false);

  useEffect(() => {
    // 🔹 Later when API is ready
    // setLoading(true);
    // API.get(`/shipments/${id}`)
    //   .then(res => setShipment(res.data))
    //   .finally(() => setLoading(false));

    // 🔹 For now (static placeholder)
    setShipment({ _id: id });
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 font-[Montserrat]">Loading shipment details...</div>
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

      <div className="bg-white border rounded-lg p-4">
        <p className="text-gray-700">
          Shipment ID: <span className="font-medium">{shipment?._id}</span>
        </p>

        {/* Add more sections here */}
        {/* Horse info */}
        {/* Pickup / Delivery */}
        {/* Status timeline */}
      </div>
    </div>
  );
};

export default ShipmentDetails;
