import React, { useState, useEffect } from "react";
import { useShipperReview } from "../../contexts/shipperContext/ShipperReviewContext";
import { MdRateReview } from "react-icons/md";

import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";
import ConfirmModal from "../../components/common/ConfirmModal";

const GoogleReview = () => {
  const {
    googleReviewLink,
    updateGoogleReviewLink,
    fetchGoogleReviewLink,
    loading,
  } = useShipperReview();

  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchGoogleReviewLink();
  }, [fetchGoogleReviewLink]);

  useEffect(() => {
    if (googleReviewLink) {
      setLink(googleReviewLink);
    }
  }, [googleReviewLink]);

  const validateGoogleLink = (url) => {
    if (!url) return "Google review link is required.";

    try {
      const parsed = new URL(url);

      if (!parsed.hostname.includes("google"))
        return "Please enter a valid Google review link.";

      return "";
    } catch {
      return "Invalid URL format.";
    }
  };

  const isUpdating = Boolean(googleReviewLink);
  const buttonLabel = isUpdating ? "Update Link" : "Add Link";

  const handleSaveClick = () => {
    const validationError = validateGoogleLink(link);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    await updateGoogleReviewLink(link);
    setShowConfirm(false);
  };

  return (
    <div className="w-full font-montserrat">
      {/* Header */}
      <div className="flex items-center gap-3  mb-6">
        <MdRateReview size={26} className="text-system-primary" />

        <h2 className="text-[16px] font-semibold text-systemText leading-[24px]">
          Google Reviews Link
        </h2>
      </div>

      {/* Card Container */}
      <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6 max-w-3xl">
        <p className="text-[14px] font-semibold text-systemText leading-[22px] mb-5">
          If you already have Google reviews, you can share your Google Business
          review link here. This helps customers see your reputation.
        </p>

        {/* Input Field */}
        <div className="space-y-2">
          <InputField
            label="Your Google Review Link"
            type="url"
            placeholder="https://www.google.com/maps/place/YourBusiness"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
        </div>

        {/* Button */}
        <div className="flex gap-3 flex-wrap mt-6">
          <Button
            variant="primary"
            onClick={handleSaveClick}
            disabled={loading}
            icon={<MdRateReview size={18} />}
          >
            {buttonLabel}
          </Button>
        </div>

        {/* Preview Link */}
        {googleReviewLink && (
          <div className="border-t mt-6 pt-4">
            <p className="text-xs text-gray-500 mb-2">Current Saved Link</p>

            <a
              href={googleReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-system-primary underline break-all text-xs"
            >
              {googleReviewLink}
            </a>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        show={showConfirm}
        title={
          isUpdating ? "Update Google Review Link" : "Add Google Review Link"
        }
        message={
          isUpdating
            ? "Are you sure you want to update your Google review link?"
            : "Are you sure you want to add this Google review link? Once added, it cannot be deleted."
        }
        confirmText={isUpdating ? "Yes, Update" : "Yes, Add"}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default GoogleReview;
