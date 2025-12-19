// src/pages/shipper/ChatOverview.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const ChatOverview = () => {
  const navigate = useNavigate();

  // Mock shipments data
  const shipments = [
    {
      _id: "1",
      numberOfHorses: 3,
      pickupLocation: "Delhi",
      deliveryLocation: "Mumbai",
    },
    {
      _id: "2",
      numberOfHorses: 2,
      pickupLocation: "Bengaluru",
      deliveryLocation: "Hyderabad",
    },
    {
      _id: "3",
      numberOfHorses: 1,
      pickupLocation: "Chennai",
      deliveryLocation: "Pune",
    },
  ];

  return (
    <div className="p-4 font-montserrat">
      <h2 className="text-2xl font-semibold mb-4">Shipments Chat</h2>
      <ul className="space-y-2">
        {shipments.map((shipment) => (
          <li
            key={shipment._id}
            onClick={() => navigate(`/shipper/chat/${shipment._id}`)}
            className="p-4 border rounded cursor-pointer hover:bg-gray-100 transition flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-gray-800">
                {shipment.numberOfHorses} Horse Shipping
              </p>
              <p className="text-sm text-gray-600">
                {shipment.pickupLocation} → {shipment.deliveryLocation}
              </p>
            </div>
            <span className="text-system-primary font-semibold">Chat →</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatOverview;
