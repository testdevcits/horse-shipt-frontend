// src/pages/shipper/Dashboard.js
import React from "react";
import CommentBanner from "../../components/common/CommentBanner";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <CommentBanner />

      {/* Dashboard Content */}
      <div className="text-xl font-bold">Shipper Dashboard</div>
    </div>
  );
};

export default Dashboard;
