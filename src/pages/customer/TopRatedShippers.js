import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { MdNavigateNext } from "react-icons/md";

import ShipperReviewCard from "../../components/common/ShipperReviewCard";
import { topShippers } from "../../data/ShipperReviewData";

const TopRatedShippers = () => {
  const navigate = useNavigate();

  // Show only first 3 shippers for preview
  const shippersToShow = topShippers.slice(0, 3);

  const handleSeeAll = () => {
    navigate("/allshippers");
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="font-montserrat font-semibold text-lg text-systemText">
        Top Rated Shippers
      </h2>

      {/* Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shippersToShow.map((shipper) => (
          <ShipperReviewCard key={shipper.id} shipper={shipper} />
        ))}
      </div>

      {/* See All Shippers Button */}
      {topShippers.length > shippersToShow.length && (
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
            See All Shippers
            <MdNavigateNext color="#BF9B53" size={20} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TopRatedShippers;
