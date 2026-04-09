// /pages/customer/steps/Step4HorseDocs.jsx
// COMPLETE WORKING FILE - Copy and use directly

import React from "react";
import FileInput from "../../../components/common/FileInput";
import ImageInput from "../../../components/common/ImageInput";
import Modal from "../common/WarningModal";

const Step4HorseDocuments = ({
  horses,
  handleHorseFileChange,
  errors,
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

  return (
    <div className="flex flex-col w-full gap-6 font-montserrat">
      {/* ===== EACH HORSE ===== */}
      {horses.map((horse, idx) => (
        <div
          key={idx}
          className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-md border border-gray-200 space-y-5"
        >
          {/* Header */}
          <h2 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b-2 border-[#BF9B53]">
            Horse {idx + 1} - {horse.registeredName || "Unnamed"}
          </h2>

          {/* ===== HORSE PHOTO ===== */}
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>
              Upload a Photo of the Horse{" "}
              <span className="text-red-500">*</span>
            </label>
            <p style={descriptionStyle}>
              A clear photo helps potential buyers better evaluate the horse.
            </p>
            <ImageInput
              file={horse.photo}
              onChange={(file) => {
                handleHorseFileChange(idx, "photo", file);
                clearError(`photo${idx}`);
              }}
              required
              error={errors?.[`photo${idx}`]}
            />
          </div>

          {/* ===== COGGINS ===== */}
          <div>
            <FileInput
              file={horse.cogins}
              onChange={(file) => {
                handleHorseFileChange(idx, "cogins", file);
                clearError(`cogins${idx}`);
              }}
              accept=".pdf,.jpg,.png"
              placeholder="Upload Coggins Certificate (Optional)"
              error={errors?.[`cogins${idx}`]}
            />
            <p style={descriptionStyle} className="mt-2">
              Coggins test certificate (Equine Infectious Anemia test).
            </p>
          </div>

          {/* ===== HEALTH CERTIFICATE ===== */}
          <div>
            <FileInput
              file={horse.healthCertificate}
              onChange={(file) => {
                handleHorseFileChange(idx, "healthCertificate", file);
                clearError(`healthCertificate${idx}`);
              }}
              accept=".pdf,.jpg,.png"
              placeholder="Upload Health Certificate (Optional)"
              error={errors?.[`healthCertificate${idx}`]}
            />
            <p style={descriptionStyle} className="mt-2">
              Official health certificate from veterinarian.
            </p>
          </div>

          {/* ===== OTHER DOCUMENTS ===== */}
          <div>
            <FileInput
              file={horse.otherDocuments}
              onChange={(file) => {
                handleHorseFileChange(idx, "otherDocuments", file);
                clearError(`otherDocuments${idx}`);
              }}
              accept=".pdf,.jpg,.png"
              placeholder="Upload Other Documents (Optional)"
              error={errors?.[`otherDocuments${idx}`]}
            />
            <p style={descriptionStyle} className="mt-2">
              Any additional documents (registration papers, vaccination
              records, etc.).
            </p>
          </div>

          {/* ===== GENERAL INFO ===== */}
          <div>
            <label style={labelStyle} className="block mb-2">
              Shipment Details
            </label>
            <textarea
              value={horse.generalInfo || ""}
              onChange={(e) => {
                handleHorseFileChange(idx, "generalInfo", e.target.value);
                clearError(`generalInfo${idx}`);
              }}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-600 focus:outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20"
              rows={3}
              placeholder="Describe special handling requirements, feeding information, behavior notes, etc."
            />
            {errors?.[`generalInfo${idx}`] && (
              <p className="text-red-500 text-xs mt-2">
                {errors[`generalInfo${idx}`]}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* ===== RECIPIENT EMAIL ===== */}
      <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-md">
        <h3 className="text-lg font-bold mb-3 text-gray-800">
          Share Tracking (Optional)
        </h3>

        <label className="block font-semibold text-gray-600 mb-2">
          Recipient Email Address
        </label>

        <input
          type="email"
          value={recipientEmail || ""}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="buyer@example.com"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20"
        />

        <p className="text-sm text-gray-500 mt-3">
          If provided, the recipient will receive an email with tracking
          information after shipment is published.
        </p>
      </div>

      {/* ===== INFO BANNER ===== */}
      <div className="bg-amber-50 border-l-4 border-[#BF9B53] p-4 rounded-r-lg">
        <p className="text-sm text-amber-800">
          <span className="font-bold">Important:</span> While Coggins and Health
          Certificates are optional, we highly recommend uploading them to
          increase buyer confidence and facilitate transport.
        </p>
      </div>

      {/* ===== WARNING MODAL ===== */}
      {showWarning && (
        <Modal
          title="Missing Recommended Documents"
          message="Your Coggins or Health Certificate have not been uploaded. These documents are highly recommended before shipment. Do you want to continue without them?"
          onClose={onCloseWarning}
          buttonText="Continue to Review"
        />
      )}
    </div>
  );
};

export default Step4HorseDocuments;
