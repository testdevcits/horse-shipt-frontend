import React, { useEffect } from "react";
import FileInput from "../../../components/common/FileInput";
import ImageInput from "../../../components/common/ImageInput";
import Modal from "../common/WarningModal";
import { Upload } from "lucide-react";

const Step4HorseDocuments = ({
  horses = [],
  handleHorseFileChange,
  errors = {},
  clearError,
  showWarning,
  onCloseWarning,
  recipientEmail,
  setRecipientEmail,
}) => {
  const labelStyle = {
    fontFamily: "Montserrat, sans-serif",
    fontWeight: 600,
    fontSize: "14px",
    lineHeight: "20px",
    color: "#1f2937",
  };

  const descriptionStyle = {
    fontFamily: "Montserrat, sans-serif",
    fontWeight: 400,
    fontSize: "13px",
    lineHeight: "18px",
    color: "#6b7280",
  };

  // Safety check for horses array
  const displayHorses = Array.isArray(horses) ? horses : [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col w-full gap-6 font-montserrat px-2 md:px-4">
      {displayHorses && displayHorses.length > 0 ? (
        displayHorses.map((horse, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-md border border-gray-200 space-y-6"
          >
            {/* Header */}
            <div className="border-b-2 border-[#BF9B53] pb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Horse {idx + 1} - {horse?.registeredName || "Unnamed"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {horse?.barnName || "N/A"} • {horse?.breed || "N/A"} • Age{" "}
                {horse?.age || "N/A"}
              </p>
            </div>

            {/* Photo Upload */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#BF9B53]" />
                <label style={labelStyle}>
                  Upload a Photo of the Horse{" "}
                  <span className="text-red-500">*</span>
                </label>
              </div>
              <p style={descriptionStyle}>
                A clear, professional photo helps buyers better evaluate the
                horse. JPG, PNG (Max 10MB)
              </p>
              <ImageInput
                file={horse?.photo}
                onChange={(file) => {
                  handleHorseFileChange(idx, "photo", file);
                  clearError(`photo${idx}`);
                }}
                required
                error={errors?.[`photo${idx}`]}
                label=""
              />
            </div>

            {/* Coggins Certificate */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label style={labelStyle}>Coggins Certificate (Optional)</label>
              </div>
              <FileInput
                file={horse?.cogins}
                onChange={(file) => {
                  handleHorseFileChange(idx, "cogins", file);
                  clearError(`cogins${idx}`);
                }}
                accept=".pdf,.jpg,.png"
                placeholder="Upload Coggins Certificate (EIA Test)"
                error={errors?.[`cogins${idx}`]}
              />
              <p style={descriptionStyle}>
                Equine Infectious Anemia (EIA) test certificate. Highly
                recommended for transport.
              </p>
            </div>

            {/* Health Certificate */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label style={labelStyle}>Health Certificate (Optional)</label>
              </div>
              <FileInput
                file={horse?.healthCertificate}
                onChange={(file) => {
                  handleHorseFileChange(idx, "healthCertificate", file);
                  clearError(`healthCertificate${idx}`);
                }}
                accept=".pdf,.jpg,.png"
                placeholder="Upload Health Certificate"
                error={errors?.[`healthCertificate${idx}`]}
              />
              <p style={descriptionStyle}>
                Official health certificate from a licensed veterinarian.
                Recommended for all shipments.
              </p>
            </div>

            {/* Other Documents */}
            <div className="space-y-3">
              <label style={labelStyle}>Additional Documents (Optional)</label>
              <FileInput
                file={horse?.otherDocuments}
                onChange={(file) => {
                  handleHorseFileChange(idx, "otherDocuments", file);
                  clearError(`otherDocuments${idx}`);
                }}
                accept=".pdf,.jpg,.png"
                placeholder="Upload Other Documents"
                error={errors?.[`otherDocuments${idx}`]}
              />
              <p style={descriptionStyle}>
                Registration papers, vaccination records, breed certifications,
                etc.
              </p>
            </div>

            {/* Shipment Details */}
            <div className="space-y-3">
              <label style={labelStyle} className="block">
                Special Handling & Care Instructions
              </label>
              <textarea
                value={horse?.generalInfo || ""}
                onChange={(e) => {
                  handleHorseFileChange(idx, "generalInfo", e.target.value);
                  clearError(`generalInfo${idx}`);
                }}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20 transition-all"
                rows={4}
                placeholder="Include any special handling requirements, feeding information, behavior notes, medical conditions, allergies, etc."
              />
              {errors?.[`generalInfo${idx}`] && (
                <p className="text-red-500 text-xs mt-2">
                  {errors[`generalInfo${idx}`]}
                </p>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 font-semibold">
            No horses added yet. Please add horses in the previous step.
          </p>
        </div>
      )}

      {/* Share Tracking Section */}
      <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-5 rounded-lg space-y-4">
        <h3 className="text-lg font-bold text-slate-900">
          Share Tracking (Optional)
        </h3>

        <div className="space-y-2">
          <label className="block font-semibold text-gray-700 text-sm">
            Recipient Email Address
          </label>
          <input
            type="email"
            value={recipientEmail || ""}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="buyer@example.com"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20 transition-all"
          />
          <p className="text-sm text-gray-600 mt-2">
            If provided, the recipient will receive tracking information via
            email once the shipment is published.
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-gradient-to-r from-[#BF9B53]/10 to-transparent border-l-4 border-[#BF9B53] p-5 rounded-lg space-y-4">
        <p className="text-sm font-bold text-amber-900">Important Notice</p>
        <p className="text-sm text-amber-800">
          While Coggins and Health Certificates are optional, we{" "}
          <strong>highly recommend</strong> uploading them to increase buyer
          confidence, ensure legal transport compliance, and facilitate smooth
          delivery. Missing documents may require additional verification before
          shipment can proceed.
        </p>
      </div>

      {showWarning && (
        <Modal
          title="Missing Recommended Documents"
          message="Your Coggins or Health Certificate have not been uploaded. These documents are highly recommended before shipment. Do you want to continue without them?"
          onClose={onCloseWarning}
          buttonText="Continue"
        />
      )}
    </div>
  );
};

export default Step4HorseDocuments;
