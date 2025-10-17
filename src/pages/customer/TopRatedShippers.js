import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png"; // replace with shipper logo if any
import Button from "../../components/common/Button"; // custom button
import { MdNavigateNext } from "react-icons/md";

const TopRatedShippers = () => {
  const navigate = useNavigate();

  const shippers = [
    { id: 1, name: "FastHorse Shipping", rating: 4.9 },
    { id: 2, name: "QuickEquine Transport", rating: 4.8 },
    { id: 3, name: "SmoothRide Shippers", rating: 4.7 },
  ];

  const handleSeeAll = () => {
    navigate("/allshippers");
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="font-montserrat font-semibold text-lg text-systemText">
        Top Rated Shippers
      </h2>

      <div className="flex flex-col gap-3">
        {shippers.map((shipper) => (
          <div
            key={shipper.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-white"
          >
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="Shipper Logo"
                className="w-[40px] h-[32px] object-contain"
              />
              <div className="font-montserrat text-sm font-medium text-gray-700">
                {shipper.name}
              </div>
            </div>
            <div className="text-sm text-yellow-600 font-semibold">
              ⭐ {shipper.rating}
            </div>
          </div>
        ))}
      </div>

      {/* See All Shippers Button */}
      <div className="flex gap-4">
        <Button
          variant="custom" // custom variant for no background
          bgColor="transparent" // no background
          borderColor="transparent" // no border
          textColor="#BF9B53" // text color
          rounded={false}
          className="px-6 py-2 font-montserrat flex items-center gap-2"
          onClick={handleSeeAll} // navigate on click
        >
          See All Shippers
          <MdNavigateNext color="#BF9B53" size={20} />
        </Button>
      </div>
    </div>
  );
};

export default TopRatedShippers;
