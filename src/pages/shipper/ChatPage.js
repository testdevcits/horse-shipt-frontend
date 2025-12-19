import React from "react";
import { useParams } from "react-router-dom";

const ChatPage = () => {
  const { shipmentId } = useParams();

  return (
    <div className="p-6 font-[Montserrat]">
      <h1 className="text-2xl font-semibold mb-2">Chat</h1>
      <p className="text-gray-600">
        Shipment ID:
        <span className="ml-1 font-medium text-black">{shipmentId}</span>
      </p>
    </div>
  );
};

export default ChatPage;
