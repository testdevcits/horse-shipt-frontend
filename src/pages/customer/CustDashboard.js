import React from "react";
import CommentBanner from "../../components/common/CommentBanner";

const CustDashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Banner at the top */}
      <CommentBanner />

      {/* Dashboard content */}
      <div className="text-xl font-bold">Customer Dashboard</div>
    </div>
  );
};

export default CustDashboard;
