import React, { useEffect, useState } from "react";
import { MdNavigateNext } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import CustomerShipmentCard from "../../components/common/ShipmentCard";
import Button from "../../components/common/Button";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/common/Toast";
import PageLoader from "../../components/common/PageLoader";

const MyUpcomingShipments = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch shipments from API
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/customer/shipments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          setShipments(response.data.shipments);
        }
      } catch (error) {
        console.error("Failed to fetch shipments:", error);
        Toast.error("Failed to load shipments.");
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, [token]);

  const shipmentsToShow = shipments.slice(0, 2); // Show only 3 cards on dashboard

  const handleSeeAll = () => {
    navigate("/customer/my-shipments"); // Navigate to full shipments page
  };

  if (loading)
    return <PageLoader text="Loading shipments..." fullScreen={false} />;

  return (
    <div className="w-full flex flex-col gap-6 ">
      {shipmentsToShow.length > 0 ? (
        <div className="flex flex-col gap-4 ">
          <h2 className="font-montserrat font-semibold text-lg text-systemText">
            My Upcoming Shipments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
            {shipmentsToShow.map((shipment) => (
              <CustomerShipmentCard key={shipment._id} shipment={shipment} />
            ))}
          </div>

          {shipments.length > 3 && (
            <div className="flex gap-4 mt-2">
              <Button
                variant="custom"
                bgColor="transparent"
                borderColor="transparent"
                textColor="#BF9B53"
                rounded={false}
                className="px-6 py-2 font-montserrat flex items-center gap-2"
                onClick={handleSeeAll}
              >
                See All Shipments
                <MdNavigateNext color="#BF9B53" size={20} />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[250px]  border border-dashed border-[#BF9B53] rounded-md">
          <div className="text-center text-sm text-gray-600 w-fit">
            You have no shipments.
          </div>
        </div>
      )}
    </div>
  );
};

export default MyUpcomingShipments;
