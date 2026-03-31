import React, { useState, useEffect } from "react";

const ReviewModal = ({ open, onClose, shipment, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setRating(0);
      setReviewText("");
    }
  }, [open]);

  if (!open || !shipment) return null;

  const handleSubmit = () => {
    const payload = {
      shipmentId: shipment._id,
      shipperId: shipment.shipper?._id,
      rating,
      reviewText,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/30 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-lg animate-slide-fade-in">
        {/* Header */}
        <h2 className="text-lg font-semibold mb-1">Rate Shipper</h2>

        <p className="text-xs text-gray-500 mb-3">
          Shipment: {shipment.shipmentCode}
        </p>

        {/* Shipper */}
        <div className="mb-4">
          <p className="font-medium">{shipment.shipper?.name}</p>
          <p className="text-xs text-gray-500">{shipment.shipper?.email}</p>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <p className="text-sm mb-2">Your Rating</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                className={`cursor-pointer text-3xl ${
                  star <= rating ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Review */}
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your experience..."
          className="w-full border rounded-lg p-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-system-primary"
          rows={3}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-system-primary text-white rounded-lg"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
