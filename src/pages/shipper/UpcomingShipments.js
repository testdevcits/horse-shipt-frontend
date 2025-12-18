// src/pages/shipper/UpcomingShipments.js
import React, { useState } from "react";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import { FiSearch } from "react-icons/fi";

const mockShipments = [
  {
    id: 1,
    shipmentId: "SHIP-1001",
    from: "New York",
    to: "California",
    date: "2025-01-10",
    status: "Pending",
  },
  {
    id: 2,
    shipmentId: "SHIP-1002",
    from: "Texas",
    to: "Florida",
    date: "2025-01-12",
    status: "Scheduled",
  },
  {
    id: 3,
    shipmentId: "SHIP-1003",
    from: "Nevada",
    to: "Arizona",
    date: "2025-01-15",
    status: "Pending",
  },
  {
    id: 4,
    shipmentId: "SHIP-1004",
    from: "Ohio",
    to: "Illinois",
    date: "2025-01-18",
    status: "Scheduled",
  },
];

const UpcomingShipments = () => {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredShipments = mockShipments.filter(
    (shipment) =>
      shipment.shipmentId.toLowerCase().includes(search.toLowerCase()) ||
      shipment.from.toLowerCase().includes(search.toLowerCase()) ||
      shipment.to.toLowerCase().includes(search.toLowerCase())
  );

  const displayedShipments = showAll
    ? filteredShipments
    : filteredShipments.slice(0, 2);

  return (
    <div className="flex flex-col gap-6 font-[Montserrat] mt-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Upcoming Shipments
        </h1>

        <div className="w-full sm:w-72 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <InputField
            placeholder="Search shipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Shipments List */}
      <div className="flex flex-col gap-3">
        {displayedShipments.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No shipments found</p>
        ) : (
          displayedShipments.map((shipment) => (
            <div
              key={shipment.id}
              className="border border-gray-200 rounded p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {shipment.shipmentId}
                </p>
                <p className="text-sm text-gray-600">
                  {shipment.from} → {shipment.to}
                </p>
                <p className="text-sm text-gray-500">Date: {shipment.date}</p>
              </div>

              <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700 w-fit">
                {shipment.status}
              </span>
            </div>
          ))
        )}
      </div>

      {/* See All Button */}
      {!showAll && filteredShipments.length > 2 && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowAll(true)}
            variant="secondary"
            className="font-[Montserrat]"
          >
            See All Shipments
          </Button>
        </div>
      )}
    </div>
  );
};

export default UpcomingShipments;
