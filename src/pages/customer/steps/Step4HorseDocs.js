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
}) => {
  const labelStyle = {
    fontFamily: "Montserrat, sans-serif",
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "20px",
    color: "#4B5563",
  };

  const descriptionStyle = {
    fontFamily: "Montserrat, sans-serif",
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "20px",
    color: "#4B5563",
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {horses.map((horse, idx) => (
        <div
          key={idx}
          className="bg-[#F3F4F6] p-4 rounded-xl shadow-sm border border-gray-200 space-y-4"
        >
          <h2 className="text-gray-800 font-semibold mb-2 rounded-[15px] bg-[#F2EBDD] px-4 py-3">
            Horse {idx + 1} - {horse.registeredName || "Unnamed"}
          </h2>

          {/* Horse Photo */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>
              Upload a photo of the horse{" "}
              <span className="text-red-500">*</span>
            </label>
            <p style={descriptionStyle} className="mb-2">
              A picture enhances your listing, making it more appealing.
            </p>
            <ImageInput
              file={horse.photo}
              onChange={(file) => {
                handleHorseFileChange(idx, "photo", file);
                clearError(`photo${idx}`);
              }}
              required
              error={errors[`photo${idx}`]}
            />
          </div>

          {/* Coggins */}
          <FileInput
            file={horse.cogins}
            onChange={(file) => {
              handleHorseFileChange(idx, "cogins", file);
              clearError(`cogins${idx}`);
            }}
            accept=".pdf,.jpg,.png"
            placeholder="Cog-ins (Optional)"
            error={errors[`cogins${idx}`]}
          />

          {/* Health Certificate */}
          <FileInput
            file={horse.healthCertificate}
            onChange={(file) => {
              handleHorseFileChange(idx, "healthCertificate", file);
              clearError(`healthCertificate${idx}`);
            }}
            accept=".pdf,.jpg,.png"
            placeholder="Health Certificate (Optional)"
            error={errors[`healthCertificate${idx}`]}
          />

          {/* Other */}
          <FileInput
            file={horse.otherDocuments}
            onChange={(file) => {
              handleHorseFileChange(idx, "otherDocuments", file);
              clearError(`otherDocuments${idx}`);
            }}
            accept=".pdf,.jpg,.png"
            placeholder="Other Document (Optional)"
            error={errors[`otherDocuments${idx}`]}
          />

          {/* General Info */}
          <textarea
            value={horse.generalInfo || ""}
            onChange={(e) => {
              handleHorseFileChange(idx, "generalInfo", e.target.value);
              clearError(`generalInfo${idx}`);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
            rows={3}
            placeholder="Describe shipment details"
          />
        </div>
      ))}

      {showWarning && (
        <Modal
          title="Missing Documents"
          message="Your Cog-ins or Health Certificate have not been uploaded. It is recommended to upload both before shipment."
          onClose={onCloseWarning}
        />
      )}
    </div>
  );
};

export default Step4HorseDocuments;
