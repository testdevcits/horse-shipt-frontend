import React from "react";
import { useDriverAuth } from "../../contexts/DriverAuthContext";

const DriverDashboard = () => {
  const { driver } = useDriverAuth();

  if (!driver) return <div>Loading...</div>;

  return (
    <div className="p-6 font-[Montserrat]">
      {/* Driver Info */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Welcome, {driver.name}</h2>
        <p>
          <strong>Email:</strong> {driver.email}
        </p>
        <p>
          <strong>Phone:</strong> {driver.phone}
        </p>
        <p>
          <strong>License Number:</strong> {driver.licenseNumber}
        </p>
        <p>
          <strong>Notes:</strong> {driver.notes || "N/A"}
        </p>
      </div>

      {/* Assigned Vehicles */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Assigned Vehicles</h3>
        {driver.assignedVehicles.length === 0 ? (
          <p>No vehicles assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {driver.assignedVehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="border rounded-lg p-4 shadow hover:shadow-md transition"
              >
                <h4 className="font-bold mb-1">
                  {vehicle.vehicleType} - {vehicle.transportType}
                </h4>
                <p>
                  <strong>Trailer Type:</strong> {vehicle.trailerType}
                </p>
                <p>
                  <strong>Stalls:</strong> {vehicle.numberOfStalls} (
                  {vehicle.stallSize})
                </p>
                <p className="mb-2">
                  <strong>Notes:</strong> {vehicle.notes || "N/A"}
                </p>

                {/* Vehicle Images */}
                <div className="flex gap-2 overflow-x-auto">
                  {vehicle.images.map((img) => (
                    <img
                      key={img._id}
                      src={img.url}
                      alt="Vehicle"
                      className="w-24 h-24 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
