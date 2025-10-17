import React from "react";

const MyUpcomingShipments = () => {
  // Static data for now
  const shipments = [
    { id: 1, name: "Shipment 001", date: "2025-10-20", status: "Pending" },
    { id: 2, name: "Shipment 002", date: "2025-10-22", status: "In Transit" },
    { id: 3, name: "Shipment 003", date: "2025-10-25", status: "Scheduled" },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="font-montserrat font-semibold text-lg text-systemText">
        My Upcoming Shipments
      </h2>

      {shipments.length === 0 ? (
        <div className="text-gray-500 font-montserrat text-sm p-4 border border-gray-200 rounded-md bg-white">
          You do not have any current shipments
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Show only the first shipment on small screens */}
          {shipments.slice(0, 1).map((shipment) => (
            <div
              key={shipment.id}
              className="flex justify-between items-center p-3 border border-gray-200 rounded-md bg-white"
            >
              <div className="font-montserrat text-sm font-medium text-gray-700">
                {shipment.name}
              </div>
              <div className="text-sm text-gray-500">{shipment.date}</div>
              <div
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  shipment.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : shipment.status === "In Transit"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {shipment.status}
              </div>
            </div>
          ))}

          {/* Show remaining shipments only on md+ screens */}
          {shipments.slice(1).map((shipment) => (
            <div
              key={shipment.id}
              className="hidden md:flex justify-between items-center p-3 border border-gray-200 rounded-md bg-white"
            >
              <div className="font-montserrat text-sm font-medium text-gray-700">
                {shipment.name}
              </div>
              <div className="text-sm text-gray-500">{shipment.date}</div>
              <div
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  shipment.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : shipment.status === "In Transit"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {shipment.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyUpcomingShipments;
