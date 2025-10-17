// src/pages/customer/CustDashboard.js
import React from "react";
import MyUpcomingShipments from "./MyUpcomingShipments";
import TopRatedShippers from "./TopRatedShippers";
import Button from "../../components/common/Button";
import logo from "../../assets/images/defultlogo.png";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const CustDashboard = () => {
  const { user } = useAuth(); // get the current user from context
  const navigate = useNavigate();
  // Display "Hello [Name]" or fallback text
  const greeting = user?.name ? `Hello ${user.name},` : "Hello,";

  const handleStartShipment = () => {
    navigate("/customer/new-shipment"); // navigate to NewShipment page
  };

  return (
    <div className="flex flex-col gap-6 min-h-screen w-full">
      {/* User Name */}
      <div className="font-montserrat font-semibold text-[24px] leading-[32px] text-systemText">
        {greeting}
      </div>

      {/* Dashboard Card */}
      <div className="w-full rounded-md border border-gray-300 bg-system-background flex flex-col gap-4 p-4 items-center">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Logo"
            style={{ width: "51.85px", height: "40px" }}
          />
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="primary"
            rounded={false}
            className="rounded-md px-6 py-2 font-montserrat"
            onClick={handleStartShipment} // add click handler
          >
            Start new shipment
          </Button>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-6">
        <MyUpcomingShipments />
        <TopRatedShippers />
      </div>
    </div>
  );
};

export default CustDashboard;
