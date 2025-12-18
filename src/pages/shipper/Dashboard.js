// src/pages/shipper/Dashboard.js
import React from "react";
import { useShipperProfile } from "../../contexts/ShipperProfileContext";
import { useAuth } from "../../contexts/AuthContext";
import UpcomingShipments from "./UpcomingShipments";

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
    <div className="flex flex-col font-[Montserrat]">
      <h1 className="text-4xl font-semibold text-gray-800">
        Hello {profile?.name || user?.name || "Shipper"},
      </h1>

      <UpcomingShipments />
    </div>
  );
};

export default Dashboard;
