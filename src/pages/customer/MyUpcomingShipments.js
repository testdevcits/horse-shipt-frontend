import React, { useEffect, useState } from "react";
import CustomerShipmentCard from "../../components/common/ShipmentCard";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import Toast from "../../components/common/Toast";
import PageLoader from "../../components/common/PageLoader";
import { API_BASE_URL } from "../../config/api";

const MyUpcomingShipments = () => {
  const { token } = useAuth();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch shipments from API
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/customer/shipments`,
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

  const shipmentsToShow = shipments.slice(0, 2);

  if (loading)
    return <PageLoader text="Loading shipments..." fullScreen={false} />;

  return (
  <section className="w-full min-w-0 overflow-hidden bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6 md:px-6">
    <h2 className="font-[Montserrat] text-[22px] font-bold leading-[30px] text-[#111827]">
      New Opportunities
    </h2>

    {shipmentsToShow.length > 0 ? (
      <div className="mt-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {shipmentsToShow.map((shipment) => (
            <CustomerShipmentCard key={shipment._id} shipment={shipment} />
          ))}
        </div>
      </div>
    ) : (
      <div className="mt-6 flex min-h-[250px] items-center justify-center border border-dashed border-[#BF9B53]">
        <p className="text-center text-sm text-gray-600">
          You have no shipments.
        </p>
      </div>
    )}
  </section>
);
};

export default MyUpcomingShipments;
