import React from "react";
import { useNavigate } from "react-router-dom";
import { FiTruck, FiFileText, FiZap } from "react-icons/fi";
import { TbCalendarTime } from "react-icons/tb";
import { useShipperProfile } from "../../contexts/ShipperProfileContext";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/common/Button";
import NewOpportunities from "./NewOpportunities";
import PageLoader from "../../components/common/PageLoader";

const Dashboard = () => {
  const { profile, loading } = useShipperProfile();
  const { user } = useAuth();
  const navigate = useNavigate();

  const upcomingShipmentsCount = 1;
  const submittedQuotesCount = 1;

  const formatCount = (count) => String(count).padStart(2, "0");

  if (loading) {
    return (
      <PageLoader
        text="Loading dashboard..."
        fullScreen={false}
        size={28}
        color="#BF9B53"
      />
    );
  }

  return (
    <div className="flex flex-col font-[Montserrat] gap-8">
      {/* Header */}
      <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800">
        Hello {profile?.name || user?.name || "Shipper"},
      </h1>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6 w-full">
        {/* UPCOMING SHIPMENTS */}
        <div className="flex flex-col justify-between w-full sm:w-[451px] h-[180px] p-4 border rounded-[14px] border-gray-300">
          <div>
            <TbCalendarTime size={22} />
          </div>

          <div>
            <h2 className="text-lg font-montserrat mt-2">UPCOMING SHIPMENTS</h2>
          </div>

          <div className="flex justify-between items-end p-2">
            <div>
              <p
                className="text-gray-900 font-[Montserrat] font-semibold text-system-primary"
                style={{
                  fontSize: "60px",
                  lineHeight: "72px",
                  letterSpacing: "-0.02em",
                }}
              >
                {formatCount(upcomingShipmentsCount)}
              </p>
            </div>

            <Button
              variant="custom"
              borderColor="#BF9B53"
              textColor="#BF9B53"
              icon={<FiTruck size={16} />}
              onClick={() => navigate("/shipper/shipments")}
            >
              View All Shipments
            </Button>
          </div>
        </div>

        {/* SUBMITTED QUOTES */}
        <div className="flex flex-col justify-between w-full sm:w-[451px] h-[180px] p-4 border rounded-[14px] border-gray-300">
          <div>
            <FiZap size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mt-2">
              SUBMITTED QUOTES
            </h2>
          </div>

          <div className="flex justify-between items-end p-2">
            <div>
              <p
                className="text-gray-900 font-[Montserrat] font-semibold text-system-primary"
                style={{
                  fontSize: "60px",
                  lineHeight: "72px",
                  letterSpacing: "-0.02em",
                }}
              >
                {formatCount(submittedQuotesCount)}
              </p>
            </div>

            <Button
              variant="custom"
              borderColor="#BF9B53"
              textColor="#BF9B53"
              icon={<FiFileText size={16} />}
              onClick={() => navigate("/shipper/quotes")}
            >
              View All Quotes
            </Button>
          </div>
        </div>
      </div>

      {/* New Opportunities */}
      <div className="w-full">
        <NewOpportunities />
      </div>
    </div>
  );
};

export default Dashboard;
