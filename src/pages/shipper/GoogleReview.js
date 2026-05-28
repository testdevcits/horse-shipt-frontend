import React, { useState, useEffect } from "react";
import { useShipperReview } from "../../contexts/shipperContext/ShipperReviewContext";
import { MdRateReview } from "react-icons/md";
import {
  FiCheckCircle,
  FiCopy,
  FiExternalLink,
  FiInfo,
  FiLink,
} from "react-icons/fi";
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
  const [copied, setCopied] = useState(false);

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
      const host = parsed.hostname.toLowerCase();
      const allowedHosts = ["google", "g.page", "goo.gl"];

      if (!allowedHosts.some((allowedHost) => host.includes(allowedHost)))
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

  const handleCopy = async () => {
    if (!googleReviewLink) return;

    try {
      await navigator.clipboard.writeText(googleReviewLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="w-full font-montserrat">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-[#BF9B53] text-white">
              <MdRateReview size={22} />
            </span>
            <h1 className="font-montserrat text-[28px] font-semibold leading-[38px] text-[#111827]">
              Google Reviews Link
            </h1>
          </div>
          <p className="mt-3 max-w-3xl font-montserrat text-[13px] font-medium leading-[22px] text-[#4B5563]">
            Connect your Google Business review link so horse owners can quickly
            verify your reputation before choosing you for transport.
          </p>
        </div>

        <span
          className={`inline-flex h-[30px] w-fit items-center gap-2 rounded-[4px] border px-3 text-[11px] font-bold uppercase ${
            googleReviewLink
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-[#D9AF57] bg-[#FFF9EC] text-[#BF9B53]"
          }`}
        >
          <FiCheckCircle size={13} />
          {googleReviewLink ? "Link Active" : "Not Connected"}
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3 border border-[#D9AF57] bg-[#FFF9EC] px-4 py-3">
            <FiInfo className="mt-0.5 shrink-0 text-[#BF9B53]" size={17} />
            <p className="font-montserrat text-[13px] font-semibold leading-[22px] text-[#374151]">
              Add the direct Google review or Google Maps business link you want
              customers to visit. This link appears on your public shipper
              profile.
            </p>
          </div>

          <label className="mb-2 block font-montserrat text-[12px] font-semibold leading-[20px] text-[#4B5563]">
            Your Google Review Link
          </label>
          <div
            className={`flex min-h-[44px] items-center gap-3 border bg-white px-3 ${
              error ? "border-red-300" : "border-gray-200"
            }`}
          >
            <FiLink className="shrink-0 text-[#BF9B53]" size={17} />
            <input
              type="url"
              placeholder="https://www.google.com/maps/place/YourBusiness"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                if (error) setError("");
              }}
              className="h-[42px] min-w-0 flex-1 font-montserrat text-[13px] font-medium text-[#374151] outline-none placeholder:text-gray-400"
            />
          </div>

          {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={loading}
              className="inline-flex h-[38px] items-center justify-center gap-2 bg-[#BF9B53] px-5 font-montserrat text-[12px] font-bold uppercase text-white transition hover:bg-[#a8863f] disabled:opacity-60"
            >
              <MdRateReview size={17} />
              {loading ? "Saving..." : buttonLabel}
            </button>

            {googleReviewLink && (
              <a
                href={googleReviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[38px] items-center justify-center gap-2 border border-[#BF9B53] px-5 font-montserrat text-[12px] font-bold uppercase text-[#735D32] transition hover:bg-[#BF9B53]/10"
              >
                <FiExternalLink size={15} />
                Open Link
              </a>
            )}
          </div>

          {googleReviewLink && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="mb-2 font-montserrat text-[12px] font-semibold leading-[20px] text-[#4B5563]">
                Current Saved Link
              </p>
              <div className="flex flex-col gap-3 rounded-[4px] bg-[#F3F4F6] p-3 sm:flex-row sm:items-center sm:justify-between">
                <a
                  href={googleReviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 break-all font-montserrat text-[12px] font-medium leading-[20px] text-[#374151] hover:text-[#BF9B53]"
                >
                  {googleReviewLink}
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex h-[32px] shrink-0 items-center justify-center gap-2 rounded-[4px] border border-gray-200 bg-white px-3 font-montserrat text-[11px] font-bold uppercase text-[#4B5563] transition hover:border-[#BF9B53]"
                >
                  <FiCopy size={14} />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </section>
  
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
