// src/pages/shipper/Dashboard.js
import React from "react";
import { useShipperProfile } from "../../contexts/ShipperProfileContext";
import { useAuth } from "../../contexts/AuthContext";

const Dashboard = () => {
  const { profile, loading } = useShipperProfile();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="text-gray-600 font-[Montserrat] text-lg">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-[Montserrat]">
      {/* Welcome Section */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome, {profile?.name || user?.name || "Shipper"} 👋
        </h1>

        <p className="text-gray-600 mt-2">
          Manage your profile, shipments, and reviews from here.
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <h2 className="text-xl font-medium text-gray-700 mb-2">
          Shipper Dashboard
        </h2>

        <p className="text-gray-600">
          This is your shipper dashboard overview.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
