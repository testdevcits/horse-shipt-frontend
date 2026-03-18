import React, { useEffect, useState } from "react";
import { FaShippingFast } from "react-icons/fa";
import { useDeliveredShipments } from "../../contexts/customerContext/DeliveredShipmentContext";
import PageLoader from "../../components/common/PageLoader";
import ReviewModal from "./common/ReviewModal";
import { useReview } from "../../contexts/customerContext/ReviewContext";
import Toast from "../../components/common/Toast"; // Import your Toast component

const AllShipments = () => {
  const { shipments, loading, fetchCompletedShipments } =
    useDeliveredShipments();
  const { addReview, myReviews } = useReview();

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [open, setOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCompletedShipments();
  }, [fetchCompletedShipments]);

  const handleOpen = (shipment) => {
    setSelectedShipment(shipment);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setSelectedShipment(null), 300);
  };

  const handleReviewSubmit = async (data) => {
    if (!selectedShipment) return;

    const reviewData = {
      shipperId: selectedShipment.shipper._id,
      shipmentId: selectedShipment._id,
      rating: data.rating,
      reviewText: data.reviewText,
    };

    try {
      const res = await addReview(reviewData);
      if (res?.success) {
        // Show success toast
        setToast({
          message: "Review submitted successfully!",
          type: "success",
        });
      }
    } catch (err) {
      // Show error toast
      setToast({
        message: err.message || "Failed to submit review",
        type: "error",
      });
    } finally {
      setReviewOpen(false);
    }
  };

  // Check if customer already reviewed this shipment
  const hasReviewed = (shipmentId) =>
    myReviews.some((r) => r.shipmentId === shipmentId);

  // 🔹 Loading
  if (loading) {
    return (
      <PageLoader text="Loading completed shipments..." fullScreen={false} />
    );
  }

  // 🔹 Empty
  if (!shipments.length) {
    return (
      <div className="text-center py-16">
        <FaShippingFast className="text-4xl mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold">No Completed Shipments</h2>
      </div>
    );
  }

  return (
    <div className="relative font-montserrat">
      {/* ================= TOAST ================= */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ================= REVIEW MODAL ================= */}
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        shipment={selectedShipment}
        onSubmit={handleReviewSubmit}
      />

      {/* ================= OVERLAY ================= */}
      {open && (
        <div onClick={handleClose} className="fixed inset-0 bg-black/20 z-40" />
      )}

      {/* ================= DRAWER ================= */}
      <div
        className={`fixed top-0 right-0 h-full bg-white z-50 transform transition-transform duration-300 ease-in-out mt-16
        w-full sm:w-[420px]
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {selectedShipment && (
          <div className="flex flex-col h-full">
            {/* HEADER */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold text-lg">
                {selectedShipment.shipmentCode}
              </h2>
              <button onClick={handleClose} className="text-danger text-lg">
                ✕
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 hide-scrollbar">
              {/* ROUTE */}
              <div className="bg-light p-3 rounded-xl">
                <p className="text-sm text-gray-600">
                  📍 {selectedShipment.pickupLocation}
                </p>
                <p className="text-center text-xs my-1">↓</p>
                <p className="text-sm text-gray-600">
                  📍 {selectedShipment.deliveryLocation}
                </p>
              </div>

              {/* DATES */}
              <div>
                <h3 className="font-semibold mb-1">Schedule</h3>
                <p className="text-sm">
                  Pickup:{" "}
                  {new Date(selectedShipment.pickupDate).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  Delivered:{" "}
                  {new Date(selectedShipment.deliveredAt).toLocaleString()}
                </p>
              </div>

              {/* SHIPPER */}
              <div>
                <h3 className="font-semibold mb-1">Shipper</h3>
                <p className="text-sm font-medium">
                  {selectedShipment.shipper?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedShipment.shipper?.email}
                </p>
              </div>

              {/* HORSES */}
              <div>
                <h3 className="font-semibold mb-2">Horse Details</h3>
                {selectedShipment.horses.map((h, i) => (
                  <div
                    key={i}
                    className="border rounded-xl p-3 mb-3 bg-white shadow-sm"
                  >
                    {h.photo?.url && (
                      <img
                        src={h.photo.url}
                        alt="horse"
                        className="w-full h-40 object-cover rounded-lg mb-2"
                      />
                    )}

                    <p className="font-medium">
                      {h.registeredName} ({h.barnName})
                    </p>

                    <p className="text-xs text-gray-500">
                      {h.breed} • {h.age} yrs • {h.colour} • {h.sex}
                    </p>

                    <p className="text-xs mt-1">
                      Stall: {h.requestedStallSize}
                    </p>

                    <div className="mt-2 space-x-3">
                      {h.documents?.coggins?.url && (
                        <a
                          href={h.documents.coggins.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline"
                        >
                          Coggins
                        </a>
                      )}

                      {h.documents?.healthCertificate?.url && (
                        <a
                          href={h.documents.healthCertificate.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline"
                        >
                          Health Cert
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* RATE BUTTON */}
              <div className="p-4 border-t">
                <button
                  onClick={() => setReviewOpen(true)}
                  disabled={hasReviewed(selectedShipment._id)}
                  className={`w-full px-4 py-2 rounded-md text-sm text-white ${
                    hasReviewed(selectedShipment._id)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-system-primary hover:opacity-90"
                  }`}
                >
                  {hasReviewed(selectedShipment._id)
                    ? "Already Reviewed"
                    : "Rate Shipment"}
                </button>
              </div>

              {/* EXTRA INFO */}
              {selectedShipment.additionalInfo && (
                <div>
                  <h3 className="font-semibold mb-1">Additional Info</h3>
                  <p className="text-sm text-gray-600">
                    {selectedShipment.additionalInfo}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= MAIN LIST ================= */}
      <div>
        <h1 className="text-2xl font-bold mb-6 text-systemText">
          Completed Shipments
        </h1>

        <div className="grid gap-4">
          {shipments.map((s) => (
            <div
              key={s._id}
              className="bg-white shadow-md rounded-md p-4 border flex justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <h2 className="font-semibold text-lg">{s.shipmentCode}</h2>

                <p className="text-sm text-gray-600">
                  {s.pickupLocation} → {s.deliveryLocation}
                </p>

                <p className="text-xs text-gray-500">
                  {new Date(s.pickupDate).toLocaleDateString()}
                </p>

                <p className="text-xs text-success-600 font-medium">
                  Delivered
                </p>
              </div>

              <button
                onClick={() => handleOpen(s)}
                className="px-4 py-2 bg-system-primary text-white rounded-lg text-sm hover:opacity-90 transition"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllShipments;
