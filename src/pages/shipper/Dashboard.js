import React from "react";
import CommentBanner from "../../components/common/CommentBanner";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Banner at the top */}
      <CommentBanner />

      {/* Dashboard content */}
      <div className="text-xl font-bold">Shipper Dashboard</div>
    </div>
  );
};

export default Dashboard;
