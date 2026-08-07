import React, { useEffect } from "react";
import { MdFavoriteBorder } from "react-icons/md";

import ShipperReviewCard from "../../components/common/ShipperReviewCard";
import PageLoader from "../../components/common/PageLoader";
import { useReview } from "../../contexts/customerContext/ReviewContext";

const Wishlist = () => {
  const { wishlistShippers, wishlistLoading, fetchWishlist } = useReview();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  if (wishlistLoading) {
    return (
      <PageLoader
        text="Loading Wishlist..."
        fullScreen={false}
        color="#BF9B53"
      />
    );
  }

  return (
    <section className="w-full min-w-0 overflow-hidden bg-[#F7F5F1] font-montserrat">
      <div className="mb-5 bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6 md:px-6">
        <h1 className="text-[24px] font-semibold leading-[35px] text-[#111827]">
          Wishlist
        </h1>
        <p className="mt-3 max-w-[420px] text-[10px] font-bold uppercase leading-[20px] tracking-[0.2em] text-[#BF9B53]">
          Your saved shippers
        </p>
      </div>

      {wishlistShippers.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center bg-white px-6 text-center shadow-sm">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center bg-[#F5EFE2] text-[#BF9B53]">
            <MdFavoriteBorder size={34} />
          </div>
          <h2 className="text-[20px] font-semibold text-[#111827]">
            No shippers saved yet
          </h2>
          <p className="mt-2 max-w-md text-[13px] font-medium leading-6 text-[#667085]">
            Tap Like on any shipper card to add it here.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-5">
            <p className="text-[14px] font-medium text-[#667085]">
              Showing{" "}
              <span className="font-bold text-[#344054]">
                {wishlistShippers.length} saved shippers
              </span>
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {wishlistShippers.map((shipper) => (
              <ShipperReviewCard key={shipper.id} shipper={shipper} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default Wishlist;
