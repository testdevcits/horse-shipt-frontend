import React, { useState, useEffect } from "react";

const ReviewModal = ({ open, onClose, shipment, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(0);
      setReviewText("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open || !shipment) return null;

  const handleSubmit = async () => {
    if (submitting || rating < 1) return;

    const payload = {
      shipmentId: shipment._id,
      shipperId: shipment.shipper?._id,
      rating,
      reviewText,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-lg animate-slide-fade-in">
        <h2 className="text-lg font-semibold mb-1">Rate Shipper</h2>

        <p className="text-xs text-gray-500 mb-3">
          Shipment: {shipment.shipmentCode}
        </p>

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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setRating(star);
                }}
                className={`cursor-pointer text-3xl ${
                  star <= rating ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your experience..."
          className="w-full border rounded-lg p-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-system-primary"
          rows={3}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting || rating < 1}
            className="px-4 py-2 text-sm bg-system-primary text-white rounded-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
